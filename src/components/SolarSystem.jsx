import { useState } from 'react'
import { motion } from 'framer-motion'

export default function SolarSystem() {
    const [activePlanet, setActivePlanet] = useState(null)

    const planets = [
        { name: 'Mercury', size: 'sm', color: '#8c7853', temp: '430°C' },
        { name: 'Venus', size: 'md', color: '#ffc649', temp: '465°C' },
        { name: 'Earth', size: 'md', color: '#4da6ff', temp: '15°C' },
        { name: 'Mars', size: 'sm', color: '#ff6b6b', temp: '-65°C' },
        { name: 'Jupiter', size: 'lg', color: '#c88b3a', temp: '-110°C' },
        { name: 'Saturn', size: 'lg', color: '#fad5a5', temp: '-140°C' },
        { name: 'Uranus', size: 'md', color: '#4fd0e7', temp: '-195°C' },
        { name: 'Neptune', size: 'md', color: '#4166f5', temp: '-200°C' }
    ]

    const sizeMap = {
        sm: 40,
        md: 60,
        lg: 80
    }

    return (
        <section id="solar" className="relative min-h-screen bg-gradient-to-b from-space-black via-space-dark to-space-black py-20">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-space-accent mb-4">
                        Solar System
                    </h2>
                    <p className="text-white/60">Explore our cosmic neighborhood</p>
                </motion.div>

                {/* Planets Container */}
                <div className="overflow-x-auto pb-8">
                    <motion.div
                        className="flex gap-8 justify-center min-w-max px-8"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        {planets.map((planet, index) => (
                            <motion.div
                                key={planet.name}
                                className="flex flex-col items-center gap-4 cursor-pointer"
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                            >
                                <motion.div
                                    className="relative"
                                    onMouseEnter={() => setActivePlanet(planet.name)}
                                    onMouseLeave={() => setActivePlanet(null)}
                                    whileHover={{ scale: 1.1 }}
                                >
                                    {/* Orbit ring */}
                                    <motion.div
                                        className="absolute inset-0 border border-space-accent/20 rounded-full"
                                        style={{
                                            width: sizeMap[planet.size] + 20,
                                            height: sizeMap[planet.size] + 20,
                                            top: -10,
                                            left: -10
                                        }}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                    />

                                    {/* Planet */}
                                    <motion.div
                                        className="rounded-full shadow-glow"
                                        style={{
                                            width: sizeMap[planet.size],
                                            height: sizeMap[planet.size],
                                            backgroundColor: planet.color,
                                            boxShadow: `0 0 20px ${planet.color}40`
                                        }}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                                    />
                                </motion.div>

                                {/* Planet Label and Info */}
                                <motion.div
                                    className="text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: activePlanet === planet.name ? 1 : 0.6 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h3 className="font-bold text-white">{planet.name}</h3>

                                    {/* Info Card */}
                                    <motion.div
                                        className="mt-2 bg-space-dark/80 backdrop-blur border border-space-accent/30 rounded-lg p-3 min-w-[150px] hidden"
                                        animate={{
                                            display: activePlanet === planet.name ? 'block' : 'none',
                                            opacity: activePlanet === planet.name ? 1 : 0,
                                            y: activePlanet === planet.name ? 0 : 10
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <p className="text-sm text-space-accent">Temp: {planet.temp}</p>
                                        <p className="text-xs text-white/50 mt-1">Radius: Relative</p>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Info Box */}
                <motion.div
                    className="mt-16 bg-gradient-to-r from-space-accent/10 to-purple-600/10 border border-space-accent/30 rounded-lg p-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h3 className="text-2xl font-bold text-space-accent mb-4">Our Solar System</h3>
                    <p className="text-white/70 mb-4">
                        Our solar system consists of the Sun and all gravitationally bound objects that orbit it. Hover over any planet to learn more about its characteristics and properties.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-white/60">
                        <div>• 8 Planets discovered</div>
                        <div>• Billions of years old</div>
                        <div>• Located in Milky Way</div>
                        <div>• Home to Earth</div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
