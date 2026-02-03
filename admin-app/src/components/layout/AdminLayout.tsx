import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { Home, FileText, Users, Package, BarChart3, Menu, X, Settings, LogOut, UserIcon, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'manager', 'staff', 'technician'] },
    { name: 'Invoices', href: '/invoices', icon: FileText, roles: ['admin', 'manager', 'staff', 'technician'] },
    { name: 'Customers', href: '/customers', icon: Users, roles: ['admin', 'manager', 'staff', 'technician'] },
    { name: 'Parts', href: '/parts', icon: Package, roles: ['admin', 'manager', 'staff', 'technician'] },
    { name: 'Users', href: '/users', icon: UserIcon, roles: ['admin', 'manager'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['super-admin'] },
]

export function AdminLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const { user, logout } = useAuth()
    const userMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [location.pathname])

    const filteredNavigation = navigation.filter(item => item.roles.includes(user?.role || ''))

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo Section */}
                        <div className="flex items-center space-x-3">
                            <div>
                                <h1 className="text-2xl font-bold text-[#065DE5]" style={{
                                    fontFamily: "'Revue Std Bold', serif"
                                }}>
                                    Vadivelu Cars
                                </h1>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-1">
                            {filteredNavigation.map((item) => {
                                const Icon = item.icon
                                const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                            ? 'bg-[#065DE5] text-white shadow-md'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Right Section */}
                        <div className="flex items-center gap-2">

                            {/* User Menu */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-9 h-9 bg-[#065DE5] rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                        {getInitials(user?.name || user?.username || 'User')}
                                    </div>
                                    <div className="hidden md:flex flex-col items-start">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {user?.name || user?.username}
                                        </span>
                                        <span className="text-xs text-gray-500 capitalize">
                                            {user?.role}
                                        </span>
                                    </div>
                                    <ChevronDown className={`hidden md:block h-4 w-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* User Dropdown */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {user?.name || user?.username}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {user?.email}
                                            </p>
                                            <span className="inline-flex items-center px-2 py-1 mt-2 rounded-md text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                                                {user?.role}
                                            </span>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                await logout()
                                                setIsUserMenuOpen(false)
                                                navigate('/login')
                                            }}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6 text-gray-600" />
                                ) : (
                                    <Menu className="h-6 w-6 text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-200 bg-white">
                        <nav className="px-4 py-4 space-y-1">
                            {filteredNavigation.map((item) => {
                                const Icon = item.icon
                                const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                            ? 'bg-[#065DE5] text-white shadow-md'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                        <p className="text-sm text-gray-600">
                            © 2026 Vadivelu Cars. All rights reserved.
                        </p>
                        <p className="text-xs text-gray-500">
                            Version 2.0.0
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}