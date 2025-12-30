import React from 'react'
import './CatchingBar.css'

const CatchingBar = ({ greenStart, greenWidth, redStart, redWidth, barPosition, gauge, failures, onBarClick }) => {
  return (
    <div className="catching-bar" onClick={onBarClick}>
      <div className="gray-bar">
        <div
          className="green-bar"
          style={{ left: `${greenStart}%`, width: `${greenWidth}%` }}
        >
          <div
            className="red-bar"
            style={{ left: `${((redStart - greenStart) / greenWidth) * 100}%`, width: `${redWidth}%` }}
          ></div>
        </div>
        <div className="moving-bar" style={{ left: `${barPosition}%` }}></div>
      </div>
      <p>클릭해서 막대를 멈추세요!</p>
      <div className="stats-container">
        <div className="catch-rate-container">
          <div className="catch-rate-label">포획률</div>
          <div className="catch-rate-bar-bg">
            <div 
              className="catch-rate-bar-fill" 
              style={{ width: `${Math.round(gauge)}%` }}
            ></div>
            <span className="catch-rate-text">{Math.round(gauge)}%</span>
          </div>
        </div>
        <p>남은 기회: {3 - failures}회</p>
      </div>
    </div>
  )
}

export default CatchingBar
