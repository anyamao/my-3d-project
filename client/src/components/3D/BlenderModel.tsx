import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Group, AnimationMixer } from "three";
import * as THREE from "three";

interface BlenderModelProps {
  onFrameUpdate?: (frame: number) => void;
  onAnimationComplete?: () => void;
  onAnimationStop?: () => void;
}

export interface AnimationController {
  playToFrame50: () => void;
  playFromFrame50ToEnd: () => void;
  getCurrentState: () => { isPlaying: boolean };
}

const BlenderModel = forwardRef<AnimationController, BlenderModelProps>(
  ({ onFrameUpdate, onAnimationComplete, onAnimationStop }, ref) => {
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
    const animationPhase = useRef<"idle" | "playingTo50" | "playingToEnd">(
      "idle"
    );
    const totalDuration = useRef<number>(0);
    const isPlayingRef = useRef(false);

    // Load the model
    const gltf = useLoader(GLTFLoader, "/models/Panda_nine.glb");

    // Expose control methods to parent
    useImperativeHandle(ref, () => ({
      playToFrame50: () => {
        if (!action.current || animationPhase.current === "playingTo50") return;

        console.log("Playing to frame 50");

        // Reset animation
        if (action.current) {
          action.current.stop();
          action.current.time = 0;
          action.current.paused = false;
          action.current.play();
        }

        setIsPaused(false);
        animationPhase.current = "playingTo50";
        isPlayingRef.current = true;
        pauseStartTime.current = null;
      },

      playFromFrame50ToEnd: () => {
        if (!action.current || animationPhase.current === "playingToEnd")
          return;

        console.log("Playing from frame 50 to end");

        // Start from frame 50
        if (action.current) {
          action.current.stop();
          action.current.time = PAUSE_FRAME / FRAME_RATE;
          action.current.paused = false;
          action.current.play();
        }

        setIsPaused(false);
        animationPhase.current = "playingToEnd";
        isPlayingRef.current = true;
        pauseStartTime.current = null;
      },

      getCurrentState: () => ({
        isPlaying: isPlayingRef.current,
      }),
    }));

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

          // Set to play once (we'll handle looping manually)
          action.current.setLoop(THREE.LoopOnce, 1);
          action.current.clampWhenFinished = true;

          // Start in idle state
          animationPhase.current = "idle";
          isPlayingRef.current = false;
          setIsPaused(true);
          pauseStartTime.current = null;
          action.current.time = 0;
          action.current.paused = true; // Start paused

          console.log(
            `Animation loaded. Total duration: ${
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

    const stopAnimation = () => {
      isPlayingRef.current = false;
      if (onAnimationStop) {
        onAnimationStop();
      }
    };

    useFrame((state, delta) => {
      if (!mixer.current || !action.current) return;

      const currentTime = action.current.time;
      const currentFrameNumber = Math.floor(currentTime * FRAME_RATE);
      setCurrentFrame(currentFrameNumber);

      // Update parent with current frame
      if (onFrameUpdate) {
        onFrameUpdate(currentFrameNumber);
      }

      // Handle different animation phases
      switch (animationPhase.current) {
        case "playingTo50":
          // Check if we've reached the target frame
          if (currentFrameNumber >= PAUSE_FRAME) {
            console.log(`Reached frame 50, stopping...`);

            // Stop the animation at frame 50
            action.current.paused = true;
            action.current.time = PAUSE_FRAME / FRAME_RATE;
            setIsPaused(true);
            animationPhase.current = "idle";
            stopAnimation();

            console.log("Animation stopped at frame 50");
          }
          break;

        case "playingToEnd":
          // Check if animation has reached the end
          if (currentTime >= totalDuration.current) {
            console.log(`Animation complete`);

            // Stop at the end
            action.current.paused = true;
            setIsPaused(true);
            animationPhase.current = "idle";
            stopAnimation();

            // Notify parent
            if (onAnimationComplete) {
              onAnimationComplete();
            }
          }
          break;

        case "idle":
          // Do nothing - animation is paused
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
  }
);

// Add display name for debugging
BlenderModel.displayName = "BlenderModel";

export default BlenderModel;
