import { useState, useEffect, useRef } from 'react'
import './App.css'
import { fishData } from './fishData'
import Fisherman from './components/Fisherman'
import FishingLine from './components/FishingLine'
import Bobber from './components/Bobber'
import CatchingBar from './components/CatchingBar'
import ResultOverlay from './components/ResultOverlay'
import GameLogic from './hooks/GameLogic'

function App() {
  const [gamePhase, setGamePhase] = useState('ready')
  const [exclamation, setExclamation] = useState(false)
  const [gauge, setGauge] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [failures, setFailures] = useState(0)
  const [barPosition, setBarPosition] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [direction, setDirection] = useState(1)
  const [greenStart, setGreenStart] = useState(20)
  const [greenWidth, setGreenWidth] = useState(60)
  const [redStart, setRedStart] = useState(40)
  const [redWidth, setRedWidth] = useState(20)
  const [result, setResult] = useState(null)
  const [rodAnimation, setRodAnimation] = useState('')
  const [catchAnimation, setCatchAnimation] = useState(false)
  const [isCasting, setIsCasting] = useState(false)
  const [caughtFish, setCaughtFish] = useState(null)

  const bobberRef = useRef(null)
  const lineRef = useRef(null)

  // Use custom hook for game logic
  const { resetGame, handleBarStop } = GameLogic({
    gamePhase,
    setGamePhase,
    exclamation,
    setExclamation,
    isMoving,
    setIsMoving,
    setBarPosition,
    direction,
    setDirection,
    greenStart,
    setGreenStart,
    greenWidth,
    setGreenWidth,
    redStart,
    setRedStart,
    redWidth,
    setRedWidth,
    gauge,
    setGauge,
    failures,
    setFailures,
    setAttempts,
    barPosition,
    result,
    setResult,
    setRodAnimation,
    setCatchAnimation,
    setCaughtFish,
    setIsCasting,
    isCasting,
  })

  const handleScreenClick = () => {
    // Allow immediate restart if result screen is visible
    if (result !== null) {
      resetGame()
      return
    }
    // Prevent casting if result screen is visible (!result)
    if (gamePhase === 'ready' && !isCasting && !result) {
      setIsCasting(true)
      setTimeout(() => {
        setIsCasting(false)
        setGamePhase('fishing')
      }, 1000) // Casting duration
    } else if (gamePhase === 'fishing' && exclamation) {
      const newGreenStart = Math.random() * 30 + 10
      const newGreenWidth = Math.random() * 10 + 20 // 20% ~ 30%
      const newRedWidth = Math.random() * 5 + 5 // 5% ~ 10%
      const newRedStart = newGreenStart + (newGreenWidth - newRedWidth) / 2 // 가운데

      setGreenStart(newGreenStart)
      setGreenWidth(newGreenWidth)
      setRedStart(newRedStart)
      setRedWidth(newRedWidth)

      setGamePhase('catching')
      setIsMoving(true)
      setExclamation(false)
      setBarPosition(0)
      setDirection(1)
    }
  }

  return (
    <div className="fishing-game" onClick={handleScreenClick}>
      <div className="game-container">
        {/* Sky and Water are part of the background image now, but we can add overlays if needed */}

        {/* Fisherman */}
        <Fisherman rodAnimation={rodAnimation} />

        {/* Fishing Line (SVG) - calculates line from rod tip to bobber */}
        <FishingLine
          lineRef={lineRef}
          gamePhase={gamePhase}
          isCasting={isCasting}
          bobberRef={bobberRef}
        />

        {/* Bobber - Active during fishing/catching OR during casting/pulling animations */}
        <Bobber
          gamePhase={gamePhase}
          isCasting={isCasting}
          catchAnimation={catchAnimation}
          exclamation={exclamation}
          bobberRef={bobberRef}
        />

        {/* Catch Animation - Use specific 2D image if available, else fallback */}
        {catchAnimation && (
          <img
            src={caughtFish && caughtFish.image2d ? caughtFish.image2d : "/fs.png"}
            alt="Caught Fish"
            className="pulling-whale"
          />
        )}

        {/* UI Overlays */}
        <div className="ui-layer">
          {result === null ? (
            <>
              {gamePhase === 'ready' && !isCasting && <div className="start-prompt"><p>Click to cast the line!</p></div>}

              {gamePhase === 'catching' && !catchAnimation && (
                <CatchingBar
                  greenStart={greenStart}
                  greenWidth={greenWidth}
                  redStart={redStart}
                  redWidth={redWidth}
                  barPosition={barPosition}
                  gauge={gauge}
                  failures={failures}
                  onBarClick={handleBarStop}
                />
              )}
            </>
          ) : (
            <ResultOverlay result={result} caughtFish={caughtFish} />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
