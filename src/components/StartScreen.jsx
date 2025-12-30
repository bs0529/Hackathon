import "./StartScreen.css";

function StartScreen({ onPressStart }) {
  return (
    <div className="start-screen" onClick={onPressStart}>
      <div className="pixel-clouds">
        <div className="pixel-cloud cloud-1"></div>
        <div className="pixel-cloud cloud-2"></div>
        <div className="pixel-cloud cloud-3"></div>
      </div>

      <div className="start-content">
        <div className="game-logo">
          <h1 className="pixel-title">다나까</h1>
          <div className="pixel-fish-icon">
            <img src="/assets/images/sticker_향고래.png" alt="" height={120} />
          </div>
        </div>

        <div className="press-start-container">
          <p className="press-start-text blink">PRESS START!</p>
          <p className="press-start-hint">클릭하여 시작</p>
        </div>
      </div>

      <div className="pixel-ocean">
        <img src="sea_sky.png" alt="" />
      </div>

      <div className="credits">
        <p>© 2024 OCEAN RESCUE TEAM</p>
      </div>
    </div>
  );
}

export default StartScreen;
