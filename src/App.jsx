import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./App.css";
import "./components/UserInterface.css";
import "./components/Bobber.css";
import Fisherman from "./components/Fisherman";
import Bobber from "./components/Bobber";
import CatchingBar from "./components/CatchingBar";
import ResultOverlay from "./components/ResultOverlay";
import GameLogic from "./hooks/GameLogic";
import {
  handleAction,
  getUser,
  fishing,
  getShopItems,
  buyItem,
} from "./services/api";
import { fishData } from "./fishData_original";

function App({ playerName, userId, onBackToMenu }) {
  const { habitat } = useParams();
  const navigate = useNavigate();
  const [selectedHabitat, setSelectedHabitat] = useState(habitat || "연안");
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
  const [shopItems, setShopItems] = useState([]);
  const [shopLoading, setShopLoading] = useState(false);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [preFetchedFish, setPreFetchedFish] = useState(null);
  const [actionResult, setActionResult] = useState(null);
  const [money, setMoney] = useState(0);
  const [habitatPollution, setHabitatPollution] = useState({});
  const [notification, setNotification] = useState(null);

  const bobberRef = useRef(null);

  // Fetch user info for money and pollution
  useEffect(() => {
    if (userId) {
      getUser(userId)
        .then((userData) => {
          if (userData && userData.money !== undefined) {
            setMoney(userData.money);
          }
          if (userData && userData.habitat_pollutions) {
            // habitat_pollutions 배열을 객체로 변환
            const pollutionMap = {};
            userData.habitat_pollutions.forEach((item) => {
              pollutionMap[item.habitat_name] = item.pollution_level;
            });
            setHabitatPollution(pollutionMap);
          }
        })
        .catch((err) => console.error("Failed to fetch user data:", err));
    }
  }, [userId]);

  // 낚시 시작 함수 (클릭과 스페이스바 공통)
  const startCasting = async () => {
    setIsCasting(true);

    // 낚시 시작할 때 API 호출하여 물고기 미리 가져오기
    try {
      console.log("DEBUG - fishing API 호출 전 userId:", userId);
      console.log(
        "DEBUG - fishing API 호출 전 selectedHabitat:",
        selectedHabitat
      );
      const fishResponse = await fishing(userId, selectedHabitat);
      console.log("Pre-fetched API Response:", fishResponse);
      console.log(
        "DEBUG - fishResponse 전체 구조:",
        JSON.stringify(fishResponse, null, 2)
      );

      // 응답에서 물고기 정보 추출 (새로운 API 구조)
      const isSick = fishResponse.fish?.is_sick || false;
      const apiFish = {
        species_id: fishResponse.fish?.id, // fish.id가 species_id입니다
        name: isSick
          ? `병든 ${fishResponse.fish?.name}`
          : fishResponse.fish?.name,
        originalName: fishResponse.fish?.name,
        type: fishResponse.fish?.type,
        price: fishResponse.fish?.price,
        image_url: fishResponse.fish?.image_url,
        habitat: fishResponse.fish?.habitat,
        is_new: fishResponse.is_new,
        is_sick: isSick,
        message: fishResponse.message,
      };

      console.log("DEBUG - apiFish 구조:", apiFish);

      // fishData에서 매칭되는 물고기 찾기 (3D 모델 등 추가 정보)
      const matchedFish = fishData.find((f) => f.name === apiFish.name);

      // 백엔드 image_url에 베이스 URL 추가
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://10.129.57.149:8000";
      const fullImageUrl = apiFish.image_url
        ? `${BACKEND_URL}${apiFish.image_url}`
        : null;

      const preFetchedFishData = {
        ...apiFish,
        model: matchedFish?.model || "/assets/models/202201.glb",
        image2d: fullImageUrl || matchedFish?.image2d,
        description:
          matchedFish?.description || `${apiFish.habitat}에서 잡은 물고기`,
      };

      // 이미지 미리 로드하기
      if (fullImageUrl) {
        const img = new Image();
        img.onload = () => {
          console.log("Image preloaded successfully:", fullImageUrl);
          setPreFetchedFish(preFetchedFishData);
        };
        img.onerror = () => {
          console.error("Failed to preload image:", fullImageUrl);
          // 이미지 로드 실패해도 데이터는 저장
          setPreFetchedFish(preFetchedFishData);
        };
        img.src = fullImageUrl;
      } else {
        setPreFetchedFish(preFetchedFishData);
      }

      console.log("Pre-fetched fish:", preFetchedFishData);
    } catch (error) {
      console.error("Error pre-fetching fish:", error);
      // Fallback to local data
      const filteredFish = selectedHabitat
        ? fishData.filter((fish) => fish.ovrHbttNm === selectedHabitat)
        : fishData;
      if (filteredFish && filteredFish.length > 0) {
        const randomFish =
          filteredFish[Math.floor(Math.random() * filteredFish.length)];
        setPreFetchedFish(randomFish);
      }
    }

    setTimeout(() => {
      setIsCasting(false);
      setGamePhase("fishing");
    }, 1000); // Casting duration
  };

  // Update selectedHabitat when URL parameter changes
  useEffect(() => {
    if (habitat) {
      setSelectedHabitat(decodeURIComponent(habitat));
    }
  }, [habitat]);

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
    startCasting,
  });

  const handleScreenClick = () => {
    // Prevent any fishing interactions when map, shop, or result is open
    if (showMap || showShop || result !== null) {
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

  const pollutionFilter = `hue-rotate(-${
    (habitatPollution[selectedHabitat] || 0) * 1.2
  }deg)`;

  // Helper function to refresh user data (money and pollution)
  const refreshUserData = () => {
    getUser(userId)
      .then((userData) => {
        if (userData && userData.money !== undefined) {
          setMoney(userData.money);
        }
        if (userData && userData.habitat_pollutions) {
          // habitat_pollutions 배열을 객체로 변환
          const pollutionMap = {};
          userData.habitat_pollutions.forEach((item) => {
            pollutionMap[item.habitat_name] = item.pollution_level;
          });
          setHabitatPollution(pollutionMap);
        }
      })
      .catch((err) => console.error("Failed to refresh user data:", err));
  };

  // Result overlay button handlers
  const handleRelease = async () => {
    console.log("물고기를 방생했습니다:", caughtFish?.name);
    console.log("DEBUG - caughtFish:", caughtFish);
    console.log("DEBUG - userId:", userId);
    console.log("DEBUG - selectedHabitat:", selectedHabitat);

    if (caughtFish?.species_id && userId) {
      try {
        console.log("DEBUG - API 호출 시작:", {
          userId,
          species_id: caughtFish.species_id,
          action: "RELEASE",
          habitat: selectedHabitat,
          is_sick: caughtFish.is_sick,
        });
        const response = await handleAction(
          userId,
          caughtFish.species_id,
          "RELEASE",
          selectedHabitat,
          caughtFish.is_sick
        );
        // 서버 메시지가 있으면 알림에 표시
        if (response?.message) {
          setNotification({ message: response.message, type: "release" });
          setTimeout(() => setNotification(null), 5000);
        }
        console.log("방생 처리 완료", response);
        setActionResult({
          type: "release",
          success: true,
          message: `${caughtFish.name}을(를) 방생했습니다!`,
          data: response,
        });
        // 방생 후 유저 데이터 갱신 (오염도 등)
        refreshUserData();
      } catch (error) {
        console.error("방생 API 호출 실패:", error);
        setActionResult({
          type: "release",
          success: false,
          message: "방생 처리에 실패했습니다.",
        });
      }
    } else {
      setActionResult({
        type: "release",
        success: true,
        message: `${caughtFish?.name || "물고기"}을(를) 방생했습니다!`,
      });
    }

    setTimeout(() => {
      setActionResult(null);
      resetGame();
    }, 2000);
  };

  const handleSell = async () => {
    console.log("물고기를 판매했습니다:", caughtFish?.name);
    console.log("DEBUG - caughtFish:", caughtFish);
    console.log("DEBUG - userId:", userId);
    console.log("DEBUG - selectedHabitat:", selectedHabitat);

    if (caughtFish?.species_id && userId) {
      try {
        console.log("DEBUG - API 호출 시작:", {
          userId,
          species_id: caughtFish.species_id,
          action: "SELL",
          habitat: selectedHabitat,
          is_sick: caughtFish.is_sick,
        });
        const response = await handleAction(
          userId,
          caughtFish.species_id,
          "SELL",
          selectedHabitat,
          caughtFish.is_sick
        );
        // 서버 메시지가 있으면 알림에 표시
        if (response?.message) {
          setNotification({ message: response.message, type: "sell" });
          setTimeout(() => setNotification(null), 5000);
        }
        console.log("판매 처리 완료", response);
        setActionResult({
          type: "sell",
          success: true,
          message: `${caughtFish.name}을(를) 판매했습니다!`,
          money:
            response?.money_earned || response?.earned_money || response?.price,
          data: response,
        });
        // 판매 후 최신 유저 정보 가져오기
        if (response && response.user_money !== undefined) {
          setMoney(response.user_money);
        } else if (response && response.money !== undefined) {
          setMoney(response.money);
        }
        // 추가로 유저 정보 다시 fetch하여 확실하게 동기화
        refreshUserData();
      } catch (error) {
        console.error("판매 API 호출 실패:", error);
        setActionResult({
          type: "sell",
          success: false,
          message: "판매 처리에 실패했습니다.",
        });
      }
    } else {
      setActionResult({
        type: "sell",
        success: true,
        message: `${caughtFish?.name || "물고기"}을(를) 판매했습니다!`,
        money: caughtFish?.price,
      });
    }

    setTimeout(() => {
      setActionResult(null);
      resetGame();
    }, 2000);
  };

  const handleSendToAquarium = async () => {
    console.log("물고기를 아쿠아리움으로 보냈습니다:", caughtFish?.name);
    console.log("DEBUG - caughtFish:", caughtFish);
    console.log("DEBUG - userId:", userId);
    console.log("DEBUG - selectedHabitat:", selectedHabitat);

    if (caughtFish?.species_id && userId) {
      try {
        console.log("DEBUG - API 호출 시작:", {
          userId,
          species_id: caughtFish.species_id,
          action: "AQUARIUM",
          habitat: selectedHabitat,
          is_sick: caughtFish.is_sick,
        });
        const response = await handleAction(
          userId,
          caughtFish.species_id,
          "AQUARIUM",
          selectedHabitat,
          caughtFish.is_sick
        );
        // 서버 메시지가 있으면 알림에 표시
        if (response?.message) {
          setNotification({ message: response.message, type: "aquarium" });
          setTimeout(() => setNotification(null), 5000);
        }
        console.log("아쿠아리움 수송 처리 완료", response);
        setActionResult({
          type: "aquarium",
          success: true,
          message: `${caughtFish.name}을(를) 아쿠아리움으로 보냈습니다!`,
          money: response?.money_change || response?.cost,
          data: response,
        });
        // 아쿠아리움 수송 후 유저 데이터 갱신
        refreshUserData();
      } catch (error) {
        console.error("아쿠아리움 수송 API 호출 실패:", error);
        setActionResult({
          type: "aquarium",
          success: false,
          message: "아쿠아리움 수송에 실패했습니다.",
        });
      }
    } else {
      setActionResult({
        type: "aquarium",
        success: true,
        message: `${
          caughtFish?.name || "물고기"
        }을(를) 아쿠아리움으로 보냈습니다!`,
      });
    }

    setTimeout(() => {
      setActionResult(null);
      resetGame();
    }, 2000);
  };

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
            filter: selectedHabitat === "바닷속암반" ? pollutionFilter : "none",
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
            filter: `hue-rotate(-${
              (habitatPollution[selectedHabitat] || 0) * 1.2
            }deg)`,
          }}
        />

        {/* User Interface */}
        <div className="user-interface">
          <div className="user-info">
            <div className="user-stats">
              <span>플레이어: {playerName}</span>
              <span style={{ color: "black" }}>|</span>
              <span className="user-money">{money.toLocaleString()}원</span>
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
                onClick={async (e) => {
                  e.stopPropagation();
                  resetGame();
                  setShowShop(true);
                  setShopLoading(true);
                  try {
                    const items = await getShopItems();
                    setShopItems(items || []);
                  } catch (err) {
                    console.error("Failed to fetch shop items:", err);
                    setShopItems([]);
                  }
                  setShopLoading(false);
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

        {/* Fisherman with Fishing Line */}
        <Fisherman
          rodAnimation={rodAnimation}
          bobberRef={bobberRef}
          gamePhase={gamePhase}
          isCasting={isCasting}
        />

        {/* Bobber - Active during fishing/catching OR during casting/pulling animations */}
        <Bobber
          gamePhase={gamePhase}
          isCasting={isCasting}
          catchAnimation={catchAnimation}
          exclamation={exclamation}
          bobberRef={bobberRef}
          caughtFish={caughtFish}
        />

        {/* Current Habitat Display */}
        {selectedHabitat && (
          <>
            <div className="current-habitat">
              현재 위치: {selectedHabitat}
              <div className="pollution-display">
                오염도:
                <span
                  className="pollution-value"
                  style={{
                    color:
                      (habitatPollution[selectedHabitat] || 0) < 30
                        ? "#4CAF50" // Green
                        : (habitatPollution[selectedHabitat] || 0) <= 70
                        ? "#FFC107" // Yellow/Amber
                        : "#F44336", // Red
                    fontWeight: "bold",
                  }}
                >
                  {habitatPollution[selectedHabitat] !== undefined
                    ? `${habitatPollution[selectedHabitat]}%`
                    : "측정 중..."}
                </span>
              </div>
              {notification && (
                <div
                  className={`notification-area notification-${
                    notification.type || "default"
                  }`}
                >
                  <span className="notification-message">
                    {notification.message}
                  </span>
                </div>
              )}
            </div>
          </>
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
            <ResultOverlay
              result={result}
              caughtFish={caughtFish}
              onRelease={handleRelease}
              onSell={handleSell}
              onSendToAquarium={handleSendToAquarium}
              actionResult={actionResult}
              onClose={resetGame}
            />
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
                const newHabitat = "갯벌";
                setSelectedHabitat(newHabitat);
                navigate(`/game/${encodeURIComponent(newHabitat)}`);
                setShowMap(false);
              }}
            >
              갯벌
            </button>
            <button
              onClick={() => {
                const newHabitat = "바다";
                setSelectedHabitat(newHabitat);
                navigate(`/game/${encodeURIComponent(newHabitat)}`);
                setShowMap(false);
              }}
            >
              바다
            </button>
            <button
              onClick={() => {
                const newHabitat = "바다숲";
                setSelectedHabitat(newHabitat);
                navigate(`/game/${encodeURIComponent(newHabitat)}`);
                setShowMap(false);
              }}
            >
              바다숲
            </button>
            <button
              onClick={() => {
                const newHabitat = "바닷속암반";
                setSelectedHabitat(newHabitat);
                navigate(`/game/${encodeURIComponent(newHabitat)}`);
                setShowMap(false);
              }}
            >
              바닷속암반
            </button>
            <button
              onClick={() => {
                const newHabitat = "연안";
                setSelectedHabitat(newHabitat);
                navigate(`/game/${encodeURIComponent(newHabitat)}`);
                setShowMap(false);
              }}
            >
              연안
            </button>
            <button
              onClick={() => {
                const newHabitat = "하구역";
                setSelectedHabitat(newHabitat);
                navigate(`/game/${encodeURIComponent(newHabitat)}`);
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
            <div className="shop-header">
              <h2>🎣 상점</h2>
              <div className="shop-user-info">
                <span className="shop-user-name">👤 {playerName}</span>
                <span className="shop-user-money">
                  💰 {money.toLocaleString()}원
                </span>
              </div>
            </div>
            {shopLoading ? (
              <div className="shop-loading">로딩 중...</div>
            ) : (
              <div className="shop-items">
                {shopItems.length > 0 ? (
                  shopItems.map((item) => (
                    <div
                      className="shop-item"
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        setShowPurchaseConfirm(true);
                      }}
                    >
                      <img
                        src={item.image_url || "/fishing_rod.png"}
                        alt={item.name}
                      />
                      <div className="shop-item-info">
                        <p className="shop-item-name">{item.name}</p>
                        <p className="shop-item-price">
                          {item.price?.toLocaleString()}원
                        </p>
                        {item.effect && (
                          <p className="shop-item-effect">{item.effect}</p>
                        )}
                        {item.trash_reduction && (
                          <p className="shop-item-effect">
                            🗑️ 쓰레기 감소: {item.trash_reduction}%
                          </p>
                        )}
                        {item.good_fish_bonus && (
                          <p className="shop-item-effect">
                            🐟 좋은 물고기 확률: +{item.good_fish_bonus}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="shop-empty">상점에 아이템이 없습니다.</p>
                )}
              </div>
            )}
          </div>
          <button className="shop-close-btn" onClick={() => setShowShop(false)}>
            닫기
          </button>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseConfirm && selectedItem && (
        <div className="purchase-confirm-modal">
          <div className="modal-content">
            <h3>{selectedItem.name}</h3>
            <p className="purchase-price">
              가격: {selectedItem.price?.toLocaleString()}원
            </p>
            <p>구매하시겠습니까?</p>
            <div className="modal-buttons">
              <button
                onClick={async () => {
                  try {
                    const response = await buyItem(userId, selectedItem.id);
                    setPurchaseMessage(
                      response?.message ||
                        `${selectedItem.name}을(를) 구매했습니다!`
                    );
                    setShowPurchaseConfirm(false);
                    setShowPurchaseSuccess(true);
                    // 구매 후 유저 정보 갱신
                    refreshUserData();
                  } catch (error) {
                    console.error("Purchase failed:", error);
                    setPurchaseMessage(
                      error.response?.data?.detail || "구매에 실패했습니다."
                    );
                    setShowPurchaseConfirm(false);
                    setShowPurchaseSuccess(true);
                  }
                }}
              >
                확인
              </button>
              <button
                onClick={() => {
                  setShowPurchaseConfirm(false);
                  setSelectedItem(null);
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Result Modal */}
      {showPurchaseSuccess && (
        <div className="purchase-confirm-modal">
          <div className="modal-content">
            <p>{purchaseMessage}</p>
            <div className="modal-buttons">
              <button
                onClick={() => {
                  setShowPurchaseSuccess(false);
                  setSelectedItem(null);
                  setPurchaseMessage("");
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
