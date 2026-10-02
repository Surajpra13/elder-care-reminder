import React, { useState, useEffect } from 'react'

export default function Family() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  // Form States
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('Son')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('Medicines & Prescriptions')
  const [availability, setAvailability] = useState('24x7 Available')

  // Primary Caregiver ID Storage
  const [primaryId, setPrimaryId] = useState(() => {
    return localStorage.getItem('primary_caregiver_id') || ''
  })

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/family', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
        if (data.length > 0 && !primaryId) {
          setPrimaryId(data[0]._id)
          localStorage.setItem('primary_caregiver_id', data[0]._id)
        }
      }
    } catch (err) {
      console.error('Fetch members failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!name || !phone) return

    setAdding(true)
    try {
      const res = await fetch('http://localhost:5000/api/family/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          relation,
          phone,
          role: `${role} (${availability})`
        })
      })

      if (res.ok) {
        setName('')
        setPhone('')
        fetchMembers()
      }
    } catch (err) {
      console.error('Add family member failed:', err)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/family/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setMembers(members.filter((m) => m._id !== id))
        if (primaryId === id) {
          localStorage.removeItem('primary_caregiver_id')
          setPrimaryId('')
        }
      }
    } catch (err) {
      console.error('Delete member failed:', err)
    }
  }

  const setAsPrimary = (id) => {
    setPrimaryId(id)
    localStorage.setItem('primary_caregiver_id', id)
  }

  // Prepares pre-filled WhatsApp health status text
  const sendWhatsAppUpdate = (member) => {
    const cleanNumber = member.phone.replace(/[^0-9]/g, '')
    const vitals = JSON.parse(localStorage.getItem('user_vitals_data') || '{"bp":"120/80","sugar":"110 mg/dL"}')
    const elderName = user.name || 'Elder'

    const message = encodeURIComponent(
      `Hello ${member.name}, here is the health status update for ${elderName}:\n` +
      `✅ Daily Medicines: Taken on time\n` +
      `❤️ Vitals: BP ${vitals.bp}, Blood Sugar ${vitals.sugar}\n` +
      `Sent via ElderCare Reminder Assistant.`
    )

    window.open(`https://api.whatsapp.com/send?phone=${cleanNumber}&text=${message}`, '_blank')
  }

  return (
    <div style={{
      maxWidth: '960px',
      margin: '28px auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f8fafc'
    }}>
      {/* Top Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '22px'
      }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '1.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>👨‍👩‍👧</span> Family & Caregiver Network
        </h1>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
          Keep emergency guardians, family members, and routine caregivers coordinated in one place.
        </p>
      </div>

      {/* Add New Caregiver Form */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '26px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '700', color: '#38bdf8' }}>
          + Add New Family / Caregiver
        </h3>

        <form onSubmit={handleAddMember} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <input
            type="text"
            placeholder="Full Name (e.g. Ramesh Kumar)"
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
            <option value="Son">👨‍👦 Son</option>
            <option value="Daughter">👩‍👧 Daughter</option>
            <option value="Spouse">💍 Spouse (Husband/Wife)</option>
            <option value="Nurse">👩‍⚕️ Nurse / Attendant</option>
            <option value="Neighbor">🏡 Neighbor</option>
            <option value="Doctor">🩺 Family Doctor</option>
          </select>

          <input
            type="text"
            placeholder="Contact Number (e.g. +91 9876543210)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
            required
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={inputStyle}
          >
            <option value="Medicines & Prescriptions">💊 Medicines & Prescriptions</option>
            <option value="Clinic & Hospital Visits">🩺 Clinic & Hospital Visits</option>
            <option value="Diet & Daily Meals">🥗 Diet & Daily Meals</option>
            <option value="Emergency First Responder">🚨 Emergency First Responder</option>
            <option value="General Supervision">👁️ General Supervision</option>
          </select>

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
              {adding ? 'Registering...' : 'Register Caregiver'}
            </button>
          </div>
        </form>
      </div>

      {/* Guardians List Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>
          Active Guardians & Helpers ({members.length})
        </h3>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>⭐ Primary Responder gets direct SOS alerts</span>
      </div>

      {/* Members Cards List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading family network...</div>
      ) : members.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          color: '#94a3b8'
        }}>
          No family caregivers added yet. Add one above!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {members.map((m) => {
            const isPrimary = primaryId === m._id

            return (
              <div
                key={m._id}
                style={{
                  background: isPrimary ? 'rgba(56, 189, 248, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                  border: isPrimary ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '18px 22px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '1.15rem', color: '#ffffff' }}>{m.name}</strong>
                    
                    <span style={{
                      fontSize: '0.75rem',
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontWeight: '700'
                    }}>
                      {m.relation || 'Caregiver'}
                    </span>

                    {isPrimary && (
                      <span style={{
                        fontSize: '0.75rem',
                        background: 'rgba(234, 179, 8, 0.2)',
                        color: '#facc15',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontWeight: '700'
                      }}>
                        ⭐ Primary SOS Contact
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span>📞 {m.phone}</span>
                    <span>🎯 Focus: <strong style={{ color: '#cbd5e1' }}>{m.role || 'Supervision'}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* WhatsApp Status Share */}
                  <button
                    onClick={() => sendWhatsAppUpdate(m)}
                    title="Send today's vitals & dose update on WhatsApp"
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.35)',
                      color: '#4ade80',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    💬 WhatsApp Update
                  </button>

                  {/* Direct Phone Call */}
                  <a
                    href={`tel:${m.phone}`}
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    📞 Call
                  </a>

                  {/* Primary Toggle */}
                  {!isPrimary && (
                    <button
                      onClick={() => setAsPrimary(m._id)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#cbd5e1',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Make Primary
                    </button>
                  )}

                  {/* Remove Member */}
                  <button
                    onClick={() => handleDelete(m._id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
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