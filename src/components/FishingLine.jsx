import React, { useEffect, useRef } from 'react'
import './FishingLine.css'

const FishingLine = ({ lineRef, gamePhase, isCasting, bobberRef }) => {
  const requestRef = useRef(null)

  // Real-time Line Tracking
  const updateLinePosition = () => {
    if (lineRef.current) {
      // PRO TIP: Using window dimensions avoids excessive reflows from getBoundingClientRect() on the container
      // This assumes the game container fills the screen (100vw, 100vh) which matches the CSS
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;

      // Calculate rod tip position based on fisherman position and screen size
      // Fisherman positioning: 12vw on desktop, 10vw on <1200px, 8vw on <768px, 6vw on <480px
      let fishermanLeftPercent;
      let fishermanWidth;

      if (containerWidth < 480) {
        fishermanLeftPercent = 0.06; // 6vw
        fishermanWidth = 220;
      } else if (containerWidth < 768) {
        fishermanLeftPercent = 0.08; // 8vw
        fishermanWidth = 280;
      } else if (containerWidth < 1200) {
        fishermanLeftPercent = 0.10; // 10vw
        fishermanWidth = 350;
      } else {
        fishermanLeftPercent = 0.12; // 12vw
        fishermanWidth = 350;
      }

      const fishermanLeft = containerWidth * fishermanLeftPercent;
      // Position rod tip at the right edge of fisherman, slightly below the top
      const rodTipX = fishermanLeft + fishermanWidth; // Right edge of fisherman
      const rodTipY = containerHeight * 0.35; // Slightly higher (35% from top)

      let targetX = rodTipX;
      let targetY = containerHeight * 0.75; // Default water level

      if (bobberRef.current) {
        // We still need bobber's position. This forces a reflow, but it's necessary for tracking CSS animation.
        // To minimize impact, ensure this is the ONLY layout read in the frame if possible.
        const bobberRect = bobberRef.current.getBoundingClientRect();

        // Calculate center of bobber relative to container (Assuming container is at 0,0)
        targetX = bobberRect.left + bobberRect.width / 2;
        targetY = bobberRect.top + bobberRect.height / 2;
      }

      lineRef.current.setAttribute('x1', `${rodTipX}`);
      lineRef.current.setAttribute('y1', `${rodTipY}`);
      lineRef.current.setAttribute('x2', `${targetX}`);
      lineRef.current.setAttribute('y2', `${targetY}`);
    }
    requestRef.current = requestAnimationFrame(updateLinePosition);
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateLinePosition);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gamePhase, isCasting]);

  return (
    <svg className="fishing-line-svg">
      <line
        ref={lineRef}
        x1="40%" y1="35%"
        x2="40%" y2="35%" // Initial, updated by JS
        stroke="white"
        strokeWidth="2"
        style={{ opacity: (gamePhase === 'ready' && !isCasting) ? 0 : 1 }}
      />
    </svg>
  )
}

export default FishingLine
