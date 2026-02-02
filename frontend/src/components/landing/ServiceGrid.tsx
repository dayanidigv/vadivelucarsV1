import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Wrench, Zap, Droplet, Settings, PaintBucket, Hammer, ArrowRight } from 'lucide-react'

interface Service {
    id: string
    title: string
    titleTamil: string
    icon: string
    fallback: string
    description: string
    descriptionTamil: string
    IconComponent: React.ComponentType<{ className?: string }>
}

const services: Service[] = [
    {
        id: 'oil',
        title: 'Oil Service & Maintenance',
        titleTamil: 'எண்ணெய் சேவை மற்றும் பராமரிப்பு',
        icon: '/assets/images/optimized/icon-oil-service-3d.webp',
        fallback: '/assets/images/AI/Oil Service (3D).png',
        description: 'Complete engine oil change, filter replacement, and routine maintenance',
        descriptionTamil: 'முழுமையான எஞ்சின் எண்ணெய் மாற்றம், வடிகட்டி மாற்று மற்றும் வழக்கமான பராமரிப்பு',
        IconComponent: Droplet
    },
    {
        id: 'engine',
        title: 'Engine Repair & Diagnostic',
        titleTamil: 'இயந்திர பழுது & கண்டறிதல்',
        icon: '/assets/images/optimized/icon-engine-work-3d.webp',
        fallback: '/assets/images/AI/Engine Work (3D).png',
        description: 'Engine overhaul, tuning, and computerized diagnostics',
        descriptionTamil: 'இயந்திர மறு ஒழுங்காக்கம், டியூனிங் மற்றும் கணினி கண்டறிதல்',
        IconComponent: Settings
    },
    {
        id: 'electrical',
        title: 'Electrical & Electronics',
        titleTamil: 'மின்சார & மின்னணு',
        icon: '/assets/images/optimized/icon-electrical-work-3d.webp',
        fallback: '/assets/images/AI/Electrical Work (3D).png',
        description: 'Battery, wiring, lighting, and ECU services',
        descriptionTamil: 'பேட்டரி, வயரிங், விளக்கு மற்றும் ECU சேவைகள்',
        IconComponent: Zap
    },
    {
        id: 'suspension',
        title: 'Suspension & Brake',
        titleTamil: 'சஸ்பென்ஷன் & பிரேக்',
        icon: '/assets/images/optimized/icon-suspension-work-3d.webp',
        fallback: '/assets/images/AI/Suspension Work (3D).png',
        description: 'Suspension, steering, and complete brake system service',
        descriptionTamil: 'சஸ்பென்ஷன், ஸ்டீயரிங் மற்றும் முழு பிரேக் அமைப்பு சேவை',
        IconComponent: Wrench
    },
    {
        id: 'bodywork',
        title: 'Body Work & Painting',
        titleTamil: 'உடல் வேலை & ஓவியம்',
        icon: '/assets/images/optimized/icon-body-work-painting-3d.webp',
        fallback: '/assets/images/AI/Body Work:Painting 3D.png',
        description: 'Denting, painting, polishing, and detailing services',
        descriptionTamil: 'டென்டிங், பெயின்டிங், பாலிஷிங் மற்றும் விவரம் சேவைகள்',
        IconComponent: PaintBucket
    },
    {
        id: 'general',
        title: 'General Repair & AC',
        titleTamil: 'பொது பழுதுபார்ப்பு & ஏசி',
        icon: '/assets/images/optimized/icon-general-repair-3d.webp',
        fallback: '/assets/images/AI/General Repair (3D).png',
        description: 'AC service, cooling system, and accessory installation',
        descriptionTamil: 'ஏசி சேவை, குளிரூட்டும் அமைப்பு மற்றும் துணை நிறுவல்',
        IconComponent: Hammer
    }
]

// Service Row Component - Mobile Optimized
function ServiceRow({ service, index, isMobile }: { service: Service; index: number; isMobile: boolean }) {
    const rowRef = useRef<HTMLDivElement>(null)
    const isEven = index % 2 === 0

    // Only use parallax on desktop
    const { scrollYProgress } = useScroll({
        target: rowRef,
        offset: ["start end", "end start"]
    })

    // Always call hooks unconditionally (Rules of Hooks)
    const imageX = useTransform(scrollYProgress, [0, 1], [isEven ? -100 : 100, isEven ? 50 : -50])
    const contentX = useTransform(scrollYProgress, [0, 1], [isEven ? 100 : -100, isEven ? -50 : 50])
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

    return (
        <motion.div
            ref={rowRef}
            style={isMobile ? {} : { opacity }}
            initial={isMobile ? { opacity: 0, y: 20 } : undefined}
            whileInView={isMobile ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="group relative mb-20 sm:mb-32 last:mb-0"
        >
            <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16`}>

                {/* Image Section */}
                <motion.div
                    style={isMobile ? {} : { x: imageX }}
                    className="w-full lg:w-1/2"
                >
                    <motion.div
                        whileHover={isMobile ? {} : {
                            scale: 1.05,
                            rotateY: isEven ? 5 : -5,
                            rotateX: 3,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15
                        }}
                        className="relative"
                    >
                        {/* Metallic Frame */}
                        <div className="relative overflow-hidden">

                            {/* Reduced glow for mobile performance */}
                            {!isMobile && (
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/0 via-zinc-400/10 to-zinc-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                            )}

                            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 to-black p-12 sm:p-16">
                                {/* Static background for mobile, animated for desktop */}
                                {!isMobile && (
                                    <motion.div
                                        className="absolute inset-0 opacity-30"
                                        animate={{
                                            backgroundPosition: ['0% 0%', '100% 100%'],
                                        }}
                                        transition={{
                                            duration: 20,
                                            repeat: Infinity,
                                            repeatType: "reverse"
                                        }}
                                        style={{
                                            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(161,161,170,0.1) 0%, transparent 50%)`,
                                            backgroundSize: '200% 200%'
                                        }}
                                    />
                                )}

                                {/* 3D Icon - simplified hover for mobile */}
                                <motion.div
                                    whileHover={isMobile ? {} : { scale: 1.1 }}
                                    transition={{
                                        duration: 0.8,
                                        ease: "easeOut"
                                    }}
                                    className="relative"
                                >
                                    <picture>
                                        <source srcSet={service.icon} type="image/webp" />
                                        <img
                                            src={service.fallback}
                                            width="120"
                                            height="120"
                                            loading="lazy"
                                            alt={service.title}
                                            className="relative w-full h-auto max-w-xs mx-auto object-contain drop-shadow-[0_0_40px_rgba(161,161,170,0.4)]"
                                            style={{ willChange: 'transform' }}
                                        />
                                    </picture>
                                </motion.div>
                            </div>
                        </div>

                        {/* Floating icon indicator - desktop only */}
                        {!isMobile && (
                            <motion.div
                                className="absolute -top-6 -right-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-500/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg shadow-blue-500/30"
                                whileHover={{ scale: 1.1, rotate: 360 }}
                                transition={{ duration: 0.5 }}
                            >
                                <service.IconComponent className="w-8 h-8 text-white" />
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>

                {/* Content Section */}
                <motion.div
                    style={isMobile ? {} : { x: contentX }}
                    className="w-full lg:w-1/2 space-y-6"
                >
                    {/* Number Badge */}
                    <motion.div
                        initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-3"
                    >
                        <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-700 to-zinc-800">
                            0{index + 1}
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-zinc-700 to-transparent max-w-[100px]" />
                    </motion.div>

                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight">
                            {service.title}
                        </h3>
                        <p className="text-lg sm:text-xl text-zinc-400 font-medium">
                            {service.titleTamil}
                        </p>
                    </motion.div>

                    {/* Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-3"
                    >
                        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
                            {service.description}
                        </p>
                        <p className="text-sm text-zinc-500 leading-relaxed">
                            {service.descriptionTamil}
                        </p>
                    </motion.div>

                    {/* Decorative line */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className={`h-1 w-32 bg-gradient-to-r ${isEven ? 'from-zinc-600 to-transparent' : 'from-transparent to-zinc-600'}`}
                    />
                </motion.div>
            </div>

            {/* Connecting Line Between Sections */}
            {index < services.length - 1 && (
                <motion.div
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute left-1/2 -bottom-16 w-px h-16 bg-gradient-to-b from-zinc-700 to-transparent transform -translate-x-1/2 hidden lg:block"
                />
            )}
        </motion.div>
    )
}

export function ServiceGrid() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const [isMobile, setIsMobile] = useState(false)

    // Detect mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    })

    // Always call hooks unconditionally (Rules of Hooks)
    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
    const headerY = useTransform(scrollYProgress, [0, 1], [0, -50])
    const headerOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

    return (
        <section
            ref={sectionRef}
            id="services"
            className="relative py-24 sm:py-32 px-4 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden"
        >
            {/* Animated Background Pattern - Simplified for mobile */}
            <motion.div
                style={isMobile ? {} : { y: backgroundY }}
                className="absolute inset-0 opacity-[0.03]"
            >
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'url(/assets/images/optimized/bg-automotive-tech-pattern.webp)',
                        backgroundSize: '512px',
                        backgroundRepeat: 'repeat'
                    }}
                />
            </motion.div>

            {/* Metallic Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.02]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(to right, rgba(161, 161, 170, 0.3) 1px, transparent 1px),
                                     linear-gradient(to bottom, rgba(161, 161, 170, 0.3) 1px, transparent 1px)`,
                    backgroundSize: '100px 100px'
                }} />
            </div>

            {/* Radial Gradient Spotlight */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(113,113,122,0.1)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(82,82,91,0.1)_0%,_transparent_50%)]" />

            {/* Floating Light Orbs - Desktop only */}
            {!isMobile && (
                <>
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-500/5 rounded-full blur-3xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-600/5 rounded-full blur-3xl"
                        animate={{
                            scale: [1.2, 1, 1.2],
                            x: [0, -50, 0],
                            y: [0, 30, 0],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </>
            )}

            <div className="relative max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    style={isMobile ? {} : { y: headerY, opacity: headerOpacity }}
                    initial={isMobile ? { opacity: 0, y: 30 } : undefined}
                    whileInView={isMobile ? { opacity: 1, y: 0 } : undefined}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 sm:mb-20"
                >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-zinc-200 via-zinc-50 to-zinc-300 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                        Our Services
                    </h2>
                    <p className="text-xl sm:text-2xl text-zinc-400 font-medium">
                        எங்கள் சேவைகள்
                    </p>

                    {/* Decorative Line */}
                    <motion.div
                        className="mt-6 flex justify-center"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <div className="h-1 w-32 bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
                    </motion.div>
                </motion.div>

                {/* Service Rows */}
                <div className="space-y-0">
                    {services.map((service, index) => (
                        <ServiceRow key={service.id} service={service} index={index} isMobile={isMobile} />
                    ))}
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-center mt-16 sm:mt-20"
                >
                    <motion.button
                        whileHover={isMobile ? {} : {
                            scale: 1.05,
                            boxShadow: "0 0 40px rgba(161,161,170,0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 text-white font-bold text-base sm:text-lg rounded-full border-2 border-zinc-600/50 hover:border-zinc-500/70 transition-all duration-300 overflow-hidden"
                    >
                        {/* Shine Effect - Desktop only */}
                        {!isMobile && (
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.6 }}
                            />
                        )}

                        <span className="relative flex items-center gap-3">
                            View All Services
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                    </motion.button>

                    {/* Subtitle */}
                    <p className="mt-4 text-sm text-zinc-500">
                        Explore our complete range of automotive solutions
                    </p>
                </motion.div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </section>
    )
}