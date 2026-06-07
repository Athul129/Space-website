/**
 * Planet texture URLs. Uses jsDelivr (CORS-enabled) for three.js example maps.
 * Solar System Scope blocks cross-origin requests from localhost.
 */
const CDN = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r158/examples/textures/planets'

export function getPlanetTextureUrls(res = '8k') {
    void res
    return {
        earth: {
            day: `${CDN}/earth_atmos_2048.jpg`,
            night: `${CDN}/earth_lights_2048.png`,
            clouds: `${CDN}/earth_clouds_1024.png`,
            normal: `${CDN}/earth_normal_2048.jpg`,
        },
        moon: `${CDN}/moon_1024.jpg`,
        /** No mars map in three.js r158 examples — use procedural fallback. */
        mars: null,
        /** Saturn uses procedural canvas textures. */
        saturn: null,
    }
}
