import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { bell, range, seededRandom } from './math'
import { getPointSprite } from './pointSprite'

function buildStarLayer(seed, count, spread, zRange, size, colorFn) {
    const rand = seededRandom(seed)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const color = new THREE.Color()

    for (let i = 0; i < count; i += 1) {
        const radius = spread.min + rand() * (spread.max - spread.min)
        const angle = rand() * Math.PI * 2
        const y = (rand() - 0.5) * spread.y
        const z = zRange[0] - rand() * (zRange[0] - zRange[1])
        positions[i * 3] = Math.cos(angle) * radius
        positions[i * 3 + 1] = y
        positions[i * 3 + 2] = z
        colorFn(color, rand)
        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
    }
    return { positions, colors, size }
}

export function LayeredStarField({ progressRef, mouseRef, quality }) {
    const distantRef = useRef()
    const nearRef = useRef()
    const dustRef = useRef()
    const nebulaRef = useRef()
    const bhEnergyRef = useRef()

    const counts = quality.starCount
    const sprite = useMemo(() => getPointSprite(), [])

    const distant = useMemo(
        () =>
            buildStarLayer(
                12,
                counts.distant,
                { min: 28, max: 180, y: 110 },
                [-20, -420],
                0.04,
                (c, r) => c.setHSL(0.56 + r() * 0.14, 0.28 + r() * 0.35, 0.55 + r() * 0.35),
            ),
        [counts.distant],
    )

    const near = useMemo(
        () =>
            buildStarLayer(
                44,
                counts.near,
                { min: 4, max: 38, y: 22 },
                [-15, -380],
                0.085,
                (c, r) => c.setHSL(0.58 + r() * 0.1, 0.4 + r() * 0.45, 0.72 + r() * 0.28),
            ),
        [counts.near],
    )

    const dust = useMemo(() => {
        const rand = seededRandom(77)
        const count = counts.dust
        const positions = new Float32Array(count * 3)
        for (let i = 0; i < count; i += 1) {
            positions[i * 3] = (rand() - 0.5) * 48
            positions[i * 3 + 1] = (rand() - 0.5) * 28
            positions[i * 3 + 2] = -40 - rand() * 340
        }
        return positions
    }, [counts.dust])

    const nebula = useMemo(() => {
        const rand = seededRandom(201)
        const count = counts.nebula
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        const color = new THREE.Color()
        for (let i = 0; i < count; i += 1) {
            positions[i * 3] = (rand() - 0.5) * 70
            positions[i * 3 + 1] = (rand() - 0.5) * 42
            positions[i * 3 + 2] = -220 - rand() * 120
            color.setHSL(0.72 + rand() * 0.18, 0.65, 0.45 + rand() * 0.35)
            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b
        }
        return { positions, colors }
    }, [counts.nebula])

    const bhEnergy = useMemo(() => {
        const rand = seededRandom(333)
        const count = 600
        const positions = new Float32Array(count * 3)
        for (let i = 0; i < count; i += 1) {
            const radius = 6 + rand() * 18
            const angle = rand() * Math.PI * 2
            positions[i * 3] = Math.cos(angle) * radius
            positions[i * 3 + 1] = (rand() - 0.5) * 2.2
            positions[i * 3 + 2] = Math.sin(angle) * radius
        }
        return positions
    }, [])

    useFrame((state) => {
        const progress = progressRef.current
        const t = state.clock.elapsedTime
        const parallax = progress * 22 + mouseRef.current.x * 0.4

        const pull = range(progress, 0.94, 1)
        distantRef.current.rotation.y = t * 0.004 + mouseRef.current.x * 0.012 + pull * 0.08
        distantRef.current.position.z = parallax * 0.35
        distantRef.current.scale.setScalar(1 + pull * 0.15)
        nearRef.current.scale.setScalar(1 + pull * 0.22)

        nearRef.current.rotation.y = t * 0.008 + mouseRef.current.x * 0.022
        nearRef.current.position.z = parallax * 0.65

        dustRef.current.rotation.y = t * 0.015
        dustRef.current.position.z = parallax * 0.9
        dustRef.current.material.opacity = 0.04 + range(progress, 0.5, 0.75) * 0.12

        nebulaRef.current.rotation.z = t * 0.006
        nebulaRef.current.material.opacity = 0.05 + bell(progress, 0.78, 0.92) * 0.42 + range(progress, 0.72, 0.9) * 0.2

        bhEnergyRef.current.rotation.z = -t * (0.4 + pull * 1.2)
        bhEnergyRef.current.material.opacity = pull * 0.55
        bhEnergyRef.current.position.set(0, 0, -378)
    })

    return (
        <>
            <points ref={distantRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[distant.positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[distant.colors, 3]} />
                </bufferGeometry>
                <pointsMaterial map={sprite} size={distant.size} vertexColors transparent opacity={0.88} depthWrite={false} sizeAttenuation alphaTest={0.02} />
            </points>
            <points ref={nearRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[near.positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[near.colors, 3]} />
                </bufferGeometry>
                <pointsMaterial map={sprite} size={near.size} vertexColors transparent opacity={0.95} depthWrite={false} sizeAttenuation alphaTest={0.02} />
            </points>
            <points ref={dustRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[dust, 3]} />
                </bufferGeometry>
                <pointsMaterial map={sprite} size={0.028} color="#8ea4c8" transparent opacity={0.06} depthWrite={false} blending={THREE.AdditiveBlending} alphaTest={0.02} />
            </points>
            <points ref={nebulaRef} position={[0, 0, -268]}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[nebula.positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[nebula.colors, 3]} />
                </bufferGeometry>
                <pointsMaterial map={sprite} size={0.12} vertexColors transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} alphaTest={0.02} />
            </points>
            <points ref={bhEnergyRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[bhEnergy, 3]} />
                </bufferGeometry>
                <pointsMaterial map={sprite} size={0.09} color="#7aa7ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} alphaTest={0.02} />
            </points>
        </>
    )
}

export function AsteroidDust({ progressRef, quality }) {
    const ref = useRef()
    const sprite = useMemo(() => getPointSprite(), [])
    const positions = useMemo(() => {
        const rand = seededRandom(91)
        const count = quality.starCount.belt
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count; i += 1) {
            pos[i * 3] = (rand() - 0.5) * 22
            pos[i * 3 + 1] = (rand() - 0.5) * 12
            pos[i * 3 + 2] = -132 - rand() * 48
        }
        return pos
    }, [quality.starCount.belt])

    useFrame((state) => {
        const progress = progressRef.current
        ref.current.rotation.y = state.clock.elapsedTime * 0.04
        ref.current.material.opacity = bell(progress, 0.55, 0.7) * 0.35
    })

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial map={sprite} size={0.035} color="#a89078" transparent opacity={0} depthWrite={false} alphaTest={0.02} />
        </points>
    )
}

export function SaturnRingParticles({ progressRef, quality }) {
    const ref = useRef()
    const sprite = useMemo(() => getPointSprite(), [])
    const positions = useMemo(() => {
        const rand = seededRandom(55)
        const count = quality.starCount.ring
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count; i += 1) {
            const radius = 5.8 + rand() * 4.8
            const angle = rand() * Math.PI * 2
            pos[i * 3] = Math.cos(angle) * radius
            pos[i * 3 + 1] = (rand() - 0.5) * 0.35
            pos[i * 3 + 2] = Math.sin(angle) * radius
        }
        return pos
    }, [quality.starCount.ring])

    useFrame((state) => {
        ref.current.rotation.z = state.clock.elapsedTime * 0.022
        ref.current.material.opacity = 0.15 + bell(progressRef.current, 0.68, 0.82) * 0.45
    })

    return (
        <group position={[0, 0, -211]} rotation={[1.34, 0.08, 0.12]}>
            <points ref={ref}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                </bufferGeometry>
                <pointsMaterial map={sprite} size={0.025} color="#f2e0b4" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} alphaTest={0.02} />
            </points>
        </group>
    )
}
