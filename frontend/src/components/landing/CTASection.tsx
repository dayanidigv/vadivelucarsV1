import { motion } from 'framer-motion'
import { Phone, MessageCircle } from 'lucide-react'

export function CTASection() {
    return (
        <section className="relative py-20 px-4 bg-gradient-to-b from-slate-950 to-slate-900">
            <div className="max-w-4xl mx-auto text-center">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
                        Ready to Service Your Car?
                    </h2>
                    <p className="text-xl text-blue-300 mb-3">
                        உங்கள் காரை சேவை செய்ய தயாரா?
                    </p>
                    <p className="text-slate-400 text-lg mb-12">
                        Contact us now for professional automotive care
                    </p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                >

                    {/* WhatsApp Button */}
                    <motion.a
                        href="https://wa.me/919876543210"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative w-full sm:w-auto"
                    >
                        <div className="relative backdrop-blur-xl bg-green-500/20 border-2 border-green-400 rounded-2xl px-10 py-5 overflow-hidden transition-all duration-300 hover:bg-green-500/30 hover:border-green-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]">

                            {/* Animated Pulse */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0, 0.5]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute inset-0 bg-green-400/20 rounded-2xl"
                            />

                            <div className="relative flex items-center gap-4">
                                <MessageCircle className="w-8 h-8 text-green-300" />
                                <div className="text-left">
                                    <div className="text-white font-bold text-xl">WhatsApp</div>
                                    <div className="text-green-200 text-sm">வாட்ஸ்அப்</div>
                                </div>
                            </div>
                        </div>
                    </motion.a>

                    {/* Call Button */}
                    <motion.a
                        href="tel:+919876543210"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative w-full sm:w-auto"
                    >
                        <div className="relative backdrop-blur-xl bg-blue-500/20 border-2 border-blue-400 rounded-2xl px-10 py-5 overflow-hidden transition-all duration-300 hover:bg-blue-500/30 hover:border-blue-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]">

                            {/* Ringing Animation */}
                            <motion.div
                                animate={{
                                    rotate: [0, -15, 15, -15, 15, 0]
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    repeatDelay: 2
                                }}
                                className="absolute top-1/2 left-8 -translate-y-1/2"
                            >
                                <Phone className="w-8 h-8 text-blue-300" />
                            </motion.div>

                            <div className="relative flex items-center gap-4 pl-4">
                                <div className="w-8" /> {/* Spacer for icon */}
                                <div className="text-left">
                                    <div className="text-white font-bold text-xl">Call Now</div>
                                    <div className="text-blue-200 text-sm">இப்போதே அழைக்கவும்</div>
                                </div>
                            </div>
                        </div>
                    </motion.a>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {[
                        { title: 'Free Pickup & Drop', tamil: 'இலவச பிக்கப் & டிராப்', emoji: '🚗' },
                        { title: 'Express Service', tamil: 'எக்ஸ்பிரஸ் சேவை', emoji: '⚡' },
                        { title: 'Field Work Available', tamil: 'கள வேலை கிடைக்கும்', emoji: '🔧' }
                    ].map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
                        >
                            <div className="text-4xl mb-3">{feature.emoji}</div>
                            <h3 className="text-white font-bold text-lg mb-1">{feature.title}</h3>
                            <p className="text-cyan-300 text-sm">{feature.tamil}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
