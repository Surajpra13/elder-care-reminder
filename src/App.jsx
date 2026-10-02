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
    <div 
      className={`flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full ${
        isFullScreen 
          ? 'max-w-4xl mx-auto my-4 h-[calc(100vh-140px)]' 
          : 'max-w-[95vw] sm:max-w-[380px] h-[500px]'
      }`}
    >
      {/* Bot Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <strong className="text-base block">Care Saathi AI</strong>
            <span className="text-xs text-blue-100">Bol kar ya likh kar sawal poochiye</span>
          </div>
        </div>

        {!isFullScreen && onClose && (
          <button 
            onClick={onClose} 
            className="text-white hover:text-red-200 text-2xl p-1 leading-none"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
            <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-br-sm' 
                : 'bg-white text-slate-900 border border-slate-200 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
            <div className={`text-[10px] text-slate-400 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              {msg.time}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Chips */}
      <div className="p-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
        <button onClick={() => handleSendMessage('Meri agli dawai kab hai?')} className="whitespace-nowrap px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-200">💊 Agli Dawai?</button>
        <button onClick={() => handleSendMessage('Maine BP ki dawai le li')} className="whitespace-nowrap px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-200">✓ Dawai le li</button>
        <button onClick={() => handleSendMessage('Doctor checkup kab hai?')} className="whitespace-nowrap px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-200">🩺 Doctor Visit?</button>
        <button onClick={() => handleSendMessage('Dawai ka stock kitna bacha hai?')} className="whitespace-nowrap px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-200">📦 Stock Refill?</button>
      </div>

      {/* Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage() }} className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Likh kar ya mic daba kar bolein..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-full border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
        />
        
        <button
          type="button"
          onClick={handleVoiceListen}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
            isVoiceActive ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
          }`}
          title="Mic: Bol kar poochiye"
        >
          🎤
        </button>

        <button
          type="submit"
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold hover:bg-blue-700"
        >
          ➔
        </button>
      </form>
    </div>
  )
}

// ==========================================
// 🚀 MAIN APPLICATION ROUTER
// ==========================================
export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [isFloatingOpen, setIsFloatingOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const token = localStorage.getItem('token')
  const isAdminAuth = sessionStorage.getItem('admin_session_auth') === 'true'

  // 👁️ Accessibility States
  const [fontSizeLevel, setFontSizeLevel] = useState(1) // 0: 14px, 1: 16px, 2: 19px
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
    setMobileMenuOpen(false)
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
    if (currentPath === '/assistant') return <div className="p-4"><CareAssistant isFullScreen={true} /></div>
    if (currentPath === '/dashboard') return <Dashboard />

    // Landing / Default Home View
    return (
      <div className="min-h-[75vh] flex flex-col justify-center items-center px-4 py-8 text-center">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl max-w-xl w-full p-6 sm:p-10 shadow-xl">
          <div className="text-4xl sm:text-5xl mb-3">❤️</div>
          <h1 className={`text-2xl sm:text-4xl font-extrabold mb-3 ${highContrast ? 'text-yellow-400' : 'text-white'}`}>
            ElderCare Health Hub
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
            A dedicated companion for timely medicine alerts, doctor checkups, and keeping family members effortlessly updated.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {token ? (
              <button 
                onClick={() => navigateTo('/dashboard')}
                className={`w-full sm:w-auto px-6 py-3 rounded-full font-bold text-sm sm:text-base transition-colors ${
                  highContrast ? 'bg-yellow-400 text-black' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Go to Dashboard ➔
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigateTo('/login')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-sm"
                >
                  Patient Sign In
                </button>
                <button 
                  onClick={() => navigateTo('/register')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-transparent border border-white/20 text-white rounded-full font-semibold text-sm hover:bg-white/10"
                >
                  Create Account
                </button>
              </>
            )}

            <button 
              onClick={() => navigateTo('/admin-login')}
              className="w-full sm:w-auto px-6 py-2.5 bg-sky-400/10 border border-sky-400 text-sky-400 rounded-full font-bold text-sm hover:bg-sky-400/20"
            >
              🛡️ Admin Terminal
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
    <div 
      style={{ fontSize: fontSizes[fontSizeLevel] }}
      className={`min-h-screen transition-colors duration-200 ${
        highContrast ? 'bg-black text-yellow-400' : 'bg-slate-950 text-slate-100'
      }`}
    >
      
      {/* 👓 SENIOR CITIZEN ACCESSIBILITY BAR */}
      {!hideUserNavbar && (
        <div className={`px-4 sm:px-8 py-2 flex flex-wrap justify-between sm:justify-end items-center gap-3 border-b text-xs ${
          highContrast ? 'bg-slate-900 border-yellow-400/20' : 'bg-slate-900/80 border-white/10'
        }`}>
          <span className="text-slate-400">Accessibility:</span>
          
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-white/10 rounded p-0.5">
              <button onClick={() => setFontSizeLevel(0)} className={`px-2 py-0.5 rounded text-white ${fontSizeLevel === 0 ? 'bg-blue-600 font-bold' : ''}`}>A-</button>
              <button onClick={() => setFontSizeLevel(1)} className={`px-2 py-0.5 rounded text-white ${fontSizeLevel === 1 ? 'bg-blue-600 font-bold' : ''}`}>A</button>
              <button onClick={() => setFontSizeLevel(2)} className={`px-2 py-0.5 rounded text-white ${fontSizeLevel === 2 ? 'bg-blue-600 font-bold' : ''}`}>A+</button>
            </div>

            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`px-2.5 py-1 rounded font-bold text-xs ${
                highContrast ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {highContrast ? '☀️ Normal' : '🌗 High Contrast'}
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      {!hideUserNavbar && token && (
        <header className={`sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex justify-between items-center border-b ${
          highContrast ? 'bg-black border-yellow-400/20' : 'bg-slate-900/95 backdrop-blur border-white/10'
        }`}>
          {/* Logo */}
          <div 
            onClick={() => navigateTo('/')}
            className="font-bold text-lg sm:text-xl cursor-pointer flex items-center gap-2 select-none"
          >
            <span>❤️</span> ElderCare
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex gap-5 items-center">
            <button onClick={() => navigateTo('/')} className="text-slate-300 hover:text-white font-medium text-sm">🏠 Home</button>
            <button onClick={() => navigateTo('/dashboard')} className="text-slate-300 hover:text-white font-medium text-sm">Dashboard</button>
            <button onClick={() => navigateTo('/medicines')} className="text-slate-300 hover:text-white font-medium text-sm">💊 Medicines</button>
            <button onClick={() => navigateTo('/appointments')} className="text-slate-300 hover:text-white font-medium text-sm">🩺 Appointments</button>
            <button onClick={() => navigateTo('/family')} className="text-slate-300 hover:text-white font-medium text-sm">👨‍👩‍👧 Family</button>
            <button onClick={() => navigateTo('/reports')} className="text-slate-300 hover:text-white font-medium text-sm">📋 Reports</button>
            <button onClick={() => navigateTo('/emergency')} className="text-slate-300 hover:text-white font-medium text-sm">🚨 Emergency</button>

            <button 
              onClick={() => navigateTo('/assistant')} 
              className="text-sky-400 hover:text-sky-300 font-bold text-sm flex items-center gap-1"
            >
              🤖 Care Saathi
            </button>

            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg ml-2"
            >
              Logout
            </button>
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/10 text-white text-xl leading-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </header>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && !hideUserNavbar && token && (
        <div className="lg:hidden bg-slate-900 border-b border-white/10 px-4 py-4 flex flex-col gap-2 shadow-2xl">
          <button onClick={() => navigateTo('/')} className="text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium">🏠 Home</button>
          <button onClick={() => navigateTo('/dashboard')} className="text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium">Dashboard</button>
          <button onClick={() => navigateTo('/medicines')} className="text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium">💊 Medicines</button>
          <button onClick={() => navigateTo('/appointments')} className="text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium">🩺 Appointments</button>
          <button onClick={() => navigateTo('/family')} className="text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium">👨‍👩‍👧 Family</button>
          <button onClick={() => navigateTo('/reports')} className="text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium">📋 Reports</button>
          <button onClick={() => navigateTo('/emergency')} className="text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium">🚨 Emergency</button>
          <button onClick={() => navigateTo('/assistant')} className="text-left px-3 py-2 rounded-lg bg-sky-500/20 text-sky-400 font-bold text-sm">🤖 Care Saathi AI</button>
          <button onClick={handleLogout} className="text-left px-3 py-2 rounded-lg bg-red-600/20 text-red-400 font-semibold text-sm mt-2">Logout</button>
        </div>
      )}

      {/* Main Body Content Container */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {renderPage()}
      </main>

      {/* Floating Care Saathi Bot */}
      {!isAdminRoute && !isAuthRoute && token && currentPath !== '/assistant' && (
        <>
          {!isFloatingOpen ? (
            <button
              onClick={() => setIsFloatingOpen(true)}
              className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2.5 shadow-2xl z-50 transition-transform active:scale-95 ${
                highContrast 
                  ? 'bg-yellow-400 text-black' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
              }`}
            >
              <span className="text-xl sm:text-2xl">🤖</span>
              <div className="text-left">
                <div className="text-xs sm:text-sm font-extrabold leading-tight">Care Saathi</div>
                <div className="text-[10px] opacity-90 hidden sm:block">Bol kar poochiye</div>
              </div>
            </button>
          ) : (
            <div className="fixed bottom-4 right-2 sm:bottom-6 sm:right-6 z-[9999] max-w-[95vw]">
              <CareAssistant isFullScreen={false} onClose={() => setIsFloatingOpen(false)} />
            </div>
          )}
        </>
      )}

    </div>
  )
}