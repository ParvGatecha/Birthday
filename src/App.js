// src/App.js
import React, { Suspense, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Text as DreiText } from "@react-three/drei";
import "./App.css"; // Make sure styles are imported
import BirthdayScene from "./BirthdayScene";
import PandaPreloader from "./PandaPreloader";

// Optional: Responsive Camera Adjuster
const ResponsiveCamera = ({ baseFov = 75, mobileFov = 85 }) => {
  const { size, camera } = useThree();
  useEffect(() => {
    /* ... camera adjustment logic ... */
  }, [size, camera, baseFov, mobileFov]);
  return null;
};
// (Include the full ResponsiveCamera implementation if using)

// Simple fallback while main scene loads AFTER click
function MainSceneLoadingFallback() {
  return (
    <DreiText
      position={[0, 0, 0]}
      fontSize={0.5}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      Loading the Magic... ✨
    </DreiText>
  );
}

// Main Application Component
function App() {
  const [activeMemory, setActiveMemory] = useState(null);
  const [startMainScene, setStartMainScene] = useState(false);
  // --- State for the "Too Early" message ---
  const [earlyClickMessage, setEarlyClickMessage] = useState(null); // null means hidden
  // -----------------------------------------

  const girlfriendName = "Hirva"; // <-- !!! REPLACE WITH HER NAME !!!
  const yourMessage = "You make my world brighter and happier. Love you always and forever!"; // <-- !!! REPLACE WITH YOUR MESSAGE !!!

  const showMemoryHandler = (memoryText) => {
    setActiveMemory(memoryText);
  };
  const closeMemory = () => {
    setActiveMemory(null);
  };

  // --- Updated triggerLoad function ---
  const triggerLoad = () => {
    // Clear any previous "too early" message first
    setEarlyClickMessage(null);

    const now = new Date();
    const currentYear = now.getFullYear();
    // Unlock Time: April 20th, 00:00:00 (remember month is 0-indexed)
    const unlockTime = new Date(currentYear, 3, 20, 0, 0, 0);

    console.log("Panda clicked at:", now);
    console.log("Unlock time is:", unlockTime);

    if (now >= unlockTime) {
      console.log("It's time! Starting main scene load...");
      setStartMainScene(true); // Allow main scene to load
    } else {
      // --- It's too early - Calculate time left and set styled message ---
      const diff = unlockTime - now; // Difference in milliseconds
      let message =
        "Patience, my love... <br /> The best surprises bloom with time. ✨"; // Base message with line break
      let timeHint = "";

      if (diff > 0) {
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff / (1000 * 60)) % 60);

        if (hoursLeft > 0) {
          timeHint = `(Ready in about ${hoursLeft} hour${
            hoursLeft > 1 ? "s" : ""
          } and ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""})`;
        } else if (minutesLeft > 0) {
          timeHint = `(Almost there! Ready in about ${minutesLeft} minute${
            minutesLeft !== 1 ? "s" : ""
          })`;
        } else {
          timeHint = `(Just a few moments longer!)`;
        }
        // Combine message and hint with HTML structure for styling
        message = `<p>${message}</p><p class="time-hint">${timeHint}</p>`;
      } else {
        // Should technically not happen if now < unlockTime, but safety first
        message = `<p>${message}</p><p class="time-hint">(It should be ready very soon!)</p>`;
      }

      setEarlyClickMessage(message); // Set the state to show the message
      console.log("Too early, showing custom message.");
      // -----------------------------------------------------------------
    }
  };
  // ------------------------------------------------

  // Function to dismiss the "too early" message
  const dismissEarlyMessage = () => {
    setEarlyClickMessage(null);
  };

  return (
    <>
      <Canvas camera={{ position: [0, 1, 12], fov: 75 }}>
        {!startMainScene ? (
          <PandaPreloader onPandaClick={triggerLoad} />
        ) : (
          <Suspense fallback={<MainSceneLoadingFallback />}>
            <ResponsiveCamera baseFov={75} mobileFov={85} />
            {/* --- Main Scene Content --- */}
            <ambientLight intensity={1.0} />
            <pointLight position={[10, 10, 10]} intensity={1.0} castShadow />
            <pointLight
              position={[-10, -5, 5]}
              intensity={0.6}
              color="#ffcccc"
            />
            <pointLight position={[0, 5, -15]} intensity={1.5} distance={50} />
            <Stars
              radius={100}
              depth={50}
              count={5000}
              factor={4}
              saturation={0}
              fade
              speed={1}
            />
            <BirthdayScene
              girlfriendName={girlfriendName}
              yourMessage={yourMessage}
              showMemory={showMemoryHandler}
            />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate={true}
              autoRotateSpeed={0.4}
              minPolarAngle={0}
              maxPolarAngle={Math.PI}
            />
            {/* --- End Main Scene Content --- */}
          </Suspense>
        )}
      </Canvas>

      {/* Memory Overlay (Blue Theme) */}
      <div
        className={`memory-overlay ${activeMemory ? "visible" : ""}`}
        onClick={closeMemory}
      >
        {/* ... memory content ... */}
        {activeMemory && (
          <div className="memory-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeMemory}>
              ×
            </button>
            <p>{activeMemory}</p>
          </div>
        )}
      </div>

      {/* --- "Too Early" Message Overlay --- */}
      {earlyClickMessage && (
        <div
          className={`early-overlay visible`} // Always add 'visible' class when message exists
          onClick={dismissEarlyMessage} // Click background to dismiss
        >
          <div
            className="early-message-content"
            onClick={(e) => e.stopPropagation()} // Prevent background click when clicking box
            // Use dangerouslySetInnerHTML because our message contains HTML tags (<br />, <p>, class)
            dangerouslySetInnerHTML={{ __html: earlyClickMessage }}
          >
            {/* Content is set via dangerouslySetInnerHTML */}
          </div>
        </div>
      )}
      {/* --------------------------------- */}
    </>
  );
}

// (Include full ResponsiveCamera definition if using)

export default App;
