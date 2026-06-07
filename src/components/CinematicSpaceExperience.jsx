import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { LayeredStarField, AsteroidDust, SaturnRingParticles } from '../space/CosmicParticles'
import {
    ProceduralEarth,
    ProceduralMoon,
    ProceduralMars,
    TexturedEarth,
    TexturedMoon,
    TexturedMars,
    TexturedSaturn,
    Atmosphere,
} from '../space/EnhancedPlanets'
import { makePlanetTexture } from '../space/proceduralTextures'
import { TextureErrorBoundary } from '../space/TextureErrorBoundary'
import { bell, clamp01, easeInOutQuint, lerpSegment, range, seededRandom, smooth } from '../space/math'
import { CinematicPostFX } from '../space/PostFX'
import { getQualitySettings } from '../space/quality'
import { useSpaceAudio } from '../space/SpaceAudio'
import { accretionDiskFragment, accretionDiskVertex, lensingFragment, lensingVertex } from '../space/shaders'
import { getPointSprite } from '../space/pointSprite'
import { getPlanetTextureUrls } from '../space/textures'

gsap.registerPlugin(ScrollTrigger)

const SCENES = [
    {
        id: 'earth',
        title: 'Explore The Universe',
        kicker: 'Earth orbit',
        copy: 'A living world suspended in deep space.',
        range: [0, 0.11],
    },
    {
        id: 'launch',
        title: 'Rocket Launch',
        kicker: 'T minus ascent',
        copy: 'Ignition blooms through smoke as the camera follows the climb.',
        range: [0.11, 0.24],
    },
    {
        id: 'departure',
        title: 'Leaving Earth',
        kicker: 'Orbital escape',
        copy: 'Satellites drift by as Earth falls quietly behind.',
        range: [0.24, 0.36],
    },
    {
        id: 'moon',
        title: 'Moon Pass',
        kicker: 'Lunar flyby',
        copy: 'Cratered regolith catches a cold sliver of sunlight.',
        range: [0.36, 0.45],
    },
    {
        id: 'mars',
        title: 'Mars',
        kicker: 'Dust frontier',
        copy: 'Thin atmosphere. Iron plains. Ancient riverbeds below.',
        range: [0.45, 0.56],
    },
    {
        id: 'belt',
        title: 'Asteroid Belt',
        kicker: 'High velocity transit',
        copy: 'Rock and metal shear past the lens with dangerous depth.',
        range: [0.56, 0.69],
    },
    {
        id: 'saturn',
        title: 'Saturn',
        kicker: 'Ring plane crossing',
        copy: 'Billions of ice fragments turn sunlight into a blade.',
        range: [0.69, 0.8],
    },
    {
        id: 'milky-way',
        title: 'Milky Way',
        kicker: 'Beyond the planets',
        copy: 'The solar system dissolves into a river of stars.',
        range: [0.8, 0.89],
    },
    {
        id: 'deep-space',
        title: 'Deep Space',
        kicker: 'Signal fades',
        copy: 'Light thins out. Motion becomes the only landmark.',
        range: [0.89, 0.96],
    },
    {
        id: 'black-hole',
        title: 'Black Hole',
        kicker: 'Event horizon',
        copy: 'Gravity folds the sky and pulls the journey inward.',
        range: [0.96, 1],
    },
]

const CAMERA_PATH = [
    { t: 0, p: [0, 0.35, 14], l: [0, 0, -8], f: 45 },
    { t: 0.08, p: [0.15, -0.35, 8], l: [0, -0.1, -8], f: 42 },
    { t: 0.13, p: [0.2, -3.4, -19], l: [0, -4.2, -30], f: 48 },
    { t: 0.2, p: [0.55, 2.2, -36], l: [0, 4.8, -47], f: 45 },
    { t: 0.29, p: [4.8, 2.7, -56], l: [0, 1.2, -69], f: 49 },
    { t: 0.39, p: [-4.4, 0.9, -75], l: [-1.6, 0.25, -83], f: 46 },
    { t: 0.51, p: [1.3, 1.1, -108], l: [2.6, 0, -119], f: 42 },
    { t: 0.62, p: [-0.8, 0.3, -142], l: [0.3, 0, -160], f: 54 },
    { t: 0.74, p: [4.5, 1.1, -195], l: [0, -0.1, -211], f: 43 },
    { t: 0.83, p: [0, 4.4, -235], l: [0, 1.1, -264], f: 58 },
    { t: 0.91, p: [-1.6, 1.1, -295], l: [0, 0.4, -325], f: 54 },
    { t: 0.985, p: [0, 0.2, -346], l: [0, 0, -372], f: 66 },
    { t: 1, p: [0, 0, -367], l: [0, 0, -382], f: 84 },
]

function makeRadialTexture(inner, outer, size = 256) {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, inner)
    gradient.addColorStop(0.45, inner)
    gradient.addColorStop(1, outer)
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
}

function CinematicSpaceExperience() {
    const journeyRef = useRef(null)
    const progressRef = useRef(0)
    const mouseRef = useRef({ x: 0, y: 0 })
    const [progress, setProgress] = useState(0)
    const [audioOn, setAudioOn] = useState(true)
    const quality = useMemo(() => getQualitySettings(), [])
    const textureUrls = useMemo(() => getPlanetTextureUrls(quality.textureRes), [quality.textureRes])

    useSpaceAudio(progressRef, audioOn)

    useLayoutEffect(() => {
        let hudTick = 0
        const trigger = ScrollTrigger.create({
            trigger: journeyRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.15,
            onUpdate: (self) => {
                progressRef.current = self.progress
                hudTick += 1
                if (hudTick % 2 === 0) setProgress(self.progress)
            },
        })

        requestAnimationFrame(() => ScrollTrigger.refresh())

        return () => trigger.kill()
    }, [])

    useEffect(() => {
        const handleMouseMove = (event) => {
            mouseRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2
            mouseRef.current.y = (event.clientY / window.innerHeight - 0.5) * 2
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    const activeScene = SCENES.find((scene) => progress >= scene.range[0] && progress <= scene.range[1]) ?? SCENES[SCENES.length - 1]

    return (
        <div ref={journeyRef} className="relative h-[1120vh] bg-[#01030a] text-white">
            <div className="fixed inset-0">
                <Canvas
                    camera={{ position: [0, 0.35, 14], fov: 45, near: 0.02, far: 900 }}
                    dpr={quality.dpr}
                    shadows={quality.shadows}
                    gl={{
                        antialias: quality.tier === 'desktop',
                        alpha: false,
                        powerPreference: 'high-performance',
                        toneMapping: THREE.ACESFilmicToneMapping,
                        toneMappingExposure: 1.08,
                        outputColorSpace: THREE.SRGBColorSpace,
                    }}
                >
                    <Suspense fallback={null}>
                        <SpaceJourneyScene
                            progressRef={progressRef}
                            mouseRef={mouseRef}
                            quality={quality}
                            textureUrls={textureUrls}
                        />
                    </Suspense>
                </Canvas>
            </div>

            <JourneyHud
                progress={progress}
                activeScene={activeScene}
                audioOn={audioOn}
                onToggleAudio={() => setAudioOn((v) => !v)}
                quality={quality}
            />
        </div>
    )
}

function JourneyHud({ progress, activeScene, audioOn, onToggleAudio, quality }) {
    const activeIndex = SCENES.findIndex((scene) => scene.id === activeScene.id)
    const heroVisible = progress < 0.095
    const altitude = Math.round(420 - progress * 420)
    const signal = Math.round(98 - progress * 12)

    return (
        <div className="fixed inset-0 z-20 overflow-visible pointer-events-none">
            <div className="absolute left-4 right-4 top-4 flex items-center justify-between md:left-8 md:right-8 md:top-7">
                <div className="hud-chip flex items-center gap-3 px-4 py-2">
                    <span className="hud-dot" />
                    <span className="text-[0.62rem] uppercase tracking-[0.38em] text-cyan-100/75">Odyssey 01</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onToggleAudio}
                        className="pointer-events-auto hud-chip px-3 py-2 text-[0.58rem] uppercase tracking-[0.28em] text-white/70 transition hover:text-cyan-100"
                        aria-label={audioOn ? 'Mute audio' : 'Enable audio'}
                    >
                        {audioOn ? 'Audio on' : 'Audio off'}
                    </button>
                    <span className="hud-chip px-4 py-2 text-[0.62rem] uppercase tracking-[0.32em] text-white/62">
                        {String(activeIndex + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}
                    </span>
                </div>
            </div>

            <div className="absolute right-4 top-[5.5rem] hidden flex-col gap-2 md:right-8 md:flex">
                <HudMetric label="Altitude" value={`${altitude} km`} />
                <HudMetric label="Velocity" value={`${(12 + progress * 48).toFixed(1)} km/s`} />
                <HudMetric label="Signal" value={`${signal}%`} />
                {quality.tier === 'mobile' && <HudMetric label="Mode" value="Reduced FX" />}
            </div>

            <AnimatePresence mode="wait">
                {heroVisible ? (
                    <motion.div
                        key="hero"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -18 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="absolute left-1/2 top-[18vh] w-[min(760px,88vw)] -translate-x-1/2 text-center"
                    >
                        <p className="mb-4 text-xs uppercase tracking-[0.55em] text-cyan-200/72">Deep space transmission</p>
                        <h1 className="text-5xl font-semibold leading-[0.95] text-white md:text-8xl">
                            Explore The Universe
                        </h1>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeScene.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="hud-readout absolute left-4 top-[5.5rem] w-[min(28rem,calc(100vw-2rem))] md:left-8 md:top-28 lg:max-w-md"
                    >
                        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-cyan-100/60 sm:tracking-[0.28em]">
                            {activeScene.kicker}
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold leading-tight text-white md:text-3xl lg:text-4xl">
                            {activeScene.title}
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-white/70 md:mt-4 md:text-base md:leading-7">
                            {activeScene.copy}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="pointer-events-none absolute bottom-5 left-1/2 h-[2px] w-[min(760px,78vw)] -translate-x-1/2 overflow-hidden rounded-full bg-white/8">
                <motion.div
                    className="h-full bg-gradient-to-r from-cyan-300/40 via-cyan-200 to-white"
                    style={{ scaleX: progress, transformOrigin: '0% 50%' }}
                />
            </div>

            <div className="absolute bottom-14 right-4 hidden max-h-[38vh] w-44 flex-col gap-2 overflow-y-auto md:right-8 md:flex">
                {SCENES.map((scene) => (
                    <div key={scene.id} className="flex items-center gap-3">
                        <span className={`h-px flex-1 ${scene.id === activeScene.id ? 'bg-cyan-200' : 'bg-white/12'}`} />
                        <span className={`text-[0.56rem] uppercase tracking-[0.2em] ${scene.id === activeScene.id ? 'text-cyan-100' : 'text-white/34'}`}>
                            {scene.title}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function HudMetric({ label, value }) {
    return (
        <div className="hud-chip min-w-[9rem] px-3 py-2 text-right">
            <p className="text-[0.52rem] uppercase tracking-[0.28em] text-white/40">{label}</p>
            <p className="mt-1 font-mono text-xs text-cyan-100/88">{value}</p>
        </div>
    )
}

function SpaceJourneyScene({ progressRef, mouseRef, quality, textureUrls }) {
    const { camera, scene } = useThree()
    const position = useMemo(() => new THREE.Vector3(), [])
    const lookAt = useMemo(() => new THREE.Vector3(), [])
    const fromPosition = useMemo(() => new THREE.Vector3(), [])
    const toPosition = useMemo(() => new THREE.Vector3(), [])
    const fromLook = useMemo(() => new THREE.Vector3(), [])
    const toLook = useMemo(() => new THREE.Vector3(), [])
    const drift = useMemo(() => new THREE.Vector3(), [])
    const shake = useMemo(() => new THREE.Vector3(), [])
    const bgColor = useMemo(() => new THREE.Color('#01030a'), [])
    const targetFov = useRef(45)

    useFrame((state) => {
        const progress = progressRef.current
        const mouse = mouseRef.current
        const t = state.clock.elapsedTime
        let segment = CAMERA_PATH[0]
        let next = CAMERA_PATH[1]

        for (let i = 0; i < CAMERA_PATH.length - 1; i += 1) {
            if (progress >= CAMERA_PATH[i].t && progress <= CAMERA_PATH[i + 1].t) {
                segment = CAMERA_PATH[i]
                next = CAMERA_PATH[i + 1]
                break
            }
        }

        const local = lerpSegment(progress, segment, next, easeInOutQuint)
        fromPosition.set(...segment.p)
        toPosition.set(...next.p)
        fromLook.set(...segment.l)
        toLook.set(...next.l)
        position.lerpVectors(fromPosition, toPosition, local)
        lookAt.lerpVectors(fromLook, toLook, local)

        const launchShake = bell(progress, 0.1, 0.24)
        shake.set(
            Math.sin(t * 38) * 0.04 * launchShake,
            Math.cos(t * 31) * 0.03 * launchShake,
            Math.sin(t * 44) * 0.02 * launchShake,
        )
        drift.set(
            Math.sin(t * 0.35) * 0.08,
            Math.cos(t * 0.28) * 0.06,
            Math.sin(t * 0.22) * 0.05,
        )

        position.x += mouse.x * (0.2 + progress * 0.42) + drift.x + shake.x
        position.y += -mouse.y * (0.14 + progress * 0.22) + drift.y + shake.y
        position.z += drift.z * 0.5 + shake.z
        lookAt.x += mouse.x * 0.48
        lookAt.y += -mouse.y * 0.3

        const blackHolePull = range(progress, 0.94, 1)
        position.z -= blackHolePull * 0.35

        camera.position.copy(position)
        camera.lookAt(lookAt)
        targetFov.current = THREE.MathUtils.lerp(segment.f, next.f, local)
        if (Math.abs(camera.fov - targetFov.current) > 0.02) {
            camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov.current, 0.14)
            camera.updateProjectionMatrix()
        }

        if (scene.fog) {
            scene.fog.density = 0.006 + range(progress, 0.78, 1) * 0.018
            bgColor.setHSL(0.62, 0.8, 0.01 + range(progress, 0.72, 0.9) * 0.022)
            scene.background = bgColor
        }
    })

    return (
        <>
            <color attach="background" args={['#01030a']} />
            <fogExp2 attach="fog" args={['#020613', 0.007]} />
            <ambientLight intensity={0.14} />
            <directionalLight position={[8, 4, 8]} intensity={4.6} color="#fff0d0" />
            <pointLight position={[0, -3, -29]} intensity={14} distance={36} color="#ff8a3d" />
            <pointLight position={[0, 0, -211]} intensity={3.5} distance={80} color="#f6d58f" />
            <pointLight position={[0, 0, -372]} intensity={9} distance={100} color="#7aa7ff" />

            <LayeredStarField progressRef={progressRef} mouseRef={mouseRef} quality={quality} />
            <NebulaVeils progressRef={progressRef} />
            <NebulaDeepSpace progressRef={progressRef} />
            <TextureErrorBoundary fallback={<ProceduralEarth progressRef={progressRef} />}>
                <Suspense fallback={<ProceduralEarth progressRef={progressRef} />}>
                    <TexturedEarth progressRef={progressRef} urls={textureUrls} />
                </Suspense>
            </TextureErrorBoundary>
            <LaunchSequence progressRef={progressRef} />
            <DepartureObjects progressRef={progressRef} />
            <TextureErrorBoundary fallback={<ProceduralMoon progressRef={progressRef} />}>
                <Suspense fallback={<ProceduralMoon progressRef={progressRef} />}>
                    <TexturedMoon progressRef={progressRef} url={textureUrls.moon} />
                </Suspense>
            </TextureErrorBoundary>
            {textureUrls.mars ? (
                <TextureErrorBoundary fallback={<ProceduralMars progressRef={progressRef} />}>
                    <Suspense fallback={<ProceduralMars progressRef={progressRef} />}>
                        <TexturedMars progressRef={progressRef} url={textureUrls.mars} />
                    </Suspense>
                </TextureErrorBoundary>
            ) : (
                <ProceduralMars progressRef={progressRef} />
            )}
            <AsteroidBelt progressRef={progressRef} quality={quality} />
            <AsteroidDust progressRef={progressRef} quality={quality} />
            <TexturedSaturn progressRef={progressRef} />
            <SaturnRingParticles progressRef={progressRef} quality={quality} />
            <MilkyWay progressRef={progressRef} />
            <DeepSpace progressRef={progressRef} />
            <BlackHole progressRef={progressRef} />
            <CinematicPostFX />
        </>
    )
}

function NebulaVeils({ progressRef }) {
    const textureA = useMemo(() => makeRadialTexture('rgba(74,137,255,0.28)', 'rgba(11,16,34,0)'), [])
    const textureB = useMemo(() => makeRadialTexture('rgba(196,87,255,0.18)', 'rgba(4,8,18,0)'), [])
    const refs = useRef([])

    useFrame((state) => {
        const progress = progressRef.current
        refs.current.forEach((mesh, index) => {
            if (!mesh) return
            mesh.lookAt(state.camera.position)
            mesh.rotation.z += 0.0008 * (index + 1)
            mesh.material.opacity = (0.06 + range(progress, 0.72, 0.9) * 0.32) * (index % 2 ? 0.8 : 1)
        })
    })

    const veils = [
        { p: [-22, 5, -232], s: 58, t: textureA },
        { p: [17, -3, -255], s: 72, t: textureB },
        { p: [-12, 14, -282], s: 88, t: textureA },
        { p: [9, 2, -318], s: 50, t: textureB },
    ]

    return (
        <>
            {veils.map((veil, index) => (
                <mesh key={index} ref={(node) => { refs.current[index] = node }} position={veil.p} scale={[veil.s, veil.s, 1]}>
                    <planeGeometry args={[1, 1]} />
                    <meshBasicMaterial map={veil.t} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.08} />
                </mesh>
            ))}
        </>
    )
}

function NebulaDeepSpace({ progressRef }) {
    const refs = useRef([])
    const textureA = useMemo(() => makeRadialTexture('rgba(120,60,255,0.35)', 'rgba(4,8,18,0)'), [])
    const textureB = useMemo(() => makeRadialTexture('rgba(255,90,140,0.22)', 'rgba(4,8,18,0)'), [])
    const textureC = useMemo(() => makeRadialTexture('rgba(60,140,255,0.28)', 'rgba(4,8,18,0)'), [])

    useFrame((state) => {
        const progress = progressRef.current
        const intensity = range(progress, 0.76, 0.92)
        refs.current.forEach((mesh, index) => {
            if (!mesh) return
            mesh.lookAt(state.camera.position)
            mesh.rotation.z += 0.0012 * (index + 1)
            mesh.material.opacity = (0.04 + intensity * 0.38) * (0.7 + index * 0.08)
        })
    })

    const veils = [
        { p: [-28, 8, -248], s: 72, t: textureA },
        { p: [22, -6, -272], s: 96, t: textureB },
        { p: [-8, 18, -302], s: 110, t: textureC },
        { p: [14, 4, -328], s: 64, t: textureA },
    ]

    return (
        <>
            {veils.map((veil, index) => (
                <mesh key={index} ref={(node) => { refs.current[index] = node }} position={veil.p} scale={[veil.s, veil.s, 1]}>
                    <planeGeometry args={[1, 1]} />
                    <meshBasicMaterial map={veil.t} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.06} />
                </mesh>
            ))}
        </>
    )
}

function Earth({ progressRef }) {
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

function LaunchSequence({ progressRef }) {
    const rocketRef = useRef()
    const smokeRef = useRef()
    const smokeDenseRef = useRef()
    const flameRef = useRef()
    const glowRef = useRef()
    const padLightRef = useRef()
    const pointSprite = useMemo(() => getPointSprite(), [])

    const smokePositions = useMemo(() => {
        const rand = seededRandom(94)
        const count = 680
        const positions = new Float32Array(count * 3)
        for (let i = 0; i < count; i += 1) {
            const radius = rand() * 3.2
            const angle = rand() * Math.PI * 2
            positions[i * 3] = Math.cos(angle) * radius
            positions[i * 3 + 1] = rand() * 2.4
            positions[i * 3 + 2] = Math.sin(angle) * radius
        }
        return positions
    }, [])

    const denseSmoke = useMemo(() => {
        const rand = seededRandom(188)
        const count = 320
        const positions = new Float32Array(count * 3)
        for (let i = 0; i < count; i += 1) {
            positions[i * 3] = (rand() - 0.5) * 4
            positions[i * 3 + 1] = rand() * 1.2
            positions[i * 3 + 2] = (rand() - 0.5) * 4
        }
        return positions
    }, [])

    useFrame((state) => {
        const progress = progressRef.current
        const ignition = smooth(range(progress, 0.095, 0.16))
        const ascent = smooth(range(progress, 0.135, 0.24))
        rocketRef.current.position.y = -4.4 + ascent * 28
        rocketRef.current.position.z = -30 - ascent * 18
        rocketRef.current.rotation.z = -0.04 + ascent * 0.11
        rocketRef.current.rotation.x = ascent * -0.12
        rocketRef.current.visible = progress < 0.33
        const smokeOpacity = (1 - range(progress, 0.19, 0.29)) * (0.15 + ignition * 0.72)
        smokeRef.current.material.opacity = smokeOpacity
        smokeDenseRef.current.material.opacity = smokeOpacity * 0.65
        smokeRef.current.rotation.y = state.clock.elapsedTime * 0.28
        smokeDenseRef.current.rotation.y = -state.clock.elapsedTime * 0.18
        smokeRef.current.scale.setScalar(1 + ignition * 1.8 + ascent * 2.4)
        smokeDenseRef.current.scale.setScalar(0.8 + ignition * 1.2 + ascent * 1.8)
        flameRef.current.visible = progress > 0.105 && progress < 0.27
        flameRef.current.scale.y = 0.8 + ignition * 2.1 + ascent * 1.1 + Math.sin(state.clock.elapsedTime * 28) * 0.12
        glowRef.current.intensity = 4 + ignition * 18 + ascent * 8
        padLightRef.current.intensity = 2 + ignition * 14
    })

    return (
        <group position={[0, 0, 0]}>
            <group position={[0, -4.85, -30]}>
                <mesh position={[0, -0.1, 0]} receiveShadow>
                    <cylinderGeometry args={[2.8, 3.2, 0.24, 64]} />
                    <meshStandardMaterial color="#1a2230" roughness={0.6} metalness={0.45} />
                </mesh>
                <mesh position={[0, 0.24, 0]}>
                    <torusGeometry args={[2.15, 0.05, 8, 80]} />
                    <meshStandardMaterial color="#5d728a" emissive="#10253a" emissiveIntensity={0.65} />
                </mesh>
                {[-1, 1].map((side) => (
                    <mesh key={side} position={[side * 1.7, 0.45, 0]} rotation={[0, 0, side * 0.36]}>
                        <boxGeometry args={[0.08, 1.6, 0.08]} />
                        <meshStandardMaterial color="#758596" metalness={0.8} roughness={0.35} />
                    </mesh>
                ))}
                <pointLight ref={padLightRef} position={[0, 0.5, 0]} color="#ff9a36" distance={18} intensity={2} />
                <points ref={smokeRef}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" args={[smokePositions, 3]} />
                    </bufferGeometry>
                    <pointsMaterial map={pointSprite} size={0.38} color="#d8d0c4" transparent opacity={0.12} depthWrite={false} alphaTest={0.02} />
                </points>
                <points ref={smokeDenseRef} position={[0, 0.2, 0]}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" args={[denseSmoke, 3]} />
                    </bufferGeometry>
                    <pointsMaterial map={pointSprite} size={0.55} color="#f0ebe3" transparent opacity={0.08} depthWrite={false} alphaTest={0.02} />
                </points>
            </group>

            <group ref={rocketRef} position={[0, -4.4, -30]}>
                <mesh position={[0, 1.35, 0]} castShadow>
                    <cylinderGeometry args={[0.32, 0.42, 2.7, 36]} />
                    <meshStandardMaterial color="#f2f4f7" roughness={0.42} metalness={0.18} />
                </mesh>
                <mesh position={[0, 2.9, 0]}>
                    <coneGeometry args={[0.33, 0.82, 36]} />
                    <meshStandardMaterial color="#d43c2f" roughness={0.44} metalness={0.08} />
                </mesh>
                {[-1, 1].map((side) => (
                    <mesh key={side} position={[side * 0.42, 0.55, 0]} rotation={[0, 0, side * -0.5]}>
                        <boxGeometry args={[0.18, 0.72, 0.08]} />
                        <meshStandardMaterial color="#d43c2f" roughness={0.55} />
                    </mesh>
                ))}
                <pointLight ref={glowRef} position={[0, -0.8, 0]} color="#ff7a1a" distance={12} intensity={4} />
                <mesh ref={flameRef} position={[0, -0.55, 0]} rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[0.32, 1.55, 32]} />
                    <meshBasicMaterial color="#ff9a36" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
                </mesh>
                <mesh position={[0, -0.95, 0]} rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[0.5, 0.65, 32]} />
                    <meshBasicMaterial color="#fff2c4" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
                </mesh>
            </group>
        </group>
    )
}

function DepartureObjects({ progressRef }) {
    const refs = useRef([])
    const satellites = useMemo(() => [
        { p: [-4.4, 2.3, -57], s: 0.75, r: 0.8 },
        { p: [5.5, -1.1, -63], s: 0.55, r: -0.6 },
        { p: [1.9, 3.6, -69], s: 0.45, r: 1.3 },
    ], [])

    useFrame((state) => {
        const progress = progressRef.current
        refs.current.forEach((satellite, index) => {
            if (!satellite) return
            const pass = range(progress, 0.23 + index * 0.03, 0.37 + index * 0.03)
            satellite.rotation.y = state.clock.elapsedTime * (0.45 + index * 0.2)
            satellite.position.x += Math.sin(state.clock.elapsedTime + index) * 0.003
            satellite.visible = pass > 0 && pass < 1
        })
    })

    return (
        <>
            {satellites.map((satellite, index) => (
                <group key={index} ref={(node) => { refs.current[index] = node }} position={satellite.p} scale={satellite.s} rotation={[0.2, satellite.r, 0]}>
                    <mesh>
                        <boxGeometry args={[0.6, 0.38, 0.45]} />
                        <meshStandardMaterial color="#b9c1ca" metalness={0.82} roughness={0.28} />
                    </mesh>
                    <mesh position={[-0.78, 0, 0]}>
                        <boxGeometry args={[0.9, 0.03, 0.36]} />
                        <meshStandardMaterial color="#1d74ff" emissive="#0a3c87" emissiveIntensity={0.8} roughness={0.35} />
                    </mesh>
                    <mesh position={[0.78, 0, 0]}>
                        <boxGeometry args={[0.9, 0.03, 0.36]} />
                        <meshStandardMaterial color="#1d74ff" emissive="#0a3c87" emissiveIntensity={0.8} roughness={0.35} />
                    </mesh>
                </group>
            ))}
        </>
    )
}

function MoonPass({ progressRef }) {
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

function MarsScene({ progressRef }) {
    const groupRef = useRef()
    const dustRef = useRef()
    const texture = useMemo(() => makePlanetTexture('mars'), [])
    const dust = useMemo(() => {
        const rand = seededRandom(41)
        const count = 1200
        const positions = new Float32Array(count * 3)
        for (let i = 0; i < count; i += 1) {
            const radius = 3.8 + rand() * 5.2
            const angle = rand() * Math.PI * 2
            positions[i * 3] = Math.cos(angle) * radius
            positions[i * 3 + 1] = (rand() - 0.5) * 4.8
            positions[i * 3 + 2] = Math.sin(angle) * radius
        }
        return positions
    }, [])

    useFrame((state) => {
        const progress = progressRef.current
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.038
        dustRef.current.rotation.y = -state.clock.elapsedTime * 0.055
        dustRef.current.material.opacity = 0.08 + bell(progress, 0.44, 0.57) * 0.3
    })

    return (
        <group ref={groupRef} position={[2.7, 0, -119]}>
            <mesh>
                <sphereGeometry args={[3.05, 112, 112]} />
                <meshStandardMaterial map={texture} roughness={0.88} metalness={0.02} />
            </mesh>
            <points ref={dustRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[dust, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.055} color="#d98b5b" transparent opacity={0.16} depthWrite={false} />
            </points>
            <Atmosphere radius={3.05} color="#c05b37" intensity={0.24} />
        </group>
    )
}

function AsteroidBelt({ progressRef, quality }) {
    const groupRef = useRef()
    const meshRef = useRef()
    const dummy = useMemo(() => new THREE.Object3D(), [])

    const asteroids = useMemo(() => {
        const rand = seededRandom(83)
        const count = quality.asteroidCount
        return Array.from({ length: count }, (_, index) => ({
            p: [(rand() - 0.5) * 22, (rand() - 0.5) * 12, -128 - rand() * 52],
            s: 0.08 + rand() * 0.85,
            r: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI],
            speed: 0.2 + rand() * 1.1,
            drift: rand() * Math.PI * 2,
            id: index,
        }))
    }, [quality.asteroidCount])

    useFrame((state) => {
        const progress = progressRef.current
        const t = state.clock.elapsedTime
        const beltIntensity = bell(progress, 0.55, 0.7)
        groupRef.current.rotation.z = Math.sin(t * 0.14) * 0.1
        groupRef.current.position.z = -range(progress, 0.56, 0.7) * 14

        if (!meshRef.current) return
        asteroids.forEach((asteroid, index) => {
            const closePass = index % 17 === 0 ? Math.sin(t * 2.2 + asteroid.drift) * 1.8 : 0
            dummy.position.set(
                asteroid.p[0] + Math.sin(t * asteroid.speed + asteroid.drift) * (0.4 + beltIntensity),
                asteroid.p[1] + Math.cos(t * asteroid.speed * 0.6 + asteroid.id) * 0.25,
                asteroid.p[2] + closePass,
            )
            dummy.rotation.set(
                asteroid.r[0] + t * asteroid.speed,
                asteroid.r[1] + t * asteroid.speed * 0.7,
                asteroid.r[2],
            )
            const scale = asteroid.s * (1 + beltIntensity * 0.15)
            dummy.scale.setScalar(scale)
            dummy.updateMatrix()
            meshRef.current.setMatrixAt(index, dummy.matrix)
        })
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <group ref={groupRef}>
            <instancedMesh ref={meshRef} args={[null, null, asteroids.length]} castShadow receiveShadow>
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#7a6d61" roughness={0.94} metalness={0.18} />
            </instancedMesh>
        </group>
    )
}

function SaturnScene({ progressRef }) {
    const groupRef = useRef()
    const ringsRef = useRef()
    const texture = useMemo(() => makePlanetTexture('saturn'), [])

    useFrame((state) => {
        const progress = progressRef.current
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.025
        ringsRef.current.rotation.z = state.clock.elapsedTime * 0.018
        groupRef.current.scale.setScalar(0.92 + bell(progress, 0.68, 0.82) * 0.16)
    })

    return (
        <group ref={groupRef} position={[0, 0, -211]}>
            <mesh>
                <sphereGeometry args={[4.6, 112, 112]} />
                <meshStandardMaterial map={texture} roughness={0.72} />
            </mesh>
            <group ref={ringsRef} rotation={[1.34, 0.08, 0.12]}>
                {[0, 1, 2, 3].map((ring) => (
                    <mesh key={ring}>
                        <ringGeometry args={[6.1 + ring * 0.72, 6.55 + ring * 0.72, 192]} />
                        <meshStandardMaterial
                            color={ring % 2 ? '#dec999' : '#f2e0b4'}
                            side={THREE.DoubleSide}
                            transparent
                            opacity={0.36 - ring * 0.035}
                            roughness={0.62}
                            metalness={0.04}
                            depthWrite={false}
                        />
                    </mesh>
                ))}
            </group>
            <Atmosphere radius={4.6} color="#f6d58f" intensity={0.2} />
        </group>
    )
}

function MilkyWay({ progressRef }) {
    const groupRef = useRef()
    const [positions, colors] = useMemo(() => {
        const rand = seededRandom(121)
        const count = 7200
        const pos = new Float32Array(count * 3)
        const col = new Float32Array(count * 3)
        const color = new THREE.Color()
        for (let i = 0; i < count; i += 1) {
            const arm = i % 5
            const radius = Math.pow(rand(), 0.62) * 24
            const angle = radius * 0.47 + arm * ((Math.PI * 2) / 5) + (rand() - 0.5) * 0.58
            pos[i * 3] = Math.cos(angle) * radius
            pos[i * 3 + 1] = (rand() - 0.5) * (1.4 + radius * 0.1)
            pos[i * 3 + 2] = Math.sin(angle) * radius
            color.setHSL(0.58 + rand() * 0.16, 0.5, 0.66 + rand() * 0.3)
            col[i * 3] = color.r
            col[i * 3 + 1] = color.g
            col[i * 3 + 2] = color.b
        }
        return [pos, col]
    }, [])

    useFrame((state) => {
        const progress = progressRef.current
        groupRef.current.rotation.y = -0.35 + state.clock.elapsedTime * 0.015
        groupRef.current.rotation.z = 0.62 + state.clock.elapsedTime * 0.01
        groupRef.current.scale.setScalar(1 + range(progress, 0.79, 0.9) * 0.28)
    })

    return (
        <group ref={groupRef} position={[0, 0, -264]} scale={1.16}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[colors, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.07} vertexColors transparent opacity={0.84} depthWrite={false} blending={THREE.AdditiveBlending} />
            </points>
            <mesh>
                <sphereGeometry args={[1.8, 64, 64]} />
                <meshBasicMaterial color="#f5f0ce" transparent opacity={0.34} blending={THREE.AdditiveBlending} />
            </mesh>
        </group>
    )
}

function DeepSpace({ progressRef }) {
    const ref = useRef()
    const positions = useMemo(() => {
        const rand = seededRandom(172)
        const count = 1800
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count; i += 1) {
            pos[i * 3] = (rand() - 0.5) * 34
            pos[i * 3 + 1] = (rand() - 0.5) * 20
            pos[i * 3 + 2] = -300 - rand() * 52
        }
        return pos
    }, [])

    useFrame((state) => {
        const progress = progressRef.current
        ref.current.rotation.y = state.clock.elapsedTime * 0.02
        ref.current.material.opacity = 0.08 + range(progress, 0.88, 0.97) * 0.34
    })

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.045} color="#9db6ff" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    )
}

function BlackHole({ progressRef }) {
    const groupRef = useRef()
    const diskRef = useRef()
    const innerRef = useRef()
    const lensRef = useRef()
    const diskUniforms = useMemo(
        () => ({
            inner: { value: new THREE.Color('#fff2b3') },
            mid: { value: new THREE.Color('#ff6b2a') },
            outer: { value: new THREE.Color('#4d6dff') },
            time: { value: 0 },
        }),
        [],
    )
    const lensUniforms = useMemo(() => ({ strength: { value: 0 } }), [])

    useFrame((state) => {
        const progress = progressRef.current
        const pull = range(progress, 0.94, 1)
        const t = state.clock.elapsedTime
        groupRef.current.rotation.z = t * 0.18
        groupRef.current.scale.setScalar(0.85 + pull * 1.65)
        diskRef.current.rotation.z = -t * (0.32 + pull * 0.55)
        diskUniforms.time.value = t
        innerRef.current.material.opacity = 0.88 + Math.sin(t * 5) * 0.06
        lensUniforms.strength.value = pull * 1.35
        lensRef.current.lookAt(state.camera.position)
        lensRef.current.material.opacity = pull * 0.42
    })

    return (
        <group ref={groupRef} position={[0, 0, -378]} rotation={[1.32, 0.08, 0]}>
            <mesh ref={diskRef}>
                <ringGeometry args={[5.1, 14.8, 256]} />
                <shaderMaterial
                    side={THREE.DoubleSide}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    uniforms={diskUniforms}
                    vertexShader={accretionDiskVertex}
                    fragmentShader={accretionDiskFragment}
                />
            </mesh>
            <mesh ref={innerRef} rotation={[-1.32, 0, 0]}>
                <sphereGeometry args={[4.4, 96, 96]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.94} />
            </mesh>
            {[7.4, 10.5, 14.5, 18.2].map((size, index) => (
                <mesh key={size} rotation={[-1.32, 0, 0]} scale={size}>
                    <torusGeometry args={[1, 0.01 + index * 0.005, 16, 192]} />
                    <meshBasicMaterial
                        color={index === 0 ? '#fff1bc' : '#7aa7ff'}
                        transparent
                        opacity={0.18 - index * 0.028}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
            <mesh ref={lensRef} position={[0, 0, 2]} scale={[28, 28, 1]}>
                <planeGeometry args={[1, 1]} />
                <shaderMaterial
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    uniforms={lensUniforms}
                    vertexShader={lensingVertex}
                    fragmentShader={lensingFragment}
                />
            </mesh>
        </group>
    )
}

export default CinematicSpaceExperience
