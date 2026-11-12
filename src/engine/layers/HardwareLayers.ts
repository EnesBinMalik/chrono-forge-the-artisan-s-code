/**
 * CHRONO-FORGE: THE ARTISAN'S CODE
 * 5 Handcrafted Hardware Layers (Zero Procedural)
 * Lead Architect & System Designer: Enes Öztürk
 *
 * Layer 1: The Brass & Silicon Foundry (Bakır ve Silikon Dökümhanesi)
 * Layer 2: The Grand Chronometer (Sonsuz Saat Kulesi)
 * Layer 3: The Vacuum Tube Sanctuary (Cam ve Vakum Tüpü Katedrali)
 * Layer 4: The Jacquard Loom Abyss (Delikli Kart Labirenti)
 * Layer 5: The Master's Core (Ustanın Çekirdek Atölyesi)
 */

import * as THREE from 'three';
import { ArtisanMaterials } from '../materials';
import {
  createClockworkGearGeometry,
  createEscapementWheelGeometry,
  createVacuumBulbGeometry,
  createPunchCardGeometry,
} from '../proceduralGeometries';

export interface LayerDefinition {
  id: number;
  nameTr: string;
  nameEn: string;
  subtitle: string;
  ambientColor: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  forgeTask: string;
  requiredLogicGate: 'AND' | 'XOR' | 'NOT' | 'NAND';
}

export const LAYER_DEFINITIONS: LayerDefinition[] = [
  {
    id: 1,
    nameTr: 'Bakır ve Silikon Dökümhanesi',
    nameEn: 'The Brass & Silicon Foundry',
    subtitle: 'Erimiş Silikon Nehirleri & Devasa İşlemci Çekirdek Vinçleri',
    ambientColor: 0x3d1c06,
    fogColor: 0x140a04,
    fogNear: 15,
    fogFar: 50,
    forgeTask: 'Ağır Kinetik Çekiç ile Bakır Matrise AND Mantık Kapısı Döv',
    requiredLogicGate: 'AND',
  },
  {
    id: 2,
    nameTr: 'Sonsuz Saat Kulesi',
    nameEn: 'The Grand Chronometer',
    subtitle: 'Milimetrik Pirinç Dişliler, Sarkaçlar & Zemberek Rezonansı',
    ambientColor: 0x2b220e,
    fogColor: 0x0f0c05,
    fogNear: 18,
    fogFar: 55,
    forgeTask: 'Saat Kulesi Kaçış Çarkını XOR Ters Faz Kapısı ile Senkronize Et',
    requiredLogicGate: 'XOR',
  },
  {
    id: 3,
    nameTr: 'Cam ve Vakum Tüpü Katedrali',
    nameEn: 'The Vacuum Tube Sanctuary',
    subtitle: 'El Üflemesi Triyot Tüpleri, Katot Arkları & Kırılgan Akustik',
    ambientColor: 0x151f2e,
    fogColor: 0x060c14,
    fogNear: 15,
    fogFar: 48,
    forgeTask: 'Katot Polaritesini NOT İnvertör Kapısı ile Tersine Çevir',
    requiredLogicGate: 'NOT',
  },
  {
    id: 4,
    nameTr: 'Delikli Kart Labirenti',
    nameEn: 'The Jacquard Loom Abyss',
    subtitle: 'Asılı Bronz Kod Kartları, Mekanik Dokuma & İkili Derleyici',
    ambientColor: 0x221c12,
    fogColor: 0x0c0a06,
    fogNear: 16,
    fogFar: 52,
    forgeTask: 'Delikli Kart Sütunlarına NAND Evrensel Kapı İğnelerini Çak',
    requiredLogicGate: 'NAND',
  },
  {
    id: 5,
    nameTr: "Ustanın Çekirdek Atölyesi",
    nameEn: "The Master's Core",
    subtitle: 'Ruhsuz Otomasyon Tanrısı: Automated Leviathan Karşılaşması',
    ambientColor: 0x2b0e0e,
    fogColor: 0x100505,
    fogNear: 20,
    fogFar: 60,
    forgeTask: 'Leviathan Çekirdeğini Zemberek Hızlandırması & Dövme ile Yok Et',
    requiredLogicGate: 'NAND',
  },
];

export class LayerArchitect {
  private materials: ArtisanMaterials;
  private animatedElements: {
    mesh: THREE.Object3D;
    type: 'spin' | 'pendulum' | 'crane' | 'glow' | 'punchSlide';
    speed: number;
    axis?: 'x' | 'y' | 'z';
    originY?: number;
    phase?: number;
  }[] = [];

  constructor(materials: ArtisanMaterials) {
    this.materials = materials;
  }

  /**
   * Constructs Layer 1: The Brass & Silicon Foundry
   */
  public buildLayer1(group: THREE.Scene | THREE.Group) {
    // 1. Massive Foundry Floor (Cast iron diamond-tread plates)
    const floorGeo = new THREE.CylinderGeometry(24, 24, 1.0, 32);
    const floor = new THREE.Mesh(floorGeo, this.materials.hammeredIron);
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    group.add(floor);

    // 2. Molten Silicon Channels (Cross-shaped glowing canal)
    const moltenGeo = new THREE.BoxGeometry(40, 0.2, 3.5);
    const river1 = new THREE.Mesh(moltenGeo, this.materials.moltenSilicon);
    river1.position.set(0, 0.05, 0);
    group.add(river1);

    const river2 = new THREE.Mesh(moltenGeo, this.materials.moltenSilicon);
    river2.rotation.y = Math.PI / 2;
    river2.position.set(0, 0.05, 0);
    group.add(river2);

    // 3. Central Forging Anvil (The Master's Silicon Anvil)
    const anvilPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 2.0, 1.2, 16),
      this.materials.hammeredIron
    );
    anvilPedestal.position.set(0, 0.6, 0);
    anvilPedestal.castShadow = true;
    group.add(anvilPedestal);

    const anvilTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.4, 1.4),
      this.materials.polishedGoldBrass
    );
    anvilTop.position.set(0, 1.3, 0);
    group.add(anvilTop);

    // 4. Heavy Gantry Cranes carrying processor cores overhead
    for (let i = -12; i <= 12; i += 8) {
      const gantryPillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 12, 0.8),
        this.materials.hammeredIron
      );
      gantryPillar.position.set(i, 6, -14);
      group.add(gantryPillar);

      const craneArm = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.6, 8.0),
        this.materials.brass
      );
      craneArm.position.set(i, 11, -10);
      group.add(craneArm);

      // Processor core ingot suspended on chains
      const coreIngot = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 1.2, 2.0),
        this.materials.copperPatina
      );
      coreIngot.position.set(i, 7.5, -10);
      group.add(coreIngot);

      this.animatedElements.push({
        mesh: coreIngot,
        type: 'crane',
        speed: 0.8 + Math.abs(i) * 0.1,
        originY: 7.5,
        phase: Math.abs(i),
      });
    }

    // 5. Heavy Steam Exhaust Furnaces around perimeter
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
      const fx = Math.cos(a) * 16;
      const fz = Math.sin(a) * 16;
      const furnace = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.8, 6.0, 12),
        this.materials.hammeredIron
      );
      furnace.position.set(fx, 3.0, fz);
      group.add(furnace);

      const chimneyCap = new THREE.Mesh(
        new THREE.ConeGeometry(1.8, 1.4, 12),
        this.materials.brass
      );
      chimneyCap.position.set(fx, 6.7, fz);
      group.add(chimneyCap);
    }
  }

  /**
   * Constructs Layer 2: The Grand Chronometer (Sonsuz Saat Kulesi)
   */
  public buildLayer2(group: THREE.Scene | THREE.Group) {
    // 1. Clock Tower Floor (Pave of interlocking brass chapter rings)
    const floorGeo = new THREE.CylinderGeometry(22, 22, 0.8, 36);
    const floor = new THREE.Mesh(floorGeo, this.materials.darkBrass);
    floor.position.y = -0.4;
    group.add(floor);

    // 2. Giant Wall of Interlocking Clockwork Escapements and Gears
    const gearConfigs = [
      { x: 0, y: 8, z: -15, teeth: 36, r: 5.5, speed: 0.2, dir: 1, mat: this.materials.brass },
      { x: 7, y: 11, z: -14.8, teeth: 24, r: 3.6, speed: -0.3, dir: -1, mat: this.materials.polishedGoldBrass },
      { x: -6.5, y: 10, z: -14.8, teeth: 20, r: 3.0, speed: -0.36, dir: -1, mat: this.materials.copperPatina },
      { x: 12, y: 6, z: -14.5, teeth: 18, r: 2.6, speed: 0.4, dir: 1, mat: this.materials.brass },
      { x: -11, y: 5.5, z: -14.5, teeth: 22, r: 3.2, speed: 0.35, dir: 1, mat: this.materials.bluedSteel },
    ];

    gearConfigs.forEach((cfg) => {
      const geo = createClockworkGearGeometry(cfg.teeth, cfg.r, cfg.r * 0.88, cfg.r * 0.72, 0.35, cfg.r * 0.15, 6);
      const mesh = new THREE.Mesh(geo, cfg.mat);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      group.add(mesh);

      this.animatedElements.push({
        mesh,
        type: 'spin',
        speed: cfg.speed * cfg.dir,
        axis: 'z',
      });
    });

    // 3. Giant Counterweighted Pendulums swinging overhead
    for (let i = -1; i <= 1; i += 2) {
      const pendulumGroup = new THREE.Group();
      pendulumGroup.position.set(i * 7, 14, 0);

      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 10, 12),
        this.materials.bluedSteel
      );
      rod.position.y = -5;
      pendulumGroup.add(rod);

      const bob = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.2, 0.4, 24),
        this.materials.polishedGoldBrass
      );
      bob.rotation.x = Math.PI / 2;
      bob.position.y = -10;
      pendulumGroup.add(bob);

      group.add(pendulumGroup);

      this.animatedElements.push({
        mesh: pendulumGroup,
        type: 'pendulum',
        speed: 1.4,
        axis: 'z',
        phase: i > 0 ? Math.PI : 0,
      });
    }

    // 4. Central Chronometer Escapement Anchor & Master Wheel
    const escapementGeo = createEscapementWheelGeometry(18, 3.2, 0.3);
    const escapementWheel = new THREE.Mesh(escapementGeo, this.materials.polishedGoldBrass);
    escapementWheel.position.set(0, 3.5, 0);
    escapementWheel.rotation.x = Math.PI / 2;
    group.add(escapementWheel);

    this.animatedElements.push({
      mesh: escapementWheel,
      type: 'spin',
      speed: 0.8,
      axis: 'y',
    });
  }

  /**
   * Constructs Layer 3: The Vacuum Tube Sanctuary (Cam ve Vakum Tüpü Katedrali)
   */
  public buildLayer3(group: THREE.Scene | THREE.Group) {
    // 1. Cathedral Polished Copper Grid Floor
    const floorGeo = new THREE.CylinderGeometry(24, 24, 0.8, 36);
    const floor = new THREE.Mesh(floorGeo, this.materials.bluedSteel);
    floor.position.y = -0.4;
    group.add(floor);

    // 2. Colossal Glass Vacuum Triode & Pentode Tubes lining the nave
    const tubePositions = [
      { x: -8, z: -6, h: 7, r: 1.6 },
      { x: -8, z: 2, h: 6, r: 1.4 },
      { x: -8, z: 10, h: 7.5, r: 1.8 },
      { x: 8, z: -6, h: 7, r: 1.6 },
      { x: 8, z: 2, h: 6, r: 1.4 },
      { x: 8, z: 10, h: 7.5, r: 1.8 },
    ];

    tubePositions.forEach((tp) => {
      const tubeGroup = new THREE.Group();
      tubeGroup.position.set(tp.x, 0, tp.z);

      // Brass base socket
      const socket = new THREE.Mesh(
        new THREE.CylinderGeometry(tp.r * 0.9, tp.r, 1.2, 16),
        this.materials.brass
      );
      socket.position.y = 0.6;
      tubeGroup.add(socket);

      // Glass bulb
      const bulbGeo = createVacuumBulbGeometry(tp.h, tp.r);
      const bulbMesh = new THREE.Mesh(bulbGeo, this.materials.vacuumGlass);
      bulbMesh.position.y = 1.0;
      tubeGroup.add(bulbMesh);

      // Internal glowing tungsten filament (coiled helix)
      const filament = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, tp.h * 0.6, 8),
        this.materials.glowingFilament
      );
      filament.position.y = 1.2 + tp.h * 0.3;
      tubeGroup.add(filament);

      // Warm glow light inside each tube
      const tubeLight = new THREE.PointLight(0xff9922, 2.0, 10);
      tubeLight.position.y = 1.2 + tp.h * 0.3;
      tubeGroup.add(tubeLight);

      group.add(tubeGroup);

      this.animatedElements.push({
        mesh: filament,
        type: 'glow',
        speed: 2.0 + Math.random(),
      });
    });

    // 3. High-Voltage Jacob's Ladder Electric Arc Towers
    const towerGeo = new THREE.CylinderGeometry(0.12, 0.15, 9, 8);
    const towerA = new THREE.Mesh(towerGeo, this.materials.copperPatina);
    towerA.position.set(-1.2, 4.5, -8);
    group.add(towerA);

    const towerB = new THREE.Mesh(towerGeo, this.materials.copperPatina);
    towerB.position.set(1.2, 4.5, -8);
    group.add(towerB);
  }

  /**
   * Constructs Layer 4: The Jacquard Loom Abyss (Delikli Kart Labirenti)
   */
  public buildLayer4(group: THREE.Scene | THREE.Group) {
    // 1. Mechanical Loom Floor
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(24, 24, 0.8, 36),
      this.materials.hammeredIron
    );
    floor.position.y = -0.4;
    group.add(floor);

    // 2. Giant Punched Metal Cards suspended from overhead brass rails
    const cardPositions = [
      { x: -7, y: 4, z: -8, rotY: 0.2 },
      { x: -3, y: 5, z: -12, rotY: -0.1 },
      { x: 3, y: 4.5, z: -10, rotY: 0.15 },
      { x: 7, y: 5.5, z: -6, rotY: -0.3 },
      { x: -9, y: 4, z: 2, rotY: 0.4 },
      { x: 9, y: 4, z: 2, rotY: -0.4 },
    ];

    cardPositions.forEach((pos, idx) => {
      const cardGeo = createPunchCardGeometry(4.2, 2.4, 0.1, 7, 14);
      const card = new THREE.Mesh(cardGeo, this.materials.punchCardBronze);
      card.position.set(pos.x, pos.y, pos.z);
      card.rotation.y = pos.rotY;
      card.castShadow = true;
      group.add(card);

      this.animatedElements.push({
        mesh: card,
        type: 'punchSlide',
        speed: 0.6 + (idx % 3) * 0.2,
        originY: pos.y,
        phase: idx * 1.2,
      });
    });

    // 3. Central Jacquard Reader Console (Binary Compilation Altar)
    const consoleAltar = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 1.4, 2.0),
      this.materials.brass
    );
    consoleAltar.position.set(0, 0.7, 0);
    group.add(consoleAltar);

    // Feed rollers
    const roller1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 3.8, 16),
      this.materials.bluedSteel
    );
    roller1.rotation.z = Math.PI / 2;
    roller1.position.set(0, 1.5, 0.5);
    group.add(roller1);

    const roller2 = roller1.clone();
    roller2.position.set(0, 1.5, -0.5);
    group.add(roller2);

    this.animatedElements.push({
      mesh: roller1,
      type: 'spin',
      speed: 1.5,
      axis: 'x',
    });
    this.animatedElements.push({
      mesh: roller2,
      type: 'spin',
      speed: -1.5,
      axis: 'x',
    });
  }

  /**
   * Constructs Layer 5: The Master's Core (Ustanın Çekirdek Atölyesi)
   */
  public buildLayer5(group: THREE.Scene | THREE.Group) {
    // 1. Master Arena Floor (Octagonal brass dais with inlaid logic circuit runs)
    const dais = new THREE.Mesh(
      new THREE.CylinderGeometry(25, 26, 1.0, 8),
      this.materials.brass
    );
    dais.position.y = -0.5;
    dais.receiveShadow = true;
    group.add(dais);

    // Inner blued steel ring
    const innerRing = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 14, 1.05, 32),
      this.materials.bluedSteel
    );
    innerRing.position.y = -0.45;
    group.add(innerRing);

    // 2. Handcrafted Babbage Difference Engines around the arena rim
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
      const bx = Math.cos(angle) * 18;
      const bz = Math.sin(angle) * 18;

      const engineTower = new THREE.Group();
      engineTower.position.set(bx, 0, bz);
      engineTower.lookAt(0, 0, 0);

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 7.0, 1.2),
        this.materials.hammeredIron
      );
      frame.position.y = 3.5;
      engineTower.add(frame);

      // Stacked counter gears inside difference engine
      for (let g = 1.0; g <= 6.0; g += 0.8) {
        const gear = new THREE.Mesh(
          createClockworkGearGeometry(16, 0.65, 0.55, 0.45, 0.1, 0.1, 3),
          this.materials.polishedGoldBrass
        );
        gear.position.set(0, g, 0.2);
        gear.rotation.y = Math.PI / 2;
        engineTower.add(gear);

        this.animatedElements.push({
          mesh: gear,
          type: 'spin',
          speed: 1.2 + g * 0.3,
          axis: 'z',
        });
      }

      group.add(engineTower);
    }

    // 3. Giant Analog CRT Oscilloscopes displaying green trace waves
    const scopeGeo = new THREE.CylinderGeometry(1.4, 1.6, 2.2, 16);
    const scopeMesh = new THREE.Mesh(scopeGeo, this.materials.hammeredIron);
    scopeMesh.rotation.x = Math.PI / 2;
    scopeMesh.position.set(0, 4.0, -16);
    group.add(scopeMesh);

    const screenGeo = new THREE.CircleGeometry(1.3, 16);
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff66,
      emissiveIntensity: 2.5,
      roughness: 0.1,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 4.0, -14.88);
    group.add(screenMesh);
  }

  /**
   * Updates all animated architectural hardware elements
   */
  public update(delta: number, time: number) {
    this.animatedElements.forEach((elem) => {
      if (elem.type === 'spin') {
        const axis = elem.axis || 'z';
        elem.mesh.rotation[axis] += delta * elem.speed;
      } else if (elem.type === 'pendulum') {
        const axis = elem.axis || 'z';
        const phase = elem.phase || 0;
        elem.mesh.rotation[axis] = Math.sin(time * elem.speed + phase) * 0.28;
      } else if (elem.type === 'crane' && elem.originY !== undefined) {
        const phase = elem.phase || 0;
        elem.mesh.position.y = elem.originY + Math.sin(time * elem.speed + phase) * 0.8;
      } else if (elem.type === 'punchSlide' && elem.originY !== undefined) {
        const phase = elem.phase || 0;
        elem.mesh.position.y = elem.originY + Math.sin(time * elem.speed + phase) * 0.4;
      } else if (elem.type === 'glow') {
        const mat = (elem.mesh as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat && 'emissiveIntensity' in mat) {
          mat.emissiveIntensity = 2.5 + Math.sin(time * elem.speed) * 1.0;
        }
      }
    });
  }

  public clear() {
    this.animatedElements = [];
  }
}
