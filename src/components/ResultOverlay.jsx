import React from 'react'

const ResultOverlay = ({ result, caughtFish }) => {
  return (
    <div className="result-overlay">
      {result === 'success' ? (
        <>
          <h3 className="result-title success">{caughtFish ? caughtFish.name : 'Unknown Fish'}</h3>
          {caughtFish && (
            <div className="model-wrapper">
              <img
                src={caughtFish.image2d}
                alt={caughtFish.name}
                style={{ width: '100%', height: '80px', objectFit: 'contain', backgroundColor: '#e0f7fa', borderRadius: '8px' }}
              />
            </div>
          )}
          <p className="success-text">{caughtFish && caughtFish.ovrHbttNm ? `${caughtFish.ovrHbttNm}` : 'Great Job!'}</p>
        </>
      ) : (
        <h2 className="result-title fail">FAILED...</h2>
      )}
    </div>
  )
}

export default ResultOverlay
