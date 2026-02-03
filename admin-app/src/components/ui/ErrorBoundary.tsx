import React from 'react'
import { Button } from './button'

interface Props {
    children: React.ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log to monitoring service
        console.error('Error boundary caught:', error, errorInfo)

        // Don't log stack trace in production (info leak)
        if (import.meta.env.DEV) {
            console.error('Stack:', error.stack)
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
                    <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-100 max-w-md w-full">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-6">
                            The application encountered an unexpected error. This has been logged for our team to review.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Button onClick={() => window.location.reload()} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                Reload Page
                            </Button>
                            <Button variant="outline" onClick={() => window.location.href = '/'} className="w-full border-gray-200">
                                Go to Homepage
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
