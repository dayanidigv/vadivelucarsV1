import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { ServiceZone } from './types';

interface ServiceHotspotsProps {
    zones: ServiceZone[];
    selectedZone: string | null;
    onZoneClick: (zoneId: string) => void;
    onZoneHover: (zoneId: string | null) => void;
}

export function ServiceHotspots({
    zones,
    selectedZone,
    onZoneClick,
    onZoneHover
}: ServiceHotspotsProps) {
    return (
        <>
            {zones.map((zone) => (
                <Hotspot
                    key={zone.id}
                    zone={zone}
                    isSelected={selectedZone === zone.id}
                    onClick={() => onZoneClick(zone.id)}
                    onPointerEnter={() => onZoneHover(zone.id)}
                    onPointerLeave={() => onZoneHover(null)}
                />
            ))}
        </>
    );
}

interface HotspotProps {
    zone: ServiceZone;
    isSelected: boolean;
    onClick: () => void;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
}

function Hotspot({ zone, isSelected, onClick, onPointerEnter, onPointerLeave }: HotspotProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const pulseRef = useRef(0);
    const [isHovered, setIsHovered] = useState(false);
    const [clickScale, setClickScale] = useState(1);

    useFrame((state) => {
        if (meshRef.current) {
            // Continuous pulse animation
            pulseRef.current += 0.05;
            const scale = (1 + Math.sin(pulseRef.current) * 0.15) * clickScale;
            meshRef.current.scale.set(scale, scale, scale);

            // Float up and down slightly
            const baseY = zone.position[1];
            meshRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        }
    });

    return (
        <group position={zone.position}>
            {/* Glowing sphere hotspot */}
            <mesh
                ref={meshRef}
                onClick={() => {
                    setClickScale(1.4);
                    setTimeout(() => setClickScale(1), 200);
                    onClick();
                }}
                onPointerEnter={(e) => {
                    e.stopPropagation();
                    setIsHovered(true);
                    onPointerEnter();
                }}
                onPointerLeave={(e) => {
                    e.stopPropagation();
                    setIsHovered(false);
                    onPointerLeave();
                }}
                onPointerOver={() => (document.body.style.cursor = 'pointer')}
                onPointerOut={() => (document.body.style.cursor = 'default')}
            >
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshBasicMaterial
                    color={isSelected ? "#10b981" : "#3b82f6"}
                    transparent
                    opacity={isSelected ? 0.9 : 0.7}
                />
            </mesh>

            {/* Outer glow ring */}
            <mesh position={[0, 0, 0.01]}>
                <ringGeometry args={[0.15, 0.25, 16]} />
                <meshBasicMaterial
                    color={isSelected ? "#10b981" : "#3b82f6"}
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Tooltip on hover */}
            <Html
                position={[0, 0.3, 0]}
                center
                style={{
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s ease-in-out',
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? 'translateY(0)' : 'translateY(-5px)',
                }}
                className="hotspot-tooltip"
            >
                <div className="bg-slate-900/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-500/30 shadow-xl">
                    <div className="text-white text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                        <span>{zone.icon}</span>
                        <span>{zone.label}</span>
                    </div>
                </div>
            </Html>
        </group>
    );
}
