/**
 * CHRONO-FORGE: THE ARTISAN'S CODE
 * Master Artisan & System Architect: ENES ÖZTÜRK
 * 3D Composite Handcrafted Character Model
 *
 * Articulated brass exoskeleton, chest mainspring, steam boiler manometer,
 * The Logic Maul, Oscillating Titanium Blade, and diegetic gauntlet dial.
 */

import * as THREE from 'three';
import { ArtisanMaterials } from './materials';
import { createTheLogicMaulMesh, createSawBladeGeometry } from './proceduralGeometries';

export class EnesArtisanModel {
  public group: THREE.Group;
  private materials: ArtisanMaterials;

  // Body parts
  public torso: THREE.Group;
  public head: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;

  // Artisan gear
  public logicMaul: THREE.Group;
  public sawBladeGroup: THREE.Group;
  public sawBladeMesh: THREE.Mesh;
  public mainspringMesh: THREE.Mesh;
  public manometerNeedle: THREE.Mesh;
  public gauntletDial: THREE.Mesh;

  // Animation states
  public isAttacking: boolean = false;
  public attackType: 'hammer' | 'saw' | 'overdrive' = 'hammer';
  public attackTime: number = 0;
  public isOverdrive: boolean = false;
  public overdriveTime: number = 0;
  public mainspringTension: number = 0; // 0..1
  public boilerPressure: number = 1.0; // 0..1

  // Walk cycle
  private walkPhase: number = 0;

  constructor(materials: ArtisanMaterials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'EnesOzturkArtisan';

    // Root Torso
    this.torso = new THREE.Group();
    this.torso.position.y = 1.35;
    this.group.add(this.torso);

    // 1. Cuirass / Chest Armor (Hammered bronze & brass breastplate)
    const chestGeom = new THREE.CylinderGeometry(0.38, 0.32, 0.65, 12);
    const chestMesh = new THREE.Mesh(chestGeom, materials.brass);
    chestMesh.castShadow = true;
    this.torso.add(chestMesh);

    // 2. Chest Mainspring Mechanism (Zemberek)
    const springPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16),
      materials.darkBrass
    );
    springPlate.rotation.x = Math.PI / 2;
    springPlate.position.set(0, 0.08, 0.36);
    this.torso.add(springPlate);

    // Mainspring coiled spiral
    const spiralGeom = new THREE.TorusGeometry(0.12, 0.02, 8, 24);
    this.mainspringMesh = new THREE.Mesh(spiralGeom, materials.bluedSteel);
    this.mainspringMesh.position.set(0, 0.08, 0.39);
    this.torso.add(this.mainspringMesh);

    // 3. Steam Boiler Backpack (High Pressure Boiler with Glass Manometer)
    const boilerGroup = new THREE.Group();
    boilerGroup.position.set(0, 0.1, -0.42);

    const boilerTank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.7, 16),
      materials.copperPatina
    );
    boilerTank.castShadow = true;
    boilerGroup.add(boilerTank);

    // Brass boiler retention straps
    const strapTop = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.025, 8, 20),
      materials.polishedGoldBrass
    );
    strapTop.rotation.x = Math.PI / 2;
    strapTop.position.y = 0.22;
    boilerGroup.add(strapTop);

    const strapBot = strapTop.clone();
    strapBot.position.y = -0.22;
    boilerGroup.add(strapBot);

    // Working Glass Manometer attached to the boiler
    const manometerDial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.05, 24),
      materials.manometerFace
    );
    manometerDial.rotation.x = Math.PI / 2;
    manometerDial.rotation.y = Math.PI;
    manometerDial.position.set(0, 0.18, -0.25);
    boilerGroup.add(manometerDial);

    // Needle
    const needleGeom = new THREE.BoxGeometry(0.015, 0.1, 0.01);
    this.manometerNeedle = new THREE.Mesh(needleGeom, materials.needleRed);
    this.manometerNeedle.position.set(0, 0.18, -0.28);
    boilerGroup.add(this.manometerNeedle);

    // Steam exhaust stacks (Twin chimneys)
    const stack1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.04, 0.35, 12),
      materials.brass
    );
    stack1.position.set(0.12, 0.48, 0);
    boilerGroup.add(stack1);

    const stack2 = stack1.clone();
    stack2.position.set(-0.12, 0.48, 0);
    boilerGroup.add(stack2);

    this.torso.add(boilerGroup);

    // 4. Head & Artisan Mask (Forgemaster's Optic Visor with Brass Gears)
    this.head = new THREE.Group();
    this.head.position.set(0, 0.52, 0);

    const headBase = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      materials.hammeredIron
    );
    this.head.add(headBase);

    // Dual brass optical lenses (Artisan Loupes)
    const loupeR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.1, 12),
      materials.polishedGoldBrass
    );
    loupeR.rotation.x = Math.PI / 2;
    loupeR.position.set(0.07, 0.02, 0.18);
    this.head.add(loupeR);

    const loupeL = loupeR.clone();
    loupeL.position.set(-0.07, 0.02, 0.18);
    this.head.add(loupeL);

    // Loupe lenses (sapphire crystal glass)
    const lensR = new THREE.Mesh(
      new THREE.CircleGeometry(0.048, 12),
      materials.vacuumGlass
    );
    lensR.position.set(0.07, 0.02, 0.232);
    this.head.add(lensR);

    const lensL = lensR.clone();
    lensL.position.set(-0.07, 0.02, 0.232);
    this.head.add(lensL);

    this.torso.add(this.head);

    // 5. Right Arm (Wields The Logic Maul)
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.5, 0.2, 0);

    const rShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 12),
      materials.brass
    );
    this.rightArm.add(rShoulder);

    const rUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.07, 0.38, 12),
      materials.bluedSteel
    );
    rUpperArm.position.y = -0.22;
    this.rightArm.add(rUpperArm);

    const rForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.06, 0.38, 12),
      materials.brass
    );
    rForearm.position.y = -0.56;
    this.rightArm.add(rForearm);

    // Gauntlet Logic Dial (Diegetic gate indicator)
    const dialGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16);
    this.gauntletDial = new THREE.Mesh(dialGeom, materials.polishedGoldBrass);
    this.gauntletDial.position.set(0, -0.68, 0.06);
    this.gauntletDial.rotation.x = Math.PI / 2;
    this.rightArm.add(this.gauntletDial);

    // Attach The Logic Maul
    this.logicMaul = createTheLogicMaulMesh(materials);
    this.logicMaul.position.set(0, -0.72, 0.25);
    this.logicMaul.rotation.x = Math.PI / 2;
    this.rightArm.add(this.logicMaul);

    this.torso.add(this.rightArm);

    // 6. Left Arm (Wields Oscillating Titanium Blade)
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.5, 0.2, 0);

    const lShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 12),
      materials.brass
    );
    this.leftArm.add(lShoulder);

    const lUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.07, 0.38, 12),
      materials.bluedSteel
    );
    lUpperArm.position.y = -0.22;
    this.leftArm.add(lUpperArm);

    const lForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.06, 0.38, 12),
      materials.brass
    );
    lForearm.position.y = -0.56;
    this.leftArm.add(lForearm);

    // Oscillating Saw Shield Attachment
    this.sawBladeGroup = new THREE.Group();
    this.sawBladeGroup.position.set(0, -0.7, 0.2);

    const sawHousing = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.2, 0.22),
      materials.hammeredIron
    );
    this.sawBladeGroup.add(sawHousing);

    const bladeGeo = createSawBladeGeometry(28, 0.42, 0.03);
    this.sawBladeMesh = new THREE.Mesh(bladeGeo, materials.titanium);
    this.sawBladeMesh.rotation.y = Math.PI / 2;
    this.sawBladeGroup.add(this.sawBladeMesh);

    this.leftArm.add(this.sawBladeGroup);
    this.torso.add(this.leftArm);

    // 7. Articulated Legs (Hydraulic Brass Greaves)
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.2, -0.35, 0);
    const lThigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.08, 0.45, 12),
      materials.bluedSteel
    );
    lThigh.position.y = -0.22;
    this.leftLeg.add(lThigh);
    const lCalf = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.07, 0.5, 12),
      materials.brass
    );
    lCalf.position.y = -0.65;
    this.leftLeg.add(lCalf);
    const lFoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.1, 0.26),
      materials.hammeredIron
    );
    lFoot.position.set(0, -0.92, 0.05);
    this.leftLeg.add(lFoot);
    this.torso.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.2, -0.35, 0);
    const rThigh = lThigh.clone();
    this.rightLeg.add(rThigh);
    const rCalf = lCalf.clone();
    this.rightLeg.add(rCalf);
    const rFoot = lFoot.clone();
    this.rightLeg.add(rFoot);
    this.torso.add(this.rightLeg);
  }

  /**
   * Sets logic gate index on the gauntlet dial (AND = 0, XOR = 1, NOT = 2, NAND = 3)
   */
  public setLogicGate(gate: 'AND' | 'XOR' | 'NOT' | 'NAND') {
    const angles = { AND: 0, XOR: Math.PI / 2, NOT: Math.PI, NAND: (Math.PI * 3) / 2 };
    this.gauntletDial.rotation.z = angles[gate] || 0;
  }

  /**
   * Triggers Logic Maul Kinetic Slam
   */
  public triggerHammerAttack() {
    if (this.isAttacking) return;
    this.isAttacking = true;
    this.attackType = 'hammer';
    this.attackTime = 0;
  }

  /**
   * Triggers Oscillating Saw Slash
   */
  public triggerSawAttack() {
    if (this.isAttacking) return;
    this.isAttacking = true;
    this.attackType = 'saw';
    this.attackTime = 0;
  }

  /**
   * Activates Mainspring Overdrive (Zemberek Hızlandırma)
   */
  public triggerOverdrive() {
    this.isOverdrive = true;
    this.overdriveTime = 6.0; // 6 seconds of frenzy
  }

  /**
   * Updates animations per frame
   */
  public update(delta: number, isMoving: boolean) {
    // 1. Overdrive decay & spinning gears
    if (this.isOverdrive) {
      this.overdriveTime -= delta;
      if (this.overdriveTime <= 0) {
        this.isOverdrive = false;
        this.overdriveTime = 0;
      }
      // Rapid spin of chest mainspring
      this.mainspringMesh.rotation.z += delta * 24.0;
    } else {
      this.mainspringMesh.rotation.z += delta * 1.5;
    }

    // 2. Continuous high-RPM spin of the titanium saw blade
    this.sawBladeMesh.rotation.z += delta * (this.isOverdrive ? 45.0 : 20.0);

    // Hammer top gear rotation
    const hammerGear = this.logicMaul.getObjectByName('hammerTopGear');
    if (hammerGear) {
      hammerGear.rotation.z += delta * (this.isOverdrive ? 18.0 : 4.0);
    }

    // 3. Manometer needle oscillation (diegetic steam boiler pressure indicator)
    const needleTarget = (this.boilerPressure - 0.5) * 2.8; // -1.4 rad to +1.4 rad
    const jitter = (Math.random() - 0.5) * 0.08;
    this.manometerNeedle.rotation.z = needleTarget + jitter;

    // 4. Locomotion walk cycle
    const speed = this.isOverdrive ? 18 : 10;
    if (isMoving) {
      this.walkPhase += delta * speed;
      const legSwing = Math.sin(this.walkPhase) * 0.45;
      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;

      // Slight body bounce
      this.torso.position.y = 1.35 + Math.abs(Math.sin(this.walkPhase * 2)) * 0.06;

      if (!this.isAttacking) {
        this.rightArm.rotation.x = -legSwing * 0.6;
        this.leftArm.rotation.x = legSwing * 0.6;
      }
    } else {
      // Idle breathing
      const idle = Math.sin(Date.now() * 0.002) * 0.03;
      this.torso.position.y = 1.35 + idle;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;

      if (!this.isAttacking) {
        this.rightArm.rotation.x = THREE.MathUtils.damp(this.rightArm.rotation.x, -0.2, 8, delta);
        this.leftArm.rotation.x = THREE.MathUtils.damp(this.leftArm.rotation.x, -0.2, 8, delta);
      }
    }

    // 5. Attack Animations
    if (this.isAttacking) {
      this.attackTime += delta * (this.isOverdrive ? 1.8 : 1.2);

      if (this.attackType === 'hammer') {
        // High wind-up -> Devastating downward forge smash
        if (this.attackTime < 0.2) {
          // Windup: arm raises up high
          const p = this.attackTime / 0.2;
          this.rightArm.rotation.x = -p * 2.2;
          this.rightArm.rotation.z = -p * 0.4;
          this.torso.rotation.x = -0.15 * p;
        } else if (this.attackTime < 0.38) {
          // Smash down onto anvil/automaton
          const p = (this.attackTime - 0.2) / 0.18;
          this.rightArm.rotation.x = -2.2 + p * 3.4;
          this.rightArm.rotation.z = -0.4 + p * 0.6;
          this.torso.rotation.x = 0.25 * p;
        } else if (this.attackTime < 0.6) {
          // Recovery
          const p = (this.attackTime - 0.38) / 0.22;
          this.rightArm.rotation.x = 1.2 - p * 1.4;
          this.torso.rotation.x = 0.25 * (1 - p);
        } else {
          this.isAttacking = false;
        }
      } else if (this.attackType === 'saw') {
        // Forward horizontal buzz saw slash
        if (this.attackTime < 0.18) {
          const p = this.attackTime / 0.18;
          this.leftArm.rotation.x = -p * 1.6;
          this.leftArm.rotation.y = -p * 0.8;
        } else if (this.attackTime < 0.4) {
          const p = (this.attackTime - 0.18) / 0.22;
          this.leftArm.rotation.y = -0.8 + p * 1.8;
        } else {
          this.isAttacking = false;
        }
      }
    }
  }
}
