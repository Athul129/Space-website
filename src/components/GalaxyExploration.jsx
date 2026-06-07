import { motion } from 'framer-motion'

export default function GalaxyExploration() {
    const galaxies = [
        { name: 'Andromeda', distance: '2.5M ly', color: 'from-blue-600 to-purple-600' },
        { name: 'Triangulum', distance: '3M ly', color: 'from-purple-600 to-pink-600' },
        { name: 'Whirlpool', distance: '23M ly', color: 'from-cyan-500 to-blue-600' },
        { name: 'Sombrero', distance: '29.3M ly', color: 'from-yellow-500 to-orange-600' }
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: 'easeOut' }
        }
    }

    return (
        <section id="galaxy" className="relative min-h-screen bg-gradient-to-b from-space-black via-space-dark to-space-black py-20 overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-30">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-space-accent rounded-full blur-3xl"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, delay: 5 }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Galaxy Exploration
                    </h2>
                    <p className="text-white/60">Discover distant galaxies beyond our Milky Way</p>
                </motion.div>

                {/* Galaxies Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                >
                    {galaxies.map((galaxy, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            className="group relative"
                        >
                            {/* Galaxy Card */}
                            <motion.div
                                className={`relative h-80 rounded-2xl overflow-hidden bg-gradient-to-br ${galaxy.color} p-8 flex items-end cursor-pointer shadow-glow`}
                                whileHover={{ y: -10 }}
                            >
                                {/* Content overlay */}
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>

                                {/* Animated particles */}
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-2 h-2 bg-white rounded-full"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`
                                        }}
                                        animate={{
                                            opacity: [0.3, 1, 0.3],
                                            scale: [1, 1.5, 1]
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            delay: i * 0.2
                                        }}
                                    />
                                ))}

                                {/* Text content */}
                                <motion.div
                                    className="relative z-10"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <h3 className="text-3xl font-bold text-white mb-2">{galaxy.name}</h3>
                                    <p className="text-white/80 mb-4">{galaxy.distance} away</p>
                                    <motion.button
                                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium backdrop-blur border border-white/30 transition-all"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Explore →
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Statistics */}
                <motion.div
                    className="mt-20 grid grid-cols-3 gap-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {[
                        { number: '200B+', label: 'Galaxies' },
                        { number: '1T+', label: 'Stars' },
                        { number: '∞', label: 'Possibilities' }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            className="text-center"
                            whileInView={{ scale: [0.8, 1] }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <div className="text-4xl font-bold text-space-accent mb-2">{stat.number}</div>
                            <div className="text-white/60">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
