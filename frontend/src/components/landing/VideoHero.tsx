import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Phone, MessageCircle, Award, Calendar, MapPin, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function VideoHero() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [isVideoLoaded, setIsVideoLoaded] = useState(false)

    const { scrollY } = useScroll()
    const opacity = useTransform(scrollY, [0, 300], [1, 0])
    const scale = useTransform(scrollY, [0, 300], [1, 0.95])

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
    }, [isVideoLoaded])

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-neutral-950"
        >
            {/* Video Background with Enhanced Overlay */}
            <div className="absolute inset-0 w-full h-full">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover opacity-40"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/assets/images/AI/Animated Background Pattern.png"
                    onLoadedData={() => setIsVideoLoaded(true)}
                >
                    <source
                        src={isMobile
                            ? "/assets/videos/optimized/hero-mobile.webm"
                            : "/assets/videos/optimized/hero-desktop-fhd.webm"
                        }
                        type="video/webm"
                    />
                    <source
                        src={isMobile
                            ? "/assets/videos/optimized/hero-mobile.mp4"
                            : "/assets/videos/optimized/hero-desktop-fhd.mp4"
                        }
                        type="video/mp4"
                    />
                    <img
                        src="/assets/images/AI/Animated Background Pattern.png"
                        alt="Hero background"
                        className="w-full h-full object-cover"
                    />
                </video>

                {/* Multi-layered Gradient Overlay - Metallic Black */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.9)_100%)]" />

                {/* Chrome Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.08]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(to right, rgba(163, 163, 163, 0.5) 1px, transparent 1px),
                                         linear-gradient(to bottom, rgba(163, 163, 163, 0.5) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }} />
                </div>

                {/* Metallic Light Reflections */}
                <motion.div
                    className="absolute top-0 left-1/4 w-96 h-96 bg-zinc-400/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-0 right-1/4 w-96 h-96 bg-neutral-300/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.4, 0.2, 0.4],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Main Content */}
            <motion.div
                className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32"
                style={{ opacity, scale }}
            >
                <div className="text-center space-y-6 sm:space-y-8">

                    {/* Trust Badge */}
                    <motion.div
                        className="flex justify-center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/40 border border-zinc-700/50 backdrop-blur-sm">
                            <Award className="w-4 h-4 text-zinc-300" />
                            <span className="text-sm font-medium text-zinc-200">Salem's Most Trusted Service Center</span>
                        </div>
                    </motion.div>

                    {/* Main Heading - Improved Typography Hierarchy */}
                    <div className="space-y-3">
                        <motion.h1
                            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.15 }}
                        >
                            <span
                                className="block bg-clip-text text-transparent bg-gradient-to-b from-[#4A9EFF] via-[#015AE4] to-[#013A94] leading-[1.1]"
                                style={{
                                    fontFamily: "'Revue Std Bold', serif",
                                    WebkitTextStroke: '1px rgba(1, 90, 228, 0.3)',
                                    filter: 'drop-shadow(0 2px 8px rgba(1, 90, 228, 0.5)) drop-shadow(0 0 20px rgba(1, 90, 228, 0.3))',
                                }}
                            >
                                VADIVELU CARS
                            </span>
                        </motion.h1>

                        {/* Tamil Name - Enhanced Metallic */}
                        <motion.p
                            className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-300/90 tracking-wide"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                        >
                            வடிவேலு கார்ஸ்
                        </motion.p>
                    </div>

                    {/* Subheading - Improved Contrast and Spacing */}
                    <motion.h2
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl mx-auto leading-tight px-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.45 }}
                    >
                        <span className="inline-block bg-gradient-to-r from-white via-zinc-100 to-zinc-200 bg-clip-text text-transparent">
                            15,000+ Cars Serviced
                        </span>
                        <br />
                        <span className="text-zinc-300/90 text-2xl sm:text-3xl md:text-4xl">
                            Since 2012
                        </span>
                    </motion.h2>

                    {/* Service Features - Grid Layout */}
                    <motion.div
                        className="max-w-3xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.6 }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4">
                            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-zinc-800/30 border border-zinc-700/40 backdrop-blur-sm">
                                {/* <div className="w-2 h-2 rounded-full bg-zinc-400" /> */}
                                <span className="text-sm sm:text-base text-zinc-200 font-medium">Multi-Brand Service</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-zinc-800/30 border border-zinc-700/40 backdrop-blur-sm">
                                {/* <div className="w-2 h-2 rounded-full bg-neutral-300" /> */}
                                <span className="text-sm sm:text-base text-zinc-200 font-medium">Express Repairs</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-zinc-800/30 border border-zinc-700/40 backdrop-blur-sm sm:col-span-1 col-span-1">
                                {/* <div className="w-2 h-2 rounded-full bg-zinc-400" /> */}
                                <span className="text-sm sm:text-base text-zinc-200 font-medium">Expert Technicians</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* CTA Section - Enhanced Hierarchy and Spacing */}
                    <motion.div
                        className="pt-8 sm:pt-12"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.75 }}
                    >
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-stretch sm:items-center max-w-2xl mx-auto px-4">

                            {/* Primary CTA - WhatsApp */}
                            <motion.a
                                href="https://wa.me/918903626677?text=Hi%2C%20I%20need%20car%20service"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex-1 sm:flex-initial"
                                whileHover={{ scale: 1.03, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur-lg opacity-30 group-hover:opacity-100 transition duration-300" />
                                <Button
                                    size="lg"
                                    className="relative w-full sm:w-auto px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg shadow-2xl border-2 border-green-400/50 transition-all duration-300"
                                >
                                    <MessageCircle className="w-6 h-6" />
                                    <span className="hidden sm:inline">WhatsApp Us Now</span>
                                    <span className="sm:hidden">Message Us</span>
                                </Button>
                            </motion.a>

                            {/* Secondary CTA - Call - Metallic Steel */}
                            <motion.a
                                href="tel:+918903626677"
                                className="group relative flex-1 sm:flex-initial"
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto px-8 py-6 border-2 border-zinc-600/60 bg-zinc-800/40 hover:bg-zinc-700/50 backdrop-blur-md text-zinc-100 hover:border-zinc-500/80 transition-all duration-300 font-semibold text-lg shadow-lg"
                                >
                                    <Phone className="w-5 h-5" />
                                    89036 26677
                                </Button>
                            </motion.a>
                        </div>

                        {/* Quick Contact Info */}
                        <motion.div
                            className="mt-6 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-sm text-zinc-400 px-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.9 }}
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Open 6 Days</span>
                            </div>
                            <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-600" />
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>Salem, Tamil Nadu</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Scroll Indicator - Enhanced Animation */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 12, 0] }}
                transition={{
                    opacity: { delay: 1.2, duration: 0.5 },
                    y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
            >
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-10 border-2 border-zinc-600/60 rounded-full flex justify-center pt-2 backdrop-blur-sm bg-zinc-800/20">
                        <motion.div
                            className="w-1.5 h-3 bg-zinc-300 rounded-full"
                            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                    <ChevronDown className="w-5 h-5 text-zinc-500" />
                </div>
            </motion.div>

            {/* Decorative Corner Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-blue-500/30" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-cyan-500/30" />
        </section>
    )
}