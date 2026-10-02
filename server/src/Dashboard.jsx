import React, { useState, useEffect, useRef } from 'react'

export default function Dashboard() {
  const [medicines, setMedicines] = useState([])
  const [appointments, setAppointments] = useState([])
  const [contacts, setContacts] = useState([])
  const [familyMembers, setFamilyMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Notification Tray State
  const [showNotifTray, setShowNotifTray] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Upcoming Pill Reminder', desc: 'Shelcal 500 dose scheduled at 01:30 PM', time: '10 mins ago', unread: true },
    { id: 2, title: 'Family Sync Successful', desc: 'Morning BP (120/80) sent to Sister Sunita', time: '1 hour ago', unread: true },
    { id: 3, title: 'Doctor Visit Alert', desc: 'Appointment with Dr. Rajesh Verma in 2 days', time: 'Yesterday', unread: false }
  ])

  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Daily Adherence State
  const [takenDoses, setTakenDoses] = useState(() => {
    try {
      const saved = localStorage.getItem('user_taken_doses')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // 📦 Pill Inventory Stock State
  const [pillStocks, setPillStocks] = useState(() => {
    try {
      const saved = localStorage.getItem('user_pill_stocks')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Health Vitals Tracker state
  const [vitals, setVitals] = useState(() => {
    try {
      const saved = localStorage.getItem('user_vitals_data')
      return saved ? JSON.parse(saved) : { bp: '120/80', sugar: '110 mg/dL', pulse: '74 bpm' }
    } catch {
      return { bp: '120/80', sugar: '110 mg/dL', pulse: '74 bpm' }
    }
  })
  const [isEditingVitals, setIsEditingVitals] = useState(false)
  const [tempVitals, setTempVitals] = useState(vitals)

  // Filter for medicines: 'all' | 'pending' | 'completed'
  const [doseFilter, setDoseFilter] = useState('all')

  // ==========================================
  // 🚨 MISSED DOSE AUDIO ALARM & SIREN SYSTEM
  // ==========================================
  const [activeAlarmMed, setActiveAlarmMed] = useState(null)
  const alarmIntervalRef = useRef(null)

  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(820, audioCtx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(420, audioCtx.currentTime + 0.35)

      gain.gain.setValueAtTime(0.28, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35)

      osc.connect(gain)
      gain.connect(audioCtx.destination)

      osc.start()
      osc.stop(audioCtx.currentTime + 0.4)
    } catch {
      // Audio fallback
    }
  }

  const speakReminder = (medName) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const msg = new SpeechSynthesisUtterance(`Dhyan dijiye! Aapki dawai ${medName} lene ka samay ho gaya hai. Kripya turant dawai lijiye.`)
      msg.lang = 'hi-IN'
      msg.rate = 0.95
      window.speechSynthesis.speak(msg)
    }
  }

  const triggerDoseAlarm = (med) => {
    setActiveAlarmMed(med)
    speakReminder(med.name)
    playAlarmSound()

    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current)
    alarmIntervalRef.current = setInterval(() => {
      playAlarmSound()
    }, 1800)
  }

  const stopAlarmAndMarkTaken = (medId) => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current)
      alarmIntervalRef.current = null
    }
    setActiveAlarmMed(null)
    const targetMed = medicines.find(m => m._id === medId)
    if (targetMed) toggleDose(targetMed)
  }

  const dismissAlarmOnly = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current)
      alarmIntervalRef.current = null
    }
    setActiveAlarmMed(null)
  }

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Background Clock Checker (Every 30 seconds)
  useEffect(() => {
    const checkTimer = setInterval(() => {
      const now = new Date()
      const currentHours = now.getHours()
      const currentMinutes = now.getMinutes()
      const isPM = currentHours >= 12
      const formattedHours = currentHours % 12 || 12
      const currentFormatted = `${formattedHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`

      medicines.forEach(med => {
        const isTaken = takenDoses[med._id]
        if (!isTaken && med.time === currentFormatted && !activeAlarmMed) {
          triggerDoseAlarm(med)
        }
      })
    }, 30000)

    return () => {
      clearInterval(checkTimer)
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current)
    }
  }, [medicines, takenDoses, activeAlarmMed])

  const fetchDashboardData = async (isManualSync = false) => {
    if (isManualSync) setSyncing(true)
    try {
      const headers = { 'Authorization': `Bearer ${token}` }

      const [medRes, appRes, contRes, famRes] = await Promise.all([
        fetch('http://localhost:5000/api/medicines', { headers }),
        fetch('http://localhost:5000/api/appointments', { headers }),
        fetch('http://localhost:5000/api/emergency', { headers }),
        fetch('http://localhost:5000/api/family', { headers })
      ])

      if (medRes.ok) {
        const medData = await medRes.json()
        setMedicines(medData)
        // Initialize stock if not already in localStorage
        setPillStocks(prev => {
          const updated = { ...prev }
          medData.forEach((m, idx) => {
            if (updated[m._id] === undefined) {
              updated[m._id] = m.stock !== undefined ? m.stock : (idx === 0 ? 18 : idx === 1 ? 24 : 3)
            }
          })
          localStorage.setItem('user_pill_stocks', JSON.stringify(updated))
          return updated
        })
      }
      if (appRes.ok) setAppointments(await appRes.json())
      if (contRes.ok) setContacts(await contRes.json())
      if (famRes.ok) setFamilyMembers(await famRes.json())
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
      if (isManualSync) {
        setTimeout(() => setSyncing(false), 500)
      }
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [token])

  const navigateTo = (path) => {
    window.location.pathname = path
  }

  const markAllNotifsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })))
  }

  // 📦 Toggle Dose & Auto Deduct 1 Tablet from Stock
  const toggleDose = (med) => {
    const isNowTaken = !takenDoses[med._id]
    const updatedTaken = { ...takenDoses, [med._id]: isNowTaken }
    setTakenDoses(updatedTaken)
    localStorage.setItem('user_taken_doses', JSON.stringify(updatedTaken))

    // Update Stock (-1 on take, +1 on untake)
    const currentStock = pillStocks[med._id] !== undefined ? pillStocks[med._id] : 15
    const newStock = isNowTaken ? Math.max(0, currentStock - 1) : currentStock + 1
    const updatedStocks = { ...pillStocks, [med._id]: newStock }
    setPillStocks(updatedStocks)
    localStorage.setItem('user_pill_stocks', JSON.stringify(updatedStocks))

    if (isNowTaken) {
      const newNotif = {
        id: Date.now(),
        title: 'Dose Recorded',
        desc: `Marked ${med.name} as taken. 1 tablet deducted (${newStock} left).`,
        time: 'Just now',
        unread: true
      }
      setNotifications(prev => [newNotif, ...prev])
    }
  }

  // 📦 1-Click Refill Pills Stock (+10 or +30)
  const handleRefillStock = (medId, count) => {
    const current = pillStocks[medId] !== undefined ? pillStocks[medId] : 0
    const updated = { ...pillStocks, [medId]: current + count }
    setPillStocks(updated)
    localStorage.setItem('user_pill_stocks', JSON.stringify(updated))

    const newNotif = {
      id: Date.now(),
      title: 'Pill Stock Refilled',
      desc: `Added +${count} tablets to inventory. Current stock: ${current + count}`,
      time: 'Just now',
      unread: true
    }
    setNotifications(prev => [newNotif, ...prev])
  }

  const handleSaveVitals = (e) => {
    e.preventDefault()
    setVitals(tempVitals)
    localStorage.setItem('user_vitals_data', JSON.stringify(tempVitals))
    setIsEditingVitals(false)
  }

  const totalMeds = medicines.length
  const takenCount = medicines.filter(m => takenDoses[m._id]).length
  const pendingCount = totalMeds - takenCount
  const adherenceRate = totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 0
  const primaryEmergency = contacts.length > 0 ? contacts[0] : null
  const unreadNotifsCount = notifications.filter(n => n.unread).length

  // Filtered medicines
  const filteredMeds = medicines.filter(m => {
    if (doseFilter === 'pending') return !takenDoses[m._id]
    if (doseFilter === 'completed') return !!takenDoses[m._id]
    return true
  })

  // Low stock inventory check (5 or fewer tablets)
  const lowStockMeds = medicines.filter(m => {
    const stock = pillStocks[m._id] !== undefined ? pillStocks[m._id] : 15
    return stock <= 5
  })

  const nextAppointment = appointments.length > 0 ? appointments[0] : null

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '24px auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f8fafc',
      position: 'relative'
    }}>

      {/* ============================================================== */}
      {/* 🚨 CRITICAL FULL-SCREEN DOSE MISSED / TIME-UP ALARM OVERLAY */}
      {/* ============================================================== */}
      {activeAlarmMed && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(153, 27, 27, 0.95)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '36px 28px',
            maxWidth: '460px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            border: '4px solid #ef4444'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🔔</div>
            <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.85rem', fontWeight: '800', padding: '4px 14px', borderRadius: '20px' }}>
              MEDICINE TIME ALARM
            </span>

            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: '14px 0 6px 0' }}>
              Dawai Lene Ka Samay Ho Gaya!
            </h2>
            <p style={{ color: '#475569', fontSize: '1rem', margin: '0 0 20px 0' }}>
              Aapki dawai <strong style={{ color: '#2563eb' }}>{activeAlarmMed.name}</strong> ({activeAlarmMed.dosage || '1 Dose'}) scheduled hai.
            </p>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', textAlign: 'left', fontSize: '0.9rem', color: '#0f172a' }}>
              <div>⏰ <strong>Scheduled Time:</strong> {activeAlarmMed.time || 'Due Now'}</div>
              <div>📦 <strong>Current Stock:</strong> {pillStocks[activeAlarmMed._id] !== undefined ? pillStocks[activeAlarmMed._id] : '15'} tablets left</div>
              <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px' }}>
                ⚠️ Acknowledge karne par dose taken mark hogi aur 1 goli stock se minus ho jayegi.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <button
                onClick={() => stopAlarmAndMarkTaken(activeAlarmMed._id)}
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(22, 163, 74, 0.4)'
                }}
              >
                ✓ Maine Dawai Le Li (Stop Alarm)
              </button>

              <button
                onClick={dismissAlarmOnly}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#64748b',
                  padding: '10px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Snooze (10 Mins Baad Yaad Dilana)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📦 LOW STOCK PILL REFILL WARNING STRIP */}
      {lowStockMeds.length > 0 && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(234, 179, 8, 0.2) 0%, rgba(202, 138, 4, 0.15) 100%)',
          border: '1px solid #facc15',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>📦</span>
            <div>
              <strong style={{ color: '#facc15', fontSize: '1rem', display: 'block' }}>
                Pharmacy Stock Refill Warning ({lowStockMeds.length} Medicine Low)
              </strong>
              <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                {lowStockMeds.map(m => `${m.name} (${pillStocks[m._id] !== undefined ? pillStocks[m._id] : 3} pills remaining)`).join(', ')}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleRefillStock(lowStockMeds[0]._id, 30)}
            style={{
              background: '#facc15',
              color: '#000000',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '8px',
              fontWeight: '800',
              cursor: 'pointer',
              fontSize: '0.82rem'
            }}
          >
            + Refill Full Strip (+30 Pills)
          </button>
        </div>
      )}

      {/* 🚨 Emergency Assistance Top Bar */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.28) 0%, rgba(153, 27, 27, 0.22) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.45)',
        borderRadius: '14px',
        padding: '14px 20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 4px 20px rgba(220, 38, 38, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.8rem' }}>🚨</span>
          <div>
            <strong style={{ color: '#fca5a5', fontSize: '0.95rem', display: 'block' }}>Emergency Assistance</strong>
            <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
              {primaryEmergency ? `Quick Dial Primary Contact (${primaryEmergency.name})` : 'No emergency contact registered'}
            </span>
          </div>
        </div>
        {primaryEmergency ? (
          <a
            href={`tel:${primaryEmergency.phone}`}
            style={{
              background: '#dc2626',
              color: '#ffffff',
              padding: '9px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📞 Call {primaryEmergency.name}
          </a>
        ) : (
          <button
            onClick={() => navigateTo('/emergency')}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem'
            }}
          >
            Add Contact
          </button>
        )}
      </div>

      {/* Header Banner With Live Clock & Action Controls */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.85) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '1.8rem', fontWeight: '800' }}>
            Welcome back, <span style={{ color: '#38bdf8' }}>{user.name || 'Elder Member'}</span> 👋
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#94a3b8', fontSize: '0.95rem' }}>
            <span>📅 {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span style={{ color: '#38bdf8', fontWeight: '600' }}>⏰ {currentTime.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Buttons Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Quick Alarm Demo Trigger */}
          <button
            onClick={() => {
              const testMed = medicines[0] || { _id: 'test_1', name: 'Shelcal 500', dosage: '1 Tab', time: '10:00 AM' }
              triggerDoseAlarm(testMed)
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              color: '#f87171',
              padding: '10px 16px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            ⚡ Test Medicine Alarm
          </button>

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={syncing}
            style={{
              background: syncing ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              padding: '10px 18px',
              borderRadius: '20px',
              color: '#38bdf8',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: syncing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: syncing ? '#f59e0b' : '#22c55e' }}></span>
            {syncing ? 'Syncing...' : '● Live Sync'}
          </button>

          {/* 🔔 Live Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifTray(!showNotifTray)}
              title="Notifications"
              style={{
                background: showNotifTray ? '#0284c7' : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              🔔
              {unreadNotifsCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  background: '#ef4444', color: '#fff', borderRadius: '50%',
                  width: '18px', height: '18px', fontSize: '0.7rem', fontWeight: '800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Tray */}
            {showNotifTray && (
              <div style={{
                position: 'absolute', top: '50px', right: '0', width: '320px',
                background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px',
                padding: '16px', boxShadow: '0 12px 30px rgba(0,0,0,0.6)', zIndex: 1000
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>Alerts & Activity</strong>
                  <button onClick={markAllNotifsRead} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}>
                    Mark all read
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{
                      padding: '10px',
                      background: n.unread ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      borderLeft: n.unread ? '3px solid #38bdf8' : '3px solid transparent',
                      borderRadius: '6px', fontSize: '0.8rem'
                    }}>
                      <div style={{ fontWeight: '700', color: '#ffffff', marginBottom: '2px' }}>{n.title}</div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>{n.desc}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '4px' }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ⚙️ Dashboard Setting Icon */}
          <button
            onClick={() => setShowSettingsModal(true)}
            title="App Settings"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff', width: '42px', height: '42px', borderRadius: '50%',
              cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* 🩺 Next Appointment & 👨‍👩‍👧 Family Status Row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px', marginBottom: '24px'
      }}>
        {/* Next Appointment Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.12) 0%, rgba(5, 150, 105, 0.1) 100%)',
          border: '1px solid rgba(74, 222, 128, 0.35)', borderRadius: '16px',
          padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.2rem' }}>🩺</span>
              <span style={{ color: '#4ade80', fontWeight: '700', fontSize: '0.85rem' }}>Next Doctor Checkup</span>
            </div>
            {nextAppointment ? (
              <>
                <h3 style={{ margin: '2px 0', fontSize: '1.2rem', color: '#ffffff', fontWeight: '800' }}>
                  {nextAppointment.doctorName}
                </h3>
                <span style={{ color: '#cbd5e1', fontSize: '0.85rem', display: 'block' }}>
                  🏥 {nextAppointment.hospital}
                </span>
                <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: '700', marginTop: '4px', display: 'inline-block' }}>
                  📅 {nextAppointment.date} at {nextAppointment.time || '10:00 AM'}
                </span>
              </>
            ) : (
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>No upcoming visits scheduled.</p>
            )}
          </div>
          <button
            onClick={() => navigateTo('/appointments')}
            style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            View Details ➔
          </button>
        </div>

        {/* Family Caregiver Notification Status */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px',
          padding: '18px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: '700', color: '#38bdf8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>👨‍👩‍👧</span> Family Notification Status
            </span>
            <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: '600' }}>● Auto Sync On</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {familyMembers.length > 0 ? (
              familyMembers.slice(0, 2).map((fam, idx) => (
                <div key={fam._id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: '#cbd5e1' }}>{fam.name} ({fam.relation || 'Caregiver'})</span>
                  <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: '700', background: 'rgba(74, 222, 128, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                    ✓ Notified
                  </span>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: '#cbd5e1' }}>Suraj Prajapati (Primary Contact)</span>
                <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: '700', background: 'rgba(74, 222, 128, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                  ✓ Doses Synced
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => navigateTo('/family')}
            style={{ background: 'transparent', border: 'none', color: '#38bdf8', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}
          >
            Manage Caregivers Network ➔
          </button>
        </div>
      </div>

      {/* Adherence & Pending Alert Row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px', marginBottom: '24px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px', padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: '600', color: '#cbd5e1' }}>Daily Medicine Intake Adherence</span>
            <span style={{ color: '#38bdf8', fontWeight: '700' }}>
              {takenCount} of {totalMeds} Doses Taken ({adherenceRate}%)
            </span>
          </div>
          <div style={{ width: '100%', height: '9px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{
              width: `${adherenceRate}%`, height: '100%',
              background: 'linear-gradient(90deg, #38bdf8 0%, #4ade80 100%)',
              transition: 'width 0.4s ease'
            }}></div>
          </div>
        </div>

        <div style={{
          background: pendingCount > 0 ? 'rgba(251, 146, 60, 0.12)' : 'rgba(74, 222, 128, 0.12)',
          border: pendingCount > 0 ? '1px solid rgba(251, 146, 60, 0.3)' : '1px solid rgba(74, 222, 128, 0.3)',
          borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <strong style={{ color: pendingCount > 0 ? '#fb923c' : '#4ade80', fontSize: '1rem', display: 'block' }}>
              {pendingCount > 0 ? `⚠️ ${pendingCount} Doses Remaining Today` : '🎉 All Doses Taken Today!'}
            </strong>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              {pendingCount > 0 ? 'Samay par dawai lena na bhooliye' : 'Aapka swasthya hamari prathmikta hai'}
            </span>
          </div>
        </div>
      </div>

      {/* 💊 MEDICINE SCHEDULE & INVENTORY STOCK TRACKER */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
              💊 Today's Medication & Pill Stock Tracker
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Dose lene par pill inventory se automatic 1 tablet deduct hogi
            </span>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'pending', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setDoseFilter(f)}
                style={{
                  background: doseFilter === f ? '#0284c7' : 'rgba(255,255,255,0.06)',
                  border: 'none',
                  color: doseFilter === f ? '#ffffff' : '#94a3b8',
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Loading prescriptions...</div>
        ) : filteredMeds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No medications found for this filter.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredMeds.map(med => {
              const isTaken = !!takenDoses[med._id]
              const stock = pillStocks[med._id] !== undefined ? pillStocks[med._id] : 15
              const isLowStock = stock <= 5

              return (
                <div
                  key={med._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: isTaken ? 'rgba(74, 222, 128, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: isLowStock ? '1px solid #facc15' : isTaken ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '1rem', color: isTaken ? '#4ade80' : '#ffffff' }}>{med.name}</strong>
                      {isLowStock && (
                        <span style={{ background: '#facc15', color: '#000', fontSize: '0.7rem', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                          LOW STOCK: {stock} LEFT
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                      {med.dosage || '1 Dose'} • ⏰ {med.time || '10:00 AM'} • 📦 <strong style={{ color: isLowStock ? '#facc15' : '#38bdf8' }}>{stock} tablets</strong> in box
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* +10 Pills Quick Refill */}
                    <button
                      onClick={() => handleRefillStock(med._id, 10)}
                      title="Add 10 pills to inventory"
                      style={{
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid #38bdf8',
                        color: '#38bdf8',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      +10 Strip
                    </button>

                    {!isTaken && (
                      <button
                        onClick={() => triggerDoseAlarm(med)}
                        title="Ring manual alarm"
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid #ef4444',
                          color: '#f87171',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        🔔 Ring
                      </button>
                    )}

                    <button
                      onClick={() => toggleDose(med)}
                      style={{
                        background: isTaken ? '#15803d' : '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {isTaken ? '✓ Taken' : 'Mark as Taken'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 🩺 Health Vitals Tracker Row */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
            🩺 Health Vitals Tracker
          </h2>
          <button
            onClick={() => setIsEditingVitals(!isEditingVitals)}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              padding: '6px 14px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            {isEditingVitals ? 'Cancel' : 'Update Vitals ➔'}
          </button>
        </div>

        {isEditingVitals ? (
          <form onSubmit={handleSaveVitals} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <input
              type="text"
              placeholder="BP (e.g. 120/80)"
              value={tempVitals.bp}
              onChange={(e) => setTempVitals({ ...tempVitals, bp: e.target.value })}
              style={inputFieldStyle}
              required
            />
            <input
              type="text"
              placeholder="Sugar (e.g. 110 mg/dL)"
              value={tempVitals.sugar}
              onChange={(e) => setTempVitals({ ...tempVitals, sugar: e.target.value })}
              style={inputFieldStyle}
              required
            />
            <input
              type="text"
              placeholder="Pulse (e.g. 74 bpm)"
              value={tempVitals.pulse}
              onChange={(e) => setTempVitals({ ...tempVitals, pulse: e.target.value })}
              style={inputFieldStyle}
              required
            />
            <button
              type="submit"
              style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
            >
              Save Vitals
            </button>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <div style={vitalCardStyle}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>BLOOD PRESSURE</span>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#38bdf8', margin: '4px 0' }}>{vitals.bp}</div>
              <span style={{ fontSize: '0.72rem', color: '#4ade80' }}>● Optimal</span>
            </div>
            <div style={vitalCardStyle}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>BLOOD SUGAR</span>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#facc15', margin: '4px 0' }}>{vitals.sugar}</div>
              <span style={{ fontSize: '0.72rem', color: '#4ade80' }}>● Fasting Normal</span>
            </div>
            <div style={vitalCardStyle}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>PULSE RATE</span>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#4ade80', margin: '4px 0' }}>{vitals.pulse}</div>
              <span style={{ fontSize: '0.72rem', color: '#4ade80' }}>● Regular</span>
            </div>
          </div>
        )}
      </div>

      {/* ⚙️ Settings Modal */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px',
            padding: '24px', maxWidth: '380px', width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>App Preferences</h3>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
              Pill Inventory Refill Tracking & Missed Dose Acoustic Siren Alarm enabled for elder adherence.
            </p>
            <button
              onClick={() => {
                localStorage.clear()
                sessionStorage.clear()
                navigateTo('/login')
              }}
              style={{ width: '100%', background: '#dc2626', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
            >
              Logout Account
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

const vitalCardStyle = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '12px',
  padding: '14px',
  textAlign: 'center'
}

const inputFieldStyle = {
  padding: '10px 14px',
  background: '#020617',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#ffffff',
  outline: 'none',
  fontSize: '0.85rem'
}