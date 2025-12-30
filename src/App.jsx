import { useState, useEffect, useRef } from "react";
import "./App.css";
import "./components/UserInterface.css";
import "./components/Bobber.css"; 
import Fisherman from "./components/Fisherman";
import FishingLine from "./components/FishingLine";
import Bobber from "./components/Bobber";
import CatchingBar from "./components/CatchingBar";
import ResultOverlay from "./components/ResultOverlay";
import GameLogic from "./hooks/GameLogic";

function App({
  playerName,
  userId,
  selectedHabitat: initialHabitat,
  onBackToMenu,
}) {
  const [gamePhase, setGamePhase] = useState("ready");
  const [exclamation, setExclamation] = useState(false);
  const [gauge, setGauge] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [failures, setFailures] = useState(0);
  const [barPosition, setBarPosition] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState(1);
  const [greenStart, setGreenStart] = useState(20);
  const [greenWidth, setGreenWidth] = useState(60);
  const [redStart, setRedStart] = useState(40);
  const [redWidth, setRedWidth] = useState(20);
  const [result, setResult] = useState(null);
  const [rodAnimation, setRodAnimation] = useState("");
  const [catchAnimation, setCatchAnimation] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [caughtFish, setCaughtFish] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [selectedRod, setSelectedRod] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [selectedHabitat, setSelectedHabitat] = useState(initialHabitat);
  const [preFetchedFish, setPreFetchedFish] = useState(null);

  const bobberRef = useRef(null);
  const lineRef = useRef(null);

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
    showMap,
    userId,
    preFetchedFish,
    setPreFetchedFish,
  });

  const handleScreenClick = () => {
    // Prevent any fishing interactions when map or shop is open
    if (showMap || showShop) {
      return;
    }

    // Allow immediate restart if result screen is visible
    if (result !== null) {
      resetGame();
      return;
    }
    // Prevent casting if result screen is visible (!result)
    if (gamePhase === "ready" && !isCasting && !result) {
      setIsCasting(true);
      setTimeout(() => {
        setIsCasting(false);
        setGamePhase("fishing");
      }, 1000); // Casting duration
    } else if (gamePhase === "fishing" && exclamation) {
      const newGreenStart = Math.random() * 30 + 10;
      const newGreenWidth = Math.random() * 10 + 20; // 20% ~ 30%
      const newRedWidth = Math.random() * 5 + 5; // 5% ~ 10%
      const newRedStart = newGreenStart + (newGreenWidth - newRedWidth) / 2; // 가운데

      setGreenStart(newGreenStart);
      setGreenWidth(newGreenWidth);
      setRedStart(newRedStart);
      setRedWidth(newRedWidth);

      setGamePhase("catching");
      setIsMoving(true);
      setExclamation(false);
      setBarPosition(0);
      setDirection(1);
    }
  };

  // Function to get background images based on habitat
  const getBackgroundImages = (habitat) => {
    switch (habitat) {
      case "바다":
        return { sky: "/sea_sky.png", ground: "/sea_ground.png" };
      case "하구역":
        return { sky: "/estuary_sky.png", ground: "/estuary_ground.png" };
      case "바닷속암반":
        return {
          sky: "/Undersea_rocks_sky.png",
          ground: "/Undersea_rocks_ground.png",
        };
      case "바다숲":
        return { sky: "/sea_forest_sky.png", ground: "/sea_forest_ground.png" };
      case "갯벌":
        return { sky: "/foreshore_sky.png", ground: "/foreshore_ground.png" };
      case "연안":
        return { sky: "/coast_sky.png", ground: "/coast_ground.png" };
      default:
        return { sky: "/coast_sky.png", ground: "/coast_ground.png" };
    }
  };

  const backgroundImages = getBackgroundImages(selectedHabitat);

  // Function to get background images based on habitat
  const getBackgroundImages = (habitat) => {
    switch (habitat) {
      case '바다':
        return { sky: '/sea_sky.png', ground: '/sea_ground.png' }
      case '하구역':
        return { sky: '/estuary_sky.png', ground: '/estuary_ground.png' }
      case '바닷속암반':
        return { sky: '/Undersea_rocks_sky.png', ground: '/Undersea_rocks_ground.png' }
      case '바다숲':
        return { sky: '/sea_forest_sky.png', ground: '/sea_forest_ground.png' }
      case '갯벌':
        return { sky: '/foreshore_sky.png', ground: '/foreshore_ground.png' }
      case '연안':
        return { sky: '/coast_sky.png', ground: '/coast_ground.png' }
      default:
        return { sky: '/coast_sky.png', ground: '/coast_ground.png' }
    }
  }

  const backgroundImages = getBackgroundImages(selectedHabitat)

  return (
    <div className="fishing-game" onClick={handleScreenClick}>
      <div className="game-container">
        {/* Background Images */}
        <img
          src={backgroundImages.sky}
          alt="Sky Background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "50%",
            objectFit: "fill",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        <img
          src={backgroundImages.ground}
          alt="Ground Background"
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: "100%",
            height: "70%",
            objectFit: "fill",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* User Interface */}
        <div className="user-interface">
          <div className="user-info">
            <div className="user-stats">
              <span>플레이어: {playerName}</span>
            </div>
            <div className="user-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMap(true);
                }}
              >
                지도
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetGame();
                  setShowShop(true);
                }}
              >
                상점
              </button>
              <button
                className="menu-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onBackToMenu();
                }}
              >
                메뉴로
              </button>
            </div>
          </div>
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
            src={
              caughtFish && caughtFish.image2d ? caughtFish.image2d : "/fs.png"
            }
            alt="Caught Fish"
            className="pulling-whale"
          />
        )}

        {/* Current Habitat Display */}
        {selectedHabitat && (
          <div className="current-habitat">현재 위치: {selectedHabitat}</div>
        )}

        {/* UI Overlays */}
        <div className="ui-layer">
          {result === null ? (
            <>
              {gamePhase === "ready" && !isCasting && (
                <div className="start-prompt">
                  <p>클릭, 스페이스바로 낚시하기</p>
                </div>
              )}

              {gamePhase === "catching" && !catchAnimation && (
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

      {/* Map Modal */}
      {showMap && (
        <div className="map-screen">
          <img src="/map.png" alt="Map" className="map-image" />
          <div className="map-buttons">
            <button
              onClick={() => {
                setSelectedHabitat("갯벌");
                setShowMap(false);
              }}
            >
              갯벌
            </button>
            <button
              onClick={() => {
                setSelectedHabitat("바다");
                setShowMap(false);
              }}
            >
              바다
            </button>
            <button
              onClick={() => {
                setSelectedHabitat("바다숲");
                setShowMap(false);
              }}
            >
              바다숲
            </button>
            <button
              onClick={() => {
                setSelectedHabitat("바닷속암반");
                setShowMap(false);
              }}
            >
              바닷속암반
            </button>
            <button
              onClick={() => {
                setSelectedHabitat("연안");
                setShowMap(false);
              }}
            >
              연안
            </button>
            <button
              onClick={() => {
                setSelectedHabitat("하구역");
                setShowMap(false);
              }}
            >
              하구역
            </button>
          </div>
          <button className="close-map" onClick={() => setShowMap(false)}>
            닫기
          </button>
        </div>
      )}

      {/* Shop Modal */}
      {showShop && (
        <div className="shop-screen">
          <div className="shop-content">
            <h2>상점</h2>
            <div className="shop-items">
            <div className="shop-item" onClick={() => {
              setSelectedRod('머찐 낚싯대');
              setShowPurchaseConfirm(true);
            }}>
              <img src="/cool_fishing_rod.png" alt="Fishing Rod 1" />
              <p>머찐 낚싯대</p>
            </div>
            <div className="shop-item" onClick={() => {
              setSelectedRod('메우 믓찐 낚싯대');
              setShowPurchaseConfirm(true);
            }}>
              <img src="/hansome_fishing_rod.png" alt="Fishing Rod 2" />
              <p>메우 믓찐 낚싯대</p>
            </div>
            </div>
          </div>
          <button onClick={() => setShowShop(false)}>닫기</button>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseConfirm && (
        <div className="purchase-confirm-modal">
          <div className="modal-content">
            <p>{selectedRod}을 구매하시겠습니까?</p>
            <div className="modal-buttons">
              <button onClick={() => {
                setShowPurchaseConfirm(false);
                setShowPurchaseSuccess(true);
              }}>확인</button>
              <button onClick={() => setShowPurchaseConfirm(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Success Modal */}
      {showPurchaseSuccess && (
        <div className="purchase-confirm-modal">
          <div className="modal-content">
            <p>구매 완료!</p>
            <div className="modal-buttons">
              <button onClick={() => setShowPurchaseSuccess(false)}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
