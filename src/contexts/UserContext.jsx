import React, { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalFish: 0,
    rareFish: 0,
    highScore: 0,
    gamesPlayed: 0
  })

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('fishingGameUser')
    const savedToken = localStorage.getItem('fishingGameToken')

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      // Validate token with backend
      validateToken(savedToken)
    }
  }, [])

  const validateToken = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_USER_API_URL}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        setStats(userData.stats)
      } else {
        // Token invalid, logout
        logout()
      }
    } catch (err) {
      console.error('Token validation failed:', err)
      logout()
    }
  }

  const login = async (username, password) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_USER_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setStats(data.stats)
        localStorage.setItem('fishingGameUser', JSON.stringify(data.user))
        localStorage.setItem('fishingGameToken', data.token)
        return { success: true }
      } else {
        setError(data.message || '로그인 실패')
        return { success: false, message: data.message }
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다')
      return { success: false, message: '네트워크 오류' }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username, email, password) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_USER_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setStats(data.stats)
        localStorage.setItem('fishingGameUser', JSON.stringify(data.user))
        localStorage.setItem('fishingGameToken', data.token)
        return { success: true }
      } else {
        setError(data.message || '회원가입 실패')
        return { success: false, message: data.message }
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다')
      return { success: false, message: '네트워크 오류' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setStats({
      totalFish: 0,
      rareFish: 0,
      highScore: 0,
      gamesPlayed: 0
    })
    localStorage.removeItem('fishingGameUser')
    localStorage.removeItem('fishingGameToken')
  }

  const updateStats = async (gameResult) => {
    if (!user) return

    try {
      const token = localStorage.getItem('fishingGameToken')
      const response = await fetch(`${import.meta.env.VITE_GAME_API_URL}/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(gameResult)
      })

      if (response.ok) {
        const updatedStats = await response.json()
        setStats(updatedStats)
      }
    } catch (err) {
      console.error('Failed to update stats:', err)
    }
  }

  const value = {
    user,
    isLoading,
    error,
    stats,
    login,
    register,
    logout,
    updateStats
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
