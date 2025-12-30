import { useState } from 'react'
import './NicknameInput.css'

function NicknameInput({ onSubmit }) {
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (nickname.trim().length === 0) {
      setError('닉네임을 입력해주세요!')
      return
    }

    if (nickname.trim().length < 2) {
      setError('닉네임은 2글자 이상이어야 합니다!')
      return
    }

    if (nickname.trim().length > 10) {
      setError('닉네임은 10글자 이하여야 합니다!')
      return
    }

    onSubmit(nickname.trim())
  }

  const handleChange = (e) => {
    setNickname(e.target.value)
    setError('')
  }

  return (
    <div className="nickname-screen">
      <div className="nickname-container">
        <div className="pixel-border">
          <h2 className="nickname-title">플레이어 이름</h2>

          <form onSubmit={handleSubmit} className="nickname-form">
            <div className="input-wrapper">
              <input
                type="text"
                value={nickname}
                onChange={handleChange}
                placeholder="이름을 입력하세요"
                className="pixel-input"
                maxLength={10}
                autoFocus
              />
              <div className="input-cursor"></div>
            </div>

            {error && (
              <p className="error-message shake">{error}</p>
            )}

            <div className="button-group">
              <button type="submit" className="pixel-button primary">
                확인
              </button>
            </div>
          </form>

          <div className="character-preview">
            <div className="pixel-fisherman">🎣</div>
            <p className="preview-text">
              {nickname || '???'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NicknameInput
