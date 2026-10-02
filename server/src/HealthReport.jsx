import React, { useState, useEffect } from 'react'

export default function HealthReport() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')

  // Medical Passport / Profile Health Info
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('elder_medical_profile')
      return saved ? JSON.parse(saved) : {
        age: '68',
        gender: 'Male',
        bloodGroup: 'B+',
        allergies: 'Penicillin, Dust',
        chronicConditions: 'Type-2 Diabetes, Hypertension (High BP)',
        mobility: 'Uses Walking Stick',
        emergencyDoctor: 'Dr. Rajesh Verma (+91 9876543210)',
        insurancePolicy: 'Star Health Senior Plan #SH-884920'
      }
    } catch {
      return {}
    }
  })

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [tempProfile, setTempProfile] = useState(profile)

  // Medicines Data & Taken Map
  const [medicines, setMedicines] = useState([])
  const [takenDoses, setTakenDoses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_taken_doses')) || {}
    } catch {
      return {}
    }
  })

  // Vitals Data
  const [vitals, setVitals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_vitals_data')) || { bp: '120/80', sugar: '110 mg/dL', pulse: '74 bpm' }
    } catch {
      return { bp: '120/80', sugar: '110 mg/dL', pulse: '74 bpm' }
    }
  })

  // Hydration Tracker (Glasses of water)
  const [waterGlasses, setWaterGlasses] = useState(() => {
    return Number(localStorage.getItem('user_water_glasses')) || 5
  })

  // 7-Day Adherence Data
  const [weeklyStats, setWeeklyStats] = useState([
    { day: 'Mon', rate: 100 },
    { day: 'Tue', rate: 80 },
    { day: 'Wed', rate: 100 },
    { day: 'Thu', rate: 100 },
    { day: 'Fri', rate: 60 },
    { day: 'Sat', rate: 80 },
    { day: 'Sun (Today)', rate: 80 }
  ])

  useEffect(() => {
    fetch('https://elder-care-reminder.onrender.com/api/medicines', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMedicines(data)
      })
      .catch(() => {})
  }, [token])

  const totalDoses = medicines.length || 5
  const takenCount = medicines.filter(m => takenDoses[m._id]).length || 4
  const pendingCount = Math.max(0, totalDoses - takenCount)
  const adherenceRate = Math.round((takenCount / totalDoses) * 100)

  const handleWaterChange = (change) => {
    const updated = Math.max(0, Math.min(12, waterGlasses + change))
    setWaterGlasses(updated)
    localStorage.setItem('user_water_glasses', updated)
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    setProfile(tempProfile)
    localStorage.setItem('elder_medical_profile', JSON.stringify(tempProfile))
    setIsEditingProfile(false)
  }

  const handlePrint = () => {
    window.print()
  }

  // Share Today's Summary to Family on WhatsApp
  const shareSummaryWhatsApp = () => {
    const elderName = user.name || 'Elder'
    const todayDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    
    const message = encodeURIComponent(
      `📋 *TODAY'S CARE SUMMARY REPORT*\n` +
      `👤 Patient: *${elderName}* (${todayDate})\n` +
      `------------------------------------\n` +
      `💊 *Medicines:* ${takenCount} of ${totalDoses} doses taken (${adherenceRate}%)\n` +
      `⏳ *Pending Doses:* ${pendingCount}\n` +
      `❤️ *Health Vitals:* BP ${vitals.bp} | Sugar ${vitals.sugar} | Pulse ${vitals.pulse}\n` +
      `💧 *Hydration:* ${waterGlasses} of 8 glasses of water\n` +
      `🩸 *Blood Group:* ${profile.bloodGroup}\n` +
      `------------------------------------\n` +
      `Overall Status: Routine on track.\n` +
      `Generated via ElderCare Reminder App.`
    )

    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank')
  }

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '28px auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f8fafc'
    }}>
      {/* Top Banner with Action Buttons */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.85) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '22px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📋</span> Health Reports & Care Summary
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            Live daily routine log, weekly medication adherence, and elder medical passport.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={shareSummaryWhatsApp}
            style={{
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            💬 Share on WhatsApp
          </button>

          <button
            onClick={handlePrint}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🖨️ Print Report
          </button>
        </div>
      </div>

      {/* 🌟 NEW FEATURE: TODAY'S CARE SUMMARY DIGITAL SLIP */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(30, 41, 59, 0.4) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>📝</span>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#ffffff', fontWeight: '800' }}>
                Today's Care Summary
              </h2>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Live snapshot for {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <span style={{
            background: adherenceRate >= 80 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
            color: adherenceRate >= 80 ? '#4ade80' : '#facc15',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: '700'
          }}>
            ● Daily Status: {adherenceRate >= 80 ? 'Optimal' : 'Attention Needed'}
          </span>
        </div>

        {/* 4 Summary Highlight Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '16px'
        }}>
          {/* Medicine Adherence */}
          <div style={summaryTileStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>💊 Medicine Doses</span>
              <span style={{ color: '#38bdf8', fontWeight: '800', fontSize: '0.85rem' }}>{adherenceRate}%</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
              {takenCount} / {totalDoses} Taken
            </div>
            <span style={{ fontSize: '0.75rem', color: pendingCount > 0 ? '#fb923c' : '#4ade80', fontWeight: '600' }}>
              {pendingCount > 0 ? `⏳ ${pendingCount} Doses Pending` : '✓ All Doses Completed'}
            </span>
          </div>

          {/* Blood Pressure & Sugar */}
          <div style={summaryTileStyle}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>❤️ Health Vitals</span>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
              BP: {vitals.bp}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: '600' }}>
              Sugar: {vitals.sugar} • Pulse: {vitals.pulse}
            </span>
          </div>

          {/* Hydration / Water Intake */}
          <div style={summaryTileStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>💧 Water Intake</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => handleWaterChange(-1)} style={counterBtnStyle}>-</button>
                <button onClick={() => handleWaterChange(1)} style={counterBtnStyle}>+</button>
              </div>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#38bdf8', marginBottom: '4px' }}>
              {waterGlasses} / 8 Glasses
            </div>
            <span style={{ fontSize: '0.75rem', color: waterGlasses >= 6 ? '#4ade80' : '#94a3b8', fontWeight: '600' }}>
              {waterGlasses >= 8 ? '✓ Fully Hydrated' : `${8 - waterGlasses} glasses left for today`}
            </span>
          </div>

          {/* Next Consultation Status */}
          <div style={summaryTileStyle}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>🩺 Next Consultation</span>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
              Dr. Rajesh Verma
            </div>
            <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: '600' }}>
              Apex Clinic • In 2 Days
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: 🪪 ELDER MEDICAL PASSPORT CARD */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#ffffff', fontWeight: '800' }}>
              🪪 {user.name || 'Elder Patient'}'s Medical Passport
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Critical health identity for emergency staff & consulting doctors
            </span>
          </div>
          <button
            onClick={() => { setTempProfile(profile); setIsEditingProfile(true) }}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            ✏️ Edit Profile
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          <div style={infoBoxStyle}>
            <span style={labelStyle}>🩸 Blood Group</span>
            <strong style={{ fontSize: '1.2rem', color: '#f87171' }}>{profile.bloodGroup || 'O+'}</strong>
          </div>

          <div style={infoBoxStyle}>
            <span style={labelStyle}>🎂 Age & Gender</span>
            <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>{profile.age} Years • {profile.gender}</strong>
          </div>

          <div style={infoBoxStyle}>
            <span style={labelStyle}>⚠️ Known Allergies</span>
            <strong style={{ fontSize: '0.95rem', color: '#facc15' }}>{profile.allergies || 'None'}</strong>
          </div>

          <div style={infoBoxStyle}>
            <span style={labelStyle}>🩺 Existing Conditions</span>
            <strong style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>{profile.chronicConditions || 'Hypertension'}</strong>
          </div>

          <div style={infoBoxStyle}>
            <span style={labelStyle}>🦯 Mobility Status</span>
            <strong style={{ fontSize: '0.95rem', color: '#4ade80' }}>{profile.mobility || 'Independent'}</strong>
          </div>

          <div style={infoBoxStyle}>
            <span style={labelStyle}>👨‍⚕️ Emergency Doctor</span>
            <strong style={{ fontSize: '0.9rem', color: '#38bdf8' }}>{profile.emergencyDoctor || 'Dr. Verma'}</strong>
          </div>

          <div style={{ ...infoBoxStyle, gridColumn: 'span 2' }}>
            <span style={labelStyle}>🛡️ Health Insurance Policy</span>
            <strong style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>{profile.insurancePolicy || 'Star Senior Insurance'}</strong>
          </div>
        </div>
      </div>

      {/* SECTION 3: 📊 7-DAY MEDICATION ADHERENCE OVERVIEW */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#ffffff', fontWeight: '800' }}>
              📊 7-Day Medication Adherence Overview
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Routine performance across this week</span>
          </div>

          <div style={{
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid #4ade80',
            color: '#4ade80',
            padding: '6px 14px',
            borderRadius: '20px',
            fontWeight: '800',
            fontSize: '0.85rem'
          }}>
            Weekly Average: 85% (Good Adherence)
          </div>
        </div>

        {/* 7-Day Bar Graph */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '12px',
          padding: '20px 10px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '12px',
          alignItems: 'end',
          minHeight: '170px'
        }}>
          {weeklyStats.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: item.rate >= 80 ? '#4ade80' : '#fb923c', marginBottom: '6px' }}>
                {item.rate}%
              </span>
              <div style={{
                width: '32px',
                height: `${item.rate * 1.1}px`,
                background: item.rate === 100 
                  ? 'linear-gradient(180deg, #4ade80 0%, #15803d 100%)' 
                  : item.rate >= 80 
                    ? 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)' 
                    : 'linear-gradient(180deg, #fb923c 0%, #c2410c 100%)',
                borderRadius: '6px 6px 0 0'
              }}></div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px', fontWeight: '600' }}>
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && (
        <div style={modalBackdropStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff' }}>Edit Medical Passport</h3>
              <button onClick={() => setIsEditingProfile(false)} style={closeBtnStyle}>✕</button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Blood Group</label>
                <input
                  type="text"
                  value={tempProfile.bloodGroup}
                  onChange={(e) => setTempProfile({ ...tempProfile, bloodGroup: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Age</label>
                <input
                  type="text"
                  value={tempProfile.age}
                  onChange={(e) => setTempProfile({ ...tempProfile, age: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Gender</label>
                <input
                  type="text"
                  value={tempProfile.gender}
                  onChange={(e) => setTempProfile({ ...tempProfile, gender: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Mobility Status</label>
                <input
                  type="text"
                  value={tempProfile.mobility}
                  onChange={(e) => setTempProfile({ ...tempProfile, mobility: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Known Allergies</label>
                <input
                  type="text"
                  value={tempProfile.allergies}
                  onChange={(e) => setTempProfile({ ...tempProfile, allergies: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Chronic Conditions</label>
                <input
                  type="text"
                  value={tempProfile.chronicConditions}
                  onChange={(e) => setTempProfile({ ...tempProfile, chronicConditions: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Emergency Doctor & Contact</label>
                <input
                  type="text"
                  value={tempProfile.emergencyDoctor}
                  onChange={(e) => setTempProfile({ ...tempProfile, emergencyDoctor: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Health Insurance Details</label>
                <input
                  type="text"
                  value={tempProfile.insurancePolicy}
                  onChange={(e) => setTempProfile({ ...tempProfile, insurancePolicy: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '8px', display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                  Save Medical Details
                </button>
                <button type="button" onClick={() => setIsEditingProfile(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const summaryTileStyle = {
  background: '#020617',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  padding: '14px 16px',
  borderRadius: '12px'
}

const counterBtnStyle = {
  background: '#1e293b',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#38bdf8',
  width: '24px',
  height: '24px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const infoBoxStyle = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  padding: '12px 16px',
  borderRadius: '10px'
}

const labelStyle = {
  fontSize: '0.75rem',
  color: '#94a3b8',
  display: 'block',
  marginBottom: '4px'
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  background: '#020617',
  border: '1px solid #1e293b',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '0.85rem',
  outline: 'none',
  boxSizing: 'border-box'
}

const modalBackdropStyle = {
  position: 'fixed',
  top: 0, left: 0, width: '100%', height: '100%',
  background: 'rgba(0,0,0,0.8)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 9999
}

const modalBoxStyle = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '14px',
  padding: '24px',
  maxWidth: '520px',
  width: '90%',
  maxHeight: '85vh',
  overflowY: 'auto'
}

const closeBtnStyle = {
  background: '#1e293b',
  border: 'none',
  color: '#fff',
  padding: '6px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '700'
}