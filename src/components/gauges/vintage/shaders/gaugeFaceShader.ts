export const gaugeFaceShader = {
  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform vec3 uBackgroundColor;
    uniform vec3 uTickColor;
    uniform vec3 uTextColor;
    uniform float uRadius;
    uniform float uTime;
    uniform bool uNightMode;
    
    varying vec2 vUv;
    
    #define PI 3.14159265359
    
    float sdArc(vec2 p, float radius, float angle, float width) {
      float a = atan(p.y, p.x);
      float d = length(p) - radius;
      float angleDiff = abs(mod(a + PI, angle) - angle * 0.5);
      return max(abs(d) - width * 0.5, angleDiff - angle * 0.5);
    }
    
    float tick(vec2 p, float angle, float length, float width) {
      vec2 dir = vec2(cos(angle), sin(angle));
      vec2 start = dir * 0.8;
      vec2 end = dir * (0.8 + length);
      
      vec2 pa = p - start;
      vec2 ba = end - start;
      float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
      float d = length(pa - ba * h);
      
      return smoothstep(width, 0.0, d);
    }
    
    vec3 renderGaugeFace(vec2 uv) {
      vec2 center = uv - 0.5;
      float dist = length(center);
      
      vec3 color = uBackgroundColor;
      
      // Radial gradient
      color = mix(color, color * 0.8, smoothstep(0.0, 0.5, dist));
      
      // Add subtle noise texture
      float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
      color += noise * 0.02;
      
      // Major ticks
      for (float i = 0.0; i < 11.0; i++) {
        float angle = mix(-2.35, 0.785, i / 10.0);
        float tickStrength = tick(center, angle, 0.05, 0.003);
        color = mix(color, uTickColor, tickStrength);
      }
      
      // Minor ticks
      for (float i = 0.0; i < 51.0; i++) {
        float angle = mix(-2.35, 0.785, i / 50.0);
        float tickStrength = tick(center, angle, 0.025, 0.0015);
        color = mix(color, uTickColor, tickStrength * 0.5);
      }
      
      // Night mode glow
      if (uNightMode) {
        vec3 glowColor = vec3(1.0, 0.9, 0.7);
        float glowStrength = 0.3 + 0.1 * sin(uTime * 2.0);
        color = mix(color, glowColor, glowStrength * (1.0 - dist * 2.0));
      }
      
      return color;
    }
    
    void main() {
      vec3 color = renderGaugeFace(vUv);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  
  uniforms: {
    uBackgroundColor: { value: [0.05, 0.05, 0.05] },
    uTickColor: { value: [0.9, 0.9, 0.9] },
    uTextColor: { value: [1.0, 1.0, 1.0] },
    uRadius: { value: 0.45 },
    uTime: { value: 0 },
    uNightMode: { value: false },
  }
};