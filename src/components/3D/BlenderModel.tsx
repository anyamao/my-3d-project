import React, { useRef, useEffect, useState } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Group, AnimationMixer } from "three";
import * as THREE from "three";

const BlenderModel: React.FC = () => {
  const group = useRef<Group>(null);
  const mixer = useRef<AnimationMixer | null>(null);
  const action = useRef<THREE.AnimationAction | null>(null);

  // Animation state
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseStartTime = useRef<number | null>(null);

  // Animation settings
  const FRAME_RATE = 30;
  const PAUSE_FRAME = 50;
  const PAUSE_DURATION = 10000; // 10 seconds in milliseconds

  // Add state to track animation phase
  const animationPhase = useRef<"initial" | "pause" | "resume" | "complete">(
    "initial"
  );
  const totalDuration = useRef<number>(0);

  // Load the model
  const gltf = useLoader(GLTFLoader, "/models/Panda_sixth.glb");

  useEffect(() => {
    if (gltf.scene) {
      // Enable shadows
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      if (gltf.animations?.length > 0) {
        mixer.current = new AnimationMixer(gltf.scene);

        const animationClip =
          gltf.animations.find((a) => a.name === "PandaAnimation") ||
          gltf.animations[0];
        action.current = mixer.current.clipAction(animationClip);

        // Store total duration
        totalDuration.current = animationClip.duration;

        // Reset all states
        animationPhase.current = "initial";
        setIsPaused(false);
        pauseStartTime.current = null;

        // Set to play once (we'll handle looping manually)
        action.current.setLoop(THREE.LoopOnce, 1);
        action.current.clampWhenFinished = false;

        // Start from the beginning
        action.current.time = 0;
        action.current.play();

        console.log(
          `Animation started at frame 0. Total duration: ${
            totalDuration.current
          }s, Frames: ${totalDuration.current * FRAME_RATE}`
        );
      }
    }

    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
      }
    };
  }, [gltf]);

  useFrame((state, delta) => {
    if (!mixer.current || !action.current) return;

    const currentTime = action.current.time;
    const currentFrameNumber = Math.floor(currentTime * FRAME_RATE);
    setCurrentFrame(currentFrameNumber);

    // Handle different animation phases
    switch (animationPhase.current) {
      case "initial":
        // Check if we've reached the pause frame
        if (currentFrameNumber >= PAUSE_FRAME) {
          console.log(`Reached pause frame ${PAUSE_FRAME}, pausing...`);

          // Pause the animation
          action.current.paused = true;
          setIsPaused(true);
          animationPhase.current = "pause";
          pauseStartTime.current = Date.now();

          // Ensure we're exactly at the pause frame
          action.current.time = PAUSE_FRAME / FRAME_RATE;
        }
        break;

      case "pause":
        // Check if pause duration has elapsed
        if (
          pauseStartTime.current &&
          Date.now() - pauseStartTime.current >= PAUSE_DURATION
        ) {
          console.log(`Pause complete, resuming from frame ${PAUSE_FRAME}`);

          // Resume animation from pause frame
          action.current.time = PAUSE_FRAME / FRAME_RATE;
          action.current.paused = false;
          setIsPaused(false);
          animationPhase.current = "resume";
          pauseStartTime.current = null;
        }
        break;

      case "resume":
        // Check if animation has reached the end
        if (currentTime >= totalDuration.current) {
          console.log(`Animation complete, restarting...`);

          // Reset animation to beginning
          action.current.stop();
          action.current.time = 0;
          action.current.play();
          animationPhase.current = "initial";
          setIsPaused(false);
          console.log(`Restarted animation from frame 0`);
        }
        break;
    }

    // Update mixer only if not paused
    if (!action.current.paused) {
      mixer.current.update(delta);
    }
  });

  return (
    <group ref={group}>
      <primitive
        object={gltf.scene}
        scale={1}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
};

export default BlenderModel;
