import "./Menu.css";

function Menu({ onStartGame, playerName, onLogout, onShowCollection }) {
  return (
    <div className="menu-screen">
      <div className="menu-container">
        <div className="menu-content">
          <h1 className="game-title">바다를 되살리자</h1>
          <p className="game-subtitle">플레이어: {playerName}</p>

          <div className="menu-buttons">
            <button className="menu-button primary" onClick={onStartGame}>
              게임 시작
            </button>
            <button className="menu-button" onClick={onShowCollection}>
              도감
            </button>
            <button className="menu-button">아쿠아리움</button>
            <button className="menu-button logout" onClick={onLogout}>
              로그아웃
            </button>
          </div>
        </div>

        {/* Pixel ocean */}
        <div className="pixel-ocean">
          <div className="ocean-wave wave-1"></div>
          <div className="ocean-wave wave-2"></div>
          <div className="ocean-wave wave-3"></div>

          {/* Underwater effects */}
          <div className="underwater-effects">
            <div className="bubble bubble-1"></div>
            <div className="bubble bubble-2"></div>
            <div className="bubble bubble-3"></div>
            <div className="bubble bubble-4"></div>
            <div className="bubble bubble-5"></div>
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="seaweed seaweed-1"></div>
            <div className="seaweed seaweed-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Menu;
