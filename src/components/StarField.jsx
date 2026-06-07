import { useEffect, useRef } from 'react'

export default function StarField() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        // Create stars
        const stars = Array.from({ length: 200 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            opacity: Math.random() * 0.5 + 0.5,
            speed: Math.random() * 0.5 + 0.1
        }))

        let animationFrameId
        let scrollY = 0

        const animate = () => {
            ctx.fillStyle = 'rgba(10, 14, 39, 0.1)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            stars.forEach(star => {
                star.opacity += (Math.random() - 0.5) * 0.02
                star.opacity = Math.max(0.1, Math.min(1, star.opacity))

                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
                ctx.beginPath()
                ctx.arc(star.x, star.y + scrollY * 0.2, star.radius, 0, Math.PI * 2)
                ctx.fill()
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        const handleScroll = () => {
            scrollY = window.scrollY
        }

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener('scroll', handleScroll)
        window.addEventListener('resize', handleResize)
        animate()

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        />
    )
}
