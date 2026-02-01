import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

export function MapSection() {
    return (
        <section className="relative py-16 sm:py-20 px-4 bg-gradient-to-b from-black to-zinc-950">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(to right, rgba(161, 161, 170, 0.3) 1px, transparent 1px),
                                     linear-gradient(to bottom, rgba(161, 161, 170, 0.3) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-400">
                            Find Us
                        </h2>
                    </div>
                    <p className="text-zinc-500 text-sm">
                        Near HP Petrol Bunk, Kondalampatti Bypass, Salem
                    </p>
                </motion.div>

                {/* Map Container */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative rounded-2xl overflow-hidden border border-zinc-800/50 shadow-2xl"
                >
                    {/* Map Frame */}
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3907.8015333175795!2d78.1220925!3d11.637487599999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babef4c5193a2a7%3A0x8fa3208d92891f03!2sVadivelu%20cars!5e0!3m2!1sen!2sin!4v1735669000613!5m2!1sen!2sin"
                        className="w-full h-[300px] sm:h-[400px] md:h-[450px]"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Vadivelu Cars Location"
                    />

                    {/* Overlay gradient for better integration */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
                </motion.div>
            </div>
        </section>
    )
}
