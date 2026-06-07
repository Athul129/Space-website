export const clamp01 = (value) => Math.min(1, Math.max(0, value))

export const smooth = (value) => value * value * (3 - 2 * value)

export const range = (progress, start, end) => clamp01((progress - start) / (end - start))

export const bell = (progress, start, end) => {
    const value = range(progress, start, end)
    return Math.sin(value * Math.PI)
}

/** Cinematic ease — slow in, cruise, slow out */
export const easeInOutQuint = (t) => (t < 0.5 ? 16 * t ** 5 : 1 - ((-2 * t + 2) ** 5) / 2)

export const easeOutExpo = (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t))

export function seededRandom(seed) {
    let state = seed
    return () => {
        state += 0x6d2b79f5
        let next = state
        next = Math.imul(next ^ (next >>> 15), next | 1)
        next ^= next + Math.imul(next ^ (next >>> 7), next | 61)
        return ((next ^ (next >>> 14)) >>> 0) / 4294967296
    }
}

export function lerpSegment(progress, segment, next, easeFn = easeInOutQuint) {
    const local = smooth(range(progress, segment.t, next.t))
    return easeFn(local)
}
