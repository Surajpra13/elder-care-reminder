import React from 'react'

export default function Navbar() {
  const token = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.pathname = '/login'
  }

  // Agar user logged in nahi hai toh navbar hide rahega
  if (!token) return null

  const currentPath = window.location.pathname

  const navItemStyle = (path) => ({
    cursor: 'pointer',
    color: currentPath === path ? '#38bdf8' : '#cbd5e1',
    fontSize: '0.92rem',
    fontWeight: currentPath === path ? '700' : '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '6px',
    background: currentPath === path ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
    transition: 'all 0.2s ease'
  })

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      background: '#0f172a',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 4px 18px rgba(0,0,0,0.3)'
    }}>
      {/* Brand Logo */}
      <div 
        onClick={() => window.location.pathname = '/dashboard'}
        style={{ fontWeight: '800', fontSize: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}
      >
        <span style={{ fontSize: '1.4rem' }}>❤️</span> ElderCare
      </div>

      {/* Nav Navigation Links */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span 
          onClick={() => window.location.pathname = '/dashboard'}
          style={navItemStyle('/dashboard')}
        >
          🏠 Dashboard
        </span>

        <span 
          onClick={() => window.location.pathname = '/medicines'}
          style={navItemStyle('/medicines')}
        >
          💊 Medicines
        </span>

        <span 
          onClick={() => window.location.pathname = '/appointments'}
          style={navItemStyle('/appointments')}
        >
          🩺 Appointments
        </span>

        <span 
          onClick={() => window.location.pathname = '/family'}
          style={navItemStyle('/family')}
        >
          👨‍👩‍👧 Family
        </span>

        <span 
          onClick={() => window.location.pathname = '/reports'}
          style={navItemStyle('/reports')}
        >
          📋 Reports
        </span>

        <span 
          onClick={() => window.location.pathname = '/emergency'}
          style={navItemStyle('/emergency')}
        >
          🚨 Emergency
        </span>

        <span 
          onClick={() => window.location.pathname = '/admin'}
          style={{
            ...navItemStyle('/admin'),
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38bdf8'
          }}
        >
          🛡 Admin
        </span>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '7px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.85rem',
            marginLeft: '8px'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}