import React, { useState, useRef, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import BlenderModel, { AnimationController } from "./BlenderModel";
import AnimationControls from "./AnimationControl";
import WeatherEffects from "./WeatherEffects";

const Scene: React.FC = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [weatherType, setWeatherType] = useState<"none" | "snow" | "rain">(
    "none"
  );
  const [isNightMode, setIsNightMode] = useState(false);
  const [ambientLightIntensity, setAmbientLightIntensity] = useState(2);
  const [directionalLightIntensity, setDirectionalLightIntensity] = useState(5);
  const [weatherIntensity, setWeatherIntensity] = useState(0.5);
  const handleToggleNightMode = useCallback(() => {
    setIsNightMode((prev) => !prev);

    if (isNightMode) {
      setAmbientLightIntensity(2);
      setDirectionalLightIntensity(5);
    } else {
      setAmbientLightIntensity(0.5);
      setDirectionalLightIntensity(0.5);
    }
  }, [isNightMode]);

  const orbitControlsRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (orbitControlsRef.current) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleResetCamera = useCallback(() => {
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      const camera = controls.object;
      const wasEnabled = controls.enabled;

      controls.enabled = false;

      camera.position.set(-3, 7, -5.7);
      controls.target.set(-0.5, 7, 0);

      controls.update();

      setTimeout(() => {
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = wasEnabled;
        }
      }, 100);
    } else {
    }
  }, []);

  const handleWeatherChange = useCallback(
    (type: "none" | "snow" | "rain", intensity: number) => {
      setWeatherType(type);
      setWeatherIntensity(intensity);
    },
    []
  );

  const animationControllerRef = useRef<AnimationController | null>(null);

  const canPlayToFrame50 = !isAnimationPlaying;
  const canPlayFromFrame50ToEnd = !isAnimationPlaying;

  const handlePlayToFrame50 = useCallback(() => {
    if (!canPlayToFrame50) return;

    if (animationControllerRef.current) {
      animationControllerRef.current.playToFrame50();
      setIsAnimationComplete(false);
      setIsAnimationPlaying(true);
    }
  }, [canPlayToFrame50]);

  const handlePlayFromFrame50ToEnd = useCallback(() => {
    if (!canPlayFromFrame50ToEnd) return;

    if (animationControllerRef.current) {
      animationControllerRef.current.playFromFrame50ToEnd();

      setIsAnimationComplete(false);
      setIsAnimationPlaying(true);
    }
  }, [canPlayFromFrame50ToEnd]);

  const handleFrameUpdate = useCallback((frame: number) => {
    setCurrentFrame(frame);
  }, []);

  return (
    <div
      className={`w-full h-screen ${
        isNightMode ? "bg-[#0b0c0c]" : "bg-blue-200"
      } relative`}
    >
      <Canvas
        camera={{
          position: [-3, 7, -5.7],
          fov: 50,
        }}
        shadows={true}
      >
        <WeatherEffects
          type={weatherType}
          intensity={weatherIntensity}
          windStrength={0.2}
        />

        <directionalLight
          position={[20, 30, 10]}
          intensity={directionalLightIntensity}
          color="#ffe7a7ff"
        />
        {isNightMode && <fog attach="fog" args={["#000022", 10, 50]} />}

        <ambientLight intensity={ambientLightIntensity} color="#ffffff" />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[30, -2, 0]}
          receiveShadow
        >
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>

        <BlenderModel
          ref={animationControllerRef}
          onFrameUpdate={handleFrameUpdate}
          onAnimationStop={() => setIsAnimationPlaying(false)}
        />

        <OrbitControls
          ref={orbitControlsRef}
          target={[-0.5, 7, 0]}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={200}
          minDistance={0}
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
        onWeatherChange={handleWeatherChange}
        onResetCamera={handleResetCamera}
        isNightMode={isNightMode}
        onToggleNightMode={handleToggleNightMode}
      />
    </div>
  );
};

export default Scene;
