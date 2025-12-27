import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import BlenderModel from "./BlenderModel";

const Scene: React.FC = () => {
  return (
    <div className="w-full h-screen bg-blue-200">
      <Canvas
        camera={{
          position: [5, 20, 5], // Increased Y to move up
          rotation: [-2, Math.PI, 0], // 180 degrees around Y axis
          fov: 50,
        }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <Suspense fallback={null}>
          <BlenderModel />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={20}
          minDistance={3}
        />
      </Canvas>
    </div>
  );
};

export default Scene;
