import { useState, useEffect, useRef } from 'react'
import './App.css'
import { fishData } from './fishData'

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

  const timerRef = useRef(null)
  const moveRef = useRef(null)
  const bobberRef = useRef(null)
  const lineRef = useRef(null)
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
  }, [gamePhase, catchAnimation, isCasting]);

  useEffect(() => {
    if (gamePhase === 'fishing') {
      const delay = Math.random() * 1500 + 500
      timerRef.current = setTimeout(() => {
        setExclamation(true)
      }, delay)
    }
    return () => clearTimeout(timerRef.current)
  }, [gamePhase])

  useEffect(() => {
    if (isMoving) {
      moveRef.current = setInterval(() => {
        setBarPosition(prev => {
          let newPos = prev + direction * 3
          if (newPos >= 100) {
            newPos = 100
            setDirection(-1)
          } else if (newPos <= 0) {
            newPos = 0
            setDirection(1)
          }
          return newPos
        })
      }, 20)
    } else {
      clearInterval(moveRef.current)
    }
    return () => clearInterval(moveRef.current)
  }, [isMoving, direction])

  // Auto-reset game after showing result
  useEffect(() => {
    if (result !== null) {
      const resetTimer = setTimeout(() => {
        resetGame()
      }, 3000) // Reset after 3 seconds
      return () => clearTimeout(resetTimer)
    }
  }, [result])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault()
        // Allow immediate restart if result screen is visible
        if (result !== null) {
          resetGame()
          return
        }
        // Prevent casting if result screen is visible (!result)
        if (gamePhase === 'ready' && !isCasting && !result) {
          startCasting()
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
        } else if (gamePhase === 'catching' && isMoving) {
          let points = 0
          const greenEnd = greenStart + greenWidth
          const redEnd = redStart + redWidth
          if (barPosition >= greenStart && barPosition <= greenEnd) {
            points = 15
            if (barPosition >= redStart && barPosition <= redEnd) {
              points = 30
            }
          }
          const newGauge = Math.min(100, gauge + points)
          const newFailures = failures + (points === 0 ? 1 : 0)
          setGauge(newGauge)
          setFailures(newFailures)
          setAttempts(prev => prev + 1)

          // 낚싯대 애니메이션
          if (points > 0) {
            setRodAnimation('success')
            setTimeout(() => setRodAnimation(''), 150)
          } else {
            setRodAnimation('fail')
            setTimeout(() => setRodAnimation(''), 150)
          }

          if (newFailures >= 3) {
            setResult('fail')
            setGamePhase('ready')
            setIsMoving(false)
          } else if (newGauge >= 100) {
            setCatchAnimation(true)
            setIsMoving(false)

            // Randomly select a fish with error handling
            try {
              if (fishData && fishData.length > 0) {
                const randomFish = fishData[Math.floor(Math.random() * fishData.length)]
                setCaughtFish(randomFish)
                console.log("Caught fish:", randomFish.name);
              } else {
                console.error("Fish data is empty or missing");
                // Fallback
                setCaughtFish({
                  name: "범고래 (Fallback)",
                  model: "/assets/models/202201.glb",
                  description: "데이터를 불러오지 못해 기본 범고래가 표시됩니다."
                });
              }
            } catch (error) {
              console.error("Error selecting fish:", error);
              setCaughtFish({
                name: "범고래 (Error)",
                model: "/assets/models/202201.glb",
                description: "오류가 발생했습니다."
              });
            }

            setTimeout(() => {
              setCatchAnimation(false)
              setResult('success')
              setGamePhase('ready')
            }, 2000)
          } else {
            const newGreenStart = Math.random() * 30 + 10
            const newGreenWidth = Math.random() * 30 + 20
            const newRedWidth = Math.random() * 10 + 5
            const newRedStart = newGreenStart + (newGreenWidth - newRedWidth) / 2

            setGreenStart(newGreenStart)
            setGreenWidth(newGreenWidth)
            setRedStart(newRedStart)
            setRedWidth(newRedWidth)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gamePhase, exclamation, isMoving, barPosition, greenStart, greenWidth, redStart, redWidth, gauge, failures, isCasting])

  const startCasting = () => {
    setIsCasting(true)
    setTimeout(() => {
      setIsCasting(false)
      setGamePhase('fishing')
    }, 1000) // Casting duration
  }

  const handleScreenClick = () => {
    // Allow immediate restart if result screen is visible
    if (result !== null) {
      resetGame()
      return
    }
    // Prevent casting if result screen is visible (!result)
    if (gamePhase === 'ready' && !isCasting && !result) {
      startCasting()
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

  const handleBarClick = () => {
    if (gamePhase === 'catching' && isMoving) {
      let points = 0
      const greenEnd = greenStart + greenWidth
      const redEnd = redStart + redWidth
      if (barPosition >= greenStart && barPosition <= greenEnd) {
        points = 15
        if (barPosition >= redStart && barPosition <= redEnd) {
          points = 30
        }
      }
      const newGauge = Math.min(100, gauge + points)
      const newFailures = failures + (points === 0 ? 1 : 0)
      setGauge(newGauge)
      setFailures(newFailures)
      setAttempts(prev => prev + 1)

      // 낚싯대 애니메이션
      if (points > 0) {
        setRodAnimation('success')
        setTimeout(() => setRodAnimation(''), 150)
      } else {
        setRodAnimation('fail')
        setTimeout(() => setRodAnimation(''), 150)
      }

      if (newFailures >= 3) {
        setResult('fail')
        setGamePhase('ready')
        setIsMoving(false)
      } else if (newGauge >= 100) {
        setCatchAnimation(true)
        setIsMoving(false)

        try {
          if (fishData && fishData.length > 0) {
            const randomFish = fishData[Math.floor(Math.random() * fishData.length)]
            setCaughtFish(randomFish)
            console.log("Caught fish (mouse):", randomFish.name);
          } else {
            console.error("Fish data is empty or missing");
            setCaughtFish({
              name: "범고래 (Fallback)",
              model: "/assets/models/202201.glb",
              description: "데이터를 불러오지 못해 기본 범고래가 표시됩니다."
            });
          }
        } catch (error) {
          console.error("Error selecting fish:", error);
          setCaughtFish({
            name: "범고래 (Error)",
            model: "/assets/models/202201.glb",
            description: "오류가 발생했습니다."
          });
        }

        setTimeout(() => {
          setCatchAnimation(false)
          setResult('success')
          setGamePhase('ready')
        }, 2000)
      } else {
        const newGreenStart = Math.random() * 30 + 10
        const newGreenWidth = Math.random() * 30 + 20
        const newRedWidth = Math.random() * 10 + 5
        const newRedStart = newGreenStart + (newGreenWidth - newRedWidth) / 2

        setGreenStart(newGreenStart)
        setGreenWidth(newGreenWidth)
        setRedStart(newRedStart)
        setRedWidth(newRedWidth)
      }
    }
  }

  const resetGame = () => {
    setGamePhase('ready')
    setExclamation(false)
    setGauge(0)
    setAttempts(0)
    setFailures(0)
    setBarPosition(0)
    setIsMoving(false)
    setResult(null)
    setIsCasting(false) // Reset casting state
    setCaughtFish(null) // Reset fish
    clearTimeout(timerRef.current)
    clearInterval(moveRef.current)
    cancelAnimationFrame(requestRef.current); // Stop line tracking animation
  }

  return (
    <div className="fishing-game" onClick={handleScreenClick}>
      <div className="game-container">
        {/* Sky and Water are part of the background image now, but we can add overlays if needed */}

        {/* Fisherman */}
        <div className={`fisherman-container ${rodAnimation}`}>
          <img src="/fisherman.png" alt="Fisherman" className="fisherman" />
        </div>

        {/* Fishing Line (SVG) - calculates line from rod tip to bobber */}
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

        {/* Bobber - Active during fishing/catching OR during casting/pulling animations */}
        {(gamePhase === 'fishing' || gamePhase === 'catching' || isCasting || catchAnimation) && (
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
        )}

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
                <div className="catching-bar" onClick={handleBarClick}>
                  <div className="gray-bar">
                    <div
                      className="green-bar"
                      style={{ left: `${greenStart}%`, width: `${greenWidth}%` }}
                    >
                      <div
                        className="red-bar"
                        style={{ left: `${((redStart - greenStart) / greenWidth) * 100}%`, width: `${redWidth}%` }}
                      ></div>
                    </div>
                    <div className="moving-bar" style={{ left: `${barPosition}%` }}></div>
                  </div>
                  <p>클릭해서 막대를 멈추세요!</p>
                  <div className="stats-container">
                    <p>포획률: {Math.round(gauge)}%</p>
                    <p>남은 기회: {3 - failures}회</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="result-overlay">
              {result === 'success' ? (
                <>
                  <h3 className="result-title success">{caughtFish ? caughtFish.name : 'Unknown Fish'}</h3>
                  {caughtFish && (
                    <div className="model-wrapper">
                      <img
                        src={caughtFish.image2d}
                        alt={caughtFish.name}
                        style={{ width: '100%', height: '80px', objectFit: 'contain', backgroundColor: '#e0f7fa', borderRadius: '8px' }}
                      />
                    </div>
                  )}
                  <p className="success-text">{caughtFish && caughtFish.ovrHbttNm ? `${caughtFish.ovrHbttNm}` : 'Great Job!'}</p>
                </>
              ) : (
                <h2 className="result-title fail">FAILED...</h2>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
