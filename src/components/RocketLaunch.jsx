import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RocketLaunch() {
    const [isLaunching, setIsLaunching] = useState(false)
    const [countdown, setCountdown] = useState(null)
    const [particles, setParticles] = useState([])

    useEffect(() => {
        if (countdown === null) return

        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }

        if (countdown === 0) {
            setIsLaunching(true)
            // Generate particles
            const newParticles = Array.from({ length: 30 }, (_, i) => ({
                id: i,
                angle: (Math.random() - 0.5) * 0.6 + Math.PI / 2,
                velocity: Math.random() * 300 + 200,
                life: 1
            }))
            setParticles(newParticles)

            setTimeout(() => {
                setIsLaunching(false)
                setCountdown(null)
            }, 2000)
        }
    }, [countdown])

    const handleLaunch = () => {
        if (!isLaunching && countdown === null) {
            setCountdown(3)
        }
    }

    const particleVariants = {
        exit: (custom) => ({
            opacity: 0,
            y: -custom.velocity * 0.02,
            x: Math.cos(custom.angle) * custom.velocity * 0.015,
            transition: { duration: 1 }
        })
    }

    return (
        <section className="relative min-h-screen bg-gradient-to-b from-space-black to-space-dark py-20 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-space-accent rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-space-accent mb-4">
                        Mission Launch
                    </h2>
                    <p className="text-white/60 mb-12">Click to initiate countdown sequence</p>
                </motion.div>

                {/* Rocket Container */}
                <motion.div
                    className="relative h-96 flex items-center justify-center"
                    animate={isLaunching ? { y: -600 } : { y: 0 }}
                    transition={{ duration: 2, ease: 'easeIn' }}
                >
                    {/* Flame Effect */}
                    <AnimatePresence>
                        {isLaunching && (
                            <motion.div
                                className="absolute bottom-0 w-20 h-32 pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="w-full h-full relative">
                                    {/* Flame layers */}
                                    <motion.div
                                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-24 bg-gradient-to-t from-orange-600 to-orange-300 rounded-b-lg"
                                        animate={{ height: [80, 100, 85] }}
                                        transition={{ duration: 0.1, repeat: Infinity }}
                                    />
                                    <motion.div
                                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-20 bg-gradient-to-t from-yellow-400 to-orange-300 rounded-b-lg"
                                        animate={{ height: [60, 80, 65] }}
                                        transition={{ duration: 0.1, repeat: Infinity, delay: 0.05 }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Rocket */}
                    <motion.div className="relative w-24 h-48 pointer-events-none">
                        {/* Rocket Body */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-300 to-gray-400 rounded-t-2xl rounded-b-lg mx-2">
                            {/* Windows */}
                            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-300 rounded-full border-2 border-blue-500"></div>
                            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-300 rounded-full border-2 border-blue-500"></div>
                        </div>

                        {/* Fins */}
                        <div className="absolute bottom-0 left-0 w-3 h-8 bg-red-600 rounded-t-sm"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-8 bg-red-600 rounded-t-sm"></div>

                        {/* Tip */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-8 border-l-transparent border-r-transparent border-b-red-600"></div>
                    </motion.div>

                    {/* Smoke Particles */}
                    <AnimatePresence>
                        {particles.map((particle) => (
                            <motion.div
                                key={particle.id}
                                className="absolute w-3 h-3 rounded-full bg-white/30 pointer-events-none"
                                style={{
                                    left: '50%',
                                    bottom: '20%',
                                    x: '-50%'
                                }}
                                initial={{ opacity: 1, scale: 1 }}
                                exit="exit"
                                custom={particle}
                                variants={particleVariants}
                                onAnimationComplete={() => {
                                    setParticles(prev => prev.filter(p => p.id !== particle.id))
                                }}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Countdown Display */}
                <AnimatePresence mode="wait">
                    {countdown !== null && countdown > 0 && (
                        <motion.div
                            key={countdown}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            initial={{ scale: 2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="text-8xl font-bold text-space-accent drop-shadow-lg">
                                {countdown}
                            </div>
                        </motion.div>
                    )}

                    {countdown === 0 && (
                        <motion.div
                            key="launch"
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="text-6xl font-bold text-space-accent drop-shadow-lg">
                                🚀 LAUNCH!
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Launch Button */}
                <motion.button
                    onClick={handleLaunch}
                    disabled={isLaunching || countdown !== null}
                    className="mt-12 px-8 py-4 bg-space-accent text-space-black font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: !isLaunching && countdown === null ? 1.05 : 1 }}
                    whileTap={{ scale: !isLaunching && countdown === null ? 0.95 : 1 }}
                >
                    {countdown !== null ? `Launching in ${countdown}...` : isLaunching ? 'Launching...' : 'Initiate Launch'}
                </motion.button>
            </div>
        </section>
    )
}
