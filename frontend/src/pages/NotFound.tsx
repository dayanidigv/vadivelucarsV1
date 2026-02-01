import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-900">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2 mb-8">The page you're looking for doesn't exist.</p>
        <div className="space-x-4">
          <Link 
            to="/" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
          <Link 
            to="/dashboard" 
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
