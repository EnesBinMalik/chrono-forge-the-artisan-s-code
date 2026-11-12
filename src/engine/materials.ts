/**
 * CHRONO-FORGE: THE ARTISAN'S CODE
 * Handcrafted PBR Materials Library
 * Lead Architect: Enes Öztürk
 *
 * Zero AI slop, zero flat unshaded materials. Authentic hammered bronze,
 * brushed brass, heat-blued steel, molten silicon, and vacuum glass.
 */

import * as THREE from 'three';

export const isSoftwareGl = (() => {
  if (typeof window === 'undefined') return false;
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
})();

/**
 * Creates procedural brushed metal surface texture (brush strokes along tangent)
 */
function createBrushedMetalTexture(baseColorHex: string, streakColorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, 512, 512);

  // Micro-grooves and linear brush grain
  ctx.fillStyle = streakColorHex;
  for (let i = 0; i < 4000; i++) {
    const y = Math.random() * 512;
    const h = 1 + Math.random() * 2;
    const alpha = 0.03 + Math.random() * 0.08;
    ctx.globalAlpha = alpha;
    ctx.fillRect(0, y, 512, h);
  }

  // Artisan hammer marks & patina dots
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#0a0805';
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 2 + Math.random() * 6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Manometer Dial Texture
 */
export function createManometerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dial face (aged parchment / ivory brass)
  ctx.fillStyle = '#1c1813';
  ctx.fillRect(0, 0, 512, 512);

  ctx.beginPath();
  ctx.arc(256, 256, 240, 0, Math.PI * 2);
  ctx.fillStyle = '#e8d8b8';
  ctx.fill();
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#6b4f26';
  ctx.stroke();

  // Dial markings
  ctx.translate(256, 256);
  ctx.strokeStyle = '#2b1d0c';
  ctx.fillStyle = '#2b1d0c';
  ctx.font = 'bold 20px "Cinzel", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = -135; i <= 135; i += 15) {
    const rad = (i * Math.PI) / 180;
    const isMajor = i % 45 === 0;
    const r1 = 220;
    const r2 = isMajor ? 185 : 205;
    ctx.lineWidth = isMajor ? 4 : 2;

    ctx.beginPath();
    ctx.moveTo(Math.cos(rad) * r1, Math.sin(rad) * rrad(rad));
    ctx.lineTo(Math.cos(rad) * r2, Math.sin(rad) * r2);
    ctx.stroke();

    if (isMajor) {
      const val = Math.round((i + 135) / 2.7);
      const textR = 160;
      ctx.fillText(`${val}`, Math.cos(rad) * textR, Math.sin(rad) * textR);
    }
  }

  function rrad(r: number) {
    return Math.sin(r);
  }

  // Artisan Signature
  ctx.font = 'bold 15px "Cinzel Decorative", Georgia, serif';
  ctx.fillStyle = '#822405';
  ctx.fillText('ENES ÖZTÜRK', 0, -60);
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#4a3b2a';
  ctx.fillText('BAR x 100 • STEAM CORE', 0, -35);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class ArtisanMaterials {
  public brass: THREE.MeshStandardMaterial;
  public darkBrass: THREE.MeshStandardMaterial;
  public polishedGoldBrass: THREE.MeshPhysicalMaterial;
  public copperPatina: THREE.MeshStandardMaterial;
  public bluedSteel: THREE.MeshPhysicalMaterial;
  public titanium: THREE.MeshStandardMaterial;
  public hammeredIron: THREE.MeshStandardMaterial;
  public moltenSilicon: THREE.MeshStandardMaterial;
  public vacuumGlass: THREE.MeshPhysicalMaterial;
  public glowingFilament: THREE.MeshStandardMaterial;
  public punchCardBronze: THREE.MeshStandardMaterial;
  public manometerFace: THREE.MeshStandardMaterial;
  public needleRed: THREE.MeshStandardMaterial;

  constructor() {
    const brassTexture = createBrushedMetalTexture('#b88b4a', '#8a642e');
    const steelTexture = createBrushedMetalTexture('#3a4454', '#1f252e');
    const ironTexture = createBrushedMetalTexture('#26262b', '#18181c');

    // Handcrafted Antiqued Brass
    this.brass = new THREE.MeshStandardMaterial({
      color: 0xc8963e,
      roughness: 0.32,
      metalness: 0.9,
      map: brassTexture,
    });

    this.darkBrass = new THREE.MeshStandardMaterial({
      color: 0x785623,
      roughness: 0.5,
      metalness: 0.85,
    });

    this.polishedGoldBrass = new THREE.MeshPhysicalMaterial({
      color: 0xe6b349,
      roughness: 0.16,
      metalness: 0.96,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
    });

    // Oxidized Copper with green-turquoise patina flecks
    this.copperPatina = new THREE.MeshStandardMaterial({
      color: 0x9b5338,
      roughness: 0.58,
      metalness: 0.75,
    });

    // Artisan Blued Steel (Tempered at 295°C)
    this.bluedSteel = new THREE.MeshPhysicalMaterial({
      color: 0x22354d,
      roughness: 0.22,
      metalness: 0.92,
      clearcoat: 0.8,
      map: steelTexture,
    });

    // Oscillating Titanium Saw Blade
    this.titanium = new THREE.MeshStandardMaterial({
      color: 0x8a99a8,
      roughness: 0.2,
      metalness: 0.95,
      map: steelTexture,
    });

    // Heavy Anvil Iron
    this.hammeredIron = new THREE.MeshStandardMaterial({
      color: 0x242429,
      roughness: 0.65,
      metalness: 0.8,
      map: ironTexture,
    });

    // Molten Silicon (Foundry magma river)
    this.moltenSilicon = new THREE.MeshStandardMaterial({
      color: 0xff4800,
      emissive: 0xff3b00,
      emissiveIntensity: 1.8,
      roughness: 0.4,
      metalness: 0.2,
    });

    // Hand-blown Vacuum Tube Glass
    this.vacuumGlass = new THREE.MeshPhysicalMaterial({
      color: 0xd6e8ff,
      transparent: true,
      opacity: isSoftwareGl ? 0.35 : 0.45,
      roughness: 0.08,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.85,
      ior: 1.52,
      thickness: 0.4,
      depthWrite: false,
    });

    // Glowing Filament (Tungsten Cathode)
    this.glowingFilament = new THREE.MeshStandardMaterial({
      color: 0xff9d26,
      emissive: 0xffaa33,
      emissiveIntensity: 3.5,
      roughness: 0.1,
    });

    // Jacquard Punched Bronze Card
    this.punchCardBronze = new THREE.MeshStandardMaterial({
      color: 0xa8773b,
      roughness: 0.4,
      metalness: 0.85,
    });

    // Manometer Dial Face
    this.manometerFace = new THREE.MeshStandardMaterial({
      map: createManometerTexture(),
      roughness: 0.4,
      metalness: 0.1,
    });

    // Manometer & Indicator Needle
    this.needleRed = new THREE.MeshStandardMaterial({
      color: 0xb51d10,
      roughness: 0.3,
      metalness: 0.4,
    });
  }
}
