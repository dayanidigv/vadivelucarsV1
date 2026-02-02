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
                {/* Primary SEO Tags */}
                <title>Vadivelu Cars - Professional Automotive Service | வடிவேலு கார்ஸ்</title>
                <meta
                    name="description"
                    content="Expert automotive service in Tamil Nadu. Engine repair, oil service, electrical work, suspension, body work & more. Free pickup & drop. Call now!"
                />
                <meta name="keywords" content="car service, automotive repair, vadivelu cars, car maintenance, Tamil Nadu, vehicle service, engine repair, oil change, car wash, denting, painting" />
                <meta name="author" content="Vadivelu Cars" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://vadivelucars.in" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Vadivelu Cars - Professional Automotive Service | வடிவேலு கார்ஸ்" />
                <meta property="og:description" content="Expert automotive service in Tamil Nadu. Engine repair, oil service, electrical work, suspension, body work & more. Free pickup & drop." />
                <meta property="og:url" content="https://vadivelucars.in" />
                <meta property="og:image" content="https://vadivelucars.in/og-image.jpg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:site_name" content="Vadivelu Cars" />
                <meta property="og:locale" content="en_IN" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Vadivelu Cars - Professional Automotive Service" />
                <meta name="twitter:description" content="Expert automotive service in Tamil Nadu. Engine repair, oil service, electrical work, suspension, body work & more." />
                <meta name="twitter:image" content="https://vadivelucars.in/twitter-image.jpg" />
                <meta name="twitter:site" content="@vadivelucars" />
                <meta name="twitter:creator" content="@vadivelucars" />

                {/* Additional SEO */}
                <meta name="language" content="English" />
                <meta name="geo.region" content="IN-TN" />
                <meta name="geo.placename" content="Tamil Nadu" />
                <meta name="ICBM" content="Vadivelu Cars - Automotive Service" />
                <meta name="msapplication-TileColor" content="#2563eb" />
                <meta name="theme-color" content="#2563eb" />

                {/* Structured Data */}
                <script type="application/ld+json">
                    {`
                {
                    "@context": "https://schema.org",
                    "@type": "LocalBusiness",
                    "name": "Vadivelu Cars",
                    "description": "Professional automotive service center in Tamil Nadu",
                    "url": "https://vadivelucars.in",
                    "telephone": "+918903626677",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Near HP Petrol Bunk, Opp. SM Nexa, Kondalampatti Bypass",
                        "addressLocality": "Salem",
                        "addressRegion": "Tamil Nadu",
                        "postalCode": "636010",
                        "addressCountry": "IN"
                    },
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": "11.6374876",
                        "longitude": "78.1220925"
                    },
                    "openingHours": "Mo-Sa 09:00-19:00",
                    "priceRange": "$$",
                    "sameAs": [
                        "https://www.facebook.com/vadivelucars",
                        "https://www.instagram.com/vadivelucars"
                    ]
                }
                `}
                </script>
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
