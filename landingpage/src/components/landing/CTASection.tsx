import { motion, useScroll, useTransform } from 'framer-motion'
import { Phone, MessageCircle, Clock, MapPin, Award, ArrowRight, Car, Zap, Wrench } from 'lucide-react'
import { useRef } from 'react'

export function CTASection() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], [50, -50])
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

    return (
        <section
            ref={sectionRef}
            id="book"
            className="relative py-24 sm:py-32 px-4 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden"
        >
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(to right, rgba(161, 161, 170, 0.3) 1px, transparent 1px),
                                     linear-gradient(to bottom, rgba(161, 161, 170, 0.3) 1px, transparent 1px)`,
                    backgroundSize: '80px 80px'
                }} />
            </div>

            {/* Animated Gradient Orbs */}
            <motion.div
                className="absolute top-1/4 -left-32 w-96 h-96 bg-zinc-600/10 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neutral-500/10 rounded-full blur-3xl"
                animate={{
                    scale: [1.2, 1, 1.2],
                    x: [0, -50, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <div className="relative max-w-7xl mx-auto">

                {/* Main Content - Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">

                    {/* Left Side - Text Content */}
                    <motion.div
                        style={{ y, opacity }}
                        className="space-y-8"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/30 backdrop-blur-sm"
                        >
                            <Award className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-semibold text-blue-300">Professional Service</span>
                        </motion.div>

                        {/* Heading */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-white to-zinc-200 leading-tight mb-4">
                                Ready to Service Your Car?
                            </h2>
                            <p className="text-2xl sm:text-3xl text-zinc-400 font-bold mb-4">
                                உங்கள் காரை சேவை செய்ய தயாரா?
                            </p>
                            <p className="text-lg text-zinc-500 leading-relaxed">
                                Get in touch with our expert team for professional automotive care. We're here to keep your vehicle running smoothly.
                            </p>
                        </motion.div>

                        {/* Quick Info Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            {[
                                { icon: Clock, text: 'Open 6 Days', tamil: '6 நாட்கள்' },
                                { icon: MapPin, text: 'Salem, TN', tamil: 'சேலம்' },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                        <item.icon className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold text-sm">{item.text}</div>
                                        <div className="text-zinc-500 text-xs">{item.tamil}</div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Side - CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="space-y-6"
                    >
                        {/* WhatsApp CTA - Primary */}
                        <motion.a
                            href="https://wa.me/918903626677?text=Hi%2C%20I%20need%20car%20service"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative block"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-300"></div>

                            <div className="relative bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 border-2 border-green-400/30 overflow-hidden">
                                {/* Animated background pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute inset-0" style={{
                                        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                                        backgroundSize: '20px 20px'
                                    }} />
                                </div>

                                {/* Shine effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '200%' }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        repeatDelay: 2,
                                        ease: "easeInOut"
                                    }}
                                />

                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <MessageCircle className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-white font-black text-2xl mb-1">WhatsApp Us</div>
                                            <div className="text-green-100 text-sm font-medium">வாட்ஸ்அப் செய்யுங்கள்</div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform duration-300" />
                                </div>

                                {/* Pulse indicator */}
                                <motion.div
                                    className="absolute top-6 right-6 w-3 h-3 bg-white rounded-full"
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [1, 0, 1]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            </div>
                        </motion.a>

                        {/* Call CTA - Secondary */}
                        <motion.a
                            href="tel:+918903626677"
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative block"
                        >
                            <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border-2 border-zinc-800/80 hover:border-zinc-700/80 transition-all duration-300 overflow-hidden">
                                {/* Metallic shine */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-zinc-700/0 via-zinc-500/10 to-zinc-700/0 opacity-0 group-hover:opacity-100"
                                    transition={{ duration: 0.5 }}
                                />

                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <motion.div
                                            className="w-14 h-14 rounded-xl bg-zinc-800/80 flex items-center justify-center"
                                            animate={{
                                                rotate: [0, -10, 10, -10, 10, 0]
                                            }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                repeatDelay: 3
                                            }}
                                        >
                                            <Phone className="w-8 h-8 text-zinc-300" />
                                        </motion.div>
                                        <div>
                                            <div className="text-white font-black text-2xl mb-1">89036 26677</div>
                                            <div className="text-zinc-400 text-sm font-medium">இப்போதே அழைக்கவும்</div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-zinc-400 group-hover:translate-x-2 group-hover:text-zinc-300 transition-all duration-300" />
                                </div>
                            </div>
                        </motion.a>

                        {/* Sub-text */}
                        <p className="text-center text-sm text-zinc-600">
                            Available Monday - Saturday • 9 AM - 7 PM
                        </p>
                    </motion.div>
                </div>

                {/* Features Grid - Bottom Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {[
                        {
                            Icon: Car,
                            title: 'Free Pickup & Drop',
                            tamil: 'இலவச பிக்கப் & டிராப்',
                            description: 'Convenient doorstep service'
                        },
                        {
                            Icon: Zap,
                            title: 'Express Service',
                            tamil: 'எக்ஸ்பிரஸ் சேவை',
                            description: 'Quick turnaround time'
                        },
                        {
                            Icon: Wrench,
                            title: 'Field Work Available',
                            tamil: 'கள வேலை கிடைக்கும்',
                            description: 'On-site repairs available'
                        }
                    ].map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="group relative"
                        >
                            <div className="relative h-full backdrop-blur-xl bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-zinc-800/50 rounded-2xl p-8 overflow-hidden transition-all duration-300 hover:border-zinc-700/60 hover:shadow-[0_0_30px_rgba(113,113,122,0.15)]">
                                {/* Hover gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/0 via-zinc-700/5 to-zinc-800/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative space-y-4">
                                    {/* Icon */}
                                    <div className="w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-2">
                                        <feature.Icon className="w-14 h-14 text-blue-400" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-white font-bold text-xl group-hover:text-zinc-100 transition-colors">
                                        {feature.title}
                                    </h3>

                                    {/* Tamil */}
                                    <p className="text-zinc-400 font-medium text-sm">
                                        {feature.tamil}
                                    </p>

                                    {/* Description */}
                                    <p className="text-zinc-600 text-sm">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Bottom accent */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </section>
    )
}