import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function AstronautSection({ mousePosition }) {
    const containerRef = useRef(null)
    const [offset, setOffset] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return

            const rect = containerRef.current.getBoundingClientRect()
            const x = (e.clientX - rect.left - rect.width / 2) * 0.1
            const y = (e.clientY - rect.top - rect.height / 2) * 0.1

            setOffset({ x, y })
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener('mousemove', handleMouseMove)
            return () => container.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return (
        <section ref={containerRef} className="relative min-h-screen bg-gradient-to-b from-space-dark to-space-black py-20 flex items-center justify-center overflow-hidden">
            {/* Background blur elements */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-space-accent rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Beyond Boundaries
                    </h2>
                    <p className="text-white/60">Experience zero gravity like an astronaut</p>
                </motion.div>

                {/* Astronaut Container */}
                <motion.div
                    className="relative h-96 flex items-center justify-center"
                    animate={{ x: offset.x, y: offset.y }}
                    transition={{ type: 'spring', damping: 20, mass: 1, stiffness: 100 }}
                >
                    {/* Glow background */}
                    <motion.div
                        className="absolute w-80 h-80 rounded-full bg-space-accent/10 blur-3xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />

                    {/* Astronaut */}
                    <motion.div
                        className="relative text-9xl"
                        animate={{
                            y: [0, -30, 0],
                            rotateZ: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                    >
                        👨‍🚀
                    </motion.div>

                    {/* Floating particles around astronaut */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-space-accent"
                            initial={{
                                x: Math.cos((i / 6) * Math.PI * 2) * 120,
                                y: Math.sin((i / 6) * Math.PI * 2) * 120
                            }}
                            animate={{
                                x: Math.cos((i / 6) * Math.PI * 2 + Date.now() / 2000) * 120,
                                y: Math.sin((i / 6) * Math.PI * 2 + Date.now() / 2000) * 120,
                                opacity: [0.3, 1, 0.3]
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: 'linear'
                            }}
                        />
                    ))}
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    {[
                        { icon: '⭐', title: 'Zero Gravity', desc: 'Experience weightlessness' },
                        { icon: '🌌', title: 'Deep Space', desc: 'Explore the cosmos' },
                        { icon: '🛰️', title: 'Orbital Motion', desc: 'Understand mechanics' }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            className="bg-space-dark/50 backdrop-blur border border-space-accent/30 rounded-lg p-6 hover:border-space-accent/70 transition-all"
                            whileHover={{ scale: 1.05, y: -10 }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                        >
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold text-space-accent mb-2">{feature.title}</h3>
                            <p className="text-white/60">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Info Text */}
                <motion.p
                    className="mt-12 text-white/70 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Move your mouse around to see the parallax effect. Astronauts experience a completely different perspective of our universe from the vantage point of space.
                </motion.p>
            </div>
        </section>
    )
}
