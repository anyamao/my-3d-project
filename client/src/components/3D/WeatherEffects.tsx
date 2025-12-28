import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WeatherEffectsProps {
  type: "snow" | "rain" | "none";
  intensity: number;
  windStrength?: number;
}

const WeatherEffects: React.FC<WeatherEffectsProps> = ({
  type,
  intensity,
  windStrength = 0.1,
}) => {
  const particlesRef = useRef<THREE.Points>(null);
  const overlayRef = useRef<THREE.Mesh>(null);
  const particleCount = Math.floor(intensity * 2000);

  // Create particle geometry
  const particleGeometry = useMemo(() => {
    if (type === "none") return null;

    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 40;
      positions[i3 + 1] = Math.random() * 30 + 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 40;

      if (type === "snow") {
        velocities[i3] = (Math.random() - 0.5) * 0.1 + windStrength;
        velocities[i3 + 1] = -Math.random() * 0.5 - 0.2;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
      } else if (type === "rain") {
        velocities[i3] = (Math.random() - 0.5) * 0.1 + windStrength * 2;
        velocities[i3 + 1] = -Math.random() * 2 - 1.5;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));

    return geometry;
  }, [type, intensity, particleCount, windStrength]);

  // Create particle material
  const particleMaterial = useMemo(() => {
    if (type === "snow") {
      return new THREE.PointsMaterial({
        size: 0.1,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
      });
    } else if (type === "rain") {
      return new THREE.PointsMaterial({
        size: 0.05,
        color: 0x88ccff,
        transparent: true,
        opacity: 0.6,
      });
    }
    return null;
  }, [type]);

  const overlayOpacity = useMemo(() => {
    if (type === "snow") {
      return intensity * 0.15; // 0.15 max opacity at full intensity
    }
    return 0;
  }, [type, intensity]);

  useFrame(() => {
    if (particlesRef.current && type !== "none" && particleGeometry) {
      const positions = particlesRef.current.geometry.attributes.position
        .array as Float32Array;
      const velocities = particlesRef.current.geometry.attributes.velocity
        .array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];
        positions[i3 + 2] += velocities[i3 + 2];

        if (positions[i3 + 1] < -5) {
          positions[i3] = (Math.random() - 0.5) * 40;
          positions[i3 + 1] = Math.random() * 10 + 20;
          positions[i3 + 2] = (Math.random() - 0.5) * 40;
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (type === "none" || !particleGeometry || !particleMaterial) return null;

  return (
    <>
      {/* Snow particles */}
      {particleGeometry && particleMaterial && (
        <points
          ref={particlesRef}
          geometry={particleGeometry}
          material={particleMaterial}
        />
      )}

      {/* White overlay for snow effect */}
      {type === "snow" && overlayOpacity > 0 && (
        <mesh ref={overlayRef}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial
            color={0xffffff}
            transparent={true}
            opacity={overlayOpacity}
            depthWrite={false} // Important: don't write to depth buffer
          />
        </mesh>
      )}
    </>
  );
};

export default WeatherEffects;
