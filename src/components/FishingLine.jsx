import React, { useEffect, useRef } from "react";
import "./FishingLine.css";

const FishingLine = ({
  lineRef,
  gamePhase,
  isCasting,
  bobberRef,
  fishermanRef,
}) => {
  const requestRef = useRef(null);

  // Real-time Line Tracking
  const updateLinePosition = () => {
    if (lineRef.current) {
      let rodTipX = window.innerWidth * 0.33; // Default fallback
      let rodTipY = window.innerHeight * 0.3; // Default fallback

      // If fishermanRef is available, calculate exact position from the actual DOM element
      if (fishermanRef?.current) {
        const fishermanRect = fishermanRef.current.getBoundingClientRect();
        // Rod tip is at the top-right of the fisherman image
        // Adjust these offsets based on the actual image
        rodTipX = fishermanRect.right - fishermanRect.width * 0.05; // 95% to the right
        rodTipY = fishermanRect.top + fishermanRect.height * 0.15; // 15% from the top
      }

      let targetX = rodTipX;
      let targetY = window.innerHeight * 0.75; // Default water level

      if (bobberRef.current) {
        // We still need bobber's position. This forces a reflow, but it's necessary for tracking CSS animation.
        // To minimize impact, ensure this is the ONLY layout read in the frame if possible.
        const bobberRect = bobberRef.current.getBoundingClientRect();

        // Calculate center of bobber relative to container (Assuming container is at 0,0)
        targetX = bobberRect.left + bobberRect.width / 2;
        targetY = bobberRect.top + bobberRect.height / 2;
      }

      lineRef.current.setAttribute("x1", `${rodTipX}`);
      lineRef.current.setAttribute("y1", `${rodTipY}`);
      lineRef.current.setAttribute("x2", `${targetX}`);
      lineRef.current.setAttribute("y2", `${targetY}`);
    }
    requestRef.current = requestAnimationFrame(updateLinePosition);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateLinePosition);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gamePhase, isCasting]);

  return (
    <svg className="fishing-line-svg">
      <line
        ref={lineRef}
        x1="40%"
        y1="35%"
        x2="40%"
        y2="35%" // Initial, updated by JS
        stroke="white"
        strokeWidth="2"
        style={{ opacity: gamePhase === "ready" && !isCasting ? 0 : 1 }}
      />
    </svg>
  );
};

export default FishingLine;
