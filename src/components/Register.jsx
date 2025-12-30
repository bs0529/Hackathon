import React, { useState } from 'react'
import './UserInterface.css'
import { useUser } from '../contexts/UserContext'

const Register = ({ onSwitchToLogin, onClose }) => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { register, isLoading, error } = useUser()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    const result = await register(username, email, password)
    if (result.success) {
      onClose()
    }
  }

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-username">사용자명</label>
            <input
              type="text"
              id="reg-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">이메일</label>
            <input
              type="email"
              id="reg-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">비밀번호</label>
            <input
              type="password"
              id="reg-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-confirm-password">비밀번호 확인</label>
            <input
              type="password"
              id="reg-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="auth-buttons">
            <button type="submit" disabled={isLoading}>
              {isLoading ? '회원가입 중...' : '회원가입'}
            </button>
            <button type="button" onClick={onClose}>
              취소
            </button>
          </div>
        </form>
        <div className="auth-switch">
          <p>이미 계정이 있으신가요? <button onClick={onSwitchToLogin}>로그인</button></p>
        </div>
      </div>
    </div>
  )
}

export default Register
