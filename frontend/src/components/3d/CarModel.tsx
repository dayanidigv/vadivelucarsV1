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

        // Calculate bounding box to understand model size
        const box = new THREE.Box3().setFromObject(clonedScene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        console.log('📏 Model Dimensions:', {
            width: size.x.toFixed(2),
            height: size.y.toFixed(2),
            depth: size.z.toFixed(2),
            center: `(${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)})`
        });

        // Center the model
        clonedScene.position.x -= center.x;
        clonedScene.position.y -= center.y;
        clonedScene.position.z -= center.z;

        // Fix materials and enable shadows
        let meshCount = 0;
        clonedScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                meshCount++;

                // Enable shadows
                child.castShadow = true;
                child.receiveShadow = true;

                console.log(`🎨 Mesh #${meshCount}:`, child.name || 'unnamed', 'Material type:', child.material?.type);

                // Fix material issues
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat) => fixMaterial(mat, child.name));
                    } else {
                        fixMaterial(child.material, child.name);
                    }
                }

                // Ensure geometry has proper normals
                if (child.geometry) {
                    child.geometry.computeVertexNormals();
                }
            }
        });

        console.log(`✅ Processed ${meshCount} meshes`);

        // Add to scene
        group.current.add(clonedScene);

        return () => {
            if (group.current) {
                group.current.remove(clonedScene);
            }
        };
    }, [loadedScene]);

    // Helper function to fix material properties
    const fixMaterial = (material: THREE.Material, meshName: string) => {
        if (material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshPhysicalMaterial) {

            // Ensure materials are visible
            material.side = THREE.DoubleSide; // Render both sides
            material.transparent = false;
            material.opacity = 1;

            // Improve visibility
            material.metalness = Math.min(material.metalness || 0.3, 0.5);
            material.roughness = Math.max(material.roughness || 0.5, 0.4);

            // Ensure proper lighting response
            material.needsUpdate = true;

            console.log(`  ✓ Material fixed for "${meshName}":`, {
                type: material.type,
                metalness: material.metalness.toFixed(2),
                roughness: material.roughness.toFixed(2),
                color: material.color?.getHexString()
            });
        }
    };

    // Fallback if model fails to load
    if (!loadedScene) {
        console.warn('Using fallback geometry');
        return (
            <group ref={group} position={[0, 0, 0]}>
                {/* Simple fallback car */}
                <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                    <boxGeometry args={[2, 1, 4]} />
                    <meshStandardMaterial
                        color="#3b82f6"
                        metalness={0.6}
                        roughness={0.4}
                        emissive="#1e40af"
                        emissiveIntensity={0.2}
                    />
                </mesh>
            </group>
        );
    }

    return (
        <group
            ref={group}
            scale={[18, 18, 18]}
            position={[0, -0.5, 0]}
            rotation={[0, 0, 0]}
        />
    );
}

// Preload the model
useGLTF.preload('/models/car-model.glb');
