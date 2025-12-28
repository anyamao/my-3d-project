import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

const CameraDebugger: React.FC = () => {
  const { camera } = useThree();

  useEffect(() => {
    const logCamera = () => {
      const rotationDegrees = {
        x: camera.rotation.x * (180 / Math.PI),
        y: camera.rotation.y * (180 / Math.PI),
        z: camera.rotation.z * (180 / Math.PI),
      };
      console.log("Camera Position:", camera.position);
      console.log("Camera Rotation (degrees):", rotationDegrees);
    };

    // Log on mount
    logCamera();

    // Add keypress to log camera info
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "c" || e.key === "C") {
        logCamera();
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [camera]);

  return null;
};

export default CameraDebugger;
