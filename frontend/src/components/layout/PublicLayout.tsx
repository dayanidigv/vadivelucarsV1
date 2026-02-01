
import { useState, useEffect } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

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
        <div className="font-sans antialiased text-slate-800 bg-white min-h-screen flex flex-col">
            {/* Navbar */}
            <nav className={`fixed w-full z-50 transition-all duration-300 border-b ${scrolled ? 'border-gray-200 bg-white/85 backdrop-blur-xl shadow-sm' : 'border-white/10 bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0 flex items-center gap-3 cursor-pointer">
                            <img src="/assets/images/vadivelu_cars.png" className="h-12 w-auto object-contain" alt="Vadivelu Cars" />
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="/#services" className={`text-sm font-medium transition-colors ${scrolled ? 'text-slate-600 hover:text-brand-600' : 'text-slate-200 hover:text-white'}`}>Services</a>
                            <a href="/#about" className={`text-sm font-medium transition-colors ${scrolled ? 'text-slate-600 hover:text-brand-600' : 'text-slate-200 hover:text-white'}`}>About</a>
                            <Link to="/login" className={`text-sm font-medium transition-colors ${scrolled ? 'text-slate-600 hover:text-brand-600' : 'text-slate-200 hover:text-white'}`}>Track Status</Link>
                            <a href="/#book" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-brand-500/30 flex items-center gap-2">
                                Book Service
                            </a>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(true)} className={`p-2 ${scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-white hover:text-slate-200'}`}>
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-50 bg-white/95 backdrop-blur-xl transform transition-transform duration-300 md:hidden flex flex-col items-center justify-center space-y-8 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 text-slate-600 p-2">
                    <X className="w-8 h-8" />
                </button>
                <a href="/#services" className="text-2xl font-semibold text-slate-800" onClick={() => setIsMenuOpen(false)}>Services</a>
                <a href="/#about" className="text-2xl font-semibold text-slate-800" onClick={() => setIsMenuOpen(false)}>About</a>
                <Link to="/login" className="text-2xl font-semibold text-slate-800" onClick={() => setIsMenuOpen(false)}>Track Status</Link>
                <a href="/#book" className="bg-brand-600 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg shadow-brand-500/30" onClick={() => setIsMenuOpen(false)}>Book Service</a>
            </div>

            {/* Main Content */}
            <main className="flex-grow pt-20">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 md:col-span-2">
                            <h2 className="text-2xl font-bold text-white mb-4">Vadivelu<span className="text-brand-500">Cars</span></h2>
                            <p className="mb-4 max-w-sm">Bosch authorized service center in Salem. Dedicated to comprehensive car care and customer satisfaction since 2012.</p>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><Link to="/" className="hover:text-brand-500 transition-colors">Home</Link></li>
                                <li><a href="/#about" className="hover:text-brand-500 transition-colors">About Us</a></li>
                                <li><a href="/#services" className="hover:text-brand-500 transition-colors">Services</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Contact</h3>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <span>Near HP Petrol Bunk, Opp. SM Nexa, Kondalampatti Bypass, Salem, TN 636010</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span>+91 8012526677</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 text-center text-sm">
                        <p>&copy; 2025 Vadivelu Cars. All Rights Reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
