import { lazy, Suspense } from 'react';
import { VideoHero } from '@/components/landing/VideoHero'
import { ServiceGrid } from '@/components/landing/ServiceGrid'
import { CTASection } from '@/components/landing/CTASection'
import { Helmet } from 'react-helmet-async'

// Lazy load 3D component for performance
const Interactive3DShowcase = lazy(() => import('@/components/landing/Interactive3DShowcase').then(module => ({ default: module.Interactive3DShowcase })));

function ShowcaseSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="h-12 w-96 bg-slate-800 rounded-lg mx-auto mb-4 animate-pulse" />
                    <div className="h-6 w-64 bg-slate-800 rounded-lg mx-auto animate-pulse" />
                </div>
                <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
                    <div className="aspect-video lg:h-[600px] bg-slate-900/50 rounded-3xl border border-blue-500/20 animate-pulse" />
                    <div className="space-y-2">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-16 bg-slate-900/40 rounded-xl border border-slate-700/50 animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LandingPage() {
    return (
        <>
            <Helmet>
                <title>Vadivelu Cars - Professional Automotive Service | வடிவேலு கார்ஸ்</title>
                <meta
                    name="description"
                    content="Expert automotive service in Tamil Nadu. Engine repair, oil service, electrical work, suspension, body work & more. Free pickup & drop. Call now!"
                />
                <meta name="keywords" content="car service, automotive repair, vadivelu cars, car maintenance, Tamil Nadu" />
            </Helmet>

            <main className="bg-slate-950 min-h-screen">
                {/* Hero Section with Video Background */}
                <VideoHero />

                {/* Interactive 3D Service Showcase */}
                <Suspense fallback={<ShowcaseSkeleton />}>
                    <Interactive3DShowcase />
                </Suspense>

                {/* Services Grid */}
                <ServiceGrid />

                {/* Call to Action */}
                <CTASection />
            </main>
        </>
    )
}
