import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { atmosphereFragment, atmosphereVertex, earthSurfaceFragment, earthSurfaceVertex } from './shaders'
import { bell, range, smooth } from './math'
import { makePlanetTexture, makeRingAlphaTexture } from './proceduralTextures'

const SUN = new THREE.Vector3(1, 0.35, 0.8).normalize()

export function Atmosphere({ radius, color = '#6bc7ff', intensity = 0.72, power = 2.4 }) {
    return (
        <mesh scale={radius * 1.1}>
            <sphereGeometry args={[1, 96, 96]} />
            <shaderMaterial
                side={THREE.BackSide}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uniforms={{
                    glowColor: { value: new THREE.Color(color) },
                    intensity: { value: intensity },
                    power: { value: power },
                }}
                vertexShader={atmosphereVertex}
                fragmentShader={atmosphereFragment}
            />
        </mesh>
    )
}

export function TexturedEarth({ progressRef, urls }) {
    const groupRef = useRef()
    const cloudsRef = useRef()
    const [day, night, clouds, normal] = useTexture([
        urls.earth.day,
        urls.earth.night,
        urls.earth.clouds,
        urls.earth.normal,
    ])

    useMemo(() => {
        ;[day, night, clouds, normal].forEach((tex) => {
            tex.colorSpace = THREE.SRGBColorSpace
            tex.anisotropy = 8
        })
    }, [day, night, clouds, normal])

    const sunDir = useMemo(() => ({ value: SUN }), [])

    useFrame((state) => {
        const progress = progressRef.current
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.048
        groupRef.current.position.z = THREE.MathUtils.lerp(-8, -48, smooth(range(progress, 0.13, 0.32)))
        groupRef.current.position.y = THREE.MathUtils.lerp(0, 4.8, smooth(range(progress, 0.12, 0.3)))
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(1, 0.32, smooth(range(progress, 0.14, 0.32))))
        cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.068
    })

    return (
        <group ref={groupRef} position={[0, 0, -8]}>
            <mesh>
                <sphereGeometry args={[2.8, 128, 128]} />
                <shaderMaterial
                    uniforms={{
                        dayMap: { value: day },
                        nightMap: { value: night },
                        sunDirection: sunDir,
                    }}
                    vertexShader={earthSurfaceVertex}
                    fragmentShader={earthSurfaceFragment}
                />
            </mesh>
            <mesh ref={cloudsRef} scale={1.016}>
                <sphereGeometry args={[2.8, 96, 96]} />
                <meshStandardMaterial
                    map={clouds}
                    transparent
                    opacity={0.42}
                    depthWrite={false}
                    roughness={1}
                    normalMap={normal}
                    normalScale={new THREE.Vector2(0.35, 0.35)}
                />
            </mesh>
            <Atmosphere radius={2.8} intensity={0.95} power={2.8} />
        </group>
    )
}

export function TexturedMoon({ progressRef, url }) {
    const moonRef = useRef()
    const map = useTexture(url)
    map.colorSpace = THREE.SRGBColorSpace

    useFrame((state) => {
        const progress = progressRef.current
        moonRef.current.rotation.y = state.clock.elapsedTime * 0.022
        moonRef.current.position.x = THREE.MathUtils.lerp(-3.2, -5.8, smooth(range(progress, 0.36, 0.45)))
    })

    return (
        <group ref={moonRef} position={[-3.2, 0.35, -82]}>
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[2.1, 96, 96]} />
                <meshStandardMaterial map={map} roughness={0.96} metalness={0.01} bumpMap={map} bumpScale={0.08} />
            </mesh>
        </group>
    )
}

export function TexturedMars({ progressRef, url }) {
    const groupRef = useRef()
    const dustRef = useRef()
    const map = useTexture(url)
    map.colorSpace = THREE.SRGBColorSpace

    const dust = useMemo(() => {
        const positions = new Float32Array(1400 * 3)
        for (let i = 0; i < 1400; i += 1) {
            const radius = 3.6 + Math.random() * 5.4
            const angle = Math.random() * Math.PI * 2
            positions[i * 3] = Math.cos(angle) * radius
            positions[i * 3 + 1] = (Math.random() - 0.5) * 5
            positions[i * 3 + 2] = Math.sin(angle) * radius
        }
        return positions
    }, [])

    useFrame((state) => {
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.034
        dustRef.current.rotation.y = -state.clock.elapsedTime * 0.05
        dustRef.current.material.opacity = 0.1 + bell(progressRef.current, 0.44, 0.57) * 0.35
    })

    return (
        <group ref={groupRef} position={[2.7, 0, -119]}>
            <mesh>
                <sphereGeometry args={[3.05, 112, 112]} />
                <meshStandardMaterial map={map} roughness={0.9} metalness={0.02} bumpMap={map} bumpScale={0.04} />
            </mesh>
            <points ref={dustRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[dust, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.05} color="#d98b5b" transparent opacity={0.16} depthWrite={false} />
            </points>
            <Atmosphere radius={3.05} color="#c05b37" intensity={0.32} />
        </group>
    )
}

/** Saturn uses procedural textures (no CORS-safe public map bundle). */
export function TexturedSaturn({ progressRef }) {
    const groupRef = useRef()
    const ringsRef = useRef()
    const body = useMemo(() => makePlanetTexture('saturn'), [])
    const ringAlpha = useMemo(() => makeRingAlphaTexture(), [])

    useFrame((state) => {
        const progress = progressRef.current
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.022
        ringsRef.current.rotation.z = state.clock.elapsedTime * 0.016
        groupRef.current.scale.setScalar(0.95 + bell(progress, 0.68, 0.82) * 0.22)
    })

    return (
        <group ref={groupRef} position={[0, 0, -211]}>
            <mesh>
                <sphereGeometry args={[4.6, 128, 128]} />
                <meshStandardMaterial map={body} roughness={0.68} metalness={0.04} />
            </mesh>
            <group ref={ringsRef} rotation={[1.34, 0.08, 0.12]}>
                {[0, 1, 2, 3, 4].map((ring) => (
                    <mesh key={ring}>
                        <ringGeometry args={[5.9 + ring * 0.65, 6.35 + ring * 0.65, 256]} />
                        <meshStandardMaterial
                            map={ringAlpha}
                            alphaMap={ringAlpha}
                            side={THREE.DoubleSide}
                            transparent
                            opacity={0.55 - ring * 0.06}
                            roughness={0.55}
                            metalness={0.08}
                            depthWrite={false}
                            color="#f2e0b4"
                        />
                    </mesh>
                ))}
            </group>
            <Atmosphere radius={4.6} color="#f6d58f" intensity={0.28} />
        </group>
    )
}

export function ProceduralEarth({ progressRef }) {
    const groupRef = useRef()
    const cloudsRef = useRef()
    const texture = useMemo(() => makePlanetTexture('earth'), [])
    const clouds = useMemo(() => makePlanetTexture('clouds'), [])

    useFrame((state) => {
        const progress = progressRef.current
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.055
        groupRef.current.position.z = THREE.MathUtils.lerp(-8, -48, smooth(range(progress, 0.13, 0.32)))
        groupRef.current.position.y = THREE.MathUtils.lerp(0, 4.8, smooth(range(progress, 0.12, 0.3)))
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(1, 0.32, smooth(range(progress, 0.14, 0.32))))
        cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.075
    })

    return (
        <group ref={groupRef} position={[0, 0, -8]}>
            <mesh>
                <sphereGeometry args={[2.8, 128, 128]} />
                <meshStandardMaterial map={texture} roughness={0.78} metalness={0.02} />
            </mesh>
            <mesh ref={cloudsRef} scale={1.014}>
                <sphereGeometry args={[2.8, 96, 96]} />
                <meshStandardMaterial map={clouds} transparent opacity={0.38} depthWrite={false} roughness={1} />
            </mesh>
            <Atmosphere radius={2.8} />
        </group>
    )
}

export function ProceduralMoon({ progressRef }) {
    const moonRef = useRef()
    const texture = useMemo(() => makePlanetTexture('moon'), [])

    useFrame((state) => {
        const progress = progressRef.current
        moonRef.current.rotation.y = state.clock.elapsedTime * 0.025
        moonRef.current.position.x = THREE.MathUtils.lerp(-3.2, -5.8, smooth(range(progress, 0.36, 0.45)))
    })

    return (
        <group ref={moonRef} position={[-3.2, 0.35, -82]}>
            <mesh>
                <sphereGeometry args={[2.1, 96, 96]} />
                <meshStandardMaterial map={texture} roughness={0.94} metalness={0.01} />
            </mesh>
        </group>
    )
}

export function ProceduralMars({ progressRef }) {
    const groupRef = useRef()
    const texture = useMemo(() => makePlanetTexture('mars'), [])

    useFrame((state) => {
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.038
    })

    return (
        <group ref={groupRef} position={[2.7, 0, -119]}>
            <mesh>
                <sphereGeometry args={[3.05, 112, 112]} />
                <meshStandardMaterial map={texture} roughness={0.88} metalness={0.02} />
            </mesh>
            <Atmosphere radius={3.05} color="#c05b37" intensity={0.24} />
        </group>
    )
}
