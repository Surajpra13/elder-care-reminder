import React, { useState } from 'react'

export default function CareAssistant({ isFullScreen = false, onClose }) {
  const [userInput, setUserInput] = useState('')
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'saathi',
      text: 'Pranaam! Main aapka Care Saathi hoon. Aap mujhse dawaiyon ka samay, doctor ka checkup, ya tabiyat ke baare mein kuch bhi pooch sakte hain. Main bol kar bhi bataunga!',
      time: 'Just now'
    }
  ])

  // Voice Speech Engine
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

  // Voice Mic Input
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

  // Smart Query Responses
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
      {/* Header */}
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

      {/* Messages Feed */}
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

      {/* Quick Tap Chips */}
      <div style={{ padding: '8px 14px', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        <button onClick={() => handleSendMessage('Meri agli dawai kab hai?')} style={chipStyle}>💊 Agli Dawai?</button>
        <button onClick={() => handleSendMessage('Maine BP ki dawai le li')} style={chipStyle}>✓ Dawai le li</button>
        <button onClick={() => handleSendMessage('Doctor checkup kab hai?')} style={chipStyle}>🩺 Doctor Visit?</button>
        <button onClick={() => handleSendMessage('Mujhe tabiyat theek nahi lag rahi')} style={{ ...chipStyle, color: '#dc2626', borderColor: '#fecaca' }}>🚨 Emergency Help</button>
      </div>

      {/* Input Bar with Mic */}
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