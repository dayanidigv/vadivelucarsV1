
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Droplet, Settings, Disc, Wind, Zap, Truck, Check, Award, Phone, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function Landing() {
    const [requestState, setRequestState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault()
        setRequestState('loading')

        const formData = new FormData(e.target as HTMLFormElement)
        const name = formData.get('name') as string
        const phone = formData.get('phone') as string
        // const service = formData.get('service') as string // We can log this or use it later

        try {
            // Create customer (lead)
            const res = await fetch('http://localhost:8787/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone })
            })

            const data = await res.json()

            if (res.ok || (data.error && data.error.includes('duplicate key'))) {
                // If success or already exists (which is fine for a lead), show success
                setRequestState('success')
                setTimeout(() => setRequestState('idle'), 3000);
                (e.target as HTMLFormElement).reset()
            } else {
                console.error("Booking failed", data)
                setRequestState('error')
                setTimeout(() => setRequestState('idle'), 3000)
            }
        } catch (error) {
            console.error("Booking error", error)
            setRequestState('error')
            setTimeout(() => setRequestState('idle'), 3000)
        }
    }

    return (
        <>
            <Helmet>
                <title>Vadivelu Cars | Premium Auto Care in Salem</title>
                <meta name="description" content="Bosch Authorized Service Center in Salem. Professional car care, diagnostics, and repairs at your doorstep." />
                <link rel="canonical" href="https://vadivelucars.in/" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://vadivelucars.in/" />
                <meta property="og:title" content="Vadivelu Cars | Premium Auto Care in Salem" />
                <meta property="og:description" content="Bosch Authorized Service Center in Salem. Professional car care, diagnostics, and repairs at your doorstep." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=2070&auto=format&fit=crop" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://vadivelucars.in/" />
                <meta property="twitter:title" content="Vadivelu Cars | Premium Auto Care in Salem" />
                <meta property="twitter:description" content="Bosch Authorized Service Center in Salem. Professional car care, diagnostics, and repairs at your doorstep." />
                <meta property="twitter:image" content="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=2070&auto=format&fit=crop" />

                {/* Schema.org Structured Data */}
                <script type="application/ld+json">
                    {`
                        {
                            "@context": "https://schema.org",
                            "@type": "AutoRepair",
                            "name": "Vadivelu Cars",
                            "image": "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=2070&auto=format&fit=crop",
                            "description": "Bosch Authorized Service Center in Salem providing professional car care, diagnostics, and doorstep services.",
                            "address": {
                                "@type": "PostalAddress",
                                "streetAddress": "Near HP Petrol Bunk, Opp. SM Nexa, Kondalampatti Bypass",
                                "addressLocality": "Salem",
                                "addressRegion": "TN",
                                "postalCode": "636010",
                                "addressCountry": "IN"
                            },
                            "telephone": "+918012526677",
                            "priceRange": "₹₹",
                            "openingHoursSpecification": {
                                "@type": "OpeningHoursSpecification",
                                "dayOfWeek": [
                                    "Monday",
                                    "Tuesday",
                                    "Wednesday",
                                    "Thursday",
                                    "Friday",
                                    "Saturday"
                                ],
                                "opens": "09:00",
                                "closes": "19:00"
                            },
                            "url": "https://vadivelucars.in/"
                        }
                    `}
                </script>
            </Helmet>

            {/* Hero Section */}
            <div className="relative pt-20 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=2070&auto=format&fit=crop"
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                        alt="Car Workshop"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <Award className="w-3 h-3" /> Bosch Authorized Service Center
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                            Professional Car Care <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-white">At Your Doorstep</span>
                        </h1>
                        <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-lg">
                            Experience dealership-quality service at affordable prices. From routine maintenance to complex repairs, our expert technicians handle it all.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href="#book" className="inline-flex justify-center items-center px-8 py-3.5 rounded-full bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20">
                                Book Appointment
                            </a>
                            <a href="tel:+918012526677" className="inline-flex justify-center items-center px-8 py-3.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white font-semibold hover:bg-white/20 transition-all">
                                <Phone className="w-4 h-4 mr-2" /> +91 8012526677
                            </a>
                        </div>

                        <div className="mt-12 flex items-center gap-8 text-slate-400 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <div className="p-1 rounded-full bg-green-500/20 text-green-400"><Check className="w-3 h-3" /></div>
                                Certified Pros
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1 rounded-full bg-green-500/20 text-green-400"><Check className="w-3 h-3" /></div>
                                Genuine Parts
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1 rounded-full bg-green-500/20 text-green-400"><Check className="w-3 h-3" /></div>
                                Doorstep Service
                            </div>
                        </div>
                    </div>

                    {/* Quick Booking Card */}
                    <div className="hidden lg:block absolute top-20 right-4 w-96 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-1">Quick Booking</h3>
                        <p className="text-sm text-slate-400 mb-6">Get a callback from our advisor.</p>

                        <form onSubmit={handleBooking} className="space-y-4">
                            <Input name="name" type="text" placeholder="Your Name" className="bg-white/10 border-white/10 text-white placeholder:text-slate-400 focus:ring-brand-500" required />
                            <Input name="phone" type="tel" placeholder="Phone Number" className="bg-white/10 border-white/10 text-white placeholder:text-slate-400 focus:ring-brand-500" required />
                            <Select name="service">
                                <SelectTrigger className="bg-white/10 border-white/10 text-white focus:ring-brand-500">
                                    <SelectValue placeholder="Select Service" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General Service</SelectItem>
                                    <SelectItem value="repair">Repair</SelectItem>
                                    <SelectItem value="wash">Car Wash</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                type="submit"
                                className={`w-full font-bold transition-all ${requestState === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-white text-brand-900 hover:bg-slate-100'}`}
                                disabled={requestState === 'loading'}
                            >
                                {requestState === 'loading' ? 'Requesting...' : requestState === 'success' ? 'Request Sent!' : 'Request Callback'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white py-12 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
                        <div className="space-y-2">
                            <h3 className="text-4xl font-extrabold text-brand-600">500+</h3>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Happy Customers</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-4xl font-extrabold text-brand-600">20k+</h3>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Cars Serviced</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-4xl font-extrabold text-brand-600">12+</h3>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Years Experience</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-4xl font-extrabold text-brand-600">95%</h3>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Satisfaction</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services Section */}
            <section id="services" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Comprehensive Care</h2>
                        <p className="text-lg text-slate-600">We use advanced diagnostic tools and genuine parts to keep your vehicle running like new.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ServiceCard icon={Droplet} title="Oil & Lube Service" description="Regular oil changes with premium synthetic oils to protect your engine and improve efficiency." />
                        <ServiceCard icon={Settings} title="Engine Diagnostics" description="Advanced computer diagnostics to identify and fix engine issues before they become major problems." />
                        <ServiceCard icon={Disc} title="Brake Service" description="Complete brake inspections, pad replacement, and rotor resurfacing for your safety." />
                        <ServiceCard icon={Wind} title="AC Repair" description="Full system clean, gas top-up, and leak detection to keep you cool." />
                        <ServiceCard icon={Zap} title="Electrical" description="Battery testing, wiring repairs, and lighting upgrades." />

                        {/* Doorstep Card */}
                        <div className="group bg-brand-600 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-white mb-6">
                                <Truck className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Doorstep Service</h3>
                            <p className="text-blue-100 mb-4 leading-relaxed">We come to you! Schedule a hassle-free service at your home or office.</p>
                            <a href="#book" className="text-white font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                                Book Slot <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="book" className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-900 rounded-3xl p-8 md:p-16 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-brand-600 rounded-full blur-3xl opacity-20"></div>
                        <div className="relative z-10 md:w-2/3">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Experience <br /> Premium Car Care?</h2>
                            <p className="text-slate-400 text-lg mb-8 max-w-lg">Don't wait until it's too late. Book your service today and give your car the attention it deserves.</p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href="tel:+918012526677" className="inline-flex justify-center items-center px-8 py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all">
                                    Call Now: +91 8012526677
                                </a>
                                <Link to="/login" className="inline-flex justify-center items-center px-8 py-4 rounded-full bg-transparent border border-white/20 text-white font-semibold hover:bg-white/10 transition-all">
                                    Check Vehicle Status
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

function ServiceCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="group bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1 cursor-pointer">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 mb-4 leading-relaxed">{description}</p>
            <a href="#book" className="text-brand-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                Book Now <ArrowRight className="w-4 h-4" />
            </a>
        </div>
    )
}
