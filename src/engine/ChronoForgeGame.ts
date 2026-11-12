/**
 * CHRONO-FORGE: THE ARTISAN'S CODE
 * Master Game Engine & Simulation Controller
 * Lead Architect & System Designer: ENES ÖZTÜRK
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ArtisanMaterials, isSoftwareGl } from './materials';
import { ParticleDebrisSystem } from './particles';
import { EnesArtisanModel } from './EnesArtisanModel';
import { AutomatonEnemy } from './AutomatonEnemy';
import { LayerArchitect, LAYER_DEFINITIONS, LayerDefinition } from './layers/HardwareLayers';
import { foley } from '../audio/ArtisanFoleyEngine';

// Reusable math helpers for zero GC in render loop
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();

export interface GameStateSnapshot {
  currentLayer: LayerDefinition;
  logicGate: 'AND' | 'XOR' | 'NOT' | 'NAND';
  boilerPressure: number;
  mainspringTension: number;
  isOverdrive: boolean;
  overdriveRemaining: number;
  comboCount: number;
  score: number;
  layerProgress: number; // 0..100
  isLayerComplete: boolean;
  enemyCount: number;
  bossHealthPercent: number;
  cameraMode: 'follow' | 'inspect' | 'cinematic';
}

export class ChronoForgeGame {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private materials: ArtisanMaterials;
  private particleSystem: ParticleDebrisSystem;
  private layerArchitect: LayerArchitect;

  // Actors
  public player: EnesArtisanModel;
  public enemies: AutomatonEnemy[] = [];
  public currentLayerIndex: number = 0; // 0..4

  // Lights & Environment
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private activeLayerGroup: THREE.Group;

  // Controls & Input
  private keys: Record<string, boolean> = {};
  public logicGate: 'AND' | 'XOR' | 'NOT' | 'NAND' = 'AND';
  public comboCount: number = 0;
  public comboTimer: number = 0;
  public score: number = 0;
  public layerProgress: number = 0;
  public isLayerComplete: boolean = false;
  public cameraMode: 'follow' | 'inspect' | 'cinematic' = 'follow';

  // Game loop tracking
  private isRunning: boolean = false;
  private clock: THREE.Clock;
  private frameId: number = 0;
  private onStateChangeCallback?: (state: GameStateSnapshot) => void;

  // Mouse / Pointer
  public pointerX: number = 0;
  public pointerY: number = 0;

  constructor(container: HTMLElement, onStateChange?: (state: GameStateSnapshot) => void) {
    this.container = container;
    this.onStateChangeCallback = onStateChange;

    // 1. Renderer Setup with Software WebGL Guard
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 2. Scene & Environment
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(LAYER_DEFINITIONS[0].fogColor);
    this.scene.fog = new THREE.Fog(
      LAYER_DEFINITIONS[0].fogColor,
      LAYER_DEFINITIONS[0].fogNear,
      LAYER_DEFINITIONS[0].fogFar
    );

    // PMREM Room Environment for realistic metals & glass
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Camera
    this.camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );
    this.camera.position.set(0, 5, 9);

    // 4. Lighting Rig (Key, Fill, Rim)
    this.hemiLight = new THREE.HemisphereLight(0xffeedd, 0x111622, 0.7);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffd59e, 1.8);
    this.dirLight.position.set(12, 22, 10);
    if (!isSoftwareGl) {
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.width = 2048;
      this.dirLight.shadow.mapSize.height = 2048;
      this.dirLight.shadow.bias = -0.0004;
      this.dirLight.shadow.normalBias = 0.02;
      this.dirLight.shadow.camera.near = 0.5;
      this.dirLight.shadow.camera.far = 60;
      this.dirLight.shadow.camera.left = -20;
      this.dirLight.shadow.camera.right = 20;
      this.dirLight.shadow.camera.top = 20;
      this.dirLight.shadow.camera.bottom = -20;
    }
    this.scene.add(this.dirLight);

    // 5. Materials & Systems
    this.materials = new ArtisanMaterials();
    this.particleSystem = new ParticleDebrisSystem(
      this.scene,
      this.materials.brass,
      this.materials.bluedSteel,
      this.materials.vacuumGlass
    );
    this.layerArchitect = new LayerArchitect(this.materials);

    // 6. Character: Enes Öztürk
    this.player = new EnesArtisanModel(this.materials);
    this.scene.add(this.player.group);

    // 7. Layer Root Group
    this.activeLayerGroup = new THREE.Group();
    this.scene.add(this.activeLayerGroup);

    // Build Initial Layer (Foundry)
    this.loadLayer(0);

    // 8. Clock & Event Listeners
    this.clock = new THREE.Clock();
    this.setupListeners();

    // Start Loop
    this.isRunning = true;
    this.tick();
  }

  /**
   * Switches to one of the 5 Handcrafted Hardware Layers
   */
  public loadLayer(layerIndex: number) {
    if (layerIndex < 0 || layerIndex >= LAYER_DEFINITIONS.length) return;
    this.currentLayerIndex = layerIndex;
    const def = LAYER_DEFINITIONS[layerIndex];

    // Clear previous layer architecture & enemies
    while (this.activeLayerGroup.children.length > 0) {
      this.activeLayerGroup.remove(this.activeLayerGroup.children[0]);
    }
    this.layerArchitect.clear();

    this.enemies.forEach((enemy) => {
      this.scene.remove(enemy.group);
    });
    this.enemies = [];

    // Reset player position & state
    this.player.group.position.set(0, 0, 0);
    this.layerProgress = 0;
    this.isLayerComplete = false;

    // Set Lighting & Fog
    this.scene.background = new THREE.Color(def.fogColor);
    this.scene.fog = new THREE.Fog(def.fogColor, def.fogNear, def.fogFar);
    this.hemiLight.color.setHex(def.ambientColor);

    // Build Handcrafted Layer Architecture
    switch (layerIndex) {
      case 0:
        this.layerArchitect.buildLayer1(this.activeLayerGroup);
        this.spawnEnemiesForLayer(3, 'AND', false);
        break;
      case 1:
        this.layerArchitect.buildLayer2(this.activeLayerGroup);
        this.spawnEnemiesForLayer(4, 'XOR', false);
        break;
      case 2:
        this.layerArchitect.buildLayer3(this.activeLayerGroup);
        this.spawnEnemiesForLayer(4, 'NOT', false);
        break;
      case 3:
        this.layerArchitect.buildLayer4(this.activeLayerGroup);
        this.spawnEnemiesForLayer(5, 'NAND', false);
        break;
      case 4:
        this.layerArchitect.buildLayer5(this.activeLayerGroup);
        // Boss Encounter: The Automated Leviathan
        const boss = new AutomatonEnemy(
          this.materials,
          'The Automated Leviathan (Ruhsuz Otomasyon)',
          'NAND',
          true,
          new THREE.Vector3(0, 0, -10)
        );
        this.scene.add(boss.group);
        this.enemies.push(boss);
        break;
    }

    foley.playSteamRelease();
    foley.playClockTick(false);
    this.notifyState();
  }

  private spawnEnemiesForLayer(count: number, vuln: 'AND' | 'XOR' | 'NOT' | 'NAND', isBoss: boolean) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.PI / 4;
      const dist = 7.0 + Math.random() * 5.0;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const enemy = new AutomatonEnemy(
        this.materials,
        `Clockwork Centurion ${i + 1}`,
        vuln,
        isBoss,
        new THREE.Vector3(x, 0, z)
      );
      this.scene.add(enemy.group);
      this.enemies.push(enemy);
    }
  }

  /**
   * Sets active Logic Gate (AND -> XOR -> NOT -> NAND)
   */
  public setLogicGate(gate: 'AND' | 'XOR' | 'NOT' | 'NAND') {
    this.logicGate = gate;
    this.player.setLogicGate(gate);
    foley.playRatchetClick(1.2);
    this.notifyState();
  }

  public cycleLogicGate(direction: 1 | -1 = 1) {
    const gates: ('AND' | 'XOR' | 'NOT' | 'NAND')[] = ['AND', 'XOR', 'NOT', 'NAND'];
    const curIdx = gates.indexOf(this.logicGate);
    const nextIdx = (curIdx + direction + gates.length) % gates.length;
    this.setLogicGate(gates[nextIdx]);
  }

  /**
   * Performs the Heavy Kinetic Maul Slam
   */
  public triggerHammerStrike() {
    this.player.triggerHammerAttack();
    foley.playAnvilStrike(this.logicGate);

    // Check hit radius
    const strikePos = this.player.group.position.clone();
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.player.group.quaternion);
    strikePos.add(forward.multiplyScalar(1.5));

    // Particle sparks at strike position
    this.particleSystem.emitSparks(strikePos, 32, 10.0);

    // Damage enemies in strike zone
    let didHit = false;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const dist = strikePos.distanceTo(enemy.group.position);
      if (dist < (enemy.isBoss ? 4.5 : 2.5)) {
        didHit = true;
        const res = enemy.receiveHit(this.player.isOverdrive ? 180 : 95, this.logicGate);
        this.particleSystem.emitMechanicalDebris(res.hitPosition, res.isCritical ? 10 : 5);
        this.score += Math.round(res.damage * 10);
        this.addCombo();

        if (res.isDead) {
          foley.playSteamRelease();
          this.particleSystem.emitMechanicalDebris(enemy.group.position, 18);
          this.scene.remove(enemy.group);
          this.enemies.splice(i, 1);
          this.checkLayerProgression();
        }
      }
    }

    // Check central anvil / forge altar interaction
    if (this.player.group.position.length() < 3.2) {
      this.forgeActiveLayerCircuit();
    }

    this.notifyState();
  }

  /**
   * Performs the Oscillating Titanium Saw Slash
   */
  public triggerSawSlash() {
    this.player.triggerSawAttack();
    foley.playSawSlice();

    const slashPos = this.player.group.position.clone();
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.player.group.quaternion);
    slashPos.add(forward.multiplyScalar(1.4));

    this.particleSystem.emitSparks(slashPos, 16, 7.0);

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const dist = slashPos.distanceTo(enemy.group.position);
      if (dist < (enemy.isBoss ? 4.0 : 2.2)) {
        const res = enemy.receiveHit(this.player.isOverdrive ? 75 : 45, this.logicGate);
        this.particleSystem.emitMechanicalDebris(res.hitPosition, 4);
        this.score += Math.round(res.damage * 6);
        this.addCombo();

        if (res.isDead) {
          foley.playSteamRelease();
          this.scene.remove(enemy.group);
          this.enemies.splice(i, 1);
          this.checkLayerProgression();
        }
      }
    }

    this.notifyState();
  }

  /**
   * Mainspring Overdrive (Zemberek Hızlandırma)
   */
  public triggerMainspringOverdrive() {
    this.player.triggerOverdrive();
    foley.playRatchetClick(1.8);
    foley.playSteamRelease();

    // High velocity steam vents from backpack
    const backPos = this.player.group.position.clone().add(new THREE.Vector3(0, 1.8, -0.5));
    this.particleSystem.emitSparks(backPos, 40, 12.0);

    this.notifyState();
  }

  /**
   * Forges the active layer logic circuit at the central anvil/station
   */
  public forgeActiveLayerCircuit() {
    const curDef = LAYER_DEFINITIONS[this.currentLayerIndex];
    if (this.logicGate === curDef.requiredLogicGate) {
      this.layerProgress = Math.min(100, this.layerProgress + 35);
      foley.playAnvilStrike(this.logicGate);
      foley.playPunchCardStamp();

      if (this.layerProgress >= 100) {
        this.isLayerComplete = true;
        this.score += 5000;
        foley.playClockTick(true);
      }
    } else {
      // Gate mismatch
      foley.playClockTick(false);
    }
  }

  private checkLayerProgression() {
    if (this.enemies.length === 0) {
      this.layerProgress = 100;
      this.isLayerComplete = true;
      this.score += 2500;
    }
  }

  private addCombo() {
    this.comboCount++;
    this.comboTimer = 3.5;
    foley.setTension(this.comboCount, this.player.isOverdrive);
  }

  /**
   * Sets camera view mode (Follow / Inspect / Cinematic)
   */
  public setCameraMode(mode: 'follow' | 'inspect' | 'cinematic') {
    this.cameraMode = mode;
    this.notifyState();
  }

  private setupListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      foley.init();

      if (e.key === 'q' || e.key === 'Q') {
        this.cycleLogicGate(-1);
      } else if (e.key === 'e' || e.key === 'E') {
        this.cycleLogicGate(1);
      } else if (e.key === ' ') {
        e.preventDefault();
        this.triggerMainspringOverdrive();
      } else if (e.key === 'j' || e.key === 'J') {
        this.triggerHammerStrike();
      } else if (e.key === 'k' || e.key === 'K') {
        this.triggerSawSlash();
      } else if (e.key === 'f' || e.key === 'F') {
        this.forgeActiveLayerCircuit();
      } else if (e.key === 'v' || e.key === 'V') {
        const modes: ('follow' | 'inspect' | 'cinematic')[] = ['follow', 'inspect', 'cinematic'];
        const next = modes[(modes.indexOf(this.cameraMode) + 1) % modes.length];
        this.setCameraMode(next);
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        this.loadLayer(parseInt(e.key) - 1);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    this.container.addEventListener('mousedown', (e) => {
      foley.init();
      if (e.button === 0) {
        this.triggerHammerStrike();
      } else if (e.button === 2) {
        e.preventDefault();
        this.triggerSawSlash();
      }
    });

    this.container.addEventListener('contextmenu', (e) => e.preventDefault());

    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointerY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });

    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    if (!this.container || !this.renderer) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  /**
   * Main Simulation Loop
   */
  private tick = () => {
    if (!this.isRunning) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Process Player Locomotion
    let moveX = 0;
    let moveZ = 0;
    if (this.keys['w'] || this.keys['arrowup']) moveZ += 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveZ -= 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    const isMoving = moveX !== 0 || moveZ !== 0;
    const baseSpeed = this.player.isOverdrive ? 10.5 : 5.8;

    if (isMoving) {
      _vec3A.set(moveX, 0, moveZ).normalize();
      this.player.group.position.x += _vec3A.x * baseSpeed * delta;
      this.player.group.position.z += _vec3A.z * baseSpeed * delta;

      // Keep inside circular arena
      const maxRadius = 18.0;
      if (this.player.group.position.length() > maxRadius) {
        this.player.group.position.setLength(maxRadius);
      }

      // Smoothly rotate character to face movement direction
      const moveAngle = Math.atan2(_vec3A.x, _vec3A.z);
      this.player.group.rotation.y = THREE.MathUtils.damp(
        this.player.group.rotation.y,
        moveAngle,
        12,
        delta
      );
    }

    // 2. Update Player Animations & Diegetic indicators
    this.player.boilerPressure = Math.max(0.2, 1.0 - (this.comboCount > 0 ? 0.05 : 0));
    this.player.update(delta, isMoving);

    // 3. Update Enemies
    this.enemies.forEach((enemy) => {
      enemy.update(delta, this.player.group.position);
    });

    // 4. Update Hardware Layer Elements & Particles
    this.layerArchitect.update(delta, elapsedTime);
    this.particleSystem.update(delta);

    // 5. Update Combo decay
    if (this.comboCount > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
        foley.setTension(0, this.player.isOverdrive);
        this.notifyState();
      }
    }

    // 6. Camera Rig with smooth exponential damping
    if (this.cameraMode === 'follow') {
      const targetCamPos = _vec3B.copy(this.player.group.position).add(new THREE.Vector3(0, 5.5, -9.5));
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamPos.x, 5, delta);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamPos.y, 5, delta);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamPos.z, 5, delta);
      this.camera.lookAt(
        this.player.group.position.x,
        this.player.group.position.y + 1.2,
        this.player.group.position.z
      );
    } else if (this.cameraMode === 'inspect') {
      // Close artisan inspection orbit
      const orbitR = 4.0;
      const ox = this.player.group.position.x + Math.sin(elapsedTime * 0.4) * orbitR;
      const oz = this.player.group.position.z + Math.cos(elapsedTime * 0.4) * orbitR;
      this.camera.position.set(ox, this.player.group.position.y + 2.0, oz);
      this.camera.lookAt(
        this.player.group.position.x,
        this.player.group.position.y + 1.2,
        this.player.group.position.z
      );
    } else if (this.cameraMode === 'cinematic') {
      // Wide arena panoramic sweep
      const sweepX = Math.sin(elapsedTime * 0.15) * 18;
      const sweepZ = Math.cos(elapsedTime * 0.15) * 18;
      this.camera.position.set(sweepX, 10, sweepZ);
      this.camera.lookAt(0, 2, 0);
    }

    // 7. Render
    this.renderer.render(this.scene, this.camera);

    // Schedule next frame
    if (isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  /**
   * Software WebGL CPU paced loop
   */
  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private notifyState() {
    if (!this.onStateChangeCallback) return;
    const boss = this.enemies.find((e) => e.isBoss);
    const bossHpPercent = boss ? (boss.health / boss.maxHealth) * 100 : 0;

    this.onStateChangeCallback({
      currentLayer: LAYER_DEFINITIONS[this.currentLayerIndex],
      logicGate: this.logicGate,
      boilerPressure: this.player.boilerPressure,
      mainspringTension: this.player.isOverdrive ? 1.0 : this.comboCount * 0.15,
      isOverdrive: this.player.isOverdrive,
      overdriveRemaining: Math.max(0, this.player.overdriveTime),
      comboCount: this.comboCount,
      score: this.score,
      layerProgress: this.layerProgress,
      isLayerComplete: this.isLayerComplete,
      enemyCount: this.enemies.length,
      bossHealthPercent: bossHpPercent,
      cameraMode: this.cameraMode,
    });
  }

  public dispose() {
    this.isRunning = false;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.onResize);
    this.particleSystem.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
