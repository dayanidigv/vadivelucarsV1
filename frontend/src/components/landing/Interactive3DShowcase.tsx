import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import { CarModel } from '@/components/3d/CarModel';
import { CameraController } from '@/components/3d/CameraController';
import { ServiceHotspots } from '@/components/3d/ServiceHotspots';
import { ServiceInfoPanel } from '@/components/3d/ServiceInfoPanel';
import { SERVICE_CATEGORIES, DEFAULT_CAMERA } from '@/components/3d/types';
import type { ServiceCategory } from '@/components/3d/types';

export function Interactive3DShowcase() {
    const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleServiceSelect = (serviceId: string) => {
        const service = SERVICE_CATEGORIES.find(s => s.id === serviceId);
        if (service) {
            setIsTransitioning(true);
            setSelectedService(service);
        }
    };

    const handleReset = () => {
        setSelectedService(null);
        setIsTransitioning(true);
    };

    const serviceZones = SERVICE_CATEGORIES.map(s => s.zone);

    return (
        <section className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">
                        Interactive Service Explorer
                    </h2>
                    <p className="text-lg sm:text-xl text-blue-200/80 max-w-2xl mx-auto">
                        Click on any service below to explore what we offer
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
                    {/* 3D Canvas */}
                    <motion.div
                        className="relative aspect-video lg:aspect-auto lg:h-[600px] bg-slate-900/50 rounded-3xl overflow-hidden border border-blue-500/20 shadow-2xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <Suspense fallback={<CanvasLoader />}>
                            <Canvas
                                camera={{ position: DEFAULT_CAMERA.position, fov: DEFAULT_CAMERA.fov || 55 }}
                                shadows
                            >
                                {/* Lighting */}
                                <ambientLight intensity={0.6} />
                                <directionalLight
                                    position={[10, 10, 5]}
                                    intensity={1.2}
                                    castShadow
                                    shadow-mapSize-width={2048}
                                    shadow-mapSize-height={2048}
                                />
                                <spotLight
                                    position={[0, 5, 0]}
                                    angle={0.3}
                                    penumbra={1}
                                    intensity={0.5}
                                    castShadow
                                />

                                {/* Environment (for reflections) */}
                                <Environment preset="night" />

                                {/* Car Model */}
                                <CarModel modelPath="/models/car-model.glb" />

                                {/* Service Hotspots */}
                                <ServiceHotspots
                                    zones={serviceZones}
                                    selectedZone={selectedService?.id || null}
                                    onZoneClick={handleServiceSelect}
                                    onZoneHover={setHoveredZone}
                                />

                                {/* Shadow Plane */}
                                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                                    <planeGeometry args={[20, 20]} />
                                    <shadowMaterial opacity={0.3} />
                                </mesh>

                                {/* Camera Controller */}
                                <CameraController
                                    targetPreset={selectedService?.zone.camera || null}
                                    enableManualControl={!isTransitioning}
                                    onTransitionComplete={() => setIsTransitioning(false)}
                                />
                            </Canvas>
                        </Suspense>

                        {/* Reset Button */}
                        {selectedService && (
                            <button
                                onClick={handleReset}
                                className="absolute top-4 right-4 px-4 py-2 bg-slate-900/80 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium hover:bg-slate-800/80 transition-colors"
                            >
                                Reset View
                            </button>
                        )}
                    </motion.div>

                    {/* Service Selector */}
                    <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Select a Service</h3>
                        <div className="space-y-2">
                            {SERVICE_CATEGORIES.map((service) => (
                                <button
                                    key={service.id}
                                    onClick={() => handleServiceSelect(service.id)}
                                    className={`
                    w-full text-left px-5 py-4 rounded-xl transition-all duration-300
                    border backdrop-blur-sm
                    ${selectedService?.id === service.id
                                            ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-blue-500/50 shadow-lg shadow-blue-500/20'
                                            : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-blue-500/30'
                                        }
                  `}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{service.icon}</span>
                                        <div className="flex-1">
                                            <div className="font-semibold text-white">{service.name}</div>
                                            <div className="text-xs text-blue-200/60">{service.priceRange}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Service Info Panel (appears at bottom on selection) */}
            <ServiceInfoPanel
                service={selectedService}
                onClose={() => setSelectedService(null)}
            />
        </section>
    );
}

function CanvasLoader() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-900/50">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                <p className="text-blue-200/60 font-medium">Loading 3D Model...</p>
            </div>
        </div>
    );
}
