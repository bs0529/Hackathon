import React, { useRef, useEffect, useState } from "react";
import "./Fisherman.css";

const Fisherman = ({ rodAnimation, bobberRef, gamePhase, isCasting }) => {
  const fishermanImgRef = useRef(null);
  const lineRef = useRef(null);
  const [lineCoords, setLineCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  useEffect(() => {
    const updateLinePosition = () => {
      if (!fishermanImgRef.current || !bobberRef?.current) {
        requestAnimationFrame(updateLinePosition);
        return;
      }

      const imgRect = fishermanImgRef.current.getBoundingClientRect();
      // Rod tip is at the top-right corner of the fisherman image
      const rodTipX = imgRect.right;
      const rodTipY = imgRect.top;

      let targetX = rodTipX;
      let targetY = window.innerHeight * 0.75; // Default water level

      // During fishing, catching, or pulling phases, connect to the bobber
      if (gamePhase === "fishing" || gamePhase === "catching" || isCasting) {
        const bobberRect = bobberRef.current.getBoundingClientRect();
        targetX = bobberRect.left + bobberRect.width / 2;
        targetY = bobberRect.top + bobberRect.height / 2;
      }

      setLineCoords({ x1: rodTipX, y1: rodTipY, x2: targetX, y2: targetY });
      requestAnimationFrame(updateLinePosition);
    };

    updateLinePosition();
  }, [bobberRef, gamePhase, isCasting]);

  return (
    <>
      <div className={`fisherman-container ${rodAnimation}`}>
        <img
          src="/fisherman.png"
          alt="Fisherman"
          className="fisherman"
          ref={fishermanImgRef}
        />
      </div>

      {/* Fishing Line (SVG) */}
      <svg
        ref={lineRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        {(isCasting || gamePhase === "fishing" || gamePhase === "catching") && (
          <line
            x1={lineCoords.x1}
            y1={lineCoords.y1}
            x2={lineCoords.x2}
            y2={lineCoords.y2}
            stroke="white"
            strokeWidth="2"
          />
        )}
      </svg>
    </>
  );
};

export default Fisherman;
