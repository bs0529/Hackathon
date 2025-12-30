import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GameFlow from './components/GameFlow'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameFlow />
  </StrictMode>,
)
