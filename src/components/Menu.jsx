import "./Menu.css";

function Menu({ onStartGame, playerName, onLogout, onShowCollection, onShowAquarium }) {
  return (
    <div className="menu-screen">
      <div className="menu-container">
        <div className="menu-content">
          <h1 className="game-title">다나까</h1>
          <p className="game-subtitle">플레이어: {playerName}</p>

          <div className="menu-buttons">
            <button className="menu-button primary" onClick={onStartGame}>
              게임 시작
            </button>
            <button className="menu-button" onClick={onShowCollection}>
              도감
            </button>
            <button className="menu-button" onClick={onShowAquarium}>아쿠아리움</button>
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
