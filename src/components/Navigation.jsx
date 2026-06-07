import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToSection = (id) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const navItems = [
        { label: 'Home', id: 'hero' },
        { label: 'Solar System', id: 'solar' },
        { label: 'Mission', id: 'mission' },
        { label: 'Timeline', id: 'timeline' },
        { label: 'Galaxy', id: 'galaxy' }
    ]

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'backdrop-blur-md bg-space-black/30 border-b border-space-accent/10'
                    : 'bg-transparent'
                }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <motion.div
                    className="text-2xl font-bold flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                >
                    <div className="w-3 h-3 rounded-full bg-space-accent glow"></div>
                    <span className="text-space-accent">SPACE</span>
                </motion.div>

                {/* Navigation Links */}
                <div className="hidden md:flex gap-8">
                    {navItems.map((item) => (
                        <motion.button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className="text-sm font-medium text-white/70 hover:text-space-accent transition-colors relative"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {item.label}
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-space-accent"
                                initial={{ width: 0 }}
                                whileHover={{ width: '100%' }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.button>
                    ))}
                </div>

                {/* CTA Button */}
                <motion.button
                    className="hidden md:block px-6 py-2 bg-space-accent/10 border border-space-accent rounded-lg text-space-accent font-medium hover:bg-space-accent hover:text-space-black transition-all shadow-glow"
                    whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0, 212, 255, 0.8)' }}
                    whileTap={{ scale: 0.95 }}
                >
                    Explore
                </motion.button>
            </div>
        </motion.nav>
    )
}
