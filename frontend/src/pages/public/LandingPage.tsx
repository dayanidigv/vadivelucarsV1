import { VideoHero } from '@/components/landing/VideoHero'
import { ServiceGrid } from '@/components/landing/ServiceGrid'
import { CTASection } from '@/components/landing/CTASection'
import { Helmet } from 'react-helmet-async'
import { AboutSection } from '@/components/landing/Aboutsection';
import { MapSection } from '@/components/landing/MapSection';

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

                <AboutSection />

                {/* Services Grid */}
                <ServiceGrid />

                {/* Call to Action */}
                <CTASection />

                {/* Map Section */}
                <MapSection />

            </main>
        </>
    )
}
