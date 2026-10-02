import React, { useState, useEffect } from 'react'

export default function Medicines() {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'pending' | 'taken'

  // Form State
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [time, setTime] = useState('')
  const [mealTiming, setMealTiming] = useState('After Meal')
  const [stock, setStock] = useState('15')
  const [adding, setAdding] = useState(false)

  // Taken status state
  const [takenMap, setTakenMap] = useState(() => {
    try {
      const saved = localStorage.getItem('user_taken_doses')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const token = localStorage.getItem('token')

  const fetchMedicines = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://elder-care-reminder.onrender.com/api/medicines', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setMedicines(data)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicines()
  }, [])

  // Audio reminder sound
  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime)
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.35)
    } catch (e) {
      console.log('Audio playback preview')
    }
  }

  const handleAddMedicine = async (e) => {
    e.preventDefault()
    if (!name || !dosage || !time) return

    setAdding(true)
    try {
      const res = await fetch('https://elder-care-reminder.onrender.com/api/medicines/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          dosage: `${dosage} (${mealTiming})`,
          time,
          stock: Number(stock) || 10
        })
      })

      if (res.ok) {
        setName('')
        setDosage('')
        setTime('')
        fetchMedicines()
      }
    } catch (err) {
      console.error('Add failed:', err)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`https://elder-care-reminder.onrender.com/api/medicines/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setMedicines(medicines.filter((m) => m._id !== id))
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const toggleTaken = (id) => {
    const updated = { ...takenMap, [id]: !takenMap[id] }
    setTakenMap(updated)
    localStorage.setItem('user_taken_doses', JSON.stringify(updated))
    if (!takenMap[id]) {
      playAlarmSound()
    }
  }

  const filteredMedicines = medicines.filter((m) => {
    const isTaken = !!takenMap[m._id]
    if (filter === 'pending') return !isTaken
    if (filter === 'taken') return isTaken
    return true
  })

  const totalCount = medicines.length
  const takenCount = medicines.filter((m) => takenMap[m._id]).length
  const pendingCount = totalCount - takenCount

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
        marginBottom: '22px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '1.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>💊</span> Daily Medication & Alarms
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            Smart audio alarms ring automatically when a dose is due.
          </p>
        </div>

        <button
          onClick={playAlarmSound}
          style={{
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid #38bdf8',
            color: '#38bdf8',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85rem'
          }}
        >
          🔊 Test Alarm Sound
        </button>
      </div>

      {/* Add Prescription Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '22px',
        marginBottom: '26px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '700', color: '#38bdf8' }}>
          + Add Prescription / Dose
        </h3>

        <form onSubmit={handleAddMedicine} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <input
            type="text"
            placeholder="Medicine Name (e.g. Metformin)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            required
          />

          <input
            type="text"
            placeholder="Dosage (e.g. 1 Tablet / 500mg)"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            style={inputStyle}
            required
          />

          <select
            value={mealTiming}
            onChange={(e) => setMealTiming(e.target.value)}
            style={inputStyle}
          >
            <option value="After Meal">🍽️ After Meal</option>
            <option value="Before Meal">🥣 Before Meal</option>
            <option value="Empty Stomach">🌅 Empty Stomach</option>
            <option value="Bedtime">🌙 Bedtime</option>
          </select>

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
              {adding ? 'Scheduling...' : 'Schedule Medication'}
            </button>
          </div>
        </form>
      </div>

      {/* Queue Header & Filters */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>
          Today's Dose Queue
        </h3>

        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setFilter('all')}
            style={tabBtnStyle(filter === 'all')}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            style={tabBtnStyle(filter === 'pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('taken')}
            style={tabBtnStyle(filter === 'taken')}
          >
            Taken ({takenCount})
          </button>
        </div>
      </div>

      {/* Dose Items List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading doses...</div>
      ) : filteredMedicines.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          color: '#94a3b8'
        }}>
          {filter === 'pending' ? '🎉 Sabhi doses poore ho chuke hain!' : 'Koi dawaai nahi mili.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredMedicines.map((m) => {
            const isTaken = !!takenMap[m._id]
            return (
              <div
                key={m._id}
                style={{
                  background: isTaken ? 'rgba(34, 197, 94, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                  border: isTaken ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>{m.name}</strong>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      background: isTaken ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                      color: isTaken ? '#4ade80' : '#facc15'
                    }}>
                      ● {isTaken ? 'Taken' : 'Pending'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '12px' }}>
                    <span>💊 {m.dosage}</span>
                    <span>⏰ Schedule: <strong style={{ color: '#38bdf8' }}>{m.time}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => toggleTaken(m._id)}
                    style={{
                      background: isTaken ? '#15803d' : '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {isTaken ? '✓ Taken' : 'Mark as Taken'}
                  </button>

                  <button
                    onClick={() => handleDelete(m._id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
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