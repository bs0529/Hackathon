import React from 'react'

const Fisherman = ({ rodAnimation }) => {
  return (
    <div className={`fisherman-container ${rodAnimation}`}>
      <img src="/fisherman.png" alt="Fisherman" className="fisherman" />
    </div>
  )
}

export default Fisherman
