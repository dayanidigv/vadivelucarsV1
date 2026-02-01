import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, MessageCircle, Star, Wrench, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function VideoHero() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [isVideoLoaded, setIsVideoLoaded] = useState(false)

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Auto-play video when loaded
    useEffect(() => {
        if (videoRef.current && isVideoLoaded) {
            videoRef.current.play().catch(() => {
                console.log('Autoplay prevented - user interaction needed')
            })
        }
    }, [isVideoLoaded, isMobile])

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">

            {/* Video Background */}
            <div className="absolute inset-0 w-full h-full">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/assets/images/AI/Animated Background Pattern.png"
                    onLoadedData={() => setIsVideoLoaded(true)}
                >
                    {/* WebM for modern browsers (better compression) */}
                    <source
                        src={isMobile
                            ? "/assets/videos/optimized/hero-mobile.webm"
                            : "/assets/videos/optimized/hero-desktop-fhd.webm"
                        }
                        type="video/webm"
                    />

                    {/* MP4 fallback for older browsers */}
                    <source
                        src={isMobile
                            ? "/assets/videos/optimized/hero-mobile.mp4"
                            : "/assets/videos/optimized/hero-desktop-fhd.mp4"
                        }
                        type="video/mp4"
                    />

                    {/* Fallback image if video fails */}
                    <img
                        src="/assets/images/AI/Animated Background Pattern.png"
                        alt="Hero background"
                        className="w-full h-full object-cover"
                    />
                </video>

                {/* Overlay gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/75 to-slate-950/90" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24 sm:py-32">

                {/* H1 - Brand Name */}
                <motion.h1
                    className="text-6xl sm:text-7xl md:text-9xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 drop-shadow-2xl"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    VADIVELU CARS
                </motion.h1>

                {/* Tamil Brand Name - Separate line */}
                <motion.p
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/95 mb-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.35 }}
                >
                    வடிவேலு கார்ஸ்
                </motion.p>

                {/* H2 - Value Proposition (Clear Differentiator) */}
                <motion.h2
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 max-w-4xl mx-auto leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    10,000+ Cars Serviced Since 2010
                </motion.h2>

                {/* Body - Supporting text */}
                <motion.p
                    className="text-lg sm:text-xl md:text-2xl mb-16 text-blue-100/90 font-normal max-w-3xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.65 }}
                >
                    Multi-Brand Service • Same-Day Express Repairs • Salem's #1 Trusted Center
                </motion.p>

                {/* CTA Buttons - Clear Hierarchy */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-5 justify-center items-center max-w-xl mx-auto mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                >
                    {/* Primary CTA - WhatsApp */}
                    <motion.a
                        href="https://wa.me/918903626677?text=Hi%2C%20I%20need%20car%20service"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative w-full sm:w-auto"
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            size="2xl"
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-2xl shadow-green-500/50 hover:shadow-green-500/80 transition-all duration-300 text-lg font-bold"
                        >
                            <MessageCircle className="w-6 h-6" />
                            WhatsApp Us Now
                        </Button>
                        <div className="absolute inset-0 rounded-lg bg-green-400/30 blur-xl group-hover:blur-2xl transition-all duration-300 -z-10" />
                    </motion.a>

                    {/* Secondary CTA - Call */}
                    <motion.a
                        href="tel:+918903626677"
                        className="group relative w-full sm:w-auto"
                        whileHover={{ scale: 1.03, y: -3 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Button
                            size="2xl"
                            variant="outline"
                            className="w-full border-2 border-white/40 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white hover:border-white/60 transition-all duration-300"
                        >
                            <Phone className="w-5 h-5" />
                            89036 26677
                        </Button>
                    </motion.a>
                </motion.div>

                {/* Trust Indicators - Reduced to 3, De-emphasized */}
                <motion.div
                    className="grid grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                >
                    {[
                        {
                            Icon: Star,
                            text: "4.8★",
                            subtext: "156 Reviews",
                            gradient: "from-yellow-500 to-orange-500"
                        },
                        {
                            Icon: Wrench,
                            text: "15 Years",
                            subtext: "In Salem",
                            gradient: "from-blue-500 to-cyan-500"
                        },
                        {
                            Icon: Zap,
                            text: "Same Day",
                            subtext: "80% Repairs",
                            gradient: "from-purple-500 to-pink-500"
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            className="group backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300"
                            whileHover={{ y: -4 }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 1 + (i * 0.1) }}
                        >
                            {/* Icon */}
                            <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${item.gradient} mb-3 shadow-md`}>
                                <item.Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                            </div>

                            {/* Text */}
                            <div className="font-bold text-sm sm:text-base text-white mb-0.5">{item.text}</div>
                            <div className="text-xs sm:text-sm text-blue-200/70">{item.subtext}</div>
                        </motion.div>
                    ))}
                </motion.div>

            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
                    <div className="w-1 h-3 bg-white/80 rounded-full" />
                </div>
            </motion.div>

        </section>
    )
}
