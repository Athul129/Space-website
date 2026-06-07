import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function BlackHoleExperience() {
    const canvasRef = useRef(null)
    const [isInView, setIsInView] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        // Create particles
        const particles = Array.from({ length: 100 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            opacity: Math.random() * 0.5 + 0.5
        }))

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const blackHoleRadius = 50

        let animationFrameId
        let time = 0

        const animate = () => {
            ctx.fillStyle = 'rgba(10, 14, 39, 0.1)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            time += 0.01

            // Draw black hole
            const glowLayers = 5
            for (let i = glowLayers; i > 0; i--) {
                const gradient = ctx.createRadialGradient(
                    centerX, centerY, 0,
                    centerX, centerY, blackHoleRadius + i * 20
                )
                gradient.addColorStop(0, `rgba(124, 58, 237, ${0.3 * (i / glowLayers)})`)
                gradient.addColorStop(0.5, `rgba(0, 212, 255, ${0.2 * (i / glowLayers)})`)
                gradient.addColorStop(1, 'rgba(0, 212, 255, 0)')

                ctx.fillStyle = gradient
                ctx.beginPath()
                ctx.arc(centerX, centerY, blackHoleRadius + i * 20, 0, Math.PI * 2)
                ctx.fill()
            }

            // Black hole center
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
            ctx.beginPath()
            ctx.arc(centerX, centerY, blackHoleRadius, 0, Math.PI * 2)
            ctx.fill()

            // Event horizon (animated ring)
            ctx.strokeStyle = `rgba(0, 212, 255, ${Math.sin(time) * 0.5 + 0.5})`
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(centerX, centerY, blackHoleRadius, 0, Math.PI * 2)
            ctx.stroke()

            // Animate particles
            particles.forEach(particle => {
                const dx = centerX - particle.x
                const dy = centerY - particle.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                // Gravity effect
                const force = 50000 / (distance * distance + 1)
                particle.vx += (dx / distance) * force * 0.001
                particle.vy += (dy / distance) * force * 0.001

                // Update position
                particle.x += particle.vx
                particle.y += particle.vy

                // Damping
                particle.vx *= 0.99
                particle.vy *= 0.99

                // Opacity based on distance
                const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
                particle.opacity = Math.max(0.1, 1 - distance / maxDistance)

                // Draw particle
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fill()

                // Reset if too close or out of bounds
                if (distance < blackHoleRadius + 20 || particle.x < 0 || particle.x > canvas.width) {
                    particle.x = Math.random() * canvas.width
                    particle.y = Math.random() * canvas.height
                    particle.vx = (Math.random() - 0.5) * 2
                    particle.vy = (Math.random() - 0.5) * 2
                }
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        // Intersection observer to know when section is in view
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting)
            },
            { threshold: 0.5 }
        )

        observer.observe(canvas)

        window.addEventListener('resize', handleResize)
        animate()

        return () => {
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(animationFrameId)
            observer.disconnect()
        }
    }, [])

    const handleResize = () => {
        const canvas = canvasRef.current
        if (canvas) {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <section className="relative min-h-screen bg-space-black overflow-hidden">
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
            />

            {/* Content Overlay */}
            <div className="relative z-10 h-screen flex items-center justify-center">
                <motion.div
                    className="text-center max-w-2xl mx-auto px-6"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-8xl mb-8"
                    >
                        ⚫
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Black Hole Experience
                    </h2>

                    <p className="text-white/70 mb-8">
                        Watch as particles are pulled into the infinite darkness. Experience the immense gravitational forces at the edge of the event horizon.
                    </p>

                    <motion.div
                        className="text-sm text-space-accent"
                        animate={{ opacity: [0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        Scroll to continue your journey
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
