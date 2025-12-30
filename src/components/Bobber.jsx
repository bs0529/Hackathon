import React from "react";
import "./Bobber.css";

const Bobber = ({
  gamePhase,
  isCasting,
  catchAnimation,
  exclamation,
  bobberRef,
  caughtFish,
}) => {
  return (
    (gamePhase === "fishing" ||
      gamePhase === "catching" ||
      isCasting ||
      catchAnimation) && (
      <div
        className={`bobber-container ${isCasting ? "casting" : ""} ${
          catchAnimation ? "pulling" : ""
        }`}
      >
        {exclamation && !catchAnimation && <div className="exclamation">!</div>}
        <img
          ref={bobberRef}
          src="/nak.png"
          alt="Bobber"
          className={`bobber ${
            !isCasting && !catchAnimation
              ? exclamation
                ? "bobber-shake"
                : "bobber-float"
              : ""
          }`}
        />
        {/* Caught fish image - moves together with bobber */}
        {catchAnimation && caughtFish && (
          <img
            src={caughtFish.image2d || "/nak.png"}
            alt="Caught Fish"
            className="pulling-whale"
          />
        )}
      </div>
    )
  );
};

export default Bobber;
