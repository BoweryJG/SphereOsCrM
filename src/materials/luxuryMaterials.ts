import * as THREE from 'three';

export const materials = {
  chrome: new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    reflectivity: 1,
    envMapIntensity: 3,
  }),

  redTip: new THREE.MeshPhysicalMaterial({
    color: 0xff0000,
    metalness: 0.8,
    roughness: 0.3,
    emissive: 0xff0000,
    emissiveIntensity: 0.2,
  }),

  brushedAluminum: new THREE.MeshPhysicalMaterial({
    color: 0xe0e0e0,
    metalness: 0.9,
    roughness: 0.4,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2,
    anisotropy: 1,
    anisotropyRotation: Math.PI / 4,
  }),

  sapphireGlass: new THREE.MeshPhysicalMaterial({
    color: 0xf0f0ff,
    metalness: 0,
    roughness: 0,
    transmission: 0.95,
    thickness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0,
    ior: 1.77,
    transparent: true,
  }),

  blackDial: new THREE.MeshPhysicalMaterial({
    color: 0x0a0a0a,
    metalness: 0.2,
    roughness: 0.8,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
  }),

  goldAccent: new THREE.MeshPhysicalMaterial({
    color: 0xffd700,
    metalness: 1,
    roughness: 0.2,
    emissive: 0xffd700,
    emissiveIntensity: 0.1,
  }),

  leather: new THREE.MeshPhysicalMaterial({
    color: 0x1a1a1a,
    metalness: 0,
    roughness: 0.9,
    clearcoat: 0.1,
    clearcoatRoughness: 0.8,
    normalScale: new THREE.Vector2(0.5, 0.5),
  }),

  carbonFiber: new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    metalness: 0.3,
    roughness: 0.6,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    anisotropy: 1,
    anisotropyRotation: 0,
  }),

  jewel: new THREE.MeshPhysicalMaterial({
    color: 0xff0000,
    metalness: 0,
    roughness: 0,
    transmission: 0.9,
    thickness: 1,
    ior: 2.4,
    emissive: 0xff0000,
    emissiveIntensity: 0.5,
    transparent: true,
  }),

  bezelMetal: new THREE.MeshPhysicalMaterial({
    color: 0xb0b0b0,
    metalness: 0.95,
    roughness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    reflectivity: 1,
  }),
};

export const updateMaterialEnvironment = (envMap: THREE.Texture) => {
  Object.values(materials).forEach(material => {
    if ('envMap' in material) {
      material.envMap = envMap;
      material.needsUpdate = true;
    }
  });
};