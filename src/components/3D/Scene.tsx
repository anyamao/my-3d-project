import React, { Suspense, useState, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import BlenderModel from "./BlenderModel";
import AnimationControls from "./AnimationControl";

const Scene: React.FC = () => {
  // State to track which button was last pressed
  const [lastPressedButton, setLastPressedButton] = useState<
    "none" | "button1" | "button2"
  >("none");
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);

  // Ref to control the animation
  const animationControllerRef = useRef<{
    playToFrame50: () => void;
    playFromFrame50ToEnd: () => void;
    getCurrentState: () => { isPlaying: boolean };
  } | null>(null);

  // Determine button states based on rules
  const canPlayToFrame50 =
    !isAnimationPlaying && lastPressedButton !== "button1";
  const canPlayFromFrame50ToEnd =
    !isAnimationPlaying && lastPressedButton === "button1";

  const handlePlayToFrame50 = useCallback(() => {
    if (!canPlayToFrame50) return;

    if (animationControllerRef.current) {
      animationControllerRef.current.playToFrame50();
      setLastPressedButton("button1");
      setIsAnimationComplete(false);
      setIsAnimationPlaying(true);
    }
  }, [canPlayToFrame50]);

  const handlePlayFromFrame50ToEnd = useCallback(() => {
    if (!canPlayFromFrame50ToEnd) return;

    if (animationControllerRef.current) {
      animationControllerRef.current.playFromFrame50ToEnd();
      setLastPressedButton("button2");
      setIsAnimationComplete(false);
      setIsAnimationPlaying(true);
    }
  }, [canPlayFromFrame50ToEnd]);

  const handleFrameUpdate = useCallback((frame: number) => {
    setCurrentFrame(frame);
  }, []);

  const handleAnimationComplete = useCallback(() => {
    if (lastPressedButton === "button2") {
      setIsAnimationComplete(true);
    }
    setIsAnimationPlaying(false);
  }, [lastPressedButton]);

  return (
    <div className="w-full h-screen bg-blue-200 relative">
      <Canvas
        camera={{
          position: [5, 20, 5],
          rotation: [-2, Math.PI, 0],
          fov: 50,
        }}
        shadows={true} // Disable shadows if not needed
      >
        <directionalLight
          position={[20, 30, 10]}
          intensity={5}
          color="#ffffffff"
          castShadow
          shadow-mapSize={[8192, 8192]}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          shadow-camera-far={200}
          shadow-bias={-0.001}
        />
        <directionalLight
          position={[10, 5, 0]}
          intensity={1}
          color="#ffffffff"
        />

        <ambientLight intensity={1.5} color="#ffffffff" />

        {/* Floor mesh for shadows */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -2, 0]}
          receiveShadow
        >
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#ffffffff" roughness={0.5} />
        </mesh>
        <Suspense fallback={null}>
          <BlenderModel
            ref={animationControllerRef}
            onFrameUpdate={handleFrameUpdate}
            onAnimationComplete={handleAnimationComplete}
            onAnimationStop={() => setIsAnimationPlaying(false)}
          />
          {/* Remove Environment if it adds light */}
          {/* <Environment preset="city" /> */}
        </Suspense>
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={20}
          minDistance={3}
        />
      </Canvas>

      <AnimationControls
        onPlayToFrame50={handlePlayToFrame50}
        onPlayFromFrame50ToEnd={handlePlayFromFrame50ToEnd}
        canPlayToFrame50={canPlayToFrame50}
        canPlayFromFrame50ToEnd={canPlayFromFrame50ToEnd}
        currentFrame={currentFrame}
        isAnimationComplete={isAnimationComplete}
        isAnimationPlaying={isAnimationPlaying}
      />
    </div>
  );
};

export default Scene;
