import React, { useState } from 'react'
import './UserInterface.css'
import { useUser } from '../contexts/UserContext'

const Login = ({ onSwitchToRegister, onClose }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error } = useUser()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(username, password)
    if (result.success) {
      onClose()
    }
  }

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        <h2>로그인</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">사용자명</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="auth-buttons">
            <button type="submit" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
            <button type="button" onClick={onClose}>
              취소
            </button>
          </div>
        </form>
        <div className="auth-switch">
          <p>계정이 없으신가요? <button onClick={onSwitchToRegister}>회원가입</button></p>
        </div>
      </div>
    </div>
  )
}

export default Login
