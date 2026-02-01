import { useRef, useEffect } from 'react';
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
    const hasCompletedTransition = useRef(false);

    const startPosition = useRef(new THREE.Vector3());
    const startTarget = useRef(new THREE.Vector3());
    const endPosition = useRef(new THREE.Vector3());
    const endTarget = useRef(new THREE.Vector3());

    // Reset transition when target changes
    useEffect(() => {
        if (targetPreset) {
            isTransitioning.current = true;
            transitionProgress.current = 0;
            hasCompletedTransition.current = false;

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
    }, [targetPreset, camera]);

    useFrame((_state, delta) => {
        // Early exit if not transitioning
        if (!isTransitioning.current) return;

        transitionProgress.current += delta * 1.2; // Smooth transition speed (faster = higher multiplier)

        if (transitionProgress.current >= 1) {
            transitionProgress.current = 1;
            isTransitioning.current = false;

            // Ensure exact final position
            camera.position.copy(endPosition.current);
            if (controlsRef.current) {
                controlsRef.current.target.copy(endTarget.current);
                controlsRef.current.update();
            }

            // Call completion callback only once
            if (!hasCompletedTransition.current && onTransitionComplete) {
                hasCompletedTransition.current = true;
                onTransitionComplete();
            }
            return;
        }

        // Advanced easing: easeOutCubic (smooth deceleration)
        const t = transitionProgress.current;
        const eased = 1 - Math.pow(1 - t, 3);

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
            controlsRef.current.update();
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            enabled={enableManualControl}
            enablePan={false}
            enableZoom={true}
            minDistance={4}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2.2}  // Don't go below ground
            minPolarAngle={Math.PI / 12}   // Don't go too high
            enableDamping={true}
            dampingFactor={0.08}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
            target={[0, 0.75, 0]}  // Always orbit around car center
        />
    );
}
