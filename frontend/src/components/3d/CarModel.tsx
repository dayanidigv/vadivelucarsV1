import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface CarModelProps {
    modelPath: string;
}

export function CarModel({ modelPath }: CarModelProps) {
    const group = useRef<THREE.Group>(null);

    // Load the 3D model
    const { scene } = useGLTF(modelPath);

    // Clone the scene to avoid sharing issues
    const clonedScene = scene.clone();

    return (
        <primitive
            ref={group}
            object={clonedScene}
            scale={[1.5, 1.5, 1.5]}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
        />
    );
}

// Preload the model for better performance
useGLTF.preload('/models/car-model.glb');
