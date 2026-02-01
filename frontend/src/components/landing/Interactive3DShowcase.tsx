import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import { CarModel } from '@/components/3d/CarModel';
import { CameraController } from '@/components/3d/CameraController';
import { ServiceHotspots } from '@/components/3d/ServiceHotspots';
import { ServiceInfoPanel } from '@/components/3d/ServiceInfoPanel';
import { ModelDiagnostics } from '@/components/3d/ModelDiagnostics';
import { SERVICE_CATEGORIES, DEFAULT_CAMERA } from '@/components/3d/types';
import type { ServiceCategory } from '@/components/3d/types';

// Device quality detection hook
function useDeviceQuality() {
    const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth < 1024 && window.innerWidth >= 768;
        const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;

        if (isMobile && isLowEnd) {
            setQuality('low');
        } else if (isMobile || isTablet || isLowEnd) {
            setQuality('medium');
        } else {
            setQuality('high');
        }

        console.log(`🎮 Device Quality: ${quality} (Mobile: ${isMobile}, Cores: ${navigator.hardwareConcurrency})`);
    }, []);

    return quality;
}

export function Interactive3DShowcase() {
    const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [contextLost, setContextLost] = useState(false);

    const quality = useDeviceQuality();

    // Handle WebGL context loss/restore
    useEffect(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        const handleContextLost = (event: Event) => {
            event.preventDefault();
            console.warn('⚠️ WebGL context lost');
            setContextLost(true);
            setModelLoaded(false);
        };

        const handleContextRestored = () => {
            console.log('✅ WebGL context restored');
            setContextLost(false);
        };

        canvas.addEventListener('webglcontextlost', handleContextLost);
        canvas.addEventListener('webglcontextrestored', handleContextRestored);

        return () => {
            canvas.removeEventListener('webglcontextlost', handleContextLost);
            canvas.removeEventListener('webglcontextrestored', handleContextRestored);
        };
    }, []);

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

    // Canvas performance settings based on device (reduced to prevent context loss)
    const canvasSettings = {
        low: { dpr: [1, 1], shadows: false, antialias: false },
        medium: { dpr: [1, 1], shadows: false, antialias: true },
        high: { dpr: [1, 1.5], shadows: true, antialias: true }
    }[quality] as { dpr: [number, number], shadows: boolean, antialias: boolean };

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
                        {/* Loading/Error Overlay */}
                        {(!modelLoaded || contextLost) && (
                            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm">
                                {contextLost ? (
                                    <>
                                        <div className="text-6xl mb-4">⚠️</div>
                                        <p className="text-yellow-400/90 font-semibold text-lg mb-2">WebGL Context Lost</p>
                                        <p className="text-blue-300/60 text-sm mb-4 text-center max-w-md px-4">
                                            Close some browser tabs and refresh the page
                                        </p>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Refresh Page
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                                        <p className="text-blue-200/80 font-semibold text-lg mb-1">Loading 3D Model...</p>
                                        <p className="text-blue-300/60 text-sm">This may take a moment</p>
                                    </>
                                )}
                            </div>
                        )}

                        <Suspense fallback={<CanvasLoader />}>
                            <Canvas
                                camera={{
                                    position: DEFAULT_CAMERA.position,
                                    fov: DEFAULT_CAMERA.fov || 50,
                                    near: 0.1,
                                    far: 1000
                                }}
                                shadows={canvasSettings.shadows}
                                dpr={canvasSettings.dpr}
                                gl={{
                                    antialias: canvasSettings.antialias,
                                    alpha: true,
                                    powerPreference: quality === 'low' ? 'low-power' : 'high-performance',
                                    preserveDrawingBuffer: true
                                }}
                                onCreated={({ gl, camera }) => {
                                    gl.setClearColor('#0f172a', 0);
                                    camera.lookAt(0, 0.75, 0);
                                    setTimeout(() => setModelLoaded(true), 1000);
                                }}
                            >
                                {/* ========================================= */}
                                {/* IMPROVED LIGHTING SETUP */}
                                {/* ========================================= */}

                                {/* Key Light - Main illumination from front-right */}
                                <directionalLight
                                    position={[5, 8, 5]}
                                    intensity={2.5}
                                    castShadow={canvasSettings.shadows}
                                    shadow-mapSize-width={2048}
                                    shadow-mapSize-height={2048}
                                    shadow-camera-left={-10}
                                    shadow-camera-right={10}
                                    shadow-camera-top={10}
                                    shadow-camera-bottom={-10}
                                    shadow-camera-near={0.1}
                                    shadow-camera-far={50}
                                    shadow-bias={-0.0001}
                                />

                                {/* Fill Light - Soften shadows from left */}
                                <directionalLight
                                    position={[-5, 5, 3]}
                                    intensity={1.2}
                                    color="#b0d4ff"
                                />

                                {/* Back Light - Rim lighting effect */}
                                <directionalLight
                                    position={[0, 3, -5]}
                                    intensity={0.8}
                                    color="#ffd4a3"
                                />

                                {/* Ambient - Base illumination */}
                                <ambientLight intensity={0.4} color="#ffffff" />

                                {/* Hemisphere - Sky/ground ambient */}
                                <hemisphereLight args={['#87ceeb', '#444444', 0.5]} />

                                {/* Spot - Dramatic accent from above */}
                                <spotLight
                                    position={[0, 10, 0]}
                                    angle={0.4}
                                    penumbra={1}
                                    intensity={1.5}
                                    castShadow={canvasSettings.shadows}
                                    shadow-mapSize-width={1024}
                                    shadow-mapSize-height={1024}
                                />

                                {/* Environment (for reflections) */}
                                <Environment preset="city" environmentIntensity={0.6} />

                                {/* Model Diagnostics - logs detailed model info to console */}
                                <ModelDiagnostics modelPath="/models/car-model.glb" />

                                {/* Car Model */}
                                <CarModel modelPath="/models/car-model.glb" />

                                {/* Service Hotspots */}
                                <ServiceHotspots
                                    zones={serviceZones}
                                    selectedZone={selectedService?.id || null}
                                    onZoneClick={handleServiceSelect}
                                    onZoneHover={setHoveredZone}
                                />

                                {/* ========================================= */}
                                {/* GROUND PLANE WITH BETTER SHADOW */}
                                {/* ========================================= */}
                                {canvasSettings.shadows && (
                                    <>
                                        {/* Invisible shadow receiver */}
                                        <mesh
                                            rotation={[-Math.PI / 2, 0, 0]}
                                            position={[0, 0, 0]}
                                            receiveShadow
                                        >
                                            <planeGeometry args={[50, 50]} />
                                            <shadowMaterial opacity={0.4} />
                                        </mesh>

                                        {/* Subtle grid for reference */}
                                        <gridHelper
                                            args={[20, 20, '#ffffff', '#ffffff']}
                                            position={[0, 0.01, 0]}
                                            material-opacity={0.05}
                                            material-transparent={true}
                                        />
                                    </>
                                )}

                                {/* Camera Controller */}
                                <CameraController
                                    targetPreset={selectedService?.zone.camera || null}
                                    enableManualControl={!isTransitioning}
                                    onTransitionComplete={() => setIsTransitioning(false)}
                                />
                            </Canvas>
                        </Suspense>

                        {/* User Guidance Tooltip */}
                        {modelLoaded && !selectedService && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="absolute bottom-4 left-4 z-40 pointer-events-none"
                            >
                                <div className="bg-slate-900/95 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-500/30 shadow-xl">
                                    <p className="text-white text-sm flex items-center gap-2">
                                        <span className="text-blue-400">💡</span>
                                        <span>Click and drag to rotate • Scroll to zoom</span>
                                    </p>
                                </div>
                            </motion.div>
                        )}

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
