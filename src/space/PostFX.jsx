/**
 * Post-processing is disabled — hijacking gl.render broke the R3F render loop (black screen).
 * Cinematic look comes from tone mapping, materials, and lighting on the default renderer.
 */
export function CinematicPostFX() {
    return null
}
