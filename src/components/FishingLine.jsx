import React, { useEffect, useRef } from 'react'

const FishingLine = ({ lineRef, gamePhase, isCasting, bobberRef }) => {
  const requestRef = useRef(null)

  // Real-time Line Tracking
  const updateLinePosition = () => {
    if (lineRef.current) {
      // PRO TIP: Using window dimensions avoids excessive reflows from getBoundingClientRect() on the container
      // This assumes the game container fills the screen (100vw, 100vh) which matches the CSS
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;

      // Rod tip fixed percentage relative to game-container
      // Adjusted for larger fisherman (350px width) and moved right to 15%
      const rodTipX = containerWidth * 0.40; // 40%
      const rodTipY = containerHeight * 0.35; // 35%

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
