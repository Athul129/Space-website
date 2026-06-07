import { motion } from 'framer-motion'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="relative bg-space-black border-t border-space-accent/10 py-12 mt-20">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
                >
                    {/* Brand */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex flex-col gap-4"
                    >
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-space-accent"></div>
                            <span className="text-space-accent">SPACE</span>
                        </div>
                        <p className="text-white/60 text-sm">
                            Exploring the universe through technology and innovation.
                        </p>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div>
                        <h3 className="font-bold text-white mb-4">Navigation</h3>
                        <ul className="space-y-2 text-white/60 text-sm">
                            {['Home', 'Solar System', 'Mission', 'Timeline', 'Galaxy'].map((link) => (
                                <motion.li
                                    key={link}
                                    whileHover={{ x: 5, color: '#00d4ff' }}
                                    className="cursor-pointer transition-colors"
                                >
                                    {link}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Resources */}
                    <motion.div>
                        <h3 className="font-bold text-white mb-4">Resources</h3>
                        <ul className="space-y-2 text-white/60 text-sm">
                            {['NASA', 'SpaceX', 'ESA', 'ISRO', 'About'].map((link) => (
                                <motion.li
                                    key={link}
                                    whileHover={{ x: 5, color: '#00d4ff' }}
                                    className="cursor-pointer transition-colors"
                                >
                                    {link}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div>
                        <h3 className="font-bold text-white mb-4">Connect</h3>
                        <div className="flex gap-4">
                            {['Twitter', 'Discord', 'Github', 'Instagram'].map((social) => (
                                <motion.div
                                    key={social}
                                    className="w-10 h-10 bg-space-accent/20 border border-space-accent/50 rounded-lg flex items-center justify-center cursor-pointer"
                                    whileHover={{ bg: 'space-accent/40', scale: 1.1 }}
                                >
                                    <span className="text-xs text-space-accent font-bold">{social[0]}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Divider */}
                <motion.div
                    className="h-px bg-gradient-to-r from-transparent via-space-accent/50 to-transparent mb-8"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{ originX: 0 }}
                />

                {/* Bottom */}
                <motion.div
                    className="flex flex-col md:flex-row justify-between items-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <p className="text-white/50 text-sm">
                        © {currentYear} Space Exploration. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-white/50 mt-4 md:mt-0">
                        <motion.a href="#" whileHover={{ color: '#00d4ff' }} className="transition-colors">
                            Privacy Policy
                        </motion.a>
                        <motion.a href="#" whileHover={{ color: '#00d4ff' }} className="transition-colors">
                            Terms of Service
                        </motion.a>
                        <motion.a href="#" whileHover={{ color: '#00d4ff' }} className="transition-colors">
                            Contact
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        </footer>
    )
}
