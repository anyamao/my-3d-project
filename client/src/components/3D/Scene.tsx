import React, {
  Suspense,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import BlenderModel from "./BlenderModel";
import AnimationControls from "./AnimationControl";
import WeatherEffects from "./WeatherEffects";

const Scene: React.FC = () => {
  // State to track which button was last pressed
  const [lastPressedButton, setLastPressedButton] = useState<
    "none" | "button1" | "button2"
  >("none");
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
      // Switching to DAY mode
      setAmbientLightIntensity(2);
      setDirectionalLightIntensity(5);
      console.log("🌞 Switching to DAY mode");
    } else {
      // Switching to NIGHT mode
      setAmbientLightIntensity(0.5);
      setDirectionalLightIntensity(0.5);
      console.log("🌙 Switching to NIGHT mode");
    }
  }, [isNightMode]);

  // Ref for OrbitControls
  const orbitControlsRef = useRef<any>(null);

  // Debug: Check when OrbitControls mounts
  useEffect(() => {
    console.log("Scene mounted");

    // Check ref periodically
    const interval = setInterval(() => {
      if (orbitControlsRef.current) {
        console.log(
          "✓ OrbitControls ref is now available:",
          orbitControlsRef.current
        );
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Function to reset camera
  const handleResetCamera = useCallback(() => {
    console.log("🎯 handleResetCamera called from AnimationControls");

    if (orbitControlsRef.current) {
      console.log("✅ OrbitControls ref found!");
      const controls = orbitControlsRef.current;
      const camera = controls.object;

      console.log("📷 Current camera position:", {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      });
      console.log("🎯 Current target:", {
        x: controls.target.x,
        y: controls.target.y,
        z: controls.target.z,
      });

      // Store enabled state
      const wasEnabled = controls.enabled;

      // Disable controls during reset
      controls.enabled = false;

      // Set new position
      camera.position.set(-3, 7, -5.7);
      controls.target.set(-0.5, 7, 0);

      // Force update
      controls.update();

      // Re-enable after delay
      setTimeout(() => {
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = wasEnabled;
          console.log("✅ Controls re-enabled");
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
    <div
      className={`w-full h-screen ${
        isNightMode ? "bg-[#1d1f22]" : "bg-blue-200"
      } relative`}
    >
      <Canvas
        camera={{
          position: [-3, 7, -5.7],
          fov: 50,
        }}
        shadows={true}
      >
        {/* Weather Effects Component */}
        <WeatherEffects
          type={weatherType}
          intensity={weatherIntensity}
          windStrength={0.2}
        />

        <directionalLight
          position={[20, 30, 10]}
          intensity={directionalLightIntensity}
          color="#8400ffff"
        />
        {isNightMode && <fog attach="fog" args={["#000022", 10, 50]} />}

        <ambientLight intensity={ambientLightIntensity} color="#ff0000ff" />

        {/* Floor mesh for shadows */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[30, -2, 0]}
          receiveShadow
        >
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#ffffffff" roughness={0.5} />
        </mesh>

        {/* Temporarily remove Suspense to test if it's causing the issue */}
        <BlenderModel
          ref={animationControllerRef}
          onFrameUpdate={handleFrameUpdate}
          onAnimationComplete={handleAnimationComplete}
          onAnimationStop={() => setIsAnimationPlaying(false)}
        />

        {/* OrbitControls MUST be last in the Canvas */}
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

      {/* AnimationControls with onResetCamera prop */}
      <AnimationControls
        onPlayToFrame50={handlePlayToFrame50}
        onPlayFromFrame50ToEnd={handlePlayFromFrame50ToEnd}
        canPlayToFrame50={canPlayToFrame50}
        canPlayFromFrame50ToEnd={canPlayFromFrame50ToEnd}
        currentFrame={currentFrame}
        isAnimationComplete={isAnimationComplete}
        isAnimationPlaying={isAnimationPlaying}
        onWeatherChange={handleWeatherChange}
        onResetCamera={handleResetCamera} // This was missing!
        isNightMode={isNightMode} // Pass current mode
        onToggleNightMode={handleToggleNightMode}
      />
    </div>
  );
};

export default Scene;
