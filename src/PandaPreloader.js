// src/PandaPreloader.js
import React, { Suspense, useMemo, useRef } from "react";
import { useGLTF, Text, Float } from "@react-three/drei";
import * as THREE from "three";

const PRELOADER_PANDA_URL = "/models/panda.glb";
const PRELOADER_PANDA_SCALE = 0.05;
const PRELOADER_TEXT = "Clicking my Pandu reveals immense joy... Keep clicking ALL the pandas to unveil more joy!";

// Internal component to load/display content
function PreloaderContent({ onPandaClick }) {
  // Accept the click handler
  const { scene } = useGLTF(PRELOADER_PANDA_URL);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef(); // Ref for the clickable group

  return (
    // Group contains both panda and text, allows positioning them together
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {" "}
      {/* Adjust group position if needed */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.2}>
        {/* Make the primitive clickable by adding event handlers */}
        <primitive
          object={clonedScene}
          scale={PRELOADER_PANDA_SCALE}
          position={[0, -0.5, 0]} // Panda position relative to group center
          onClick={(e) => {
            e.stopPropagation(); // Prevent clicks bubbling up
            if (onPandaClick) onPandaClick(); // Call the passed function
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => (document.body.style.cursor = "auto")}
        />
      </Float>
      <Text
        fontSize={0.4}
        color="white"
        position={[0, 1.2, 0]} // Text position relative to group center
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        maxWidth={8}
      >
        {PRELOADER_TEXT}
      </Text>
    </group>
  );
}

// Main preloader component - passes the click handler down
function PandaPreloader({ onPandaClick }) {
  // Accept the click handler
  return (
    <>
      {/* Basic lighting */}
      <ambientLight intensity={1.0} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />

      {/* Internal Suspense for loading THIS component's model */}
      <Suspense fallback={null}>
        <PreloaderContent onPandaClick={onPandaClick} />{" "}
        {/* Pass handler down */}
      </Suspense>
    </>
  );
}

export default PandaPreloader;
