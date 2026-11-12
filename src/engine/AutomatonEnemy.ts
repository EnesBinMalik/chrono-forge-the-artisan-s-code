/**
 * CHRONO-FORGE: THE ARTISAN'S CODE
 * Clockwork Automata & The Automated Leviathan Boss
 * Lead Architect: Enes Öztürk
 *
 * Handcrafted mechanical enemies featuring real-time mesh deformation,
 * logic gate vulnerabilities (AND/XOR/NOT), and kinematic boss mechanics.
 */

import * as THREE from 'three';
import { ArtisanMaterials } from './materials';
import { createClockworkGearGeometry } from './proceduralGeometries';

export interface AutomatonHitResult {
  damage: number;
  isCritical: boolean;
  isDead: boolean;
  hitPosition: THREE.Vector3;
}

export class AutomatonEnemy {
  public group: THREE.Group;
  public materials: ArtisanMaterials;
  public isBoss: boolean = false;
  public name: string;
  public health: number;
  public maxHealth: number;
  public logicVulnerability: 'AND' | 'XOR' | 'NOT' | 'NAND';

  // Kinematics & visual deformation
  public mainMesh!: THREE.Mesh;
  public gearMeshes: THREE.Mesh[] = [];
  public coreLight: THREE.PointLight | null = null;
  public isHitFlashing: boolean = false;
  private hitFlashTimer: number = 0;
  private originalScale: THREE.Vector3;
  private patrolPhase: number = 0;
  public attackTimer: number = 0;

  constructor(
    materials: ArtisanMaterials,
    name: string = 'Clockwork Centurion',
    vulnerability: 'AND' | 'XOR' | 'NOT' | 'NAND' = 'AND',
    isBoss: boolean = false,
    position: THREE.Vector3 = new THREE.Vector3()
  ) {
    this.materials = materials;
    this.name = name;
    this.isBoss = isBoss;
    this.logicVulnerability = vulnerability;
    this.health = isBoss ? 2500 : 350;
    this.maxHealth = this.health;

    this.group = new THREE.Group();
    this.group.name = name;
    this.group.position.copy(position);

    if (isBoss) {
      this.buildAutomatedLeviathan();
    } else {
      this.buildStandardAutomaton();
    }

    this.originalScale = this.group.scale.clone();
  }

  /**
   * Builds regular clockwork automaton
   */
  private buildStandardAutomaton() {
    // Torso Chassis
    const torsoGeo = new THREE.BoxGeometry(0.8, 1.1, 0.6);
    this.mainMesh = new THREE.Mesh(torsoGeo, this.materials.hammeredIron);
    this.mainMesh.castShadow = true;
    this.mainMesh.position.y = 1.2;
    this.group.add(this.mainMesh);

    // Brass armor plates on chest
    const chestPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.6, 0.15),
      this.materials.brass
    );
    chestPlate.position.set(0, 0.1, 0.32);
    this.mainMesh.add(chestPlate);

    // Corrupted logic socket in center (glows red/orange)
    const socketGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12);
    const socketMat = new THREE.MeshStandardMaterial({
      color: 0xaa2211,
      emissive: 0xff3300,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });
    const socket = new THREE.Mesh(socketGeo, socketMat);
    socket.rotation.x = Math.PI / 2;
    socket.position.set(0, 0.1, 0.4);
    this.mainMesh.add(socket);

    // Exposed rotating gears on shoulders and head
    const gearGeo = createClockworkGearGeometry(18, 0.35, 0.3, 0.24, 0.06, 0.05, 3);
    const rGear = new THREE.Mesh(gearGeo, this.materials.polishedGoldBrass);
    rGear.position.set(0.55, 0.45, 0);
    this.mainMesh.add(rGear);
    this.gearMeshes.push(rGear);

    const lGear = rGear.clone();
    lGear.position.set(-0.55, 0.45, 0);
    this.mainMesh.add(lGear);
    this.gearMeshes.push(lGear);

    // Head Unit (brass turret with monocle optic)
    const headGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.38, 12);
    const head = new THREE.Mesh(headGeo, this.materials.darkBrass);
    head.position.y = 0.75;
    this.mainMesh.add(head);

    // Monocle optic
    const eyeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 12);
    const eye = new THREE.Mesh(eyeGeo, this.materials.needleRed);
    eye.rotation.x = Math.PI / 2;
    eye.position.set(0, 0.02, 0.28);
    head.add(eye);

    // Hydraulic legs
    const legGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.9, 8);
    const rLeg = new THREE.Mesh(legGeo, this.materials.bluedSteel);
    rLeg.position.set(0.25, 0.45, 0);
    this.group.add(rLeg);

    const lLeg = rLeg.clone();
    lLeg.position.set(-0.25, 0.45, 0);
    this.group.add(lLeg);
  }

  /**
   * Builds the Colossal "The Automated Leviathan - Ruhsuz Otomasyon Tanrısı" Final Boss
   */
  private buildAutomatedLeviathan() {
    this.group.scale.set(2.4, 2.4, 2.4);

    // Massive central mainframe chassis
    const chassisGeo = new THREE.BoxGeometry(2.2, 2.8, 1.8);
    this.mainMesh = new THREE.Mesh(chassisGeo, this.materials.hammeredIron);
    this.mainMesh.castShadow = true;
    this.mainMesh.position.y = 2.4;
    this.group.add(this.mainMesh);

    // Front Boss Core (Massive rotating mechanical drum with punch pins)
    const drumGeo = new THREE.CylinderGeometry(0.75, 0.75, 1.4, 24);
    const drum = new THREE.Mesh(drumGeo, this.materials.punchCardBronze);
    drum.rotation.z = Math.PI / 2;
    drum.position.set(0, 0.2, 0.95);
    this.mainMesh.add(drum);
    this.gearMeshes.push(drum);

    // Twin giant interlocking escapement wheels
    const giantGearGeo = createClockworkGearGeometry(28, 1.1, 0.95, 0.75, 0.15, 0.2, 6);
    const rBigGear = new THREE.Mesh(giantGearGeo, this.materials.brass);
    rBigGear.position.set(1.5, 0.8, 0);
    rBigGear.rotation.y = Math.PI / 2;
    this.mainMesh.add(rBigGear);
    this.gearMeshes.push(rBigGear);

    const lBigGear = rBigGear.clone();
    lBigGear.position.set(-1.5, 0.8, 0);
    this.mainMesh.add(lBigGear);
    this.gearMeshes.push(lBigGear);

    // Boss Core Point Light
    this.coreLight = new THREE.PointLight(0xff2200, 3.5, 8.0);
    this.coreLight.position.set(0, 0.2, 1.6);
    this.mainMesh.add(this.coreLight);

    // Heavy steam boiler chimney bank (4 high stacks)
    for (let i = -0.6; i <= 0.6; i += 0.4) {
      const chimney = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.1, 1.1, 12),
        this.materials.copperPatina
      );
      chimney.position.set(i, 1.8, -0.6);
      this.mainMesh.add(chimney);
    }

    // Heavy hydraulic walker pillars
    const pillarGeo = new THREE.CylinderGeometry(0.25, 0.22, 1.8, 12);
    const leg1 = new THREE.Mesh(pillarGeo, this.materials.bluedSteel);
    leg1.position.set(1.2, 0.9, 0.8);
    this.group.add(leg1);

    const leg2 = leg1.clone();
    leg2.position.set(-1.2, 0.9, 0.8);
    this.group.add(leg2);

    const leg3 = leg1.clone();
    leg3.position.set(1.2, 0.9, -0.8);
    this.group.add(leg3);

    const leg4 = leg1.clone();
    leg4.position.set(-1.2, 0.9, -0.8);
    this.group.add(leg4);
  }

  /**
   * Applies damage with logic gate synergy and real-time mesh deformation / dents
   */
  public receiveHit(damage: number, usedGate: 'AND' | 'XOR' | 'NOT' | 'NAND'): AutomatonHitResult {
    const isCritical = usedGate === this.logicVulnerability || usedGate === 'NAND';
    const effectiveDamage = isCritical ? damage * 2.4 : damage;

    this.health = Math.max(0, this.health - effectiveDamage);
    const isDead = this.health <= 0;

    // Real Material Physics Mesh Deformation (Dent simulation)
    // Scale impact compression & tilt
    this.isHitFlashing = true;
    this.hitFlashTimer = 0.15;
    this.group.scale.set(
      this.originalScale.x * 1.12,
      this.originalScale.y * 0.88,
      this.originalScale.z * 1.12
    );

    const hitPos = this.group.position.clone();
    hitPos.y += this.isBoss ? 2.5 : 1.2;

    return {
      damage: effectiveDamage,
      isCritical,
      isDead,
      hitPosition: hitPos,
    };
  }

  /**
   * Frame update: kinematics, gear rotations, boss logic
   */
  public update(delta: number, playerPos: THREE.Vector3) {
    // 1. Recover mesh deformation smoothly
    if (this.isHitFlashing) {
      this.hitFlashTimer -= delta;
      if (this.hitFlashTimer <= 0) {
        this.isHitFlashing = false;
        this.group.scale.copy(this.originalScale);
      }
    }

    // 2. Rotate all exposed gears
    this.gearMeshes.forEach((gear, idx) => {
      const dir = idx % 2 === 0 ? 1 : -1;
      gear.rotation.z += delta * 4.5 * dir;
    });

    // 3. AI Behavior (Face player, slow menacing advance)
    const distToPlayer = this.group.position.distanceTo(playerPos);
    this.patrolPhase += delta * 1.5;

    // Face player
    const targetAngle = Math.atan2(
      playerPos.x - this.group.position.x,
      playerPos.z - this.group.position.z
    );
    this.group.rotation.y = THREE.MathUtils.damp(this.group.rotation.y, targetAngle, 4, delta);

    // Advance if within range
    const stopDist = this.isBoss ? 4.5 : 1.8;
    if (distToPlayer > stopDist && distToPlayer < 24.0) {
      const speed = this.isBoss ? 1.4 : 2.2;
      this.group.position.x += Math.sin(targetAngle) * speed * delta;
      this.group.position.z += Math.cos(targetAngle) * speed * delta;

      // Walking mechanical bob
      this.mainMesh.position.y = (this.isBoss ? 2.4 : 1.2) + Math.abs(Math.sin(this.patrolPhase * 4)) * 0.08;
    }

    // Boss Core light pulse
    if (this.coreLight) {
      this.coreLight.intensity = 2.5 + Math.sin(this.patrolPhase * 6) * 1.5;
    }
  }
}
