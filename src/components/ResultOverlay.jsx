import React from 'react'
import './ResultOverlay.css'

const ResultOverlay = ({ result, caughtFish, onRelease, onSell, onSendToAquarium }) => {
  return (
    <div className="result-overlay-backdrop">
      <div className="result-overlay">
        {result === 'success' ? (
          <>
            <h3 className="result-title success">{caughtFish ? caughtFish.name : 'Unknown Fish'}</h3>
            {caughtFish && (
              <div className="model-wrapper">
                <img
                  src={caughtFish.image2d}
                  alt={caughtFish.name}
                  style={{ width: '100%', height: '120px', objectFit: 'contain', backgroundColor: '#e0f7fa', borderRadius: '8px' }}
                />
              </div>
            )}
            <p className="success-text">{caughtFish && caughtFish.habitat ? `서식지: ${caughtFish.habitat}` : 'Great Job!'}</p>

            <div className="result-buttons">
              <button className="result-btn release-btn" onClick={onRelease}>
                방생
              </button>
              <button className="result-btn sell-btn" onClick={onSell}>
                판매
              </button>
              <button className="result-btn aquarium-btn" onClick={onSendToAquarium}>
                아쿠아리움 수송
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="result-title fail">FAILED...</h2>
            <p className="fail-text">다시 시도해보세요!</p>
          </>
        )}
      </div>
    </div>
  )
}

export default ResultOverlay
