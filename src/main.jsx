import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import StartScreen from './components/StartScreen.jsx'
import NicknameInput from './components/NicknameInput.jsx'
import Menu from './components/Menu.jsx'
import { createUser } from './services/api.js'

const USER_STORAGE_KEY = 'ocean_rescue_user'

function Root() {
  const [screen, setScreen] = useState('start') // 'start', 'nickname', 'menu', 'game'
  const [playerName, setPlayerName] = useState('')
  const [userId, setUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // 로컬스토리지에서 유저 정보 복원
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        console.log('Restored user from localStorage:', userData)
        setPlayerName(userData.nickname)
        setUserId(userData.id)
        setScreen('menu')
      } catch (error) {
        console.error('Failed to restore user data:', error)
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    }
  }, [])

  const saveUserToLocalStorage = (userData) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
  }

  const handlePressStart = () => {
    setScreen('nickname')
  }

  const handleNicknameSubmit = async (name) => {
    setIsLoading(true)
    try {
      // API를 통해 유저 생성
      const userData = await createUser(name)

      console.log('User created:', userData)

      const userInfo = {
        id: userData.id,
        nickname: userData.nickname
      }

      // 로컬스토리지에 저장
      saveUserToLocalStorage(userInfo)

      setPlayerName(userData.nickname)
      setUserId(userData.id)
      setScreen('menu')
    } catch (error) {
      console.error('Failed to create user:', error)
      // 에러 발생 시에도 로컬에서 진행 (오프라인 모드)
      const tempUserId = Date.now()
      const userInfo = {
        id: tempUserId,
        nickname: name
      }

      // 로컬스토리지에 저장
      saveUserToLocalStorage(userInfo)

      setPlayerName(name)
      setUserId(tempUserId)
      setScreen('menu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartGame = () => {
    setScreen('game')
  }

  const handleLogout = () => {
    // 로컬스토리지에서 유저 정보 삭제
    localStorage.removeItem(USER_STORAGE_KEY)
    console.log('User logged out')

    // 상태 초기화
    setPlayerName('')
    setUserId(null)
    setScreen('start')
  }

  return (
    <>
      {screen === 'start' && <StartScreen onPressStart={handlePressStart} />}
      {screen === 'nickname' && <NicknameInput onSubmit={handleNicknameSubmit} isLoading={isLoading} />}
      {screen === 'menu' && <Menu onStartGame={handleStartGame} playerName={playerName} userId={userId} onLogout={handleLogout} />}
      {screen === 'game' && <App playerName={playerName} userId={userId} />}
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
