/**
 * CHRONO-FORGE: THE ARTISAN'S CODE
 * Physical Particles & Debris Engine
 * Lead Architect: Enes Öztürk
 *
 * Real physical sparks, flying brass nuts, bolts, springs, steam plumes, and glass shards.
 */

import * as THREE from 'three';

interface SparkParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: THREE.Color;
  life: number;
  maxLife: number;
  size: number;
}

interface DebrisObject {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  rotVel: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class ParticleDebrisSystem {
  private sparks: SparkParticle[] = [];
  private debrisPool: DebrisObject[] = [];
  private sparkPoints: THREE.Points;
  private sparkGeo: THREE.BufferGeometry;
  private sparkPositions: Float32Array;
  private sparkColors: Float32Array;
  private sparkSizes: Float32Array;
  private maxSparks = 600;
  private scene: THREE.Scene;

  // Shared reusable geometries for debris
  private boltGeom: THREE.BufferGeometry;
  private springGeom: THREE.BufferGeometry;
  private glassShardGeom: THREE.BufferGeometry;
  private brassMat: THREE.Material;
  private steelMat: THREE.Material;
  private glassMat: THREE.Material;

  constructor(scene: THREE.Scene, brassMat: THREE.Material, steelMat: THREE.Material, glassMat: THREE.Material) {
    this.scene = scene;
    this.brassMat = brassMat;
    this.steelMat = steelMat;
    this.glassMat = glassMat;

    // Spark points
    this.sparkGeo = new THREE.BufferGeometry();
    this.sparkPositions = new Float32Array(this.maxSparks * 3);
    this.sparkColors = new Float32Array(this.maxSparks * 3);
    this.sparkSizes = new Float32Array(this.maxSparks);

    this.sparkGeo.setAttribute('position', new THREE.BufferAttribute(this.sparkPositions, 3));
    this.sparkGeo.setAttribute('color', new THREE.BufferAttribute(this.sparkColors, 3));
    this.sparkGeo.setAttribute('size', new THREE.BufferAttribute(this.sparkSizes, 1));

    // Custom spark material
    const sparkMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });

    this.sparkPoints = new THREE.Points(this.sparkGeo, sparkMat);
    this.sparkPoints.frustumCulled = false;
    this.scene.add(this.sparkPoints);

    // Debris geometries (hex nut/bolt, coiled spring, glass shard)
    this.boltGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.06, 6);
    this.springGeom = new THREE.TorusGeometry(0.08, 0.02, 6, 12);
    this.glassShardGeom = new THREE.TetrahedronGeometry(0.12);
  }

  /**
   * Spawns radiant incandescent sparks from hammer strike
   */
  public emitSparks(origin: THREE.Vector3, count: number = 24, power: number = 8.0) {
    const gold = new THREE.Color(0xffcc44);
    const orange = new THREE.Color(0xff6611);

    for (let i = 0; i < count; i++) {
      if (this.sparks.length >= this.maxSparks) {
        this.sparks.shift();
      }

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.45; // upward spray
      const speed = power * (0.4 + Math.random() * 0.8);

      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = Math.cos(phi) * speed + 2.0;
      const vz = Math.sin(phi) * Math.sin(theta) * speed;

      this.sparks.push({
        pos: origin.clone(),
        vel: new THREE.Vector3(vx, vy, vz),
        color: Math.random() > 0.4 ? gold.clone() : orange.clone(),
        life: 0,
        maxLife: 0.35 + Math.random() * 0.4,
        size: 0.12 + Math.random() * 0.15,
      });
    }
  }

  /**
   * Spawns physical brass bolts, nuts and recoil springs that tumble with gravity
   */
  public emitMechanicalDebris(origin: THREE.Vector3, count: number = 6) {
    for (let i = 0; i < count; i++) {
      const isSpring = Math.random() > 0.6;
      const geom = isSpring ? this.springGeom : this.boltGeom;
      const mat = Math.random() > 0.5 ? this.brassMat : this.steelMat;
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(origin);
      this.scene.add(mesh);

      const speed = 4.0 + Math.random() * 6.0;
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * speed;
      const vy = 3.5 + Math.random() * 4.5;
      const vz = Math.sin(angle) * speed;

      this.debrisPool.push({
        mesh,
        vel: new THREE.Vector3(vx, vy, vz),
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ),
        life: 0,
        maxLife: 2.5,
      });
    }
  }

  /**
   * Spawns shattering vacuum tube glass shards
   */
  public emitGlassShards(origin: THREE.Vector3, count: number = 14) {
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.glassShardGeom, this.glassMat);
      mesh.position.copy(origin);
      mesh.scale.setScalar(0.6 + Math.random() * 0.8);
      this.scene.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const speed = 3.0 + Math.random() * 5.0;
      const vx = Math.cos(angle) * speed;
      const vy = 2.0 + Math.random() * 5.0;
      const vz = Math.sin(angle) * speed;

      this.debrisPool.push({
        mesh,
        vel: new THREE.Vector3(vx, vy, vz),
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15
        ),
        life: 0,
        maxLife: 2.0,
      });
    }
  }

  /**
   * Updates physics and particle positions per frame
   */
  public update(delta: number) {
    const gravity = -18.0;

    // 1. Update sparks
    let sparkIdx = 0;
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const p = this.sparks[i];
      p.life += delta;
      if (p.life >= p.maxLife) {
        this.sparks.splice(i, 1);
        continue;
      }

      // Physics
      p.vel.y += gravity * delta;
      p.pos.x += p.vel.x * delta;
      p.pos.y += p.vel.y * delta;
      p.pos.z += p.vel.z * delta;

      // Bounce on floor
      if (p.pos.y < 0.05) {
        p.pos.y = 0.05;
        p.vel.y = -p.vel.y * 0.45;
        p.vel.x *= 0.7;
        p.vel.z *= 0.7;
      }

      const lifeRatio = 1 - p.life / p.maxLife;

      this.sparkPositions[sparkIdx * 3] = p.pos.x;
      this.sparkPositions[sparkIdx * 3 + 1] = p.pos.y;
      this.sparkPositions[sparkIdx * 3 + 2] = p.pos.z;

      this.sparkColors[sparkIdx * 3] = p.color.r * lifeRatio;
      this.sparkColors[sparkIdx * 3 + 1] = p.color.g * lifeRatio;
      this.sparkColors[sparkIdx * 3 + 2] = p.color.b * lifeRatio;

      this.sparkSizes[sparkIdx] = p.size * lifeRatio;
      sparkIdx++;
    }

    // Fill remaining buffer with zero
    for (let i = sparkIdx; i < this.maxSparks; i++) {
      this.sparkSizes[i] = 0;
    }

    this.sparkGeo.attributes.position.needsUpdate = true;
    this.sparkGeo.attributes.color.needsUpdate = true;
    this.sparkGeo.attributes.size.needsUpdate = true;

    // 2. Update physical debris
    for (let i = this.debrisPool.length - 1; i >= 0; i--) {
      const d = this.debrisPool[i];
      d.life += delta;
      if (d.life >= d.maxLife) {
        this.scene.remove(d.mesh);
        d.mesh.geometry.dispose();
        this.debrisPool.splice(i, 1);
        continue;
      }

      d.vel.y += gravity * delta;
      d.mesh.position.x += d.vel.x * delta;
      d.mesh.position.y += d.vel.y * delta;
      d.mesh.position.z += d.vel.z * delta;

      d.mesh.rotation.x += d.rotVel.x * delta;
      d.mesh.rotation.y += d.rotVel.y * delta;
      d.mesh.rotation.z += d.rotVel.z * delta;

      // Floor bounce with angular dampening
      if (d.mesh.position.y < 0.08) {
        d.mesh.position.y = 0.08;
        d.vel.y = -d.vel.y * 0.4;
        d.vel.x *= 0.75;
        d.vel.z *= 0.75;
        d.rotVel.multiplyScalar(0.7);
      }
    }
  }

  public dispose() {
    this.scene.remove(this.sparkPoints);
    this.sparkGeo.dispose();
    this.debrisPool.forEach((d) => {
      this.scene.remove(d.mesh);
    });
    this.debrisPool = [];
  }
}
