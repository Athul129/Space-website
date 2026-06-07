import { motion } from 'framer-motion'

export default function MissionTimeline() {
    const missions = [
        {
            year: '1957',
            title: 'Sputnik 1',
            description: 'First artificial satellite launched into orbit',
            icon: '🛰️'
        },
        {
            year: '1969',
            title: 'Apollo 11',
            description: 'First humans to walk on the Moon',
            icon: '🌙'
        },
        {
            year: '1981',
            title: 'Space Shuttle',
            description: 'First reusable spacecraft to orbit',
            icon: '🚀'
        },
        {
            year: '1997',
            title: 'Mars Pathfinder',
            description: 'First rover to explore Mars',
            icon: '🔴'
        },
        {
            year: '2020',
            title: 'SpaceX Crew',
            description: 'Commercial crew transport to ISS',
            icon: '👨‍🚀'
        },
        {
            year: '2025',
            title: 'Artemis Program',
            description: 'Return to Moon and establish base',
            icon: '🌟'
        }
    ]

    return (
        <section id="timeline" className="relative min-h-screen bg-gradient-to-b from-space-black to-space-dark py-20">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Mission Timeline
                    </h2>
                    <p className="text-white/60">Major milestones in space exploration</p>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Central line */}
                    <motion.div
                        className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-space-accent to-purple-600 transform -translate-x-1/2"
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        transition={{ duration: 1.5 }}
                        style={{ originY: 0 }}
                    />

                    {/* Timeline items */}
                    <div className="space-y-12">
                        {missions.map((mission, index) => (
                            <motion.div
                                key={index}
                                className={`flex gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                            >
                                {/* Left/Right Content */}
                                <div className="flex-1 flex justify-end">
                                    <motion.div
                                        className="w-full md:w-5/6 bg-space-dark/50 backdrop-blur border border-space-accent/30 rounded-lg p-6 hover:border-space-accent/70 transition-all group"
                                        whileHover={{ scale: 1.05, y: -5 }}
                                    >
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="text-3xl">{mission.icon}</div>
                                            <div>
                                                <h3 className="text-xl font-bold text-space-accent">{mission.title}</h3>
                                                <p className="text-sm text-white/50">{mission.year}</p>
                                            </div>
                                        </div>
                                        <p className="text-white/70">{mission.description}</p>
                                    </motion.div>
                                </div>

                                {/* Center dot */}
                                <motion.div
                                    className="relative flex items-center justify-center"
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <motion.div
                                        className="w-4 h-4 bg-space-accent rounded-full relative z-10"
                                        animate={{ scale: [1, 1.5, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <motion.div
                                        className="absolute w-4 h-4 bg-space-accent rounded-full"
                                        animate={{ scale: [1, 2], opacity: [1, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                </motion.div>

                                {/* Right/Left spacer */}
                                <div className="flex-1" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Future missions hint */}
                <motion.div
                    className="mt-16 text-center bg-gradient-to-r from-space-accent/10 to-purple-600/10 border border-space-accent/30 rounded-lg p-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h3 className="text-2xl font-bold text-space-accent mb-3">What's Next?</h3>
                    <p className="text-white/70 mb-4">
                        Future missions include permanent lunar bases, Mars colonization, and deep space exploration initiatives that will shape humanity's cosmic future.
                    </p>
                    <motion.button
                        className="px-6 py-2 bg-space-accent/20 border border-space-accent rounded-lg text-space-accent font-medium hover:bg-space-accent/30 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Learn About Future Plans
                    </motion.button>
                </motion.div>
            </div>
        </section>
    )
}
