import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import StartScreen from "./StartScreen";
import NicknameInput from "./NicknameInput";
import Menu from "./Menu";
import App from "../App";
import Collection from "./collection/Collection";
import CollectionDetail from "./collection/CollectionDetail";
import { createUser } from "../services/api";
import "../App.css";

const USER_STORAGE_KEY = "ocean_rescue_user";

function GameFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const [playerName, setPlayerName] = useState("");
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHabitat, setSelectedHabitat] = useState(null);

  // 로컬스토리지에서 유저 정보 복원
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log("Restored user from localStorage:", userData);
        setPlayerName(userData.nickname);
        setUserId(userData.id);
        if (location.pathname === "/") {
          navigate("/menu");
        }
      } catch (error) {
        console.error("Failed to restore user data:", error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, [location.pathname, navigate]);

  const saveUserToLocalStorage = (userData) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  };

  const handlePressStart = () => {
    navigate("/nickname");
  };

  const handleNicknameSubmit = async (name) => {
    setIsLoading(true);
    try {
      // API를 통해 유저 생성
      const userData = await createUser(name);

      console.log("User created:", userData);

      const userInfo = {
        id: userData.id,
        nickname: userData.nickname,
      };

      // 로컬스토리지에 저장
      saveUserToLocalStorage(userInfo);

      setPlayerName(userData.nickname);
      setUserId(userData.id);
      navigate("/menu");
    } catch (error) {
      console.error("Failed to create user:", error);
      // 에러 발생 시에도 로컬에서 진행 (오프라인 모드)
      const tempUserId = Date.now();
      const userInfo = {
        id: tempUserId,
        nickname: name,
      };

      // 로컬스토리지에 저장
      saveUserToLocalStorage(userInfo);

      setPlayerName(name);
      setUserId(tempUserId);
      navigate("/menu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = () => {
    navigate("/map");
  };

  const handleSelectHabitat = (habitat) => {
    setSelectedHabitat(habitat);
    navigate(`/game/${encodeURIComponent(habitat)}`);
  };

  const handleBackToMenu = () => {
    navigate("/menu");
  };

  const handleShowCollection = () => {
    navigate("/collection");
  };

  const handleLogout = () => {
    // 로컬스토리지에서 유저 정보 삭제
    localStorage.removeItem(USER_STORAGE_KEY);
    console.log("User logged out");

    // 상태 초기화
    setPlayerName("");
    setUserId(null);
    navigate("/");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<StartScreen onPressStart={handlePressStart} />}
      />
      <Route
        path="/nickname"
        element={
          <NicknameInput
            onSubmit={handleNicknameSubmit}
            isLoading={isLoading}
          />
        }
      />
      <Route
        path="/menu"
        element={
          <Menu
            onStartGame={handleStartGame}
            playerName={playerName}
            userId={userId}
            onLogout={handleLogout}
            onShowCollection={handleShowCollection}
          />
        }
      />
      <Route
        path="/map"
        element={
          <div className="map-screen">
            <img src="/map.png" alt="Map" className="map-image" />
            <div className="map-buttons">
              <button onClick={() => handleSelectHabitat("갯벌")}>갯벌</button>
              <button onClick={() => handleSelectHabitat("바다")}>바다</button>
              <button onClick={() => handleSelectHabitat("바다숲")}>
                바다숲
              </button>
              <button onClick={() => handleSelectHabitat("바닷속암반")}>
                바닷속암반
              </button>
              <button onClick={() => handleSelectHabitat("연안")}>연안</button>
              <button onClick={() => handleSelectHabitat("하구역")}>
                하구역
              </button>
            </div>
            <button className="close-map" onClick={handleBackToMenu}>
              메뉴로 돌아가기
            </button>
          </div>
        }
      />
      <Route
        path="/game/:habitat"
        element={
          <App
            playerName={playerName}
            userId={userId}
            onBackToMenu={handleBackToMenu}
          />
        }
      />
      <Route
        path="/collection"
        element={<Collection onClose={handleBackToMenu} />}
      />
      <Route path="/collection/:fishId" element={<CollectionDetail />} />
    </Routes>
  );
}

export default GameFlow;
