import { useState } from 'react'
import './StartScreen.css'

function StartScreen({ onPressStart }) {
  return (
    <div className="start-screen" onClick={onPressStart}>
      <div className="pixel-clouds">
        <div className="pixel-cloud cloud-1"></div>
        <div className="pixel-cloud cloud-2"></div>
        <div className="pixel-cloud cloud-3"></div>
      </div>

      <div className="start-content">
        <div className="game-logo">
          <h1 className="pixel-title">바다를</h1>
          <h1 className="pixel-title">되살리자</h1>
          <div className="pixel-fish-icon">🐟</div>
        </div>

        <div className="press-start-container">
          <p className="press-start-text blink">PRESS START!</p>
          <p className="press-start-hint">클릭하여 시작</p>
        </div>
      </div>

      <div className="pixel-ocean">
        <div className="ocean-wave wave-1"></div>
        <div className="ocean-wave wave-2"></div>
      </div>

      <div className="credits">
        <p>© 2024 OCEAN RESCUE TEAM</p>
      </div>
    </div>
  )
}

export default StartScreen
