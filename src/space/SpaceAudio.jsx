import { useEffect, useRef } from 'react'
import { bell, range } from './math'

export function useSpaceAudio(progressRef, enabled) {
    const ctxRef = useRef(null)
    const nodesRef = useRef(null)

    useEffect(() => {
        if (!enabled) {
            if (ctxRef.current?.state === 'running') {
                nodesRef.current?.master?.gain.setTargetAtTime(0.0001, ctxRef.current.currentTime, 0.15)
            }
            return undefined
        }

        let raf
        const start = async () => {
            if (ctxRef.current) return
            const context = new AudioContext()
            const master = context.createGain()
            master.gain.value = 0.0001

            const ambient = context.createOscillator()
            ambient.type = 'sine'
            ambient.frequency.value = 38

            const pad = context.createOscillator()
            pad.type = 'triangle'
            pad.frequency.value = 88

            const launchNoise = context.createOscillator()
            launchNoise.type = 'sawtooth'
            launchNoise.frequency.value = 120

            const bhSub = context.createOscillator()
            bhSub.type = 'sine'
            bhSub.frequency.value = 28

            const filter = context.createBiquadFilter()
            filter.type = 'lowpass'
            filter.frequency.value = 320

            const launchGain = context.createGain()
            launchGain.gain.value = 0

            const bhGain = context.createGain()
            bhGain.gain.value = 0

            ambient.connect(filter)
            pad.connect(filter)
            launchNoise.connect(launchGain)
            launchGain.connect(filter)
            bhSub.connect(bhGain)
            bhGain.connect(filter)
            filter.connect(master)
            master.connect(context.destination)

            ambient.start()
            pad.start()
            launchNoise.start()
            bhSub.start()

            ctxRef.current = context
            nodesRef.current = { master, ambient, pad, launchNoise, launchGain, bhSub, bhGain, filter }

            const tick = () => {
                const p = progressRef.current
                const launch = bell(p, 0.095, 0.26)
                const deep = range(p, 0.87, 1)
                const t = context.currentTime

                ambient.frequency.setTargetAtTime(34 + deep * 14 + launch * 8, t, 0.1)
                pad.frequency.setTargetAtTime(72 + p * 48, t, 0.1)
                launchNoise.frequency.setTargetAtTime(90 + launch * 180, t, 0.06)
                launchGain.gain.setTargetAtTime(launch * 0.04, t, 0.08)
                bhSub.frequency.setTargetAtTime(22 + deep * 18, t, 0.12)
                bhGain.gain.setTargetAtTime(deep * 0.055, t, 0.15)
                filter.frequency.setTargetAtTime(240 + launch * 1100 + deep * 280, t, 0.1)
                master.gain.setTargetAtTime(0.018 + launch * 0.028 + deep * 0.03, t, 0.14)

                raf = requestAnimationFrame(tick)
            }
            tick()
        }

        const onInteract = () => {
            start()
        }
        window.addEventListener('pointerdown', onInteract, { once: true })
        window.addEventListener('keydown', onInteract, { once: true })

        return () => {
            window.removeEventListener('pointerdown', onInteract)
            window.removeEventListener('keydown', onInteract)
            if (raf) cancelAnimationFrame(raf)
            if (ctxRef.current) {
                ctxRef.current.close()
                ctxRef.current = null
                nodesRef.current = null
            }
        }
    }, [enabled, progressRef])
}
