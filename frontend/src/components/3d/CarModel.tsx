import { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface CarModelProps {
    modelPath: string;
}

export function CarModel({ modelPath }: CarModelProps) {
    const group = useRef<THREE.Group>(null);
    const { scene: loadedScene } = useGLTF(modelPath);

    useEffect(() => {
        if (!loadedScene || !group.current) return;

        const clonedScene = loadedScene.clone();

        // =====================================
        // STEP 1: CALCULATE PRECISE BOUNDING BOX
        // =====================================
        const box = new THREE.Box3().setFromObject(clonedScene);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();

        box.getSize(size);
        box.getCenter(center);

        console.log('🔧 RAW Model Analysis:');
        console.log('  Size:', size);
        console.log('  Center:', center);
        console.log('  Min:', box.min);
        console.log('  Max:', box.max);

        // =====================================
        // STEP 2: CALCULATE OPTIMAL SCALE
        // =====================================
        // Target: Car should be 4 units long (typical car length in 3D space)
        const TARGET_LENGTH = 4.0; // Standard 3D scene units
        const currentLongestAxis = Math.max(size.x, size.y, size.z);
        const optimalScale = TARGET_LENGTH / currentLongestAxis;

        console.log(`📏 Scale Calculation:`);
        console.log(`  Current longest axis: ${currentLongestAxis.toFixed(4)}`);
        console.log(`  Target length: ${TARGET_LENGTH}`);
        console.log(`  Optimal scale: ${optimalScale.toFixed(4)}`);

        // =====================================
        // STEP 3: CENTER THE MODEL AT ORIGIN
        // =====================================
        // Move model so its geometric center is at (0, 0, 0)
        clonedScene.position.set(-center.x, -center.y, -center.z);

        // Apply optimal scale
        clonedScene.scale.setScalar(optimalScale);

        // =====================================
        // STEP 4: POSITION CAR ON GROUND PLANE
        // =====================================
        // After centering, move car up so its bottom sits at y=0
        const scaledBox = new THREE.Box3().setFromObject(clonedScene);
        const scaledSize = new THREE.Vector3();
        scaledBox.getSize(scaledSize);

        // Lift car by half its height so bottom touches ground (y=0)
        const groundOffset = scaledSize.y / 2;
        clonedScene.position.y += groundOffset;

        console.log(`🎯 Final Positioning:`);
        console.log(`  Ground offset: ${groundOffset.toFixed(4)}`);
        console.log(`  Final position:`, clonedScene.position);
        console.log(`  Final scale:`, clonedScene.scale);

        // =====================================
        // STEP 5: FIX MATERIALS & SHADOWS
        // =====================================
        let meshCount = 0;
        clonedScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                meshCount++;

                // Enable shadows
                child.castShadow = true;
                child.receiveShadow = true;

                // Fix materials
                if (child.material) {
                    const materials = Array.isArray(child.material)
                        ? child.material
                        : [child.material];

                    materials.forEach((mat) => {
                        if (mat instanceof THREE.MeshStandardMaterial) {
                            // Ensure visibility
                            mat.side = THREE.DoubleSide;
                            mat.transparent = false;
                            mat.opacity = 1;

                            // Optimize for car paint look
                            mat.metalness = Math.min(mat.metalness || 0.4, 0.6);
                            mat.roughness = Math.max(mat.roughness || 0.3, 0.2);

                            // Ensure proper lighting response
                            mat.needsUpdate = true;
                        }
                    });
                }

                // Compute proper normals
                if (child.geometry) {
                    child.geometry.computeVertexNormals();
                }
            }
        });

        console.log(`✅ Processed ${meshCount} meshes`);

        // Add to scene
        group.current.add(clonedScene);

        // Cleanup
        return () => {
            if (group.current) {
                group.current.remove(clonedScene);
            }
        };
    }, [loadedScene]);

    // =====================================
    // FALLBACK: SIMPLE GEOMETRIC CAR
    // =====================================
    if (!loadedScene) {
        console.warn('⚠️ Using fallback geometry');
        return <SimpleCarFallback />;
    }

    // =====================================
    // RENDER: Wrapper group at origin
    // =====================================
    return (
        <group
            ref={group}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
        // NO SCALE HERE - scale is applied to cloned scene inside
        />
    );
}

// =====================================
// IMPROVED FALLBACK CAR
// =====================================
function SimpleCarFallback() {
    return (
        <group position={[0, 0.75, 0]}>
            {/* Car Body - Main */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[4, 1.2, 2]} />
                <meshStandardMaterial
                    color="#2563eb"
                    metalness={0.7}
                    roughness={0.2}
                />
            </mesh>

            {/* Car Cabin - Top */}
            <mesh position={[-0.3, 0.8, 0]} castShadow receiveShadow>
                <boxGeometry args={[2, 0.9, 1.8]} />
                <meshStandardMaterial
                    color="#1e40af"
                    metalness={0.7}
                    roughness={0.2}
                />
            </mesh>

            {/* Wheels - 4 corners */}
            {[
                [-1.3, -0.5, 1.1],  // Front Left
                [1.3, -0.5, 1.1],   // Front Right
                [-1.3, -0.5, -1.1], // Rear Left
                [1.3, -0.5, -1.1],  // Rear Right
            ].map((pos, idx) => (
                <group key={idx} position={pos as [number, number, number]}>
                    {/* Tire */}
                    <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.4, 0.4, 0.25, 32]} />
                        <meshStandardMaterial
                            color="#1a1a1a"
                            metalness={0.1}
                            roughness={0.9}
                        />
                    </mesh>
                    {/* Rim */}
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.25, 0.25, 0.27, 16]} />
                        <meshStandardMaterial
                            color="#888888"
                            metalness={0.9}
                            roughness={0.1}
                        />
                    </mesh>
                </group>
            ))}

            {/* Windshield */}
            <mesh position={[0.5, 0.8, 0]} castShadow>
                <boxGeometry args={[1.5, 0.7, 1.75]} />
                <meshStandardMaterial
                    color="#87ceeb"
                    transparent
                    opacity={0.3}
                    metalness={0.9}
                    roughness={0.05}
                />
            </mesh>

            {/* Headlights */}
            {[
                [2, 0.1, 0.8],
                [2, 0.1, -0.8],
            ].map((pos, idx) => (
                <mesh key={`light-${idx}`} position={pos as [number, number, number]}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshStandardMaterial
                        color="#ffffff"
                        emissive="#ffff88"
                        emissiveIntensity={3}
                    />
                </mesh>
            ))}

            {/* Tail Lights */}
            {[
                [-2, 0.1, 0.8],
                [-2, 0.1, -0.8],
            ].map((pos, idx) => (
                <mesh key={`tail-${idx}`} position={pos as [number, number, number]}>
                    <sphereGeometry args={[0.12, 16, 16]} />
                    <meshStandardMaterial
                        color="#ff0000"
                        emissive="#ff0000"
                        emissiveIntensity={2}
                    />
                </mesh>
            ))}
        </group>
    );
}

// Preload the model
useGLTF.preload('/models/car-model.glb');
