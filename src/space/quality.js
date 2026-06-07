export function getQualitySettings() {
    const mobile = typeof window !== 'undefined' && (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches)
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lowCores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4

    if (mobile || reduced) {
        return {
            tier: 'mobile',
            starCount: { distant: 3500, near: 900, dust: 450, nebula: 300, belt: 140, ring: 500 },
            asteroidCount: 90,
            textureRes: '2k',
            postProcessing: false,
            dpr: [1, 1.15],
            dof: false,
            shadows: false,
        }
    }

    if (lowCores) {
        return {
            tier: 'low',
            starCount: { distant: 7000, near: 1800, dust: 900, nebula: 700, belt: 400, ring: 1000 },
            asteroidCount: 160,
            textureRes: '2k',
            postProcessing: false,
            dpr: [1, 1.35],
            dof: false,
            shadows: false,
        }
    }

    return {
        tier: 'desktop',
        starCount: { distant: 9000, near: 2200, dust: 1200, nebula: 900, belt: 500, ring: 1200 },
        asteroidCount: 200,
        textureRes: '2k',
        postProcessing: false,
        dpr: [1, 1.5],
        dof: false,
        shadows: false,
    }
}
