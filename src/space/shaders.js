export const atmosphereVertex = `
varying vec3 vNormal;
varying vec3 vView;
void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
}
`

export const atmosphereFragment = `
varying vec3 vNormal;
varying vec3 vView;
uniform vec3 glowColor;
uniform float intensity;
uniform float power;
void main() {
    float viewDot = dot(normalize(vNormal), normalize(vView));
    float rim = pow(1.0 - max(viewDot, 0.0), power);
    float halo = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
    float alpha = (rim * 0.85 + halo * 0.4) * intensity;
    gl_FragColor = vec4(glowColor, alpha);
}
`

export const earthSurfaceVertex = `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vWorldPos;
void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const earthSurfaceFragment = `
uniform sampler2D dayMap;
uniform sampler2D nightMap;
uniform vec3 sunDirection;
varying vec2 vUv;
varying vec3 vNormalW;
void main() {
    vec3 n = normalize(vNormalW);
    float ndl = dot(n, normalize(sunDirection));
    float dayMix = smoothstep(-0.12, 0.35, ndl);
    vec3 dayColor = texture2D(dayMap, vUv).rgb;
    vec3 nightColor = texture2D(nightMap, vUv).rgb * 1.35;
    vec3 color = mix(nightColor, dayColor, dayMix);
    gl_FragColor = vec4(color, 1.0);
}
`

export const accretionDiskFragment = `
varying vec2 vUv;
uniform float time;
uniform vec3 inner;
uniform vec3 mid;
uniform vec3 outer;
void main() {
    float radius = abs(vUv.y - 0.5) * 2.0;
    float swirl = sin((vUv.x * 40.0) + time * 2.4) * 0.08;
    radius += swirl;
    vec3 color = mix(inner, mid, smoothstep(0.06, 0.42, radius));
    color = mix(color, outer, smoothstep(0.52, 1.0, radius));
    float alpha = (1.0 - smoothstep(0.0, 1.0, radius)) * 0.82;
    float hot = smoothstep(0.02, 0.18, radius) * (0.6 + 0.4 * sin(time * 8.0 + vUv.x * 24.0));
    color += vec3(1.0, 0.85, 0.5) * hot * 0.35;
    gl_FragColor = vec4(color, alpha);
}
`

export const accretionDiskVertex = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const lensingFragment = `
uniform float strength;
varying vec2 vUv;
void main() {
    vec2 toCenter = vUv - 0.5;
    float dist = length(toCenter);
    float ring = smoothstep(0.42, 0.18, dist) * smoothstep(0.02, 0.12, dist);
    float swirl = sin(atan(toCenter.y, toCenter.x) * 8.0 + dist * 24.0) * 0.15;
    vec3 color = mix(vec3(0.35, 0.55, 1.0), vec3(1.0, 0.75, 0.45), ring + swirl);
    float alpha = ring * strength * 0.65;
    gl_FragColor = vec4(color, alpha);
}
`

export const lensingVertex = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
