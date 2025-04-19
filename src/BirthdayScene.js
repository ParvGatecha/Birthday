// src/BirthdayScene.js
import React, { useRef, useMemo, useEffect, Suspense, useState } from "react";
// Import useThree to get viewport info
import { useFrame, useThree } from "@react-three/fiber";
import { Text, Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// --- Configuration ---
const FONT_URL = "/fonts/Pacifico-Regular.ttf"; // Path in public/fonts/
const HEART_COLOR = "#ff69b4"; // Brighter Pink (Hot Pink)
const PANDA_MODEL_URL = "/models/panda.glb"; // Path in public/models/ - MAKE SURE THIS EXISTS
const PANDA_BASE_SCALE_DESKTOP = 0.02; // Base scale of the panda model on larger screens
const PANDA_HOVER_SCALE_FACTOR = 1.2; // Multiplier for hover scale (relative to initialScale)
const PANDA_POP_SCALE_FACTOR = 5; // Multiplier for pop scale (relative to initialScale)
const PANDA_POP_ANIM_SPEED = 0.1; // Speed for pop animation (0 to 1, higher = faster lerp)
const dampFactor = 0.1; // Smoothing for text rotation

// Reference width for responsive scaling calculations (adjust based on testing)
const REFERENCE_VIEWPORT_WIDTH = 12; // Approx world units width on a desktop view
const MIN_SCALE_FACTOR = 0.1; // Minimum scale factor to prevent elements becoming too tiny

// Helper object for lookAt calculation
const dummyObject = new THREE.Object3D();

// --- !!! DEFINE YOUR MEMORIES HERE !!! ---
const memoryTexts = [
  "Watching panda documentaries together cuddled on the bed. Bas thodoktime bacha madsu apde hone",
  "I Love You",
  "How you pointed out every single panda item when we went shopping. Joi joi ne khush thay kevu cute che ne hu tne joine khushh thav 🤗🤗",
  "I Love You",
  "That adorable plushie I won for you at BounceUp. Jasu pacha apde bounceup hone",
  "I Love You",
  "Dreaming about visiting the panda sanctuary in China together someday. Tne to mare Panda Nannyj banavi devi che jo tu",
  "I Love You",
  "Just knowing how much you adore pandas makes me smile.",
  "I Love You",
  "Stargazing on the roof. Khbr che tne avu gme che next time avu etle besva jasu kyak",
  "I Love You",
  "Singing badly in the car together. Rampyari ma Ahmedabad thi Rajkot. Mne icha hti yaar dhimu halavu sathe rav pn tare clg pochvanu htu 🥹🥹",
  "I Love You",
  "The first time we met and how it felt like we'd known each other forever.",
  "I Love You",
  "How you always make me laugh. Tari sathe yaar khbr nai su thay jaikai no karta hoi toi maja ave",
  "I Love You",
  "The way you always make me feel safe and protected. Thank you maru dhyan rakhva mate",
  "I Love You",
  "The way you look at me when you think I'm not watching.",
  "I Love You",
  "The way you make me feel like I'm the only person in the world when we're together.",
  "I Love You",
  "I'll never forget the first time you said 'I love you' and how it made me feel.",
  "I Love You",
  "Yaad che hu ghare hto ne apde hji vaat karvanu chalu kairu tu tyare te mne bday upar boline wish kairu tu aaay haay su avaj hto hji evij maja ave avaj sambhadva ma",
  "I Love You",
  "The way you always know how to make me smile, even on my worst days.",
  "I Love You",
  "The way you always make me feel like I'm the most important person in your life.",
  "I Love You",
  "Your smile, it lights up the room.",
  "I Love You",
  "You, Me and our trips with Rampyari.",
  "I Love You",
  "Missing you already. 🤗🤗🥹🥹",
  "I Love You",
  "That first date when we didn't know whether it was a date or not. Rajkot ma 1st floor upar red t-shirt",
  "I Love You",
  "Kevu besi gyu tu riverfront garden ma bhammmmmmmm 😂😂",
  "I Love You",
  "Ee taru risavu maru manavu kyare madsu yaar pacha",
  "I Love You",
  "Airport upar tu mukva aivi sachu kav to pag nota halta javu kem mukine pn toi javu paidu",
  "I Love You",
  "navi jagya a jaine badhuy alag alag khavu che yaar tari hare 😋😋",
  "I Love You",
  "Aa lakhta lakhtay rovu ave yaar su karvu 🥹🥹",
  "I Love You",
  "Gift to no mokli saiko me vaat kairi ti yashi hare pn ee kye naimed pde gandhinagar jai tyare mokalje to hve taiyar reje ghare jaine",
  "I Love You",
  "Activa brbr no hale to kevu khijai jai maru pandu",
  "I Love You",
  "Pase hoi ke dur hoi roj vaat to karvanij che hone em marathi bhagi nai sak tu",
  "I Love You",
  "Tari sathe yaar khbr nai su thay jai kai no karta hoi toi maja ave",
  "I Love You",
  "Tara mate badhuy karvu che pn yaar kyarek nthi bhegu thatu tney khbr che sorry ena mate pn thay jase badhuy ek divas 🤗🤗",
  "I Love You",
  "Bas eej icha che apde jem rai chi atyare emj rye badhuy 🤗🤗",
  "I Love You",
  "Tu khati re ne hu joto rav ahahahahaha anathi vadhare maja kyay no ave😍😍",
  "I Love You",
  "Bachuuuuuuuuuuuuuu pase av neeeeeeeeeeeeee 🤗🤗🤗🤗🤗🤗",
  "I Love You",
  ""
  // Add your own special memories here!
];
// ----------------------------------------

// --- Panda Memory Component with Pop Animation ---
function PandaMemory({
  modelUrl,
  memoryText,
  showMemory,
  position,
  rotation,
  initialScale = 1,
  dynamicBaseScale,
}) {
  const groupRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // Panda starts visible

  // Load the GLTF model
  const { scene } = useGLTF(modelUrl);
  // Clone the scene for each instance to allow independent transformations
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Memoize scale vectors based on the initial random scale factor
  const baseScaleVec = useMemo(
    () => new THREE.Vector3(initialScale, initialScale, initialScale),
    [initialScale]
  );
  const hoverScaleVec = useMemo(
    () => baseScaleVec.clone().multiplyScalar(PANDA_HOVER_SCALE_FACTOR),
    [baseScaleVec]
  );
  const popScaleVec = useMemo(
    () => baseScaleVec.clone().multiplyScalar(PANDA_POP_SCALE_FACTOR),
    [baseScaleVec]
  );

  // Animation logic within the frame loop
  useFrame(() => {
    if (!groupRef.current || !isVisible) return; // Skip if not visible or no ref yet

    if (isPopping) {
      // Animate scale towards the larger "pop" scale
      groupRef.current.scale.lerp(popScaleVec, PANDA_POP_ANIM_SPEED);

      // Check if the pop animation is almost complete
      if (groupRef.current.scale.distanceToSquared(popScaleVec) < 0.001) {
        setIsVisible(false); // Hide the panda
        setIsPopping(false); // Stop the pop animation state
        showMemory(memoryText); // Trigger memory display *after* animation
      }
    } else {
      // Regular hover animation: lerp between base and hover scales
      const targetScaleVec = isHovered ? hoverScaleVec : baseScaleVec;
      groupRef.current.scale.lerp(targetScaleVec, 0.1); // Use standard hover speed
    }
  });

  // Change cursor on hover (only when not popping and visible)
  useEffect(() => {
    if (isHovered && !isPopping && isVisible) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "auto";
    }
    // Cleanup function to reset cursor
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [isHovered, isPopping, isVisible]);

  // Click handler: start the pop animation
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    if (!isPopping && isVisible) {
      // Only pop if visible and not already popping
      setIsPopping(true);
      setIsHovered(false); // Ensure hover effect stops visually when popping
    }
  };

  // Don't render anything if the panda is not visible (after popping)
  if (!isVisible) return null;

  return (
    // Group controls overall position, rotation, and animated scale (hover/pop)
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      // Set initial scale directly; useFrame handles animation FROM this state
      scale={baseScaleVec}
      onPointerOver={(e) => {
        if (!isPopping) {
          e.stopPropagation();
          setIsHovered(true);
        }
      }}
      onPointerOut={(e) => {
        if (!isPopping) setIsHovered(false);
      }}
      onClick={handleClick}
    >
      {/* Primitive renders the loaded GLTF scene */}
      {/* Apply base model scale specific to the panda model, adjusted for responsiveness */}
      <primitive object={clonedScene} scale={dynamicBaseScale} />
    </group>
  );
}

// --- Main Birthday Scene Component ---
function BirthdayScene({ girlfriendName, yourMessage, showMemory }) {
  // Refs for text groups to apply lookAt rotation
  const mainTextRef = useRef();
  const messageTextRef = useRef();

  // Memoized target position for text lookAt behaviour
  const targetPosition = useMemo(() => new THREE.Vector3(), []);

  // --- Get viewport info for responsiveness ---
  const { viewport } = useThree();
  // -----------------------------------------

  // --- Calculate dynamic scale factor based on viewport width ---
  const scaleFactor = useMemo(() => {
    // Scale down proportionally on smaller viewports, but don't scale up beyond 1
    // Ensure a minimum scale factor to prevent elements becoming too tiny
    return Math.max(
      MIN_SCALE_FACTOR,
      Math.min(1.0, viewport.width / REFERENCE_VIEWPORT_WIDTH)
    );
  }, [viewport.width]);
  // -------------------------------------------------------------

  // Memoized material properties for hearts (performance)
  const heartMaterialProps = useMemo(
    () => ({
      color: HEART_COLOR,
      roughness: 0.4,
      metalness: 0.1,
    }),
    []
  );

  // --- Generate heart shapes (Responsive Count & Scattering) ---
  const heartsData = useMemo(() => {
    // Adjust heart count based on viewport width (fewer on smaller screens)
    const heartCount = viewport.width < 6 ? 250 : viewport.width < 9 ? 350 : 500;
    const temp = [];
    const heartShape = new THREE.Shape();
    const x = 0,
      y = 0;
    heartShape.moveTo(x + 0.5, y + 0.5);
    heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    heartShape.bezierCurveTo(
      x - 0.6,
      y + 1.1,
      x - 0.3,
      y + 1.54,
      x + 0.5,
      y + 1.9
    );
    heartShape.bezierCurveTo(
      x + 1.2,
      y + 1.54,
      x + 1.6,
      y + 1.1,
      x + 1.6,
      y + 0.7
    );
    heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
    heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
    const extrudeSettings = {
      steps: 1,
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 5,
    };

    // Adjust scattering range based on scaleFactor (slightly reduced on mobile)
    const scatterX = 50 * (0.8 + scaleFactor * 0.2);
    const scatterY = 40 * (0.8 + scaleFactor * 0.2);
    const scatterZ = 70 * (0.8 + scaleFactor * 0.2);
    const baseZ = -20 * scaleFactor; // Bring base Z slightly closer on mobile

    for (let i = 0; i < heartCount; i++) {
      temp.push({
        id: i,
        position: [
          (Math.random() - 0.5) * scatterX,
          (Math.random() - 0.5) * scatterY,
          (Math.random() - 0.5) * scatterZ + baseZ,
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
        scale: Math.max(0.3, Math.random() * 0.7) * scaleFactor, // Scale hearts based on factor
        speed: Math.random() * 0.6 + 0.2,
        floatIntensity: (Math.random() * 1.2 + 0.6) * scaleFactor, // Reduce float intensity slightly
      });
    }
    // Return array of shape data and the single shared geometry
    return {
      shapes: temp,
      geometry: new THREE.ExtrudeGeometry(heartShape, extrudeSettings),
    };
  }, [viewport.width, scaleFactor]); // Recalculate if viewport width or derived scaleFactor changes
  // --------------------------------------------------------------

  // --- Generate Panda Instance properties (Responsive Positioning/Scale) ---
  const pandasData = useMemo(() => {
    if (!memoryTexts || memoryTexts.length === 0) {
      console.warn("No memories defined in memoryTexts array!");
      return [];
    }
    // Adjust panda ring radius and Z position based on scaleFactor
    const baseRadius = 8 * scaleFactor;
    const randomRadius = 4 * scaleFactor;
    const baseZ = -3 * scaleFactor; // Bring pandas slightly closer on mobile

    // Create one panda instance for each memory text
    return memoryTexts.map((text, index) => {
      const angle =
        (index / memoryTexts.length) * Math.PI * 2 + Math.random() * 0.5;
      const radius = baseRadius + Math.random() * randomRadius;
      const x = Math.cos(angle) * radius;
      const y = (Math.random()) * 10 * scaleFactor; // Reduce vertical spread on mobile
      const z = Math.sin(angle) * radius + baseZ;

      return {
        id: `panda-${index}`, // Unique key for React
        memoryText: text,
        position: [x, y, z],
        rotation: [
          (Math.random() - 0.5) * 0.4,
          Math.random() * Math.PI * 2,
          (Math.random() - 0.5) * 0.2,
        ],
        initialScale: 0.9 + Math.random() * 0.2, // Random initial scale factor (0.9 to 1.1) applied to group
      };
    });
  }, [scaleFactor]); // Recalculate if scaleFactor changes
  // ------------------------------------------------

  // Dynamically calculate the base scale for the panda model primitive based on responsiveness
  const pandaDynamicBaseScale = useMemo(
    () => PANDA_BASE_SCALE_DESKTOP * scaleFactor,
    [scaleFactor]
  );

  // --- Animation Loop (useFrame) for Text Rotation ---
  useFrame((state, delta) => {
    // Make text look towards the mouse cursor position
    const worldX = state.mouse.x * 5;
    const worldY = state.mouse.y * 2;
    targetPosition.set(worldX, worldY, 5); // Target point in front of camera

    // Smoothly rotate main text group towards the target
    if (mainTextRef.current) {
      dummyObject.position.copy(mainTextRef.current.position);
      dummyObject.lookAt(targetPosition);
      mainTextRef.current.quaternion.slerp(dummyObject.quaternion, dampFactor);
    }
    // Smoothly rotate message text group towards the target
    if (messageTextRef.current) {
      dummyObject.position.copy(messageTextRef.current.position);
      dummyObject.lookAt(targetPosition);
      messageTextRef.current.quaternion.slerp(
        dummyObject.quaternion,
        dampFactor
      );
    }
  });
  // ---------------------------------------------------

  // --- Set Initial Text Rotation Once on Mount (useEffect) ---
  useEffect(() => {
    const initialTarget = new THREE.Vector3(0, 0, 5); // Point text forward initially
    if (mainTextRef.current) mainTextRef.current.lookAt(initialTarget);
    if (messageTextRef.current) messageTextRef.current.lookAt(initialTarget);
  }, []); // Empty dependency array means run only once on mount
  // ---------------------------------------------------------

  // --- Render the Scene Components ---
  return (
    <>
      {/* Main Birthday Message (Apply scaleFactor to fontSize and position) */}
      <group ref={mainTextRef} position={[0, 1.5 * scaleFactor, 0]}>
        <Text
          font={FONT_URL}
          fontSize={1 * scaleFactor}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03 * scaleFactor}
          outlineColor="#e8a0bf"
          textAlign="center"
        >
          {`Happy 23rd Birthday\n${girlfriendName}!`}
        </Text>
      </group>

      {/* Your Personal Message (Apply scaleFactor to fontSize, position, maxWidth) */}
      <group
        ref={messageTextRef}
        position={[0, -1.5 * scaleFactor, 1 * scaleFactor]}
      >
        <Text
          font={FONT_URL}
          fontSize={0.6 * scaleFactor}
          color="#f8f8f8"
          maxWidth={10 * scaleFactor}
          anchorX="center"
          anchorY="middle"
          textAlign="center"
          lineHeight={1.2}
        >
          {yourMessage}
        </Text>
      </group>

      {/* Visual Floating Hearts Group (Not Clickable) */}
      <group>
        {" "}
        {/* No ref needed if group isn't manipulated */}
        {heartsData.shapes.map((heart) => (
          // Float handles the animation based on props derived from responsive calculations
          <Float
            key={heart.id}
            position={heart.position}
            rotation={heart.rotation}
            scale={heart.scale}
            speed={heart.speed}
            rotationIntensity={0.5}
            floatIntensity={heart.floatIntensity}
          >
            {/* The visual mesh */}
            <mesh geometry={heartsData.geometry}>
              <meshStandardMaterial {...heartMaterialProps} />
            </mesh>
          </Float>
        ))}
      </group>

      {/* Clickable Pandas with Pop Animation */}
      {/* Suspense is crucial here because useGLTF loads the model asynchronously */}
      <Suspense fallback={null}>
        {pandasData.map((pandaProps) => (
          <PandaMemory
            key={pandaProps.id}
            {...pandaProps} // Spreads position, rotation, initialScale, memoryText
            modelUrl={PANDA_MODEL_URL}
            showMemory={showMemory} // Pass down the function to show the memory overlay
            dynamicBaseScale={pandaDynamicBaseScale} // Pass down responsive base scale for model
          />
        ))}
      </Suspense>
    </>
  );
}

export default BirthdayScene;

