import { useState, useEffect } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Menu, X, MapPin, Phone, ExternalLink, Mail } from 'lucide-react'

export function PublicLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="font-sans antialiased text-slate-800 bg-black min-h-screen flex flex-col">
            {/* Navbar - Metallic Black Theme */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'border-b border-zinc-800/80 bg-black backdrop-blur-xl shadow-2xl shadow-black/50' : 'border-b border-zinc-800/50 bg-black backdrop-blur-md'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo - Left side */}
                        <Link to="/" className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
                            <picture>
                                <source srcSet="/assets/images/vadivelu_cars.png" type="image/png" />
                                <img
                                    src="/assets/images/vadivelu_cars.png"
                                    width="96"
                                    height="96"
                                    loading="eager"
                                    alt="Vadivelu Cars"
                                    className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                />
                            </picture>
                        </Link>

                        {/* Desktop Menu - Centered */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a
                                href="/#services"
                                className="relative text-sm font-semibold text-zinc-300 hover:text-white transition-colors duration-300 group"
                            >
                                Services
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-zinc-400 to-zinc-600 group-hover:w-full transition-all duration-300"></span>
                            </a>
                            <a
                                href="/#about"
                                className="relative text-sm font-semibold text-zinc-300 hover:text-white transition-colors duration-300 group"
                            >
                                About
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-zinc-400 to-zinc-600 group-hover:w-full transition-all duration-300"></span>
                            </a>
                            <Link
                                to="/login"
                                className="relative bg-gradient-to-r from-[#4A9EFF] via-[#015AE4] to-[#013A94] hover:from-[#4A9EFF] hover:via-[#4A9EFF] hover:to-[#4A9EFF] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-lg shadow-zinc-900/50 hover:shadow-zinc-700/50 border border-[#4A9EFF]/50 hover:border-[#4A9EFF]/70 overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center gap-2">Track Status</span>
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            </Link>
                        </div>

                        {/* Mobile Menu Button - Right side */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className="p-2 text-zinc-300 hover:text-white transition-colors duration-300 rounded-lg hover:bg-zinc-800/50"
                                aria-label="Open navigation menu"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Metallic bottom border accent */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
            </nav>

            {/* Mobile Menu Overlay - Metallic Black */}
            <div className={`fixed inset-0 z-50 bg-black/98 backdrop-blur-2xl transition-opacity duration-300 md:hidden flex flex-col items-center justify-center space-y-8 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Close Button */}
                <button
                    onClick={() => setIsMenuOpen(false)}
                    className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2 transition-colors duration-300 rounded-lg hover:bg-zinc-800/50"
                    aria-label="Close navigation menu"
                >
                    <X className="w-8 h-8" />
                </button>

                {/* Background gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(113,113,122,0.15)_0%,_transparent_70%)]"></div>

                {/* Menu Items */}
                <div className="relative flex flex-col items-center space-y-8">
                    <a
                        href="/#services"
                        className="text-2xl font-bold text-zinc-200 hover:text-white transition-all duration-300 hover:scale-105"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Services
                    </a>
                    <a
                        href="/#about"
                        className="text-2xl font-bold text-zinc-200 hover:text-white transition-all duration-300 hover:scale-105"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        About
                    </a>
                    <Link
                        to="/login"
                        className="relative bg-gradient-to-r from-[#4A9EFF] via-[#015AE4] to-[#013A94] hover:from-[#4A9EFF] hover:via-[#4A9EFF] hover:to-[#4A9EFF] text-white px-8 py-3 rounded-full text-xl font-bold shadow-2xl shadow-zinc-900/50 transition-all duration-300 border border-[#4A9EFF]/50 overflow-hidden group"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <span className="relative z-10">Track Status</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </Link>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-zinc-800/50"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-zinc-800/50"></div>
            </div>

            {/* Main Content */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer - Metallic Black Theme */}
            <footer className="bg-gradient-to-b from-zinc-950 to-black text-zinc-400 py-12 border-t border-zinc-800/50 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(to right, rgba(161, 161, 170, 0.3) 1px, transparent 1px),
                                         linear-gradient(to bottom, rgba(161, 161, 170, 0.3) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        {/* Brand Section */}
                        <div className="col-span-1 md:col-span-2">
                            <h2
                                className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#4A9EFF] via-[#015AE4] to-[#013A94] mb-4"
                                style={{
                                    fontFamily: "'Revue Std Bold', serif",
                                    WebkitTextStroke: '0.5px rgba(1, 90, 228, 0.3)',
                                    filter: 'drop-shadow(0 1px 4px rgba(1, 90, 228, 0.5)) drop-shadow(0 0 10px rgba(1, 90, 228, 0.3))',
                                }}
                            >
                                VADIVELU CARS
                            </h2>
                            <p className="mb-4 max-w-sm text-zinc-500 leading-relaxed">
                                Bosch authorized service center in Salem. Dedicated to comprehensive car care and customer satisfaction since 2012.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link
                                        to="/"
                                        className="text-zinc-500 hover:text-zinc-300 transition-colors duration-300 text-sm flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-zinc-400 transition-colors"></span>
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="/#about"
                                        className="text-zinc-500 hover:text-zinc-300 transition-colors duration-300 text-sm flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-zinc-400 transition-colors"></span>
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/#services"
                                        className="text-zinc-500 hover:text-zinc-300 transition-colors duration-300 text-sm flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-zinc-400 transition-colors"></span>
                                        Services
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Contact</h3>
                            <ul className="space-y-4 text-sm">
                                {/* Address with Google Maps link */}
                                <li className="space-y-2">
                                    <div className="flex items-start gap-3 text-zinc-500">
                                        <MapPin className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" />
                                        <div className="space-y-1">
                                            <span className="block">Near HP Petrol Bunk, Opp. SM Nexa, Kondalampatti Bypass, Salem, TN 636010</span>
                                            <a
                                                href="https://maps.app.goo.gl/JyRYjkgfi8Pp6UKi8"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-xs font-medium"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Get Directions
                                            </a>
                                        </div>
                                    </div>
                                </li>

                                {/* Phone Numbers */}
                                <li className="space-y-2">
                                    <div className="flex items-center gap-3 text-zinc-500">
                                        <Phone className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                        <a href="tel:+918012526677" className="hover:text-zinc-300 transition-colors">
                                            +91 8012526677
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3 text-zinc-500 pl-7">
                                        <a href="tel:+918903626677" className="hover:text-zinc-300 transition-colors">
                                            +91 8903626677
                                        </a>
                                    </div>
                                </li>

                                {/* Email */}
                                <li className="flex items-center gap-3 text-zinc-500">
                                    <Mail className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                    <a href="mailto:vadivelucars@gmail.com" className="hover:text-zinc-300 transition-colors">
                                        vadivelucars@gmail.com
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-zinc-800/50 pt-8 text-center">
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-sm text-zinc-600">
                            <p>&copy; {new Date().getFullYear()} Vadivelu Cars. All Rights Reserved.</p>
                            <span className="hidden sm:inline">•</span>
                        </div>
                    </div>
                </div>

                {/* Decorative corner accents */}
                <div className="absolute bottom-0 left-0 w-24 h-24 border-l-2 border-b-2 border-zinc-800/30"></div>
                <div className="absolute top-0 right-0 w-24 h-24 border-r-2 border-t-2 border-zinc-800/30"></div>
            </footer>
        </div>
    )
}