import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import StartScreen from './components/StartScreen.jsx'
import NicknameInput from './components/NicknameInput.jsx'
import Menu from './components/Menu.jsx'

function Root() {
  const [screen, setScreen] = useState('start') // 'start', 'nickname', 'menu', 'game'
  const [playerName, setPlayerName] = useState('')

  const handlePressStart = () => {
    setScreen('nickname')
  }

  const handleNicknameSubmit = (name) => {
    setPlayerName(name)
    setScreen('menu')
  }

  const handleStartGame = () => {
    setScreen('game')
  }

  return (
    <>
      {screen === 'start' && <StartScreen onPressStart={handlePressStart} />}
      {screen === 'nickname' && <NicknameInput onSubmit={handleNicknameSubmit} />}
      {screen === 'menu' && <Menu onStartGame={handleStartGame} playerName={playerName} />}
      {screen === 'game' && <App playerName={playerName} />}
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
