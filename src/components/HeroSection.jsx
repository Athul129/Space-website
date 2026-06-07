import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function HeroSection() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight * 1.2

        let rotation = 0
        let animationFrameId

        const drawEarth = () => {
            const centerX = canvas.width - 150
            const centerY = canvas.height / 3
            const radius = 80

            // Earth glow
            const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius + 30)
            glowGradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)')
            glowGradient.addColorStop(1, 'rgba(0, 212, 255, 0)')
            ctx.fillStyle = glowGradient
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius + 30, 0, Math.PI * 2)
            ctx.fill()

            // Earth
            ctx.save()
            ctx.translate(centerX, centerY)
            ctx.rotate(rotation)

            const earthGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
            earthGradient.addColorStop(0, '#4da6ff')
            earthGradient.addColorStop(0.5, '#0066ff')
            earthGradient.addColorStop(1, '#003366')
            ctx.fillStyle = earthGradient
            ctx.beginPath()
            ctx.arc(0, 0, radius, 0, Math.PI * 2)
            ctx.fill()

            // Continents (simple pattern)
            ctx.fillStyle = '#2d5016'
            ctx.beginPath()
            ctx.arc(-radius * 0.3, -radius * 0.2, radius * 0.25, 0, Math.PI * 2)
            ctx.fill()

            ctx.beginPath()
            ctx.arc(radius * 0.4, radius * 0.1, radius * 0.2, 0, Math.PI * 2)
            ctx.fill()

            ctx.restore()

            rotation += 0.002
        }

        const animate = () => {
            ctx.fillStyle = 'rgba(10, 14, 39, 0.05)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            drawEarth()

            animationFrameId = requestAnimationFrame(animate)
        }

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight * 1.2
        }

        window.addEventListener('resize', handleResize)
        animate()

        return () => {
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
    }

    return (
        <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />

            <motion.div
                className="relative z-10 text-center max-w-4xl mx-auto px-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Floating astronaut emoji or icon */}
                <motion.div
                    className="mb-8 flex justify-center"
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <div className="text-6xl">🚀</div>
                </motion.div>

                <motion.h1
                    className="text-6xl md:text-7xl font-bold mb-4 text-space-accent"
                    variants={itemVariants}
                    style={{ textShadow: '0 0 30px rgba(0, 212, 255, 0.5)' }}
                >
                    Explore The Universe
                </motion.h1>

                <motion.p
                    className="text-xl md:text-2xl text-white/70 mb-12"
                    variants={itemVariants}
                >
                    Journey Beyond The Stars
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-6 justify-center"
                    variants={itemVariants}
                >
                    <motion.button
                        className="px-8 py-4 bg-space-accent text-space-black font-bold rounded-lg relative overflow-hidden group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const element = document.getElementById('solar')
                            element?.scrollIntoView({ behavior: 'smooth' })
                        }}
                    >
                        <div className="relative z-10">Start Journey</div>
                        <motion.div
                            className="absolute inset-0 bg-white"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: 0 }}
                            transition={{ duration: 0.3 }}
                        />
                    </motion.button>

                    <motion.button
                        className="px-8 py-4 border-2 border-space-accent text-space-accent font-bold rounded-lg hover:bg-space-accent/10 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Learn More
                    </motion.button>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 border-2 border-space-accent rounded-full flex justify-center">
                        <motion.div
                            className="w-1 h-2 bg-space-accent rounded-full mt-2"
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </motion.div>
        </section>
    )
}
