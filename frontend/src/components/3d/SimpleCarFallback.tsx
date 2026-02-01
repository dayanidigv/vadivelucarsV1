import { useRef } from 'react';
import * as THREE from 'three';

export function SimpleCarFallback() {
    const groupRef = useRef<THREE.Group>(null);

    return (
        <group ref={groupRef} position={[0, 0.5, 0]}>
            {/* Car body */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[4, 1.5, 2]} />
                <meshStandardMaterial color="#3b82f6" metalness={0.6} roughness={0.4} />
            </mesh>

            {/* Car top/cabin */}
            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.5, 1, 1.8]} />
                <meshStandardMaterial color="#2563eb" metalness={0.6} roughness={0.4} />
            </mesh>

            {/* Wheels */}
            {[
                [-1.5, -0.5, 1],
                [1.5, -0.5, 1],
                [-1.5, -0.5, -1],
                [1.5, -0.5, -1],
            ].map((pos, idx) => (
                <mesh key={idx} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
                </mesh>
            ))}

            {/* Windows (transparent) */}
            <mesh position={[0.5, 1.3, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.5, 0.6, 1.7]} />
                <meshStandardMaterial
                    color="#87ceeb"
                    transparent
                    opacity={0.3}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Headlights */}
            {[
                [2, 0.3, 0.7],
                [2, 0.3, -0.7],
            ].map((pos, idx) => (
                <mesh key={`light-${idx}`} position={pos as [number, number, number]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial
                        color="#ffffff"
                        emissive="#ffff00"
                        emissiveIntensity={2}
                    />
                </mesh>
            ))}
        </group>
    );
}
