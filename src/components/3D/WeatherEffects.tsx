// WeatherEffects.tsx
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WeatherEffectsProps {
  type: "snow" | "rain" | "none";
  intensity: number; // 0 to 1
  windStrength?: number;
}

const WeatherEffects: React.FC<WeatherEffectsProps> = ({
  type,
  intensity,
  windStrength = 0.1,
}) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = Math.floor(intensity * 5000); // Adjust based on intensity

  // Create particle geometry
  const particleGeometry = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Random starting positions
      positions[i3] = (Math.random() - 0.5) * 50;
      positions[i3 + 1] = Math.random() * 30 + 10; // Start above
      positions[i3 + 2] = (Math.random() - 0.5) * 50;

      // Random velocities
      if (type === "snow") {
        velocities[i3] = (Math.random() - 0.5) * 0.1 + windStrength; // Gentle drift
        velocities[i3 + 1] = -Math.random() * 0.5 - 0.2; // Slow fall
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
      } else if (type === "rain") {
        velocities[i3] = (Math.random() - 0.5) * 0.1 + windStrength * 2;
        velocities[i3 + 1] = -Math.random() * 2 - 1.5; // Fast fall
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
    return new THREE.PointsMaterial();
  }, [type]);

  useFrame(() => {
    if (particlesRef.current && type !== "none") {
      const positions = particlesRef.current.geometry.attributes.position
        .array as Float32Array;
      const velocities = particlesRef.current.geometry.attributes.velocity
        .array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Update position based on velocity
        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];
        positions[i3 + 2] += velocities[i3 + 2];

        // Reset particles that fall below ground
        if (positions[i3 + 1] < -5) {
          positions[i3] = (Math.random() - 0.5) * 50;
          positions[i3 + 1] = Math.random() * 10 + 20;
          positions[i3 + 2] = (Math.random() - 0.5) * 50;
        }

        // Add some randomness to movement
        velocities[i3] += (Math.random() - 0.5) * 0.01;
        velocities[i3 + 2] += (Math.random() - 0.5) * 0.01;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (type === "none") return null;

  return (
    <points
      ref={particlesRef}
      geometry={particleGeometry}
      material={particleMaterial}
    />
  );
};

export default WeatherEffects;
