// FogEffect.tsx
import React from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

interface FogEffectProps {
  enabled: boolean;
  color?: string;
  near?: number;
  far?: number;
}

const FogEffect: React.FC<FogEffectProps> = ({
  enabled,
  color = "#ffffff",
  near = 1,
  far = 30,
}) => {
  const { scene } = useThree();

  React.useEffect(() => {
    if (enabled) {
      scene.fog = new THREE.Fog(color, near, far);
    } else {
      scene.fog = null;
    }

    return () => {
      scene.fog = null;
    };
  }, [enabled, color, near, far, scene]);

  return null;
};

export default FogEffect;
