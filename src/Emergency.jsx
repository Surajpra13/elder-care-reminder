import React, { useState, useEffect } from 'react'

export default function Emergency() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [relation, setRelation] = useState('Family')
  const [adding, setAdding] = useState(false)
  
  // Siren & Alert States
  const [isSirenActive, setIsSirenActive] = useState(false)
  const [audioCtxState, setAudioCtxState] = useState(null)
  const [locationStatus, setLocationStatus] = useState('')

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://elder-care-reminder.onrender.com/api/emergency', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setContacts(data)
      }
    } catch (err) {
      console.error('Fetch emergency contacts failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  // 1. LOUD SOS SIREN ALARM
  const startSiren = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(850, ctx.currentTime)
      
      // Siren frequency modulation (Up-Down sound)
      let isHigh = true
      const interval = setInterval(() => {
        if (!osc) return
        osc.frequency.setValueAtTime(isHigh ? 960 : 650, ctx.currentTime)
        isHigh = !isHigh
      }, 350)

      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()

      setAudioCtxState({ ctx, osc, interval })
      setIsSirenActive(true)
    } catch (e) {
      console.warn('Audio Context error:', e)
      setIsSirenActive(true)
    }
  }

  const stopSiren = () => {
    if (audioCtxState) {
      clearInterval(audioCtxState.interval)
      try {
        audioCtxState.osc.stop()
        audioCtxState.ctx.close()
      } catch (e) {}
      setAudioCtxState(null)
    }
    setIsSirenActive(false)
  }

  // 2. DISPATCH WHATSAPP SOS WITH LIVE GPS
  const triggerWhatsAppSOS = (contact) => {
    setLocationStatus('Getting GPS location...')
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`
          sendSOS(contact, mapsLink)
        },
        () => {
          // If GPS denied/failed, send SOS without coordinates
          sendSOS(contact, 'Location permission unavailable')
        },
        { timeout: 6000 }
      )
    } else {
      sendSOS(contact, 'Location not supported by device')
    }
  }

  const sendSOS = (contact, locationInfo) => {
    setLocationStatus('')
    let cleanNumber = contact.phone.replace(/[^0-9]/g, '')
    if (cleanNumber.length === 10) {
      cleanNumber = '91' + cleanNumber
    }

    const elderName = user.name || 'Elder Family Member'
    const message = encodeURIComponent(
      `🚨 *EMERGENCY SOS ALERT!* 🚨\n\n` +
      `I need immediate help!\n` +
      `Elder: *${elderName}*\n` +
      `Contact: ${user.email || 'Registered User'}\n\n` +
      `📍 Current Live Location:\n${locationInfo}\n\n` +
      `Please call me or send help immediately!`
    )

    window.open(`https://api.whatsapp.com/send?phone=${cleanNumber}&text=${message}`, '_blank')
  }

  const handleAddContact = async (e) => {
    e.preventDefault()
    if (!name || !phone) return

    setAdding(true)
    try {
      const res = await fetch('https://elder-care-reminder.onrender.com/api/emergency/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${name} (${relation})`,
          phone
        })
      })

      if (res.ok) {
        setName('')
        setPhone('')
        fetchContacts()
      }
    } catch (err) {
      console.error('Failed to add contact:', err)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`https://elder-care-reminder.onrender.com/api/emergency/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setContacts(contacts.filter((c) => c._id !== id))
      }
    } catch (err) {
      console.error('Delete contact failed:', err)
    }
  }

  return (
    <div style={{
      maxWidth: '960px',
      margin: '24px auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f8fafc'
    }}>
      {/* 🔴 GIANT ONE-TAP SOS EMERGENCY PANIC BUTTON */}
      <div style={{
        background: isSirenActive 
          ? 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)' 
          : 'linear-gradient(135deg, rgba(220, 38, 38, 0.22) 0%, rgba(153, 27, 27, 0.18) 100%)',
        border: '2px solid #ef4444',
        borderRadius: '20px',
        padding: '28px',
        textAlign: 'center',
        marginBottom: '26px',
        boxShadow: isSirenActive ? '0 0 40px rgba(239, 68, 68, 0.8)' : '0 8px 30px rgba(220, 38, 38, 0.25)',
        transition: 'all 0.3s ease'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.6rem', color: '#ffffff', fontWeight: '900' }}>
          {isSirenActive ? '🚨 SIREN IS SOUNDING! LOUD ALARM ACTIVE 🚨' : '🆘 Emergency Alarm & Siren'}
        </h2>
        <p style={{ margin: '0 0 20px 0', color: '#fca5a5', fontSize: '0.95rem' }}>
          Tap below in severe danger to trigger loud acoustic alarm sounds to alert neighbors.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {!isSirenActive ? (
            <button
              onClick={startSiren}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '16px 36px',
                borderRadius: '50px',
                fontSize: '1.15rem',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(220, 38, 38, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>🚨</span> ACTIVATE SOS SIREN
            </button>
          ) : (
            <button
              onClick={stopSiren}
              style={{
                background: '#ffffff',
                color: '#b91c1c',
                border: 'none',
                padding: '16px 36px',
                borderRadius: '50px',
                fontSize: '1.15rem',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span>⏹️</span> STOP ALARM SIREN
            </button>
          )}

          {/* 3. FIND NEARBY HOSPITALS BUTTON */}
          <a
            href="https://www.google.com/maps/search/nearby+hospital+emergency/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#0284c7',
              color: '#ffffff',
              padding: '16px 26px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🏥</span> Find Nearby Hospitals On Map ➔
          </a>
        </div>
      </div>

      {/* Emergency Quick Dial Strip */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '26px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}>🚨</span>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff' }}>Government Emergency Numbers</h3>
        </div>
        <p style={{ margin: '0 0 16px 0', color: '#94a3b8', fontSize: '0.85rem' }}>
          Immediate single-tap lines for ambulance & rescue services.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href="tel:108"
            style={{
              background: '#dc2626',
              color: '#ffffff',
              padding: '10px 22px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🚑 Ambulance (108)
          </a>

          <a
            href="tel:112"
            style={{
              background: '#ea580c',
              color: '#ffffff',
              padding: '10px 22px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            👮 National Helpline (112)
          </a>

          <a
            href="tel:14567"
            style={{
              background: '#059669',
              color: '#ffffff',
              padding: '10px 22px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🧓 Elder Helpline (14567)
          </a>
        </div>
      </div>

      {/* Add Priority Contact Form */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '22px',
        marginBottom: '26px'
      }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', fontWeight: '700', color: '#38bdf8' }}>
          + Add Priority Emergency Contact
        </h3>

        <form onSubmit={handleAddContact} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <input
            type="text"
            placeholder="Contact Name (e.g. Dr. Verma, Son)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            required
          />

          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            style={inputStyle}
          >
            <option value="Family">👨‍👩‍👧 Family Member</option>
            <option value="Doctor">🩺 Personal Doctor</option>
            <option value="Neighbor">🏡 Neighbor</option>
            <option value="Caregiver">👩‍⚕️ Caregiver</option>
          </select>

          <input
            type="text"
            placeholder="10-Digit Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
            required
          />

          <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
            <button
              type="submit"
              disabled={adding}
              style={{
                width: '100%',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: adding ? 'wait' : 'pointer'
              }}
            >
              {adding ? 'Saving...' : 'Save Emergency Contact'}
            </button>
          </div>
        </form>
      </div>

      {/* Contact List with Location SOS Dispatch */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>
          Custom Priority SOS Contacts ({contacts.length})
        </h3>
        {locationStatus && <span style={{ color: '#38bdf8', fontSize: '0.85rem' }}>{locationStatus}</span>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Loading emergency contacts...</div>
      ) : contacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', color: '#94a3b8' }}>
          No priority emergency contacts saved yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {contacts.map((c) => (
            <div
              key={c._id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <strong style={{ fontSize: '1.1rem', color: '#ffffff', display: 'block', marginBottom: '4px' }}>
                  {c.name}
                </strong>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>📞 {c.phone}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* 2. SEND LIVE GPS VIA WHATSAPP BUTTON */}
                <button
                  onClick={() => triggerWhatsAppSOS(c)}
                  style={{
                    background: '#25d366',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  📍 Send GPS SOS
                </button>

                <a
                  href={`tel:${c.phone}`}
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  📞 Direct Call
                </a>

                <button
                  onClick={() => handleDelete(c._id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  padding: '12px 14px',
  background: '#0f172a',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box'
}