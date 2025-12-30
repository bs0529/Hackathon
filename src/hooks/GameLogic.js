import { useEffect, useRef } from "react";
import { fishData } from "../fishData";
import { fishing } from "../services/api";

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

  // Auto-reset game after showing result
  useEffect(() => {
    if (result !== null) {
      const resetTimer = setTimeout(() => {
        resetGame();
      }, 3000); // Reset after 3 seconds
      return () => clearTimeout(resetTimer);
    }
  }, [result]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault();

        // Prevent any fishing interactions when map is open
        if (showMap) {
          return;
        }

        // Allow immediate restart if result screen is visible
        if (result !== null) {
          resetGame();
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
  ]);

  const startCasting = () => {
    setIsCasting(true);
    setTimeout(() => {
      setIsCasting(false);
      setGamePhase("fishing");
    }, 1000); // Casting duration
  };

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
      setResult("fail");
      setGamePhase("ready");
      setIsMoving(false);
    } else if (newGauge >= 100) {
      setIsMoving(false);

      // Call fishing API
      const fetchFish = async () => {
        try {
          const fishResponse = await fishing(userId, selectedHabitat);
          console.log("API Response:", fishResponse);

          // 응답에서 물고기 정보 추출
          const apiFish = {
            name: fishResponse.fish.name,
            type: fishResponse.fish.type,
            price: fishResponse.fish.price,
            image_url: fishResponse.fish.image_url,
            habitat: fishResponse.fish.habitat,
            is_new: fishResponse.is_new,
            message: fishResponse.message,
          };

          // fishData에서 매칭되는 물고기 찾기 (3D 모델 등 추가 정보)
          const matchedFish = fishData.find((f) => f.name === apiFish.name);

          // 백엔드 image_url에 베이스 URL 추가
          const fullImageUrl = apiFish.image_url
            ? `http://10.129.57.149:8000${apiFish.image_url}`
            : null;

          const caughtFishData = {
            ...apiFish,
            model: matchedFish?.model || "/assets/models/202201.glb",
            image2d: fullImageUrl || matchedFish?.image2d,
            description:
              matchedFish?.description || `${apiFish.habitat}에서 잡은 물고기`,
          };

          setCaughtFish(caughtFishData);
          console.log("Caught fish:", caughtFishData);

          // 물고기 데이터 설정 후 애니메이션 시작
          setCatchAnimation(true);
        } catch (error) {
          console.error("Error calling fishing API:", error);
          // Fallback to local data
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

          // Fallback인 경우에도 애니메이션 시작
          setCatchAnimation(true);
        }
      };

      fetchFish();

      setTimeout(() => {
        setCatchAnimation(false);
        setResult("success");
        setGamePhase("ready");
      }, 2000);
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
    clearTimeout(timerRef.current);
    clearInterval(moveRef.current);
  };

  // Expose resetGame and handleBarStop for external use if needed
  return { resetGame, handleBarStop };
};

export default GameLogic;
