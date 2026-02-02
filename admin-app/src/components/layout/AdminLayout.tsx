import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { Home, FileText, Users, Package, BarChart3, Menu, X, Settings, LogOut, UserIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'manager', 'staff', 'technician'] },
    { name: 'Invoices', href: '/invoices', icon: FileText, roles: ['admin', 'manager', 'staff', 'technician'] },
    { name: 'Customers', href: '/customers', icon: Users, roles: ['admin', 'manager', 'staff', 'technician'] },
    { name: 'Parts', href: '/parts', icon: Package, roles: ['admin', 'manager', 'staff', 'technician'] },
    { name: 'Users', href: '/users', icon: UserIcon, roles: ['admin', 'manager'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'manager'] },
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center justify-center">

                            <h1 className="ml-2 text-xl font-bold text-gray-900" style={{
                                fontFamily: "'Revue Std Bold', serif"
                            }}>
                                Vadivelu Cars
                            </h1>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex space-x-1">
                            {navigation
                                .filter(item => item.roles.includes(user?.role || ''))
                                .map((item) => {
                                    const Icon = item.icon
                                    const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon className="mr-2 h-4 w-4" />
                                            {item.name}
                                        </Link>
                                    )
                                })}
                        </nav>

                        {/* User Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center space-x-3 text-sm rounded-md p-2 hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <UserIcon className="w-4 h-4 text-primary" />
                                </div>
                                <div className="hidden md:block text-left">
                                    <div className="font-medium text-gray-900">{user?.name || user?.username}</div>
                                    <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                                </div>
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <div className="text-sm font-medium text-gray-900">{user?.name || user?.username}</div>
                                        <div className="text-xs text-gray-500">{user?.email}</div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            await logout()
                                            setIsUserMenuOpen(false)
                                            navigate('/login')
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav Panel */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigation
                                .filter(item => item.roles.includes(user?.role || ''))
                                .map((item) => {
                                    const Icon = item.icon
                                    const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon className="mr-2 h-4 w-4" />
                                            {item.name}
                                        </Link>
                                    )
                                })}
                        </div>
                    </div>
                )}
            </header>
            <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    )
}
