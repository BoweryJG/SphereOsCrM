export const brushedMetalShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  
  fragmentShader: `
    uniform vec3 uBaseColor;
    uniform float uRoughness;
    uniform float uMetalness;
    uniform float uBrushIntensity;
    uniform vec2 uBrushDirection;
    uniform sampler2D uNoiseTexture;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    vec3 perturbNormal(vec3 normal, vec2 uv) {
      vec2 brushUv = uv * 50.0;
      float brushNoise = texture2D(uNoiseTexture, brushUv).r;
      
      vec3 tangent = normalize(vec3(uBrushDirection, 0.0));
      vec3 bitangent = cross(normal, tangent);
      
      float perturbation = (brushNoise - 0.5) * uBrushIntensity;
      return normalize(normal + perturbation * bitangent);
    }
    
    float fresnel(vec3 viewDir, vec3 normal, float ior) {
      float f0 = pow((1.0 - ior) / (1.0 + ior), 2.0);
      return f0 + (1.0 - f0) * pow(1.0 - dot(viewDir, normal), 5.0);
    }
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      vec3 perturbedNormal = perturbNormal(normal, vUv);
      
      float fresnelTerm = fresnel(viewDir, perturbedNormal, 1.5);
      
      vec3 color = uBaseColor;
      color = mix(color, vec3(1.0), fresnelTerm * uMetalness);
      
      float ndotv = max(0.0, dot(perturbedNormal, viewDir));
      color *= 0.5 + 0.5 * ndotv;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  
  uniforms: {
    uBaseColor: { value: [0.88, 0.88, 0.88] },
    uRoughness: { value: 0.4 },
    uMetalness: { value: 0.9 },
    uBrushIntensity: { value: 0.2 },
    uBrushDirection: { value: [0.707, 0.707] },
    uNoiseTexture: { value: null },
  }
};