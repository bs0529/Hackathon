import { useState, useEffect, useRef } from 'react'
import './App.css'
import './components/UserInterface.css'
import './components/Bobber.css'
import { fishData } from './fishData'
import Fisherman from './components/Fisherman'
import FishingLine from './components/FishingLine'
import Bobber from './components/Bobber'
import CatchingBar from './components/CatchingBar'
import ResultOverlay from './components/ResultOverlay'
import Login from './components/Login'
import Register from './components/Register'
import Leaderboard from './components/Leaderboard'
import GameLogic from './hooks/GameLogic'
import { useUser, UserProvider } from './contexts/UserContext'

function AppContent() {
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
  const [showAuth, setShowAuth] = useState('map') // 'login' or 'register' or 'leaderboard' or 'map'
  const [currentScore, setCurrentScore] = useState(0)
  const [selectedHabitat, setSelectedHabitat] = useState(null)

  const { user, stats, logout, updateStats } = useUser()

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
    selectedHabitat,
    showAuth,
  })

  // Update user stats when game ends
  useEffect(() => {
    if (result !== null && user) {
      const gameStats = {
        result: result,
        fishCaught: result === 'success' ? 1 : 0,
        rareFish: result === 'success' && caughtFish && caughtFish.rarity === 'rare' ? 1 : 0,
        score: currentScore,
        attempts: attempts,
        failures: failures
      }
      updateStats(gameStats)
    }
  }, [result, user, caughtFish, currentScore, attempts, failures, updateStats])

  const handleScreenClick = () => {
    // Prevent any fishing interactions when modals are open
    if (showAuth !== null) {
      return
    }

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
      <div className="game-container" style={{
        backgroundImage: 'url(/sky.png), url(/ground.png)',
        backgroundSize: '100% 50%, 100% 50%',
        backgroundPosition: 'top, bottom',
        backgroundRepeat: 'no-repeat, no-repeat',
        width: '100%',
        height: '100%'
      }}>

        {/* User Interface */}
        <div className="user-interface">
          {user ? (
            <div className="user-info">
              <div className="user-stats">
                <span>환영합니다, {user.username}!</span>
                <div className="stats-display">
                  <span>총 물고기: {stats.totalFish}</span>
                  <span>희귀 물고기: {stats.rareFish}</span>
                  <span>최고 점수: {stats.highScore}</span>
                </div>
              </div>
              <div className="user-actions">
                <button onClick={(e) => { e.stopPropagation(); setShowAuth('map'); }}>
                  지도
                </button>
                <button onClick={(e) => { e.stopPropagation(); setShowAuth('leaderboard'); }}>
                  리더보드
                </button>
                <button className="logout-btn" onClick={(e) => { e.stopPropagation(); logout(); }}>
                  로그아웃
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button onClick={(e) => { e.stopPropagation(); setShowAuth('leaderboard'); }}>리더보드</button>
              <button onClick={(e) => { e.stopPropagation(); setShowAuth('login'); }}>로그인</button>
              <button onClick={(e) => { e.stopPropagation(); setShowAuth('register'); }}>회원가입</button>
            </div>
          )}
        </div>

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

        {/* Current Habitat Display */}
        {selectedHabitat && (
          <div className="current-habitat">
            현재 위치: {selectedHabitat}
          </div>
        )}

        {/* Map Button */}
        <button
          className="map-button"
          onClick={(e) => { e.stopPropagation(); setShowAuth('map'); }}
        >
          지도
        </button>

        {/* UI Overlays */}
        <div className="ui-layer">
          {result === null ? (
            <>
              {gamePhase === 'ready' && !isCasting && <div className="start-prompt"><p>클릭, 스페이스바로 낚시하기</p></div>}

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

      {/* Modals */}
      {showAuth === 'login' && (
        <Login
          onSwitchToRegister={() => setShowAuth('register')}
          onClose={() => setShowAuth(null)}
        />
      )}
      {showAuth === 'register' && (
        <Register
          onSwitchToLogin={() => setShowAuth('login')}
          onClose={() => setShowAuth(null)}
        />
      )}
      {showAuth === 'leaderboard' && (
        <Leaderboard onClose={() => setShowAuth(null)} />
      )}
      {showAuth === 'map' && (
        <div className="map-screen">
          <img src="/map.png" alt="Map" className="map-image" />
          <div className="map-buttons">
            <button onClick={() => { setSelectedHabitat('갯벌'); setShowAuth(null); }}>갯벌</button>
            <button onClick={() => { setSelectedHabitat('바다'); setShowAuth(null); }}>바다</button>
            <button onClick={() => { setSelectedHabitat('바다숲'); setShowAuth(null); }}>바다숲</button>
            <button onClick={() => { setSelectedHabitat('바닷속암반'); setShowAuth(null); }}>바닷속암반</button>
            <button onClick={() => { setSelectedHabitat('연안'); setShowAuth(null); }}>연안</button>
            <button onClick={() => { setSelectedHabitat('하구역'); setShowAuth(null); }}>하구역</button>
          </div>
          <button className="close-map" onClick={() => setShowAuth(null)}>닫기</button>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  )
}

export default App
