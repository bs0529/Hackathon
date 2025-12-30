import React from 'react'
import './Bobber.css'

const Bobber = ({ gamePhase, isCasting, catchAnimation, exclamation, bobberRef }) => {
  return (
    (gamePhase === 'fishing' || gamePhase === 'catching' || isCasting || catchAnimation) && (
      <div
        className={`bobber-container ${isCasting ? 'casting' : ''} ${catchAnimation ? 'pulling' : ''}`}
      >
        {exclamation && !catchAnimation && <div className="exclamation">!</div>}
        <img
          ref={bobberRef}
          src="/fs.png"
          alt="Bobber"
          className={`bobber ${(!isCasting && !catchAnimation) ? (exclamation ? 'bobber-shake' : 'bobber-float') : ''}`}
        />
      </div>
    )
  )
}

export default Bobber
