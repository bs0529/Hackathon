import './Menu.css'

function Menu({ onStartGame, playerName }) {
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
            <button className="menu-button">
              도감
            </button>
            <button className="menu-button">
              아쿠아리움
            </button>
            <button className="menu-button">
              설정
            </button>
          </div>
        </div>

        {/* Pixel decorations */}
        <div className="menu-decoration">
          <div className="floating-element floating-1">🐟</div>
          <div className="floating-element floating-2">🐠</div>
          <div className="floating-element floating-3">🦀</div>
        </div>

        {/* Pixel ocean */}
        <div className="pixel-ocean">
          <div className="ocean-wave wave-1"></div>
          <div className="ocean-wave wave-2"></div>
        </div>
      </div>
    </div>
  )
}

export default Menu
