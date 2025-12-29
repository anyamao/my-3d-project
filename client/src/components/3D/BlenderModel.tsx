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
  animationSpeed?: number;
}

export interface AnimationController {
  playToFrame50: () => void;
  playFromFrame50ToEnd: () => void;
  getCurrentState: () => { isPlaying: boolean };
  setAnimationSpeed: (speed: number) => void;
}

const BlenderModel = forwardRef<AnimationController, BlenderModelProps>(
  (
    {
      onFrameUpdate,
      onAnimationComplete,
      onAnimationStop,
      animationSpeed = 0.5,
    },
    ref
  ) => {
    const group = useRef<Group>(null);
    const mixer = useRef<AnimationMixer | null>(null);
    const action = useRef<THREE.AnimationAction | null>(null);

    const [currentFrame, setCurrentFrame] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const pauseStartTime = useRef<number | null>(null);

    const FRAME_RATE = 30;
    const PAUSE_FRAME = 50;

    const animationPhase = useRef<"idle" | "playingTo50" | "playingToEnd">(
      "idle"
    );
    const totalDuration = useRef<number>(0);
    const isPlayingRef = useRef(false);
    const speedRef = useRef(animationSpeed);

    const gltf = useLoader(GLTFLoader, "/models/Panda_model.glb");

    useImperativeHandle(ref, () => ({
      playToFrame50: () => {
        if (!action.current || animationPhase.current === "playingTo50") return;

        if (action.current) {
          action.current.stop();
          action.current.time = 0;
          action.current.paused = false;
          action.current.setEffectiveTimeScale(speedRef.current);
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

        if (action.current) {
          action.current.stop();
          action.current.time = PAUSE_FRAME / FRAME_RATE;
          action.current.paused = false;
          action.current.setEffectiveTimeScale(speedRef.current);
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
      setAnimationSpeed: (speed: number) => {
        speedRef.current = speed;
        if (action.current && !action.current.paused) {
          action.current.setEffectiveTimeScale(speed);
        }
      },
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

          totalDuration.current = animationClip.duration;

          action.current.setLoop(THREE.LoopOnce, 1);
          action.current.clampWhenFinished = true;

          animationPhase.current = "idle";
          isPlayingRef.current = false;
          setIsPaused(true);
          pauseStartTime.current = null;
          action.current.time = 0;
          action.current.paused = true;
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

      if (onFrameUpdate) {
        onFrameUpdate(currentFrameNumber);
      }

      switch (animationPhase.current) {
        case "playingTo50":
          if (currentFrameNumber >= PAUSE_FRAME) {
            action.current.paused = true;
            action.current.time = PAUSE_FRAME / FRAME_RATE;
            setIsPaused(true);
            animationPhase.current = "idle";
            stopAnimation();
          }
          break;

        case "playingToEnd":
          if (currentTime >= totalDuration.current) {
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
          break;
      }

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

export default BlenderModel;
