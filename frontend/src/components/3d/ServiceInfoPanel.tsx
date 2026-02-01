import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MessageCircle } from 'lucide-react';
import type { ServiceCategory } from './types';
import { Button } from '@/components/ui/button';

interface ServiceInfoPanelProps {
    service: ServiceCategory | null;
    onClose: () => void;
}

export function ServiceInfoPanel({ service, onClose }: ServiceInfoPanelProps) {
    if (!service) return null;

    return (
        <AnimatePresence>
            {service && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 max-h-[80vh] overflow-y-auto"
                >
                    <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-6 py-4 border-b border-blue-500/20">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-white/70 hover:text-white" />
                            </button>

                            <div className="flex items-center gap-3">
                                <span className="text-4xl">{service.icon}</span>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{service.name}</h3>
                                    {service.nameTranslated && (
                                        <p className="text-sm text-blue-200/80">{service.nameTranslated}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-5 space-y-4">
                            <p className="text-white/80 leading-relaxed">
                                {service.description}
                            </p>

                            <div className="flex items-center justify-between py-3 px-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <span className="text-sm font-medium text-blue-200">Price Range</span>
                                <span className="text-lg font-bold text-white">{service.priceRange}</span>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex gap-3 pt-2">
                                <a
                                    href="https://wa.me/918903626677?text=Hi%2C%20I%20need%20car%20service"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1"
                                >
                                    <Button
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        WhatsApp
                                    </Button>
                                </a>

                                <a
                                    href="tel:+918903626677"
                                    className="flex-1"
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full border-blue-500/40 hover:bg-blue-500/10"
                                    >
                                        <Phone className="w-4 h-4" />
                                        Call Now
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
