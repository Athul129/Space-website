/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                space: {
                    black: '#0a0e27',
                    dark: '#1a1f3a',
                    blue: '#0f3460',
                    purple: '#7c3aed',
                    accent: '#00d4ff',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                glow: '0 0 20px rgba(0, 212, 255, 0.5)',
                'glow-purple': '0 0 20px rgba(124, 58, 237, 0.5)',
                'glow-strong': '0 0 40px rgba(0, 212, 255, 0.8)',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                spin3d: {
                    'from': { transform: 'rotateX(0deg) rotateY(0deg)' },
                    'to': { transform: 'rotateX(360deg) rotateY(360deg)' },
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '.5' },
                },
                'breathing': {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.8', transform: 'scale(1.05)' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)' },
                    '50%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.8)' },
                },
            },
            animation: {
                float: 'float 3s ease-in-out infinite',
                spin3d: 'spin3d 20s linear infinite',
                breathing: 'breathing 4s ease-in-out infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
