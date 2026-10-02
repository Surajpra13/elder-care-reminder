import React, { useState } from 'react'

export default function AdminDashboard() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_session_auth') === 'true'
  })
  const [adminPinInput, setAdminPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [masterPin, setMasterPin] = useState(() => {
    return localStorage.getItem('app_master_pin') || '7788'
  })

  // Navigation state
  const [activeMenu, setActiveMenu] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [actionNotice, setActionNotice] = useState('')

  // Modals & Sub-states
  const [selectedAppointmentModal, setSelectedAppointmentModal] = useState(null)
  const [inspectUser, setInspectUser] = useState(null)
  const [broadcastMessage, setBroadcastMessage] = useState('')

  // Settings Inputs
  const [newElder, setNewElder] = useState({ name: '', email: '', phone: '', age: '', bloodGroup: 'B+' })
  const [newPinValue, setNewPinValue] = useState('')

  // 1. Data Store
  const [users, setUsers] = useState([
    { _id: 'u1', name: 'Umesh Prajapati', phone: '+91 9876543210', email: 'umesh@example.com', age: 68, bloodGroup: 'B+', bp: '124/82', sugar: '112 mg/dL', adherence: 85, meds: 10, appts: 4, status: 'Active' },
    { _id: 'u2', name: 'Ramesh Patel', phone: '+91 9822334455', email: 'ramesh.patel@example.com', age: 72, bloodGroup: 'O+', bp: '142/90', sugar: '158 mg/dL', adherence: 60, meds: 8, appts: 2, status: 'Active' },
    { _id: 'u3', name: 'Kavita Verma', phone: '+91 9811002233', email: 'kavita.v@example.com', age: 65, bloodGroup: 'A+', bp: '118/78', sugar: '105 mg/dL', adherence: 90, meds: 6, appts: 1, status: 'Inactive' }
  ])

  const [medicines, setMedicines] = useState([
    { _id: 'm1', patient: 'Umesh Prajapati', name: 'Shelcal 500', dosage: '1 Tab', time: '10:00 AM', slot: 'Morning', status: 'Taken' },
    { _id: 'm2', patient: 'Umesh Prajapati', name: 'Atorvastatin', dosage: '10mg', time: '10:00 AM', slot: 'Morning', status: 'Taken' },
    { _id: 'm3', patient: 'Umesh Prajapati', name: 'Telma 40', dosage: '40mg', time: '08:30 PM', slot: 'Night', status: 'Pending' },
    { _id: 'm4', patient: 'Ramesh Patel', name: 'Metformin', dosage: '500mg', time: '01:30 PM', slot: 'Afternoon', status: 'Missed' },
    { _id: 'm5', patient: 'Kavita Verma', name: 'Glycomet 500', dosage: '1 Tab', time: '09:00 AM', slot: 'Morning', status: 'Taken' }
  ])

  const [appointments, setAppointments] = useState([
    {
      _id: 'a1',
      patient: 'Umesh Prajapati',
      doctor: 'Dr. Rajesh Sharma',
      specialty: 'Cardiologist',
      clinic: 'Apex Heart Care & Multi-Specialty Clinic',
      address: 'Near Station Road, Andheri East, Mumbai, Maharashtra 400069',
      phone: '+91 98200 12345',
      date: '05 Oct 2026',
      time: '10:30 AM',
      status: 'Upcoming',
      notes: 'Routine hypertension follow-up & ECG review.',
      fee: '₹800'
    },
    {
      _id: 'a2',
      patient: 'Ramesh Patel',
      doctor: 'Dr. Sunita Patel',
      specialty: 'Ophthalmology',
      clinic: 'City Eye Super Specialty Hospital',
      address: 'Plot 45, Sector 17, Vashi, Navi Mumbai, Maharashtra 400703',
      phone: '+91 98211 54321',
      date: '06 Oct 2026',
      time: '11:15 AM',
      status: 'Upcoming',
      notes: 'Cataract post-op lens clearance check.',
      fee: '₹600'
    }
  ])

  const [emergencies, setEmergencies] = useState([
    { id: 'e1', patient: 'Umesh Prajapati', responder: 'Suraj Prajapati (Son)', phone: '+91 84519 71642', time: '10:25 PM', location: '19.0760° N, 72.8777° E (Mumbai)', status: 'Active' },
    { id: 'e2', patient: 'Ramesh Patel', responder: 'Pooja Patel (Daughter)', phone: '+91 98221 14433', time: 'Yesterday', location: 'Mumbai East', status: 'Resolved' }
  ])

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'Missed Dose', text: 'Metformin not acknowledged by Ramesh Patel', time: '15m ago', target: 'Caregiver SMS Dispatched' },
    { id: 2, type: 'SOS Beacon', text: 'Live telemetry handshake verified for Umesh Prajapati', time: '1h ago', target: 'Auto Siren Armed' },
    { id: 3, type: 'Sync Event', text: 'Automated biotelemetry snapshot archived', time: '3h ago', target: 'Database Backup' }
  ])

  const [auditLogs, setAuditLogs] = useState([
    { id: 'l1', event: 'Telemetry Stream OK', actor: 'IoTHub Node-01', time: 'Just now', type: 'info' },
    { id: 'l2', event: 'SOS Distress Signal Handshake', actor: 'AlertService', time: '10:15 AM', type: 'danger' },
    { id: 'l3', event: 'Master Security Authorized', actor: 'RootAdmin', time: '10:00 AM', type: 'success' },
    { id: 'l4', event: 'Prescription Sync from MongoDB', actor: 'CronWorker', time: 'Yesterday', type: 'info' }
  ])

  const showNotice = (msg) => {
    setActionNotice(msg)
    setTimeout(() => setActionNotice(''), 3200)
  }

  const handleVerifyPin = (e) => {
    e.preventDefault()
    if (adminPinInput.trim() === masterPin.trim()) {
      setIsAdminAuthenticated(true)
      sessionStorage.setItem('admin_session_auth', 'true')
      setPinError('')
    } else {
      setPinError('Invalid PIN! Default: 7788')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session_auth')
    setIsAdminAuthenticated(false)
    window.location.pathname = '/admin-login'
  }

  const toggleUserStatus = (id) => {
    setUsers(users.map(u => u._id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
    showNotice('User status updated!')
  }

  const resolveEmergency = (id) => {
    setEmergencies(emergencies.map(e => e.id === id ? { ...e, status: 'Resolved' } : e))
    showNotice('Distress alert marked as Resolved!')
  }

  const handleAddPatient = (e) => {
    e.preventDefault()
    if (!newElder.name) return
    const created = {
      _id: `u_${Date.now()}`,
      name: newElder.name,
      email: newElder.email,
      phone: newElder.phone || '+91 99999 99999',
      age: Number(newElder.age) || 68,
      bloodGroup: newElder.bloodGroup,
      bp: '120/80',
      sugar: '110 mg/dL',
      adherence: 100,
      meds: 0,
      appts: 0,
      status: 'Active'
    }
    setUsers([created, ...users])
    setNewElder({ name: '', email: '', phone: '', age: '', bloodGroup: 'B+' })
    showNotice(`Patient "${created.name}" provisioned successfully!`)
    setActiveMenu('users')
  }

  const handleBroadcastAlert = (e) => {
    e.preventDefault()
    if (!broadcastMessage.trim()) return
    const newAlert = {
      id: Date.now(),
      type: 'Broadcast',
      text: broadcastMessage,
      time: 'Just now',
      target: 'All Registered Elders'
    }
    setNotifications([newAlert, ...notifications])
    setBroadcastMessage('')
    showNotice('Broadcast sent to all connected elders!')
  }

  // Audio Siren Test
  const testAudioSiren = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(850, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.45)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.5)
      showNotice('🚨 Emergency acoustic siren drill executed!')
    } catch {
      showNotice('Emergency drill executed.')
    }
  }

  const exportBackup = () => {
    const backup = { timestamp: new Date().toISOString(), users, medicines, appointments, emergencies }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eldercare_backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    showNotice('System snapshot downloaded (.JSON)')
  }

  // PIN Gatekeeper
  if (!isAdminAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px', maxWidth: '360px', width: '90%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🛡</div>
          <h2 style={{ color: '#fff', margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: '800' }}>Admin Console Access</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>Enter Master PIN (Default: <strong style={{ color: '#38bdf8' }}>7788</strong>)</p>
          <form onSubmit={handleVerifyPin}>
            <input
              type="password"
              placeholder="••••"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              style={{ width: '100%', padding: '12px', background: '#020617', border: pinError ? '1px solid #ef4444' : '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '1.4rem', textAlign: 'center', letterSpacing: '8px', boxSizing: 'border-box', marginBottom: '14px', outline: 'none' }}
              required
              autoFocus
            />
            {pinError && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '12px' }}>{pinError}</div>}
            <button type="submit" style={{ width: '100%', background: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
              Authorize Console
            </button>
          </form>
        </div>
      </div>
    )
  }

  const activeSOS = emergencies.filter(e => e.status === 'Active')

  const menuItems = [
    { id: 'overview', label: 'Console Overview', icon: '📊' },
    { id: 'users', label: 'Elders Registry', icon: '👥', badge: users.length },
    { id: 'medicines', label: 'Dose Schedules', icon: '💊', badge: medicines.length },
    { id: 'appointments', label: 'Consultations', icon: '📅', badge: appointments.length },
    { id: 'emergency', label: 'Distress Alarms', icon: '🚨', alert: activeSOS.length > 0, badge: activeSOS.length },
    { id: 'notifications', label: 'Dispatch Alerts', icon: '🔔', badge: notifications.length },
    { id: 'logs', label: 'Audit Trail', icon: '📝' },
    { id: 'settings', label: 'Settings & Tools', icon: '⚙️' }
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050811', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 🧭 LEFT SIDEBAR */}
      <aside style={{
        width: '260px',
        minWidth: '260px',
        background: '#090d16',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxSizing: 'border-box',
        zIndex: 50
      }}>
        <div>
          {/* Logo Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid #1e293b' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              🛡
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#fff' }}>ELDERCARE</div>
              <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '700' }}>ROOT CONSOLE v2.6</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '18px' }}>
            {menuItems.map(item => {
              const isActive = activeMenu === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? '#0284c7' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: '0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span style={{
                      background: item.alert ? '#ef4444' : isActive ? 'rgba(255,255,255,0.25)' : '#1e293b',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      padding: '2px 7px',
                      borderRadius: '10px'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '8px' }}>Master Supervisor</div>
          <button
            onClick={handleLogout}
            style={{ width: '100%', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '9px', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            🔒 Terminate Session
          </button>
        </div>
      </aside>

      {/* 🖥️ MAIN WORKSPACE */}
      <main style={{ flex: 1, padding: '26px 36px', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {activeMenu.replace('_', ' ')} COMMAND CENTER
            </h1>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              Node cluster active • PostgreSQL/MongoDB latency: 12ms
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', background: '#090d16', border: '1px solid #1e293b', padding: '6px 12px', borderRadius: '6px', color: '#94a3b8' }}>
              🕒 {new Date().toLocaleTimeString()}
            </span>
            <button
              onClick={() => showNotice('System telemetry refreshed!')}
              style={{ background: '#0284c7', border: 'none', color: '#fff', padding: '7px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Sync Data ↻
            </button>
          </div>
        </header>

        {actionNotice && (
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0284c7', color: '#38bdf8', padding: '10px 16px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.85rem' }}>
            {actionNotice}
          </div>
        )}

        {/* ============================================================== */}
        {/* 1. 📊 CONSOLE OVERVIEW (RICH VISUALS: GRAPHS + METRICS) */}
        {/* ============================================================== */}
        {activeMenu === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* Critical SOS Pulsing Banner */}
            {activeSOS.length > 0 && (
              <div style={{
                background: 'linear-gradient(90deg, #991b1b 0%, #7f1d1d 100%)',
                border: '1px solid #ef4444',
                borderRadius: '10px',
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.6rem' }}>🚨</span>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#fff' }}>ACTIVE DISTRESS SOS SIGNAL: {activeSOS[0].patient}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#fca5a5' }}>Responder: {activeSOS[0].responder} • Location: {activeSOS[0].location}</div>
                  </div>
                </div>
                <button
                  onClick={() => resolveEmergency(activeSOS[0].id)}
                  style={{ background: '#ffffff', color: '#991b1b', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Acknowledge & Resolve
                </button>
              </div>
            )}

            {/* Top 4 KPI Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              <div onClick={() => setActiveMenu('users')} style={{ ...statCardStyle, cursor: 'pointer' }}>
                <span style={statLabelStyle}>REGISTERED PATIENTS</span>
                <div style={{ fontSize: '2rem', fontWeight: '800', margin: '4px 0', color: '#fff' }}>{users.length}</div>
                <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>● {users.filter(u => u.status === 'Active').length} Active sessions</span>
              </div>

              <div onClick={() => setActiveMenu('medicines')} style={{ ...statCardStyle, cursor: 'pointer' }}>
                <span style={statLabelStyle}>ACTIVE PRESCRIPTIONS</span>
                <div style={{ fontSize: '2rem', fontWeight: '800', margin: '4px 0', color: '#38bdf8' }}>{medicines.length}</div>
                <span style={{ fontSize: '0.75rem', color: '#f87171' }}>1 Doses flagged missed</span>
              </div>

              <div onClick={() => setActiveMenu('appointments')} style={{ ...statCardStyle, cursor: 'pointer' }}>
                <span style={statLabelStyle}>CONSULTATIONS QUEUED</span>
                <div style={{ fontSize: '2rem', fontWeight: '800', margin: '4px 0', color: '#facc15' }}>{appointments.length}</div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Confirmed specialist visits</span>
              </div>

              <div style={statCardStyle}>
                <span style={statLabelStyle}>COMPLIANCE HEALTH</span>
                <div style={{ fontSize: '2rem', fontWeight: '800', margin: '4px 0', color: '#4ade80' }}>88.4%</div>
                <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>Above 80% protocol target</span>
              </div>
            </div>

            {/* Dual Visual Charts: Donut Compliance + 7-Day Trend Bar Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '18px' }}>
              
              {/* Circular Gauge */}
              <div style={boxStyle}>
                <strong style={{ fontSize: '0.95rem', color: '#38bdf8', display: 'block', marginBottom: '16px' }}>
                  💊 System-Wide Medicine Adherence Rate
                </strong>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                  <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="3.8" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0284c7" strokeWidth="3.8" strokeDasharray="86, 100" />
                    </svg>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>86%</span>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Adherence</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                    <div>🟢 Taken: <strong style={{ color: '#4ade80' }}>38 Doses</strong></div>
                    <div>🟡 Pending: <strong style={{ color: '#facc15' }}>5 Doses</strong></div>
                    <div>🔴 Missed: <strong style={{ color: '#f87171' }}>7 Doses</strong></div>
                  </div>
                </div>
              </div>

              {/* 7-Day Bar Chart */}
              <div style={boxStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#4ade80' }}>📅 7-Day Adherence Frequency</strong>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Daily Telemetry Logs</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', padding: '0 10px', borderBottom: '1px solid #1e293b' }}>
                  {[
                    { day: 'Mon', h: 90 }, { day: 'Tue', h: 85 }, { day: 'Wed', h: 75 },
                    { day: 'Thu', h: 95 }, { day: 'Fri', h: 80 }, { day: 'Sat', h: 70 }, { day: 'Sun', h: 90 }
                  ].map((b, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '18px', height: `${b.h}px`, background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)', borderRadius: '4px 4px 0 0' }}></div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>{b.day}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '10px' }}>
                  System Compliance Threshold Target Met (&gt;80%)
                </div>
              </div>

            </div>

            {/* Patient Triage Stream */}
            <div style={boxStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <strong style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>PATIENT TRIAGE & TELEMETRY STREAM</strong>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '700' }}>● LIVE SENSOR SYNC</span>
              </div>

              <table style={tableStyle}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', fontSize: '0.75rem' }}>
                    <th style={thStyle}>PATIENT</th>
                    <th style={thStyle}>BLOOD PRESSURE</th>
                    <th style={thStyle}>BLOOD GLUCOSE</th>
                    <th style={thStyle}>ADHERENCE</th>
                    <th style={thStyle}>STATUS</th>
                    <th style={thStyle}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={tdStyle}>
                        <strong style={{ color: '#fff' }}>{u.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{u.phone}</div>
                      </td>
                      <td style={{ ...tdStyle, color: '#fff', fontWeight: '700' }}>{u.bp}</td>
                      <td style={{ ...tdStyle, color: '#fff', fontWeight: '700' }}>{u.sugar}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{u.adherence}%</span>
                          <div style={{ width: '60px', height: '5px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${u.adherence}%`, height: '100%', background: u.adherence >= 80 ? '#4ade80' : '#fb923c' }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800',
                          background: u.status === 'Active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: u.status === 'Active' ? '#4ade80' : '#f87171'
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button onClick={() => setInspectUser(u)} style={btnStyle('#1e293b', '#38bdf8')}>Audit Record ➔</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* 2. 👥 ELDERS REGISTRY (DETAILED CARDS + ACTION TABLE) */}
        {/* ============================================================== */}
        {activeMenu === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Quick Cohort Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={boxStyle}>
                <span style={statLabelStyle}>TOTAL POPULATION</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', margin: '4px 0' }}>{users.length} Elders</div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fully onboarded in database</span>
              </div>
              <div style={boxStyle}>
                <span style={statLabelStyle}>ACTIVE SESSIONS</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4ade80', margin: '4px 0' }}>{users.filter(u => u.status === 'Active').length} Active</div>
                <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>Connected to telemetry sensors</span>
              </div>
              <div style={boxStyle}>
                <span style={statLabelStyle}>HIGH ATTENTION COHORT</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f87171', margin: '4px 0' }}>1 Flagged</div>
                <span style={{ fontSize: '0.75rem', color: '#f87171' }}>Low adherence detected</span>
              </div>
            </div>

            {/* Table */}
            <div style={boxStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <strong style={{ fontSize: '1.1rem', color: '#38bdf8' }}>CENTRAL ELDER REGISTRY DIRECTORY</strong>
                <input
                  type="text"
                  placeholder="Search user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={searchBoxStyle}
                />
              </div>

              <table style={tableStyle}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', fontSize: '0.75rem' }}>
                    <th style={thStyle}>NAME</th>
                    <th style={thStyle}>EMAIL</th>
                    <th style={thStyle}>CONTACT</th>
                    <th style={thStyle}>AGE / BLOOD</th>
                    <th style={thStyle}>MEDICINES</th>
                    <th style={thStyle}>STATUS</th>
                    <th style={thStyle}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={tdStyle}><strong style={{ color: '#fff' }}>{u.name}</strong></td>
                      <td style={tdStyle}>{u.email}</td>
                      <td style={tdStyle}>{u.phone}</td>
                      <td style={tdStyle}>{u.age} yrs • <span style={{ color: '#f87171', fontWeight: '700' }}>{u.bloodGroup}</span></td>
                      <td style={tdStyle}><strong style={{ color: '#38bdf8' }}>{u.meds} Prescribed</strong></td>
                      <td style={tdStyle}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', background: u.status === 'Active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: u.status === 'Active' ? '#4ade80' : '#f87171' }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => setInspectUser(u)} style={btnStyle('#1e293b', '#38bdf8')}>Medical Card</button>
                          <button onClick={() => toggleUserStatus(u._id)} style={btnStyle(u.status === 'Active' ? '#7f1d1d' : '#14532d', '#fff')}>
                            {u.status === 'Active' ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* 3. 💊 DOSE SCHEDULES (SLOT-BASED BREAKDOWN) */}
        {/* ============================================================== */}
        {activeMenu === 'medicines' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={{ ...boxStyle, borderLeft: '4px solid #4ade80' }}>
                <span style={statLabelStyle}>TAKEN DOSES</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4ade80', margin: '4px 0' }}>3 Doses</div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Successfully acknowledged</span>
              </div>
              <div style={{ ...boxStyle, borderLeft: '4px solid #facc15' }}>
                <span style={statLabelStyle}>PENDING DOSES</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#facc15', margin: '4px 0' }}>1 Doses</div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Due later tonight (08:30 PM)</span>
              </div>
              <div style={{ ...boxStyle, borderLeft: '4px solid #f87171' }}>
                <span style={statLabelStyle}>MISSED DOSE ALERT</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f87171', margin: '4px 0' }}>1 Alert</div>
                <span style={{ fontSize: '0.75rem', color: '#f87171' }}>Metformin (Caregiver Notified)</span>
              </div>
            </div>

            <div style={boxStyle}>
              <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '16px', color: '#38bdf8' }}>PRESCRIPTION TRACKER MATRIX</strong>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', fontSize: '0.75rem' }}>
                    <th style={thStyle}>PATIENT</th>
                    <th style={thStyle}>MEDICINE</th>
                    <th style={thStyle}>DOSAGE</th>
                    <th style={thStyle}>TIME & SLOT</th>
                    <th style={thStyle}>STATUS</th>
                    <th style={thStyle}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map(m => (
                    <tr key={m._id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={tdStyle}><strong style={{ color: '#fff' }}>{m.patient}</strong></td>
                      <td style={tdStyle}>{m.name}</td>
                      <td style={tdStyle}>{m.dosage}</td>
                      <td style={tdStyle}>⏰ {m.time} <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({m.slot})</span></td>
                      <td style={tdStyle}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', background: m.status === 'Taken' ? 'rgba(34,197,94,0.15)' : m.status === 'Pending' ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)', color: m.status === 'Taken' ? '#4ade80' : m.status === 'Pending' ? '#facc15' : '#f87171' }}>
                          {m.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {m.status === 'Missed' ? (
                          <button onClick={() => showNotice(`Emergency alert dispatched for ${m.patient}`)} style={btnStyle('#dc2626', '#fff')}>
                            Alert Caregiver
                          </button>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Monitored</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* 4. 📅 CONSULTATIONS (MAPS + POPUP MODAL) */}
        {/* ============================================================== */}
        {activeMenu === 'appointments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={boxStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <strong style={{ fontSize: '1.1rem', color: '#38bdf8' }}>CONSULTATION CALENDAR & CLINICAL VISITS</strong>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Click "Details & Map" to view clinic address and route on Google Maps.</div>
                </div>
              </div>

              <table style={tableStyle}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', fontSize: '0.75rem' }}>
                    <th style={thStyle}>PATIENT</th>
                    <th style={thStyle}>DOCTOR</th>
                    <th style={thStyle}>SPECIALTY</th>
                    <th style={thStyle}>HOSPITAL / CLINIC</th>
                    <th style={thStyle}>SCHEDULE</th>
                    <th style={thStyle}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a._id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={tdStyle}><strong style={{ color: '#fff' }}>{a.patient}</strong></td>
                      <td style={tdStyle}>{a.doctor}</td>
                      <td style={tdStyle}><span style={{ color: '#38bdf8' }}>{a.specialty}</span></td>
                      <td style={tdStyle}>
                        <div>{a.clinic}</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{a.address}</div>
                      </td>
                      <td style={tdStyle}>📅 {a.date} ({a.time})</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(a.clinic + ' ' + a.address)}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ background: '#16a34a', color: '#fff', padding: '6px 10px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            🗺️ Map
                          </a>
                          <button
                            onClick={() => setSelectedAppointmentModal(a)}
                            style={btnStyle('#0284c7', '#fff')}
                          >
                            Full Slip ➔
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* 5. 🚨 DISTRESS ALARMS (RADAR & GPS DETAILS) */}
        {/* ============================================================== */}
        {activeMenu === 'emergency' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={boxStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <strong style={{ fontSize: '1.1rem', color: '#f87171' }}>DISTRESS & ACUTE SOS LOGS</strong>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Real-time GPS alerts triggered from elder distress buttons</div>
                </div>
                <button onClick={testAudioSiren} style={btnStyle('rgba(239, 68, 68, 0.2)', '#f87171')}>
                  🚨 Acoustic Siren Drill
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {emergencies.map(e => (
                  <div key={e.id} style={{
                    padding: '16px',
                    background: e.status === 'Active' ? 'rgba(239, 68, 68, 0.08)' : '#020617',
                    border: e.status === 'Active' ? '1px solid #ef4444' : '1px solid #1e293b',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: '800', fontSize: '1.05rem', color: '#fff' }}>{e.patient}</span>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800',
                          background: e.status === 'Active' ? '#dc2626' : '#15803d', color: '#fff'
                        }}>
                          {e.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '4px 0' }}>
                        📞 Caregiver Contact: <strong>{e.responder}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                        📍 Coordinates: {e.location}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(e.location)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: '#0284c7', color: '#fff', padding: '7px 12px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '700' }}
                      >
                        🗺️️ View on Map
                      </a>
                      {e.status === 'Active' && (
                        <button onClick={() => resolveEmergency(e.id)} style={btnStyle('#16a34a', '#fff')}>
                          ✓ Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* 6. 🔔 DISPATCH ALERTS (BROADCAST ENGINE) */}
        {/* ============================================================== */}
        {activeMenu === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Broadcast Terminal */}
            <div style={boxStyle}>
              <strong style={{ fontSize: '1rem', color: '#facc15', display: 'block', marginBottom: '8px' }}>
                📢 DISPATCH SYSTEM BROADCAST ALERT
              </strong>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 14px 0' }}>
                Push immediate notification slips to all registered elderly apps and caregiver WhatsApp logs.
              </p>

              <form onSubmit={handleBroadcastAlert} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="e.g. Extreme weather warning: Stay hydrated and remain indoors today."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  required
                />
                <button
                  type="submit"
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Broadcast ➔
                </button>
              </form>
            </div>

            {/* Alert Logs */}
            <div style={boxStyle}>
              <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '16px', color: '#38bdf8' }}>TELEMETRY NOTIFICATION QUEUE</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{ padding: '12px 16px', background: '#020617', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: '#38bdf8', fontWeight: '700', fontSize: '0.8rem' }}>[{n.type}]</span>{' '}
                      <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{n.text}</span>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>Target: {n.target}</div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{n.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* 7. 📝 AUDIT TRAIL (SECURITY TRAIL) */}
        {/* ============================================================== */}
        {activeMenu === 'logs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={boxStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <strong style={{ fontSize: '1.1rem', color: '#38bdf8' }}>PLATFORM AUDIT & SECURITY TRAIL</strong>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Chronological tamper-proof logs of administrative interventions</div>
                </div>
                <button onClick={exportBackup} style={btnStyle('#0284c7', '#fff')}>
                  📥 Export Log (.JSON)
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {auditLogs.map(l => (
                  <div key={l.id} style={{ padding: '10px 14px', background: '#020617', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: l.type === 'danger' ? '#f87171' : l.type === 'success' ? '#4ade80' : '#38bdf8', fontWeight: '700' }}>
                        [{l.actor}]
                      </span>{' '}
                      <strong style={{ color: '#fff' }}>{l.event}:</strong> {l.detail}
                    </div>
                    <span style={{ color: '#64748b' }}>{l.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* 8. ⚙️ SETTINGS & TOOLS */}
        {/* ============================================================== */}
        {activeMenu === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '18px' }}>
              
              {/* Provision New Patient */}
              <div style={boxStyle}>
                <strong style={{ fontSize: '1.05rem', color: '#38bdf8', display: 'block', marginBottom: '12px' }}>
                  ➕ PROVISION NEW PATIENT RECORD
                </strong>
                <form onSubmit={handleAddPatient} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Full Name</label>
                    <input type="text" placeholder="e.g. Anand Sharma" value={newElder.name} onChange={(e) => setNewElder({ ...newElder, name: e.target.value })} style={inputStyle} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" placeholder="anand@example.com" value={newElder.email} onChange={(e) => setNewElder({ ...newElder, email: e.target.value })} style={inputStyle} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Contact Phone</label>
                    <input type="text" placeholder="+91 98765 43210" value={newElder.phone} onChange={(e) => setNewElder({ ...newElder, phone: e.target.value })} style={inputStyle} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Age</label>
                    <input type="number" placeholder="70" value={newElder.age} onChange={(e) => setNewElder({ ...newElder, age: e.target.value })} style={inputStyle} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Blood Group</label>
                    <select value={newElder.bloodGroup} onChange={(e) => setNewElder({ ...newElder, bloodGroup: e.target.value })} style={inputStyle}>
                      <option value="B+">B Positive (B+)</option>
                      <option value="O+">O Positive (O+)</option>
                      <option value="A+">A Positive (A+)</option>
                      <option value="AB+">AB Positive (AB+)</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1', marginTop: '6px' }}>
                    <button type="submit" style={{ width: '100%', background: '#059669', color: '#fff', border: 'none', padding: '11px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                      Register Patient ➔
                    </button>
                  </div>
                </form>
              </div>

              {/* Security & Backups */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={boxStyle}>
                  <strong style={{ fontSize: '1rem', color: '#f87171', display: 'block', marginBottom: '8px' }}>
                    🔐 CHANGE MASTER SECURITY PIN
                  </strong>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 12px 0' }}>Update authorization code for admin console login.</p>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    if (newPinValue.trim().length >= 4) {
                      localStorage.setItem('app_master_pin', newPinValue.trim())
                      setMasterPin(newPinValue.trim())
                      setNewPinValue('')
                      showNotice('Master PIN updated!')
                    }
                  }} style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="New PIN" value={newPinValue} onChange={(e) => setNewPinValue(e.target.value)} style={inputStyle} required />
                    <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                      Save PIN
                    </button>
                  </form>
                </div>

                <div style={boxStyle}>
                  <strong style={{ fontSize: '1rem', color: '#4ade80', display: 'block', marginBottom: '8px' }}>
                    💾 MASTER DATABASE BACKUP
                  </strong>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 12px 0' }}>Download complete snapshot of all patients, doses, and logs.</p>
                  <button onClick={exportBackup} style={{ width: '100%', background: '#1e293b', border: '1px solid #38bdf8', color: '#38bdf8', padding: '10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                    📥 Export Snapshot (.JSON)
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* MODAL: APPOINTMENT FULL SLIP WITH GOOGLE MAPS */}
      {selectedAppointmentModal && (
        <div style={modalBackdropStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#38bdf8' }}>Consultation Slip</h3>
              <button onClick={() => setSelectedAppointmentModal(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div><strong>Patient:</strong> {selectedAppointmentModal.patient}</div>
              <div><strong>Doctor:</strong> {selectedAppointmentModal.doctor} ({selectedAppointmentModal.specialty})</div>
              <div><strong>Clinic:</strong> {selectedAppointmentModal.clinic}</div>
              <div><strong>Address:</strong> {selectedAppointmentModal.address}</div>
              <div><strong>Timing:</strong> 📅 {selectedAppointmentModal.date} ({selectedAppointmentModal.time})</div>
              <div><strong>Consultation Fee:</strong> {selectedAppointmentModal.fee} (Paid)</div>
              <div><strong>Clinical Notes:</strong> <em>"{selectedAppointmentModal.notes}"</em></div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(selectedAppointmentModal.clinic + ' ' + selectedAppointmentModal.address)}`}
                target="_blank"
                rel="noreferrer"
                style={{ flex: 1, background: '#16a34a', color: '#fff', textAlign: 'center', padding: '10px', borderRadius: '6px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}
              >
                🗺️ Google Maps ➔
              </a>
              <button onClick={() => setSelectedAppointmentModal(null)} style={{ flex: 1, background: '#1e293b', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MEDICAL CARD */}
      {inspectUser && (
        <div style={modalBackdropStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#38bdf8' }}>Patient Medical Card</h3>
              <button onClick={() => setInspectUser(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div><strong>Name:</strong> {inspectUser.name}</div>
              <div><strong>Age / Blood:</strong> {inspectUser.age} yrs • <span style={{ color: '#f87171' }}>{inspectUser.bloodGroup}</span></div>
              <div><strong>Phone:</strong> {inspectUser.phone}</div>
              <div><strong>Email:</strong> {inspectUser.email}</div>
              <div><strong>Blood Pressure:</strong> {inspectUser.bp}</div>
              <div><strong>Blood Sugar:</strong> {inspectUser.sugar}</div>
              <div><strong>Adherence Score:</strong> {inspectUser.adherence}%</div>
            </div>
            <button onClick={() => setInspectUser(null)} style={{ width: '100%', background: '#0284c7', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '700', marginTop: '16px', cursor: 'pointer' }}>
              Close Record
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

const statCardStyle = {
  background: '#090d16',
  border: '1px solid #1e293b',
  borderRadius: '10px',
  padding: '16px 20px'
}

const statLabelStyle = {
  fontSize: '0.7rem',
  fontWeight: '800',
  color: '#64748b',
  letterSpacing: '0.5px'
}

const boxStyle = {
  background: '#090d16',
  border: '1px solid #1e293b',
  borderRadius: '10px',
  padding: '20px'
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left'
}

const thStyle = {
  padding: '10px 12px'
}

const tdStyle = {
  padding: '12px'
}

const btnStyle = (bg, col) => ({
  background: bg,
  color: col,
  border: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: '700',
  cursor: 'pointer'
})

const searchBoxStyle = {
  background: '#020617',
  border: '1px solid #1e293b',
  borderRadius: '6px',
  padding: '8px 12px',
  color: '#fff',
  fontSize: '0.8rem',
  outline: 'none'
}

const labelStyle = {
  fontSize: '0.75rem',
  color: '#94a3b8',
  display: 'block',
  marginBottom: '4px'
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: '#020617',
  border: '1px solid #1e293b',
  borderRadius: '6px',
  color: '#ffffff',
  boxSizing: 'border-box',
  outline: 'none'
}

const modalBackdropStyle = {
  position: 'fixed',
  top: 0, left: 0, width: '100%', height: '100%',
  background: 'rgba(0,0,0,0.85)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 9999
}

const modalBoxStyle = {
  background: '#090d16',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '24px',
  maxWidth: '440px',
  width: '90%'
}