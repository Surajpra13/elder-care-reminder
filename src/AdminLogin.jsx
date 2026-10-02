import React, { useState } from 'react'

export default function AdminLogin() {
  const [adminId, setAdminId] = useState('')
  const [adminPin, setAdminPin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleAdminAuth = (e) => {
    e.preventDefault()
    const masterPin = localStorage.getItem('app_master_pin') || '7788'

    // Simple Admin Credential Check
    if (adminId.trim().toLowerCase() === 'admin' && adminPin.trim() === masterPin) {
      sessionStorage.setItem('admin_session_auth', 'true')
      window.location.pathname = '/admin'
    } else {
      setErrorMsg('Invalid Admin ID or Master PIN! (Default: admin / 7788)')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #0f172a 0%, #020617 100%)',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: '#090d16',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px',
        padding: '40px 32px',
        maxWidth: '380px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
        textAlign: 'center'
      }}>
        {/* Header Badge */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          margin: '0 auto 16px auto',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.4)'
        }}>
          🛡️
        </div>

        <h2 style={{ color: '#ffffff', margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: '800' }}>
          ElderCare Terminal
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '24px' }}>
          Administrative & Doctor Portal Login
        </p>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '16px', fontWeight: '600' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600' }}>Admin ID</label>
            <input
              type="text"
              placeholder="e.g. admin"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              style={inputStyle}
              required
              autoFocus
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600' }}>Master Security PIN</label>
            <input
              type="password"
              placeholder="••••"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '1.3rem' }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginTop: '6px',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
            }}
          >
            Authorize Terminal ➔
          </button>
        </form>

        <div style={{ marginTop: '24px', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
          <button
            onClick={() => window.location.pathname = '/login'}
            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            ← Return to Patient / Family Login
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: '#020617',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  outline: 'none',
  marginTop: '4px'
}