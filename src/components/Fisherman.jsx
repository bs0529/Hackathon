import React from 'react'
import './Fisherman.css'

const Fisherman = ({ rodAnimation }) => {
  return (
    <div className={`fisherman-container ${rodAnimation}`}>
      <img src="/fisherman.png" alt="Fisherman" className="fisherman" />
    </div>
  )
}

export default Fisherman
