import React, { useState, useEffect } from 'react'
import Login from './Login'
import Register from './Register'
import Dashboard from './Dashboard'
import Medicines from './Medicines'
import Appointments from './Appointments'
import Family from './Family'
import Emergency from './Emergency'
import HealthReport from './HealthReport'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

// ==========================================
// 🤖 EMBEDDED SMART CARE ASSISTANT COMPONENT
// ==========================================
function CareAssistant({ isFullScreen = false, onClose }) {
  const [userInput, setUserInput] = useState('')
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'saathi',
      text: 'Pranaam! Main aapka Care Saathi hoon. Aap mujhse dawaiyon ka samay, doctor ka checkup, ya tabiyat ke baare mein kuch bhi pooch sakte hain. Main bol kar bhi bataunga!',
      time: 'Just now'
    }
  ])

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1
      utterance.lang = 'hi-IN'
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleVoiceListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Aapke browser mein voice mic support nahi hai. Please type karein.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'hi-IN'
    recognition.start()
    setIsVoiceActive(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setIsVoiceActive(false)
      handleSendMessage(transcript)
    }

    recognition.onerror = () => {
      setIsVoiceActive(false)
    }
  }

  const handleSendMessage = (customText) => {
    const text = customText || userInput
    if (!text.trim()) return

    const userMsg = { sender: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    setChatMessages(prev => [...prev, userMsg])
    setUserInput('')

    setTimeout(() => {
      let botReply = ''
      const lower = text.toLowerCase()

      if (lower.includes('agli dawai') || lower.includes('next') || lower.includes('dawai') || lower.includes('medicine')) {
        botReply = 'Aapki agli dawai "Telma 40 (BP ki goli)" raat ko 08:30 baje leni hai khana khane ke baad.'
      } else if (lower.includes('stock') || lower.includes('refill') || lower.includes('bachi')) {
        botReply = 'Dhyan dein: Telma 40 ki sirf 3 tablets bachi hain! Kripya pharmacy se nayi strip order karein.'
      } else if (lower.includes('le li') || lower.includes('khali') || lower.includes('taken')) {
        botReply = 'Shabash! Maine record kar liya hai ki aapne dawai le li hai. Swasth rahiye!'
      } else if (lower.includes('doctor') || lower.includes('appointment') || lower.includes('checkup')) {
        botReply = 'Aapka agla consultation Dr. Rajesh Sharma (Cardiologist) ke sath 05 Oct 2026 ko subah 10:30 AM Apex Clinic mein hai.'
      } else if (lower.includes('tabiyat') || lower.includes('dard') || lower.includes('chakkar') || lower.includes('emergency') || lower.includes('help')) {
        botReply = 'Kripya shanti se baith jaiye aur paani pijiye. Maine emergency alert screen par active kar diya hai.'
      } else if (lower.includes('bp') || lower.includes('sugar') || lower.includes('vitals')) {
        botReply = 'Aapka latest BP 124/82 hai aur Blood Sugar 112 mg/dL hai. Dono aache control mein hain.'
      } else {
        botReply = `Aapne poocha: "${text}". Main aapki dawaiyon aur appointments ke liye hamesha taiyar hoon.`
      }

      setChatMessages(prev => [...prev, {
        sender: 'saathi',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])

      speakText(botReply)
    }, 400)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: isFullScreen ? 'calc(100vh - 120px)' : '520px',
      maxHeight: isFullScreen ? '820px' : '520px',
      maxWidth: isFullScreen ? '900px' : '380px',
      width: '100%',
      margin: isFullScreen ? '20px auto' : '0',
      background: '#ffffff',
      borderRadius: '20px',
      boxShadow: isFullScreen ? '0 10px 30px rgba(0,0,0,0.1)' : '0 20px 50px rgba(0,0,0,0.25)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        color: '#ffffff',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
            🤖
          </div>
          <div>
            <strong style={{ fontSize: '1.05rem', display: 'block' }}>Care Saathi AI</strong>
            <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>Bol kar ya likh kar sawal poochiye</span>
          </div>
        </div>

        {!isFullScreen && onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}>
            ✕
          </button>
        )}
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc' }}>
        {chatMessages.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
              background: msg.sender === 'user' ? '#2563eb' : '#ffffff',
              color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              {msg.text}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
              {msg.time}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '8px 14px', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        <button onClick={() => handleSendMessage('Meri agli dawai kab hai?')} style={chipStyle}>💊 Agli Dawai?</button>
        <button onClick={() => handleSendMessage('Maine BP ki dawai le li')} style={chipStyle}>✓ Dawai le li</button>
        <button onClick={() => handleSendMessage('Doctor checkup kab hai?')} style={chipStyle}>🩺 Doctor Visit?</button>
        <button onClick={() => handleSendMessage('Dawai ka stock kitna bacha hai?')} style={chipStyle}>📦 Stock Refill?</button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage() }} style={{ padding: '12px 16px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Yahan likhein ya mic daba kar bolein..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
        />
        
        <button
          type="button"
          onClick={handleVoiceListen}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: isVoiceActive ? '#ef4444' : '#e0f2fe',
            color: isVoiceActive ? '#fff' : '#0284c7',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            cursor: 'pointer',
            boxShadow: isVoiceActive ? '0 0 14px #ef4444' : 'none'
          }}
          title="Mic: Bol kar poochiye"
        >
          🎤
        </button>

        <button
          type="submit"
          style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#2563eb', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', cursor: 'pointer' }}
        >
          ➔
        </button>
      </form>
    </div>
  )
}

const chipStyle = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  color: '#334155',
  padding: '6px 12px',
  borderRadius: '16px',
  fontSize: '0.78rem',
  fontWeight: '600',
  whiteSpace: 'nowrap',
  cursor: 'pointer'
}

// ==========================================
// 🚀 MAIN APPLICATION ROUTER
// ==========================================
export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [isFloatingOpen, setIsFloatingOpen] = useState(false)
  const token = localStorage.getItem('token')
  const isAdminAuth = sessionStorage.getItem('admin_session_auth') === 'true'

  // 👁️ Accessibility States
  const [fontSizeLevel, setFontSizeLevel] = useState(1) // 0: Normal (14px), 1: Standard (16px), 2: Extra Large (19px)
  const [highContrast, setHighContrast] = useState(false)

  const fontSizes = ['14px', '16px', '19px']

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', onLocationChange)
    return () => window.removeEventListener('popstate', onLocationChange)
  }, [])

  const navigateTo = (path) => {
    window.location.pathname = path
  }

  const handleLogout = () => {
    localStorage.clear()
    navigateTo('/login')
  }

  const renderPage = () => {
    if (currentPath === '/admin-login') return <AdminLogin />
    if (currentPath === '/admin') {
      return isAdminAuth ? <AdminDashboard /> : <AdminLogin />
    }

    if (currentPath === '/login') return <Login />
    if (currentPath === '/register') return <Register />
    if (currentPath === '/medicines') return <Medicines />
    if (currentPath === '/appointments') return <Appointments />
    if (currentPath === '/family') return <Family />
    if (currentPath === '/emergency') return <Emergency />
    if (currentPath === '/reports') return <HealthReport />
    if (currentPath === '/assistant') return <CareAssistant isFullScreen={true} />
    if (currentPath === '/dashboard') return <Dashboard />

    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          maxWidth: '580px',
          width: '100%',
          padding: '48px 32px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>❤️</div>
          <h1 style={{ fontSize: '2.3rem', fontWeight: '800', marginBottom: '14px', color: highContrast ? '#facc15' : '#ffffff' }}>
            ElderCare Health Hub
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '36px' }}>
            A dedicated companion for timely medicine alerts, doctor checkups, and keeping family members effortlessly updated.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {token ? (
              <button 
                onClick={() => navigateTo('/dashboard')}
                style={{
                  background: highContrast ? '#facc15' : '#2563eb',
                  color: highContrast ? '#000000' : '#ffffff',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '24px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Go to Dashboard ➔
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigateTo('/login')}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 26px',
                    borderRadius: '24px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Patient Sign In
                </button>
                <button 
                  onClick={() => navigateTo('/register')}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '24px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Create Account
                </button>
              </>
            )}

            <button 
              onClick={() => navigateTo('/admin-login')}
              style={{
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                padding: '12px 24px',
                borderRadius: '24px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🛡️ Admin Terminal Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hideUserNavbar = 
    currentPath === '/login' || 
    currentPath === '/register' || 
    currentPath === '/admin' || 
    currentPath === '/admin-login'

  const isAdminRoute = currentPath === '/admin' || currentPath === '/admin-login'
  const isAuthRoute = currentPath === '/login' || currentPath === '/register'

  return (
    <div style={{
      minHeight: '100vh',
      background: highContrast ? '#000000' : '#020617',
      color: highContrast ? '#facc15' : '#f8fafc',
      fontSize: fontSizes[fontSizeLevel],
      position: 'relative',
      transition: 'background 0.2s ease, font-size 0.15s ease'
    }}>
      
      {/* 👓 SENIOR CITIZEN ACCESSIBILITY BAR */}
      {!hideUserNavbar && (
        <div style={{
          background: highContrast ? '#111827' : '#090d16',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '6px 28px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.8rem'
        }}>
          <span style={{ color: '#94a3b8' }}>Accessibility Mode:</span>
          
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px' }}>
            <button onClick={() => setFontSizeLevel(0)} style={{ ...accBtnStyle, fontWeight: fontSizeLevel === 0 ? '800' : '400', background: fontSizeLevel === 0 ? '#2563eb' : 'transparent' }}>A-</button>
            <button onClick={() => setFontSizeLevel(1)} style={{ ...accBtnStyle, fontWeight: fontSizeLevel === 1 ? '800' : '400', background: fontSizeLevel === 1 ? '#2563eb' : 'transparent' }}>A</button>
            <button onClick={() => setFontSizeLevel(2)} style={{ ...accBtnStyle, fontWeight: fontSizeLevel === 2 ? '800' : '400', background: fontSizeLevel === 2 ? '#2563eb' : 'transparent' }}>A+</button>
          </div>

          <button
            onClick={() => setHighContrast(!highContrast)}
            style={{
              background: highContrast ? '#facc15' : 'rgba(255,255,255,0.1)',
              color: highContrast ? '#000000' : '#ffffff',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {highContrast ? '☀️ Normal Contrast' : '🌗 High Contrast'}
          </button>
        </div>
      )}

      {/* Main Navbar */}
      {!hideUserNavbar && token && (
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 28px',
          background: highContrast ? '#030712' : '#0f172a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#ffffff'
        }}>
          <div 
            onClick={() => navigateTo('/')}
            style={{ fontWeight: '700', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>❤️</span> ElderCare
          </div>

          <nav style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigateTo('/')} style={navBtnStyle}>🏠 Home</button>
            <button onClick={() => navigateTo('/dashboard')} style={navBtnStyle}>Dashboard</button>
            <button onClick={() => navigateTo('/medicines')} style={navBtnStyle}>💊 Medicines</button>
            <button onClick={() => navigateTo('/appointments')} style={navBtnStyle}>🩺 Appointments</button>
            <button onClick={() => navigateTo('/family')} style={navBtnStyle}>👨‍👩‍‍👧 Family</button>
            <button onClick={() => navigateTo('/reports')} style={navBtnStyle}>📋 Reports</button>
            <button onClick={() => navigateTo('/emergency')} style={navBtnStyle}>🚨 Emergency</button>

            <button 
              onClick={() => navigateTo('/assistant')} 
              style={{ ...navBtnStyle, color: '#38bdf8', fontWeight: '800' }}
            >
              🤖 Care Saathi
            </button>

            <button 
              onClick={handleLogout}
              style={{
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                marginLeft: '6px'
              }}
            >
              Logout
            </button>
          </nav>
        </header>
      )}

      <main>
        {renderPage()}
      </main>

      {!isAdminRoute && !isAuthRoute && token && currentPath !== '/assistant' && (
        <>
          {!isFloatingOpen ? (
            <button
              onClick={() => setIsFloatingOpen(true)}
              style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                background: highContrast ? '#facc15' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: highContrast ? '#000000' : '#ffffff',
                border: 'none',
                borderRadius: '50px',
                padding: '12px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                cursor: 'pointer',
                zIndex: 999
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>🤖</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', lineHeight: '1.1' }}>Care Saathi</div>
                <div style={{ fontSize: '0.7rem', opacity: highContrast ? 1 : 0.9 }}>Bol kar poochiye</div>
              </div>
            </button>
          ) : (
            <div style={{ position: 'fixed', bottom: '24px', right: '20px', zIndex: 9999 }}>
              <CareAssistant isFullScreen={false} onClose={() => setIsFloatingOpen(false)} />
            </div>
          )}
        </>
      )}

    </div>
  )
}

const navBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#cbd5e1',
  cursor: 'pointer',
  fontSize: '0.95rem',
  fontWeight: '500'
}

const accBtnStyle = {
  border: 'none',
  color: '#ffffff',
  padding: '4px 8px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.75rem'
}