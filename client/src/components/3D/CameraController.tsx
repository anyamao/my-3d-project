import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

const CameraController: React.FC = () => {
  const { camera } = useThree();

  useEffect(() => {
    // Position camera
    camera.position.set(0, 30, 0);

    // Look 90 degrees up (towards positive Y) and 90 degrees left
    const target = new THREE.Vector3(0, 0, 0); // Adjust these values
    camera.lookAt(target);

    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
};

export default CameraController;
