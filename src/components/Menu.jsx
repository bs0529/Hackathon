import { useState, useEffect } from "react";
import { getUser } from "../services/api";
import "./Menu.css";

function Menu({
  onStartGame,
  playerName,
  userId,
  onLogout,
  onShowCollection,
  onShowAquarium,
}) {
  const [money, setMoney] = useState(0);

  useEffect(() => {
    if (userId) {
      getUser(userId)
        .then((data) => {
          console.log(data);
          setMoney(data.money);
        })
        .catch((error) => {
          console.error("Failed to fetch user data:", error);
        });
    }
  }, [userId]);

  return (
    <div className="menu-screen">
      <div className="menu-container">
        <div className="menu-content">
          <h1 className="game-title">다나까</h1>
          <p className="game-subtitle">플레이어: {playerName}</p>
          <p className="game-money">보유 금액: {money}원</p>

          <div className="menu-buttons">
            <button className="menu-button primary" onClick={onStartGame}>
              게임 시작
            </button>
            <button className="menu-button" onClick={onShowCollection}>
              도감
            </button>
            <button className="menu-button" onClick={onShowAquarium}>
              아쿠아리움
            </button>
            <button className="menu-button logout" onClick={onLogout}>
              로그아웃
            </button>
          </div>
        </div>
        {/* Pixel ocean */}
        <div className="pixel-ocean">
          <img src="sea_ground.png" alt="" />
        </div>
      </div>
    </div>
  );
}

export default Menu;
