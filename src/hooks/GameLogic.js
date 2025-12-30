import { useEffect, useRef } from 'react'
import { fishData } from '../fishData'

const GameLogic = ({
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
}) => {
  const timerRef = useRef(null)
  const moveRef = useRef(null)

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
  }, [isMoving, direction, setBarPosition, setDirection])

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
          handleBarStop()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gamePhase, exclamation, isMoving, barPosition, greenStart, greenWidth, redStart, redWidth, gauge, failures, isCasting, result])

  const startCasting = () => {
    setIsCasting(true)
    setTimeout(() => {
      setIsCasting(false)
      setGamePhase('fishing')
    }, 1000) // Casting duration
  }

  const handleBarStop = () => {
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
  }

  // Expose resetGame and handleBarStop for external use if needed
  return { resetGame, handleBarStop }
}

export default GameLogic
