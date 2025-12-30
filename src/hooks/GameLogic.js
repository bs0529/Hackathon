import { useEffect, useRef } from "react";
import { invalidateLastFish } from "../services/api";
import { fishData } from "../fishData_original";

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
  selectedHabitat,
  showMap,
  userId,
  preFetchedFish,
  setPreFetchedFish,
  startCasting,
}) => {
  const timerRef = useRef(null);
  const moveRef = useRef(null);

  useEffect(() => {
    if (gamePhase === "fishing") {
      const delay = Math.random() * 1500 + 500;
      timerRef.current = setTimeout(() => {
        setExclamation(true);
      }, delay);
    }
    return () => clearTimeout(timerRef.current);
  }, [gamePhase]);

  useEffect(() => {
    if (isMoving) {
      moveRef.current = setInterval(() => {
        setBarPosition((prev) => {
          let newPos = prev + direction * 3;
          if (newPos >= 100) {
            newPos = 100;
            setDirection(-1);
          } else if (newPos <= 0) {
            newPos = 0;
            setDirection(1);
          }
          return newPos;
        });
      }, 20);
    } else {
      clearInterval(moveRef.current);
    }
    return () => clearInterval(moveRef.current);
  }, [isMoving, direction, setBarPosition, setDirection]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault();

        // Prevent any fishing interactions when map or result is open
        if (showMap || result !== null) {
          return;
        }

        // Prevent casting if result screen is visible (!result)
        if (gamePhase === "ready" && !isCasting && !result) {
          startCasting();
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
        } else if (gamePhase === "catching" && isMoving) {
          handleBarStop();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    gamePhase,
    exclamation,
    isMoving,
    barPosition,
    greenStart,
    greenWidth,
    redStart,
    redWidth,
    gauge,
    failures,
    isCasting,
    result,
    showMap,
    startCasting,
  ]);

  const handleBarStop = () => {
    // Prevent bar interactions when map is open
    if (showMap) {
      return;
    }

    let points = 0;
    const greenEnd = greenStart + greenWidth;
    const redEnd = redStart + redWidth;
    if (barPosition >= greenStart && barPosition <= greenEnd) {
      points = 15;
      if (barPosition >= redStart && barPosition <= redEnd) {
        points = 30;
      }
    }
    const newGauge = Math.min(100, gauge + points);
    const newFailures = failures + (points === 0 ? 1 : 0);
    setGauge(newGauge);
    setFailures(newFailures);
    setAttempts((prev) => prev + 1);

    // 낚싯대 애니메이션
    if (points > 0) {
      setRodAnimation("success");
      setTimeout(() => setRodAnimation(""), 150);
    } else {
      setRodAnimation("fail");
      setTimeout(() => setRodAnimation(""), 150);
    }

    if (newFailures >= 3) {
      // 낚시 실패 시 마지막 물고기 무효화
      if (preFetchedFish) {
        invalidateLastFish(userId)
          .then(() => {
            console.log("Successfully invalidated last fish");
          })
          .catch((error) => {
            console.error("Failed to invalidate last fish:", error);
          });
      }
      setResult("fail");
      setGamePhase("ready");
      setIsMoving(false);
    } else if (newGauge >= 100) {
      setIsMoving(false);

      // 프리페치된 물고기 데이터 사용 (이미 이미지도 로드되어 있음)
      if (preFetchedFish) {
        setCaughtFish(preFetchedFish);
        console.log("Using pre-fetched fish:", preFetchedFish);
      } else {
        // 프리페치 실패 시 fallback
        console.warn("No pre-fetched fish available, using fallback");
        const filteredFish = selectedHabitat
          ? fishData.filter((fish) => fish.ovrHbttNm === selectedHabitat)
          : fishData;
        if (filteredFish && filteredFish.length > 0) {
          const randomFish =
            filteredFish[Math.floor(Math.random() * filteredFish.length)];
          setCaughtFish(randomFish);
        } else {
          setCaughtFish({
            name: "범고래 (Fallback)",
            model: "/assets/models/202201.glb",
            description: "데이터를 불러오지 못해 기본 범고래가 표시됩니다.",
          });
        }
      }

      // 물고기 데이터 설정 후 애니메이션 시작
      setCatchAnimation(true);

      setTimeout(() => {
        setCatchAnimation(false);
        setResult("success");
        setGamePhase("ready");
      }, 3000);
    } else {
      const newGreenStart = Math.random() * 30 + 10;
      const newGreenWidth = Math.random() * 30 + 20;
      const newRedWidth = Math.random() * 10 + 5;
      const newRedStart = newGreenStart + (newGreenWidth - newRedWidth) / 2;

      setGreenStart(newGreenStart);
      setGreenWidth(newGreenWidth);
      setRedStart(newRedStart);
      setRedWidth(newRedWidth);
    }
  };

  const resetGame = () => {
    setGamePhase("ready");
    setExclamation(false);
    setGauge(0);
    setAttempts(0);
    setFailures(0);
    setBarPosition(0);
    setIsMoving(false);
    setResult(null);
    setIsCasting(false); // Reset casting state
    setCaughtFish(null); // Reset fish
    setPreFetchedFish(null); // Reset pre-fetched fish
    clearTimeout(timerRef.current);
    clearInterval(moveRef.current);
  };

  // Expose resetGame and handleBarStop for external use if needed
  return { resetGame, handleBarStop };
};

export default GameLogic;
