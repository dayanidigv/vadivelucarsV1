import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { CameraPreset } from './types';

interface CameraControllerProps {
    targetPreset: CameraPreset | null;
    enableManualControl: boolean;
    onTransitionComplete?: () => void;
}

export function CameraController({
    targetPreset,
    enableManualControl,
    onTransitionComplete
}: CameraControllerProps) {
    const { camera } = useThree();
    const controlsRef = useRef<any>(null);
    const isTransitioning = useRef(false);
    const transitionProgress = useRef(0);

    const startPosition = useRef(new THREE.Vector3());
    const startTarget = useRef(new THREE.Vector3());
    const endPosition = useRef(new THREE.Vector3());
    const endTarget = useRef(new THREE.Vector3());

    useFrame((_state, delta) => {
        if (targetPreset && !isTransitioning.current) {
            // Start transition
            isTransitioning.current = true;
            transitionProgress.current = 0;

            startPosition.current.copy(camera.position);
            if (controlsRef.current) {
                startTarget.current.copy(controlsRef.current.target);
            }

            endPosition.current.set(...targetPreset.position);
            endTarget.current.set(...targetPreset.target);

            if (targetPreset.fov && 'fov' in camera) {
                (camera as THREE.PerspectiveCamera).fov = targetPreset.fov;
                (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
            }
        }

        if (isTransitioning.current) {
            transitionProgress.current += delta * 0.8; // Transition speed

            if (transitionProgress.current >= 1) {
                transitionProgress.current = 1;
                isTransitioning.current = false;
                if (onTransitionComplete) {
                    onTransitionComplete();
                }
            }

            // Smooth easing function (easeInOutCubic)
            const t = transitionProgress.current;
            const eased = t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;

            // Interpolate camera position
            camera.position.lerpVectors(
                startPosition.current,
                endPosition.current,
                eased
            );

            // Interpolate camera target
            if (controlsRef.current) {
                controlsRef.current.target.lerpVectors(
                    startTarget.current,
                    endTarget.current,
                    eased
                );
            }
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            enabled={enableManualControl}
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={10}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 6}
        />
    );
}
