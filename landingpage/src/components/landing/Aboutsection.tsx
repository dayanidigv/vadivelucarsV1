import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Award, Users, Wrench, Shield, CheckCircle, Star } from 'lucide-react'

export function AboutSection() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    })

    const imageY = useTransform(scrollYProgress, [0, 1], [100, -100])
    const contentY = useTransform(scrollYProgress, [0, 1], [-50, 50])

    const stats = [
        { number: '15+', label: 'Years Experience', tamil: 'ஆண்டுகள் அனுபவம்' },
        { number: '15,000+', label: 'Cars Serviced', tamil: 'கார்கள் சேவை' },
        { number: '5,000+', label: 'Happy Customers', tamil: 'மகிழ்ச்சி வாடிக்கையாளர்கள்' },
    ]

    const highlights = [
        { icon: Award, text: 'Multi-Brand Specialist', tamil: 'பல பிராண்ட் நிபுணர்' },
        { icon: Shield, text: 'Trusted Since 2012', tamil: '2012 முதல் நம்பகமான' },
        { icon: Wrench, text: 'Expert Technicians', tamil: 'நிபுணர் தொழில்நுட்பவியலாளர்கள்' },
        { icon: Users, text: 'Doorstep Service', tamil: 'வீட்டு வாசல் சேவை' },
    ]

    return (
        <section
            ref={sectionRef}
            id="about"
            className="relative py-24 sm:py-32 px-4 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden"
        >
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(to right, rgba(161, 161, 170, 0.3) 1px, transparent 1px),
                                     linear-gradient(to bottom, rgba(161, 161, 170, 0.3) 1px, transparent 1px)`,
                    backgroundSize: '100px 100px'
                }} />
            </div>

            {/* Floating Gradient Orbs */}
            <motion.div
                className="absolute top-1/4 left-0 w-96 h-96 bg-zinc-600/10 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <div className="relative max-w-7xl mx-auto">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16 sm:mb-20"
                >
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="inline-block mb-6"
                    >
                        <div className="px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/30 backdrop-blur-sm">
                            <span className="text-sm font-semibold text-blue-300">About Us • எங்களை பற்றி</span>
                        </div>
                    </motion.div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-200 via-zinc-50 to-zinc-300 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] leading-tight">
                        Your Trusted Car Service<br className="hidden sm:block" /> Partner in Salem
                    </h2>

                    <p className="text-xl sm:text-2xl text-zinc-400 font-semibold max-w-3xl mx-auto">
                        Multi-Car Service | Best Car Repair & Doorstep Car Services
                    </p>

                    {/* Decorative Line */}
                    <motion.div
                        className="mt-8 flex justify-center"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <div className="h-1 w-40 bg-gradient-to-r from-transparent via-blue-600 to-transparent" />
                    </motion.div>
                </motion.div>

                {/* Main Content - Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">

                    {/* Left - Company Story */}
                    <motion.div
                        style={{ y: contentY }}
                        className="space-y-8"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6"
                        >
                            <p className="text-lg text-zinc-300 leading-relaxed">
                                At <span className="font-bold text-white">Vadivelu Cars</span>, we have been providing reliable and affordable car services since <span className="font-bold text-white">2012</span>. With <span className="font-bold text-white">15+ years of experience</span>, our expert technicians specialize in multi-brand car repairs, maintenance, and doorstep services.
                            </p>

                            <p className="text-lg text-zinc-400 leading-relaxed">
                                We ensure top-notch care for your vehicle in Salem, Tamil Nadu, combining traditional expertise with modern technology to deliver exceptional automotive solutions.
                            </p>
                        </motion.div>

                        {/* Highlights Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            {highlights.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm hover:border-zinc-700/60 transition-all duration-300"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                                        <item.icon className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold text-sm mb-1">{item.text}</div>
                                        <div className="text-zinc-500 text-xs">{item.tamil}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right - CEO Profile Card */}
                    <motion.div
                        style={{ y: imageY }}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <div className="relative group">
                            {/* Glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />

                            <div className="relative bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 rounded-3xl p-8 sm:p-10 border border-zinc-800/50 backdrop-blur-xl overflow-hidden">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-[0.03]">
                                    <div className="absolute inset-0" style={{
                                        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(161,161,170,0.3) 1px, transparent 1px)`,
                                        backgroundSize: '30px 30px'
                                    }} />
                                </div>

                                {/* Metallic Shine on Hover */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-zinc-700/0 via-zinc-500/10 to-zinc-700/0 opacity-0 group-hover:opacity-100"
                                    transition={{ duration: 0.7 }}
                                />

                                <div className="relative space-y-6">
                                    {/* Badge */}
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/30">
                                        <Star className="w-4 h-4 text-blue-400" />
                                        <span className="text-xs font-bold text-blue-300">CEO & Founder</span>
                                    </div>

                                    {/* CEO Image Placeholder */}
                                    {/* <div className="relative">
                                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700/50 flex items-center justify-center overflow-hidden group-hover:border-zinc-600/60 transition-all duration-300">
                                            <div className="text-6xl sm:text-7xl">👨‍💼</div>
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-12 h-12 border-r-2 border-b-2 border-zinc-700/40 rounded-br-2xl" />
                                    </div> */}

                                    {/* CEO Info */}
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                                                Mr. M. Vadivel
                                            </h3>
                                            <p className="text-zinc-400 font-semibold text-sm">
                                                D.M.E. | Diploma in Mechanical Engineering
                                            </p>
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-zinc-700 via-zinc-600 to-transparent" />

                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-zinc-400 text-sm leading-relaxed">
                                                    <span className="font-semibold text-zinc-300">20+ years</span> of experience in the automotive industry
                                                </p>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-zinc-400 text-sm leading-relaxed">
                                                    Vision to offer <span className="font-semibold text-zinc-300">exceptional car care</span> with unmatched customer satisfaction
                                                </p>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-zinc-400 text-sm leading-relaxed">
                                                    Making Vadivelu Cars a <span className="font-semibold text-zinc-300">trusted name in Salem</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quote */}
                                    <div className="relative mt-6 p-4 rounded-xl bg-zinc-800/30 border-l-4 border-blue-600">
                                        <p className="text-zinc-400 italic text-sm leading-relaxed">
                                            "Excellence in service, trust in every repair"
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom Accent */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                            whileHover={{ y: -10, scale: 1.05 }}
                            className="group relative"
                        >
                            <div className="relative bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 rounded-2xl p-8 border border-zinc-800/50 backdrop-blur-xl text-center overflow-hidden hover:border-zinc-700/60 transition-all duration-300">
                                {/* Metallic shine on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-700/0 via-zinc-500/10 to-zinc-700/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative space-y-2">
                                    <div className="text-5xl sm:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-zinc-200 to-zinc-400">
                                        {stat.number}
                                    </div>
                                    <div className="text-white font-bold text-lg">
                                        {stat.label}
                                    </div>
                                    <div className="text-zinc-500 text-sm font-medium">
                                        {stat.tamil}
                                    </div>
                                </div>

                                {/* Bottom accent */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </section>
    )
}