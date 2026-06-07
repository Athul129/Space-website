import * as THREE from 'three'
import { seededRandom } from './math'

function drawPlanetBlobs(context, rand, palette, count, width, height, alpha = 0.8) {
    for (let i = 0; i < count; i += 1) {
        const x = rand() * width
        const y = rand() * height
        const radiusX = 22 + rand() * 95
        const radiusY = 8 + rand() * 36
        context.save()
        context.translate(x, y)
        context.rotate((rand() - 0.5) * 0.8)
        context.globalAlpha = alpha * (0.45 + rand() * 0.55)
        context.fillStyle = palette[Math.floor(rand() * palette.length)]
        context.beginPath()
        for (let step = 0; step < 18; step += 1) {
            const angle = (step / 18) * Math.PI * 2
            const noise = 0.72 + rand() * 0.55
            const px = Math.cos(angle) * radiusX * noise
            const py = Math.sin(angle) * radiusY * noise
            if (step === 0) context.moveTo(px, py)
            else context.lineTo(px, py)
        }
        context.closePath()
        context.fill()
        context.restore()
    }
}

export function makePlanetTexture(type) {
    const width = 1024
    const height = 512
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    const rand = seededRandom(type.length * 913)

    if (type === 'earth') {
        const ocean = context.createLinearGradient(0, 0, width, height)
        ocean.addColorStop(0, '#102f69')
        ocean.addColorStop(0.42, '#0b5f91')
        ocean.addColorStop(1, '#061b3f')
        context.fillStyle = ocean
        context.fillRect(0, 0, width, height)
        drawPlanetBlobs(context, rand, ['#247048', '#5f8d49', '#a78f53', '#285c40'], 44, width, height)
        drawPlanetBlobs(context, rand, ['rgba(255,255,255,0.52)', 'rgba(220,240,255,0.42)'], 34, width, height, 0.35)
    } else if (type === 'clouds') {
        context.clearRect(0, 0, width, height)
        drawPlanetBlobs(context, rand, ['rgba(255,255,255,0.55)', 'rgba(220,240,255,0.4)'], 68, width, height, 0.7)
    } else if (type === 'moon') {
        const gray = context.createLinearGradient(0, 0, width, height)
        gray.addColorStop(0, '#b7b8b2')
        gray.addColorStop(0.5, '#767a7c')
        gray.addColorStop(1, '#d7d2c7')
        context.fillStyle = gray
        context.fillRect(0, 0, width, height)
        for (let i = 0; i < 120; i += 1) {
            const x = rand() * width
            const y = rand() * height
            const radius = 3 + rand() * 26
            context.globalAlpha = 0.18 + rand() * 0.26
            context.fillStyle = rand() > 0.45 ? '#22252a' : '#f1eee5'
            context.beginPath()
            context.arc(x, y, radius, 0, Math.PI * 2)
            context.fill()
        }
    } else if (type === 'mars') {
        const mars = context.createLinearGradient(0, 0, width, height)
        mars.addColorStop(0, '#8e2d17')
        mars.addColorStop(0.48, '#d26d35')
        mars.addColorStop(1, '#491810')
        context.fillStyle = mars
        context.fillRect(0, 0, width, height)
        drawPlanetBlobs(context, rand, ['#62210f', '#f2a15b', '#9e3a1b', '#32100a'], 82, width, height, 0.58)
    } else {
        const saturn = context.createLinearGradient(0, 0, width, 0)
        saturn.addColorStop(0, '#b78e54')
        saturn.addColorStop(0.28, '#f1d59c')
        saturn.addColorStop(0.58, '#9f7244')
        saturn.addColorStop(1, '#e9c98a')
        context.fillStyle = saturn
        context.fillRect(0, 0, width, height)
        for (let y = 0; y < height; y += 13) {
            context.globalAlpha = 0.12 + rand() * 0.18
            context.fillStyle = rand() > 0.5 ? '#fff1c9' : '#6b4a32'
            context.fillRect(0, y, width, 4 + rand() * 7)
        }
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    return texture
}

export function makeRingAlphaTexture() {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    const rand = seededRandom(55)
    context.clearRect(0, 0, size, size)
    for (let i = 0; i < 80; i += 1) {
        const y = rand() * size
        context.globalAlpha = 0.15 + rand() * 0.35
        context.fillStyle = rand() > 0.4 ? '#f2e0b4' : '#8a7048'
        context.fillRect(0, y, size, 2 + rand() * 6)
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
}
