import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function ModelDiagnostics({ modelPath }: { modelPath: string }) {
    const { scene } = useGLTF(modelPath);

    useEffect(() => {
        console.log('=== 🔍 MODEL DIAGNOSTICS ===');

        // 1. Check if model loaded
        console.log('Model loaded:', !!scene);
        console.log('Scene type:', scene?.type);
        console.log('Children count:', scene?.children.length);

        if (!scene) {
            console.error('❌ Model failed to load!');
            return;
        }

        // 2. Calculate and log bounding box
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        console.log('📦 Bounding Box:');
        console.log('  Size:', `${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);
        console.log('  Center:', `(${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)})`);

        if (size.length() < 0.01) {
            console.warn('⚠️ Model is very small! Consider scaling up.');
        }
        if (size.length() > 100) {
            console.warn('⚠️ Model is very large! Consider scaling down.');
        }

        // 3. Traverse and analyze all meshes
        let meshCount = 0;
        let materialCount = 0;
        let vertexCount = 0;

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                meshCount++;
                console.log(`\n🎨 Mesh #${meshCount}: "${child.name || 'unnamed'}"`);

                // Check geometry
                if (child.geometry) {
                    const positions = child.geometry.attributes.position;
                    vertexCount += positions ? positions.count : 0;
                    console.log('  Vertices:', positions?.count || 0);
                    console.log('  Has normals:', !!child.geometry.attributes.normal);
                    console.log('  Has UVs:', !!child.geometry.attributes.uv);
                } else {
                    console.warn('  ❌ No geometry!');
                }

                // Check materials
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((mat, idx) => {
                    materialCount++;
                    console.log(`  Material ${idx + 1}:`, {
                        type: mat.type,
                        color: mat instanceof THREE.MeshStandardMaterial ? mat.color.getHexString() : 'N/A',
                        opacity: mat.opacity,
                        transparent: mat.transparent,
                        visible: mat.visible,
                        side: mat.side === THREE.FrontSide ? 'Front' : mat.side === THREE.BackSide ? 'Back' : 'Double'
                    });

                    // Check for common issues
                    if (mat.opacity === 0) {
                        console.error('  ❌ Material opacity is 0 - model is invisible!');
                    }
                    if (!mat.visible) {
                        console.error('  ❌ Material is not visible!');
                    }
                    if (mat.side === THREE.BackSide) {
                        console.warn('  ⚠️ Material only renders back faces');
                    }
                });
            }
        });

        console.log('\n📊 Summary:');
        console.log('  Total meshes:', meshCount);
        console.log('  Total materials:', materialCount);
        console.log('  Total vertices:', vertexCount.toLocaleString());

        if (meshCount === 0) {
            console.error('❌ NO MESHES FOUND! Model has no visible geometry.');
        }

        // 4. Check for animations
        const animations = (scene as any).animations || [];
        console.log('  Animations:', animations.length);

        console.log('=== END DIAGNOSTICS ===\n');

    }, [scene]);

    return null; // This component only logs diagnostics
}
