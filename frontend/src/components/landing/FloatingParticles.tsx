import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    opacity: number
}

export function FloatingParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>([])
    const mouseRef = useRef({ x: 0, y: 0 })
    const frameRef = useRef<number>()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        // Initialize particles
        const particleCount = Math.min(50, Math.floor(window.innerWidth / 30))
        particlesRef.current = Array.from({ length: particleCount }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.5 + 0.2
        }))

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }
        window.addEventListener('mousemove', handleMouseMove)

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particlesRef.current.forEach((particle) => {
                // Mouse interaction
                const dx = mouseRef.current.x - particle.x
                const dy = mouseRef.current.y - particle.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < 150) {
                    const force = (150 - distance) / 150
                    particle.vx -= (dx / distance) * force * 0.1
                    particle.vy -= (dy / distance) * force * 0.1
                }

                // Update position
                particle.x += particle.vx
                particle.y += particle.vy

                // Drag
                particle.vx *= 0.99
                particle.vy *= 0.99

                // Boundaries
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

                // Clamp position
                particle.x = Math.max(0, Math.min(canvas.width, particle.x))
                particle.y = Math.max(0, Math.min(canvas.height, particle.y))

                // Draw particle
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)

                // Gradient for glow effect
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 3
                )
                gradient.addColorStop(0, `rgba(59, 130, 246, ${particle.opacity})`)
                gradient.addColorStop(0.5, `rgba(6, 182, 212, ${particle.opacity * 0.5})`)
                gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')

                ctx.fillStyle = gradient
                ctx.fill()

                // Draw connections
                particlesRef.current.forEach((other) => {
                    const dx = other.x - particle.x
                    const dy = other.y - particle.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 120) {
                        ctx.beginPath()
                        ctx.moveTo(particle.x, particle.y)
                        ctx.lineTo(other.x, other.y)
                        ctx.strokeStyle = `rgba(59, 130, 246, ${(1 - distance / 120) * 0.15})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                })
            })

            frameRef.current = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', handleMouseMove)
            if (frameRef.current) cancelAnimationFrame(frameRef.current)
        }
    }, [])

    return (
        <motion.canvas
            ref={canvasRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 pointer-events-none z-10"
            style={{ mixBlendMode: 'screen' }}
        />
    )
}
