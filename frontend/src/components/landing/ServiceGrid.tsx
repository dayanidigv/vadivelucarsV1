import { motion } from 'framer-motion'
import { Wrench, Zap, Droplet, Settings, PaintBucket, Hammer } from 'lucide-react'

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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    }
}

export function ServiceGrid() {
    return (
        <section className="relative py-24 px-4 bg-slate-950 overflow-hidden">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: 'url(/assets/images/optimized/bg-automotive-tech-pattern.webp)',
                    backgroundSize: '512px',
                    backgroundRepeat: 'repeat'
                }}
            />

            <div className="relative max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">
                        Our Services
                    </h2>
                    <p className="text-xl text-slate-400">
                        எங்கள் சேவைகள்
                    </p>
                </motion.div>

                {/* Service Cards Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {services.map((service) => (
                        <motion.div
                            key={service.id}
                            variants={cardVariants}
                            whileHover={{
                                y: -10,
                                scale: 1.02,
                                transition: { duration: 0.3 }
                            }}
                            className="group relative"
                        >
                            {/* Glassmorphism Card */}
                            <div className="relative h-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]">

                                {/* Gradient Glow on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Icon */}
                                <div className="relative mb-6">
                                    <picture>
                                        <source srcSet={service.icon} type="image/webp" />
                                        <img
                                            src={service.fallback}
                                            alt={service.title}
                                            className="w-32 h-32 mx-auto object-contain transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"
                                        />
                                    </picture>
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-bold text-white mb-2 text-center group-hover:text-cyan-400 transition-colors duration-300">
                                    {service.title}
                                </h3>
                                <p className="text-blue-300 text-center text-sm mb-4 font-medium">
                                    {service.titleTamil}
                                </p>

                                {/* Description */}
                                <p className="text-slate-300 text-center text-sm leading-relaxed mb-2">
                                    {service.description}
                                </p>
                                <p className="text-slate-400 text-center text-xs leading-relaxed">
                                    {service.descriptionTamil}
                                </p>

                                {/* Hover Icon */}
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <service.IconComponent className="w-6 h-6 text-cyan-400" />
                                </div>

                                {/* Bottom Gradient Border */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-center mt-16"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-shadow duration-300"
                    >
                        View All Services
                    </motion.button>
                </motion.div>
            </div>
        </section>
    )
}
