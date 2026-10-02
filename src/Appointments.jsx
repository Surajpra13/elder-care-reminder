import React, { useState, useEffect } from 'react'

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'upcoming' | 'completed'

  // Form States
  const [doctorName, setDoctorName] = useState('')
  const [hospital, setHospital] = useState('')
  const [specialty, setSpecialty] = useState('General Physician')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [adding, setAdding] = useState(false)

  // Status storage
  const [statusMap, setStatusMap] = useState(() => {
    try {
      const saved = localStorage.getItem('user_appt_status')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const token = localStorage.getItem('token')

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAppointments(data)
      }
    } catch (err) {
      console.error('Fetch appointments failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleAddAppointment = async (e) => {
    e.preventDefault()
    if (!doctorName || !date || !time) return

    setAdding(true)
    try {
      const res = await fetch('http://localhost:5000/api/appointments/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorName: `${doctorName} (${specialty})`,
          hospital: hospital || 'City Clinic',
          date,
          time
        })
      })

      if (res.ok) {
        setDoctorName('')
        setHospital('')
        setDate('')
        setTime('')
        fetchAppointments()
      }
    } catch (err) {
      console.error('Add failed:', err)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setAppointments(appointments.filter((a) => a._id !== id))
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const toggleStatus = (id) => {
    const updated = { ...statusMap, [id]: statusMap[id] === 'Completed' ? 'Upcoming' : 'Completed' }
    setStatusMap(updated)
    localStorage.setItem('user_appt_status', JSON.stringify(updated))
  }

  // Calculate Days Remaining
  const getDaysDiff = (dateStr) => {
    if (!dateStr) return ''
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const apptDate = new Date(dateStr)
    apptDate.setHours(0, 0, 0, 0)
    const diffTime = apptDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '📍 Today'
    if (diffDays === 1) return '⏳ Tomorrow'
    if (diffDays > 1) return `⏳ In ${diffDays} days`
    return 'Passed'
  }

  const filteredAppointments = appointments.filter((a) => {
    const isCompleted = statusMap[a._id] === 'Completed'
    if (filter === 'upcoming') return !isCompleted
    if (filter === 'completed') return isCompleted
    return true
  })

  return (
    <div style={{
      maxWidth: '920px',
      margin: '28px auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f8fafc'
    }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '22px'
      }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '1.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🩺</span> Doctor Appointments & Visits
        </h1>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
          Schedule checkups, get automated day reminders, and track visit completion.
        </p>
      </div>

      {/* Schedule Form */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '22px',
        marginBottom: '26px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '700', color: '#38bdf8' }}>
          + Schedule New Visit
        </h3>

        <form onSubmit={handleAddAppointment} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <input
            type="text"
            placeholder="Doctor Name (e.g. Dr. Rajesh Verma)"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            style={inputStyle}
            required
          />

          <input
            type="text"
            placeholder="Hospital / Clinic (e.g. City Care)"
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            style={inputStyle}
            required
          />

          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            style={inputStyle}
          >
            <option value="General Physician">🩺 General Physician</option>
            <option value="Cardiologist">❤️ Cardiologist (Heart)</option>
            <option value="Orthopedic">🦴 Orthopedic (Joints/Bones)</option>
            <option value="Eye Specialist">👁️ Eye Specialist</option>
            <option value="Diabetologist">🩸 Diabetologist (Sugar)</option>
            <option value="Dentist">🦷 Dentist</option>
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
            required
          />

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
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
              {adding ? 'Saving...' : 'Save Appointment'}
            </button>
          </div>
        </form>
      </div>

      {/* Header & Filter Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>
          Scheduled Consultations ({appointments.length})
        </h3>

        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setFilter('all')}
            style={tabBtnStyle(filter === 'all')}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            style={tabBtnStyle(filter === 'upcoming')}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('completed')}
            style={tabBtnStyle(filter === 'completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Consultations List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          color: '#94a3b8'
        }}>
          No appointments recorded in this category.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAppointments.map((a) => {
            const isCompleted = statusMap[a._id] === 'Completed'
            const countdown = getDaysDiff(a.date)

            return (
              <div
                key={a._id}
                style={{
                  background: isCompleted ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                  border: isCompleted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>{a.doctorName}</strong>
                    
                    {/* Status Badge */}
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      background: isCompleted ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                      color: isCompleted ? '#4ade80' : '#38bdf8'
                    }}>
                      ● {isCompleted ? 'Completed' : 'Upcoming'}
                    </span>

                    {/* Countdown Tag */}
                    {!isCompleted && countdown && (
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: 'rgba(234, 179, 8, 0.2)',
                        color: '#facc15',
                        fontWeight: '700'
                      }}>
                        {countdown}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span>🏥 {a.hospital}</span>
                    <span>📅 {a.date} at <strong style={{ color: '#4ade80' }}>{a.time}</strong></span>
                    
                    {/* Google Maps Directions Shortcut */}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.hospital)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#38bdf8',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      🗺️ View on Map ➔
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => toggleStatus(a._id)}
                    style={{
                      background: isCompleted ? '#15803d' : '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    {isCompleted ? '✓ Visited' : 'Mark as Visited'}
                  </button>

                  <button
                    onClick={() => handleDelete(a._id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      padding: '8px 14px',
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
            )
          })}
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

const tabBtnStyle = (active) => ({
  background: active ? '#0284c7' : 'transparent',
  color: active ? '#ffffff' : '#94a3b8',
  border: 'none',
  padding: '6px 14px',
  borderRadius: '6px',
  fontSize: '0.8rem',
  fontWeight: '600',
  cursor: 'pointer'
})