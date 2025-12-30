import React, { useState, useEffect } from 'react'
import './Leaderboard.css'

const Leaderboard = ({ onClose }) => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_LEADERBOARD_API_URL}`)
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data)
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-overlay">
      <div className="leaderboard-container">
        <h2>리더보드</h2>
        <button className="close-btn" onClick={onClose}>닫기</button>

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.length === 0 ? (
              <p>아직 랭킹 데이터가 없습니다.</p>
            ) : (
              leaderboard.map((entry, index) => (
                <div key={entry.id || index} className="leaderboard-entry">
                  <div className="rank">#{index + 1}</div>
                  <div className="player-info">
                    <div className="username">{entry.username}</div>
                    <div className="stats">
                      <span>물고기: {entry.totalFish}</span>
                      <span>최고 점수: {entry.highScore}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
