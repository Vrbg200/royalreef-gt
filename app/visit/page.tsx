'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/navbar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const TIMES = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00']

export default function VisitPage() {
  const supabase = createClient()
  const router   = useRouter()

  const [date, setDate]     = useState('')
  const [time, setTime]     = useState('')
  const [guests, setGuests] = useState(1)
  const [reason, setReason] = useState('')
  const [rulesOk, setRulesOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState(false)

  // Fecha mínima — mañana (24h anticipación)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const canSubmit = date && time && rulesOk && !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Debes iniciar sesión para agendar una visita')
      setLoading(false)
      return
    }

    const { error: err } = await supabase
      .from('store_visits')
      .insert({
        client_id:      user.id,
        visit_type:     'visit',
        requested_date: date,
        requested_time: time,
        guests,
        reason:         reason || null,
        status:         'pending',
        rules_accepted: true,
      })

    if (err) {
      setError('Error al agendar: ' + err.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  const rules = [
    'Prohibido tocar los tanques o meter las manos al agua',
    'Prohibido usar flash de cámara o luces externas sobre los tanques',
    'No se apartan piezas durante la visita — la compra se realiza en línea',
    'Máximo 3 visitantes por cita',
    'Duración máxima de 45 minutos',
    'Si llegas con más de 15 minutos de retraso la cita se cancela',
    'Menores de 12 años deben ir acompañados de un adulto',
  ]

  if (success) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
        <Navbar />
        <div style={{ maxWidth: '500px', margin: '60px auto', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🪸</div>
          <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#4AAF7A', marginBottom: '8px' }}>
            Solicitud enviada
          </h2>
          <p style={{ fontSize: '13px', color: '#8A8680', lineHeight: 1.6, marginBottom: '24px' }}>
            Tu solicitud de visita para el {new Date(date).toLocaleDateString('es-GT')} a las {time} fue enviada.
            Un asesor la confirmará pronto por correo.
          </p>
          <a href="/" style={{
            padding: '10px 24px', background: '#C9A84C', color: '#0D0D0D',
            borderRadius: '5px', fontSize: '13px', fontWeight: 500, textDecoration: 'none',
          }}>
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
      <Navbar />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>

        <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#C9A84C', marginBottom: '6px' }}>
          Visitar la tienda
        </h1>
        <p style={{ fontSize: '13px', color: '#8A8680', marginBottom: '24px', lineHeight: 1.6 }}>
          Agenda una visita para conocer nuestros corales en persona. Las citas son con mínimo 24 horas de anticipación y sujetas a aprobación.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Fecha y hora */}
          <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
              Fecha y hora preferida
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '5px' }}>
                Fecha *
              </label>
              <input
                type="date" min={minDate} value={date}
                onChange={e => setDate(e.target.value)} required
                style={{ width: '100%', backgroundColor: '#1E1E1E', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '5px', padding: '8px 10px', color: '#F0EDE6', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '8px' }}>
                Hora *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px' }}>
                {TIMES.map(t => (
                  <button key={t} type="button" onClick={() => setTime(t)} style={{
                    padding: '7px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer',
                    background: time === t ? 'rgba(201,168,76,0.08)' : '#1E1E1E',
                    border: `0.5px solid ${time === t ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
                    color: time === t ? '#C9A84C' : '#8A8680',
                  }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '5px' }}>
                Número de visitantes (máx 3)
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1,2,3].map(n => (
                  <button key={n} type="button" onClick={() => setGuests(n)} style={{
                    width: '44px', padding: '7px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer',
                    background: guests === n ? 'rgba(201,168,76,0.08)' : '#1E1E1E',
                    border: `0.5px solid ${guests === n ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
                    color: guests === n ? '#C9A84C' : '#8A8680',
                  }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Motivo */}
          <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '5px' }}>
              Motivo de la visita <span style={{ color: '#3A3835' }}>(opcional)</span>
            </label>
            <textarea
              value={reason} onChange={e => setReason(e.target.value)} rows={2}
              placeholder="Ej: Me interesa ver los zoanthids disponibles..."
              style={{ width: '100%', backgroundColor: '#1E1E1E', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '5px', padding: '8px 10px', color: '#F0EDE6', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
            />
          </div>

          {/* Reglas */}
          <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Reglas de visita
            </div>
            {rules.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', padding: '4px 0', fontSize: '12px', color: '#8A8680' }}>
                <span style={{ color: '#C9A84C', flexShrink: 0 }}>·</span>
                <span>{r}</span>
              </div>
            ))}

            <div onClick={() => setRulesOk(!rulesOk)} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              marginTop: '14px', cursor: 'pointer',
              background: '#1E1E1E', borderRadius: '5px', padding: '10px 12px',
            }}>
              <div style={{
                width: '15px', height: '15px', borderRadius: '3px', flexShrink: 0, marginTop: '1px',
                border: `0.5px solid ${rulesOk ? '#C9A84C' : 'rgba(201,168,76,0.45)'}`,
                background: rulesOk ? '#C9A84C' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {rulesOk && <span style={{ fontSize: '9px', color: '#0D0D0D', fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: '11px', color: '#8A8680', lineHeight: 1.5 }}>
                He leído y acepto las reglas de visita
              </span>
            </div>
          </div>

          {error && (
            <div style={{ fontSize: '12px', color: '#E8748A' }}>{error}</div>
          )}

          <button type="submit" disabled={!canSubmit} style={{
            width: '100%', padding: '12px',
            background: canSubmit ? '#C9A84C' : '#252525',
            color: canSubmit ? '#0D0D0D' : '#8A8680',
            border: 'none', borderRadius: '6px',
            fontSize: '13px', fontWeight: 500,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}>
            {loading ? 'Enviando solicitud...' : 'Solicitar visita ↗'}
          </button>

        </form>
      </div>
    </div>
  )
}