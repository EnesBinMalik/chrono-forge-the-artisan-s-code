/**
 * CHRONO-FORGE: THE ARTISAN'S CODE
 * Procedural Clockwork & Tool Geometries
 * Lead Architect: Enes Öztürk
 *
 * Mathematically modeled involute gears, Geneva mechanisms,
 * escapements, punch cards, vacuum tubes, and the Logic Maul.
 */

import * as THREE from 'three';

/**
 * Generates an authentic clockwork spur gear with N teeth, hub, and spoke cutouts
 */
export function createClockworkGearGeometry(
  teethCount: number = 24,
  outerRadius: number = 2.0,
  pitchRadius: number = 1.7,
  innerRadius: number = 1.4,
  thickness: number = 0.25,
  boreRadius: number = 0.35,
  spokeCount: number = 4
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teethCount;
  const halfStep = step / 2;
  const quarterStep = step / 4;

  // Exterior perimeter with gear teeth
  for (let i = 0; i < teethCount; i++) {
    const angle = i * step;

    const a1 = angle;
    const a2 = angle + quarterStep * 0.7;
    const a3 = angle + halfStep - quarterStep * 0.7;
    const a4 = angle + halfStep;
    const a5 = angle + step;

    // Root -> Involute flank -> Tip -> Outer crest -> Down flank
    if (i === 0) {
      shape.moveTo(Math.cos(a1) * innerRadius, Math.sin(a1) * innerRadius);
    } else {
      shape.lineTo(Math.cos(a1) * innerRadius, Math.sin(a1) * innerRadius);
    }
    shape.lineTo(Math.cos(a2) * pitchRadius, Math.sin(a2) * pitchRadius);
    shape.lineTo(Math.cos(a3) * outerRadius, Math.sin(a3) * outerRadius);
    shape.lineTo(Math.cos(a4) * outerRadius, Math.sin(a4) * outerRadius);
    shape.lineTo(Math.cos(a5) * innerRadius, Math.sin(a5) * innerRadius);
  }

  // Center axle bore hole
  const boreHole = new THREE.Path();
  boreHole.absarc(0, 0, boreRadius, 0, Math.PI * 2, true);
  shape.holes.push(boreHole);

  // Spoke cutouts (traditional horology openwork)
  if (spokeCount > 0 && innerRadius > boreRadius * 2.2) {
    const spokeInnerR = boreRadius * 1.5;
    const spokeOuterR = innerRadius * 0.82;
    const spokeAngleStep = (Math.PI * 2) / spokeCount;
    const spokeWidth = spokeAngleStep * 0.35;

    for (let s = 0; s < spokeCount; s++) {
      const startA = s * spokeAngleStep + (spokeAngleStep - spokeWidth) / 2;
      const endA = startA + spokeWidth;

      const cutout = new THREE.Path();
      cutout.moveTo(Math.cos(startA) * spokeInnerR, Math.sin(startA) * spokeInnerR);
      cutout.lineTo(Math.cos(startA) * spokeOuterR, Math.sin(startA) * spokeOuterR);
      cutout.absarc(0, 0, spokeOuterR, startA, endA, false);
      cutout.lineTo(Math.cos(endA) * spokeInnerR, Math.sin(endA) * spokeInnerR);
      cutout.absarc(0, 0, spokeInnerR, endA, startA, true);
      shape.holes.push(cutout);
    }
  }

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelSegments: 2,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

/**
 * Escapement Wheel Geometry (hooked ratchet teeth of a master chronometer)
 */
export function createEscapementWheelGeometry(
  teeth: number = 15,
  radius: number = 1.5,
  thickness: number = 0.15
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;

  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.25;
    const a2 = a0 + step * 0.85;

    // Hooked impulse face
    const rRoot = radius * 0.72;
    const rTip = radius;
    const rDrop = radius * 0.88;

    if (i === 0) {
      shape.moveTo(Math.cos(a0) * rRoot, Math.sin(a0) * rRoot);
    } else {
      shape.lineTo(Math.cos(a0) * rRoot, Math.sin(a0) * rRoot);
    }
    shape.lineTo(Math.cos(a1) * rTip, Math.sin(a1) * rTip);
    shape.lineTo(Math.cos(a2) * rDrop, Math.sin(a2) * rDrop);
  }

  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.25, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  geom.center();
  return geom;
}

/**
 * Circular Saw Blade with reverse teeth (Oscillating Titanium Blade)
 */
export function createSawBladeGeometry(
  teeth: number = 32,
  radius: number = 0.8,
  thickness: number = 0.06
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;

  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.7;
    const rInner = radius * 0.84;
    const rOuter = radius;

    if (i === 0) {
      shape.moveTo(Math.cos(a0) * rInner, Math.sin(a0) * rInner);
    } else {
      shape.lineTo(Math.cos(a0) * rInner, Math.sin(a0) * rInner);
    }
    shape.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
  }

  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.18, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 1,
  });
  geom.center();
  return geom;
}

/**
 * Jacquard Punched Bronze Card geometry with punched hole patterns
 */
export function createPunchCardGeometry(
  width: number = 3.2,
  height: number = 1.8,
  thickness: number = 0.08,
  rows: number = 6,
  cols: number = 12
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const hw = width / 2;
  const hh = height / 2;

  // Chamfered card corners
  const c = 0.15;
  shape.moveTo(-hw + c, -hh);
  shape.lineTo(hw - c, -hh);
  shape.lineTo(hw, -hh + c);
  shape.lineTo(hw, hh - c);
  shape.lineTo(hw - c, hh);
  shape.lineTo(-hw + c, hh);
  shape.lineTo(-hw, hh - c);
  shape.lineTo(-hw, -hh + c);
  shape.closePath();

  // Procedural punched code bits (deterministic based on row/col logic)
  const holeR = 0.055;
  const xSpan = (width - 0.6) / cols;
  const ySpan = (height - 0.5) / rows;
  const startX = -hw + 0.3 + xSpan / 2;
  const startY = -hh + 0.25 + ySpan / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Deterministic binary punch pattern
      const isPunched = ((r * 7 + c * 13 + 3) % 5 === 0) || (c === 0 || c === cols - 1);
      if (isPunched) {
        const hx = startX + c * xSpan;
        const hy = startY + r * ySpan;
        const hole = new THREE.Path();
        hole.absarc(hx, hy, holeR, 0, Math.PI * 2, true);
        shape.holes.push(hole);
      }
    }
  }

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 1,
  });
  geom.center();
  return geom;
}

/**
 * Hand-blown Vacuum Tube Bulb geometry (lathe envelope)
 */
export function createVacuumBulbGeometry(height: number = 2.4, radius: number = 0.8): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const segments = 24;

  // Base socket neck
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(radius * 0.45, 0));
  points.push(new THREE.Vector2(radius * 0.45, height * 0.15));

  // Bulbous glass expansion
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = height * 0.15 + t * (height * 0.85);
    // Profile: expands, holds dome, curves into sealed tip
    let r = radius;
    if (t < 0.25) {
      r = THREE.MathUtils.lerp(radius * 0.45, radius, t / 0.25);
    } else if (t > 0.75) {
      const topT = (t - 0.75) / 0.25;
      r = Math.sqrt(Math.max(0, 1 - topT * topT)) * radius;
    }
    points.push(new THREE.Vector2(r, y));
  }

  // Top exhaust tip nipple
  points.push(new THREE.Vector2(0.04, height + 0.1));
  points.push(new THREE.Vector2(0, height + 0.12));

  return new THREE.LatheGeometry(points, 28);
}

/**
 * Creates The Logic Maul (Ağır Kinetik Mantık Çekici) 3D Group
 * Composite 10-part procedural model
 */
export function createTheLogicMaulMesh(
  materials: {
    brass: THREE.Material;
    bluedSteel: THREE.Material;
    polishedGoldBrass: THREE.Material;
    copperPatina: THREE.Material;
    hammeredIron: THREE.Material;
  }
): THREE.Group {
  const maulGroup = new THREE.Group();
  maulGroup.name = 'TheLogicMaul';

  // 1. Shaft / Handle (Tempered blued steel rod with spiral brass grip)
  const shaftGeom = new THREE.CylinderGeometry(0.045, 0.05, 1.8, 16);
  const shaftMesh = new THREE.Mesh(shaftGeom, materials.bluedSteel);
  shaftMesh.position.y = 0.4;
  maulGroup.add(shaftMesh);

  // Grip leather/brass wire wrap
  for (let i = -0.3; i <= 0.4; i += 0.08) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.055, 0.015, 8, 16),
      materials.polishedGoldBrass
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = i;
    maulGroup.add(ring);
  }

  // 2. Pommel Counterweight (faceted brass polyhedron)
  const pommel = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.12),
    materials.brass
  );
  pommel.position.y = -0.52;
  maulGroup.add(pommel);

  // 3. Hammer Head Core (Ağır Dövme Demiri Blok)
  const headCore = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.32, 0.38),
    materials.hammeredIron
  );
  headCore.position.y = 1.3;
  maulGroup.add(headCore);

  // 4. Kinetic Striking Face (Front - AND/XOR Gate Forge Die)
  const frontDieGeom = new THREE.CylinderGeometry(0.18, 0.19, 0.22, 16);
  const frontDie = new THREE.Mesh(frontDieGeom, materials.polishedGoldBrass);
  frontDie.rotation.z = Math.PI / 2;
  frontDie.position.set(0.35, 1.3, 0);
  maulGroup.add(frontDie);

  // 5. Heavy Pneumatic Piston / Counter-punch (Back)
  const backPistonGeom = new THREE.CylinderGeometry(0.14, 0.16, 0.28, 12);
  const backPiston = new THREE.Mesh(backPistonGeom, materials.bluedSteel);
  backPiston.rotation.z = Math.PI / 2;
  backPiston.position.set(-0.35, 1.3, 0);
  maulGroup.add(backPiston);

  // 6. Side Logic Gate Circuit Plate (Engraved with AND / XOR logic symbol)
  const sidePlateGeom = new THREE.BoxGeometry(0.3, 0.2, 0.04);
  const sidePlate = new THREE.Mesh(sidePlateGeom, materials.copperPatina);
  sidePlate.position.set(0, 1.3, 0.21);
  maulGroup.add(sidePlate);

  const sidePlate2 = new THREE.Mesh(sidePlateGeom, materials.copperPatina);
  sidePlate2.position.set(0, 1.3, -0.21);
  maulGroup.add(sidePlate2);

  // 7. Rotating Escapement Gear on top of the hammer
  const topGearGeom = createClockworkGearGeometry(16, 0.2, 0.17, 0.13, 0.04, 0.04, 3);
  const topGear = new THREE.Mesh(topGearGeom, materials.polishedGoldBrass);
  topGear.rotation.x = Math.PI / 2;
  topGear.position.y = 1.5;
  topGear.name = 'hammerTopGear';
  maulGroup.add(topGear);

  // 8. Copper steam exhaust micro-pipes
  const pipeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.2, 1.25, 0.18),
    new THREE.Vector3(-0.25, 1.15, 0.22),
    new THREE.Vector3(-0.2, 1.05, 0.1),
  ]);
  const pipeGeom = new THREE.TubeGeometry(pipeCurve, 12, 0.02, 8, false);
  const pipe = new THREE.Mesh(pipeGeom, materials.brass);
  maulGroup.add(pipe);

  maulGroup.scale.set(1.2, 1.2, 1.2);
  return maulGroup;
}
