'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function VisitsClient({
  visits, reschedules, userId
}: {
  visits: any[], reschedules: any[], userId: string
}) {
  const supabase = createClient()
  const router = useRouter()

  const [selected, setSelected]     = useState<any>(null)
  const [newDate, setNewDate]       = useState('')
  const [newTime, setNewTime]       = useState('')
  const [showReschedule, setShowReschedule] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [tab, setTab]               = useState<'pending'|'upcoming'|'reschedules'>('pending')

  const pending   = visits.filter(v => v.status === 'pending')
  const upcoming  = visits.filter(v => ['approved','rescheduled'].includes(v.status))
  const past      = visits.filter(v => ['completed','cancelled','no_show'].includes(v.status))

  const visitTypeLabel: Record<string, string> = {
    visit:  'Visita a tienda',
    pickup: 'Pick-up de compra',
  }

  const statusStyle: Record<string, { label: string, color: string }> = {
    pending:     { label: 'Pendiente',   color: '#C9A84C' },
    approved:    { label: 'Aprobada',    color: '#4AAF7A' },
    rescheduled: { label: 'Reagendada',  color: '#4AAF7A' },
    rejected:    { label: 'Rechazada',   color: '#E8748A' },
    cancelled:   { label: 'Cancelada',   color: '#8A8680' },
    completed:   { label: 'Completada',  color: '#8A8680' },
    no_show:     { label: 'No se presentó', color: '#E8748A' },
  }

  async function handleApprove(visit: any) {
    setLoading(true)
    await supabase
      .from('store_visits')
      .update({
        status:         'approved',
        confirmed_date: visit.requested_date,
        confirmed_time: visit.requested_time,
        approved_by:    userId,
        approved_at:    new Date().toISOString(),
      })
      .eq('id', visit.id)
    setLoading(false)
    setSelected(null)
    router.refresh()
  }

  async function handleReject(id: string) {
    setLoading(true)
    await supabase
      .from('store_visits')
      .update({ status: 'rejected' })
      .eq('id', id)
    setLoading(false)
    setSelected(null)
    router.refresh()
  }

  async function handleReschedule(id: string) {
    if (!newDate || !newTime) return
    setLoading(true)
    await supabase
      .from('store_visits')
      .update({
        status:         'rescheduled',
        confirmed_date: newDate,
        confirmed_time: newTime,
        approved_by:    userId,
        approved_at:    new Date().toISOString(),
      })
      .eq('id', id)
    setShowReschedule(false)
    setNewDate('')
    setNewTime('')
    setLoading(false)
    setSelected(null)
    router.refresh()
  }

  async function handleApproveReschedule(req: any, option: number) {
    setLoading(true)
    const dateKey = `option_${option}_date` as keyof typeof req
    const timeKey = `option_${option}_time` as keyof typeof req

    await supabase
      .from('visit_reschedule_requests')
      .update({ status: 'approved', approved_option: option, responded_by: userId, responded_at: new Date().toISOString() })
      .eq('id', req.id)

    await supabase
      .from('store_visits')
      .update({
        status:         'rescheduled',
        confirmed_date: req[dateKey],
        confirmed_time: req[timeKey],
        approved_by:    userId,
        approved_at:    new Date().toISOString(),
      })
      .eq('id', req.visit_id)

    setLoading(false)
    router.refresh()
  }

  async function handleRejectReschedule(id: string) {
    setLoading(true)
    await supabase
      .from('visit_reschedule_requests')
      .update({ status: 'rejected', responded_by: userId, responded_at: new Date().toISOString() })
      .eq('id', id)
    setLoading(false)
    router.refresh()
  }

  async function handleComplete(id: string) {
    setLoading(true)
    await supabase
      .from('store_visits')
      .update({ status: 'completed' })
      .eq('id', id)
    setLoading(false)
    setSelected(null)
    router.refresh()
  }

  const input = {
    backgroundColor: '#1E1E1E',
    border: '0.5px solid rgba(201,168,76,0.18)',
    borderRadius: '5px',
    padding: '7px 10px',
    color: '#F0EDE6',
    fontSize: '12px',
    outline: 'none',
  } as React.CSSProperties

  const currentList = tab === 'pending' ? pending : tab === 'upcoming' ? upcoming : []

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <a href="/vendor" style={{ fontSize: '12px', color: '#8A8680', textDecoration: 'none' }}>← Dashboard</a>
          <span style={{ color: '#3A3835' }}>/</span>
          <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#C9A84C' }}>Citas y visitas</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[
            { key: 'pending',     label: 'Por aprobar',  count: pending.length },
            { key: 'upcoming',    label: 'Próximas',     count: upcoming.length },
            { key: 'reschedules', label: 'Cambios de cita', count: reschedules.length },
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key as any); setSelected(null) }} style={{
              padding: '7px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
              background: tab === t.key ? 'rgba(201,168,76,0.08)' : '#1E1E1E',
              border: `0.5px solid ${tab === t.key ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
              color: tab === t.key ? '#C9A84C' : '#8A8680',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              {t.label}
              {t.count > 0 && (
                <span style={{ background: '#E8748A', color: '#fff', fontSize: '9px', fontWeight: 500, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Solicitudes de cambio de cita */}
        {tab === 'reschedules' && (
          <div>
            {reschedules.length === 0 ? (
              <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '40px', textAlign: 'center', fontSize: '13px', color: '#3A3835' }}>
                No hay solicitudes de cambio de cita
              </div>
            ) : reschedules.map(r => (
              <div key={r.id} style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.45)', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#F0EDE6' }}>
                      {(r.client as any)?.full_name} solicita cambio de cita
                    </div>
                    <div style={{ fontSize: '11px', color: '#8A8680', marginTop: '2px' }}>
                      {new Date(r.created_at).toLocaleDateString('es-GT')}
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '3px', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', fontWeight: 500 }}>
                    Pendiente
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {[1,2,3].map(opt => {
                    const d = r[`option_${opt}_date`]
                    const t = r[`option_${opt}_time`]
                    if (!d) return null
                    return (
                      <button key={opt} onClick={() => handleApproveReschedule(r, opt)} disabled={loading} style={{
                        padding: '8px 14px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer',
                        background: 'rgba(74,175,122,0.08)', color: '#4AAF7A',
                        border: '0.5px solid rgba(74,175,122,0.3)',
                      }}>
                        Opción {opt}: {new Date(d).toLocaleDateString('es-GT')} {t}
                      </button>
                    )
                  })}
                </div>

                <button onClick={() => handleRejectReschedule(r.id)} disabled={loading} style={{
                  padding: '6px 14px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer',
                  background: 'transparent', color: '#E8748A',
                  border: '0.5px solid rgba(232,116,138,0.3)',
                }}>
                  Rechazar solicitud
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Lista de citas */}
        {tab !== 'reschedules' && (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? 'minmax(0,1fr) minmax(0,1fr)' : '1fr', gap: '14px' }}>
            <div>
              {currentList.length === 0 ? (
                <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '40px', textAlign: 'center', fontSize: '13px', color: '#3A3835' }}>
                  {tab === 'pending' ? 'No hay citas por aprobar' : 'No hay citas próximas'}
                </div>
              ) : currentList.map(v => {
                const st = statusStyle[v.status] || { label: v.status, color: '#8A8680' }
                return (
                  <div key={v.id} onClick={() => setSelected(selected?.id === v.id ? null : v)} style={{
                    background: selected?.id === v.id ? 'rgba(201,168,76,0.04)' : '#161616',
                    border: `0.5px solid ${selected?.id === v.id ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
                    borderRadius: '8px', padding: '13px 15px', marginBottom: '8px', cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#F0EDE6' }}>
                        {(v.client as any)?.full_name || 'Cliente'}
                      </span>
                      <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '3px', background: `${st.color}18`, color: st.color, fontWeight: 500 }}>
                        {st.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#8A8680', marginBottom: '3px' }}>
                      {visitTypeLabel[v.visit_type]} · {v.guests} persona{v.guests > 1 ? 's' : ''}
                    </div>
                    <div style={{ fontSize: '12px', color: '#C9A84C' }}>
                      {new Date(v.requested_date).toLocaleDateString('es-GT')} · {v.requested_time?.slice(0,5)}
                    </div>
                    {(v.order as any)?.order_number && (
                      <div style={{ fontSize: '10px', color: '#8A8680', marginTop: '3px', fontFamily: 'monospace' }}>
                        {(v.order as any).order_number}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Detalle */}
            {selected && (
              <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#F0EDE6' }}>
                    {(selected.client as any)?.full_name}
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: '#8A8680', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>

                {[
                  { label: 'Tipo',      value: visitTypeLabel[selected.visit_type] },
                  { label: 'Teléfono', value: (selected.client as any)?.phone || '—' },
                  { label: 'Fecha',    value: new Date(selected.requested_date).toLocaleDateString('es-GT') },
                  { label: 'Hora',     value: selected.requested_time?.slice(0,5) },
                  { label: 'Personas', value: selected.guests },
                  { label: 'Motivo',   value: selected.reason || '—' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)', fontSize: '12px' }}>
                    <span style={{ color: '#8A8680' }}>{r.label}</span>
                    <span style={{ color: '#F0EDE6', fontWeight: 500 }}>{r.value}</span>
                  </div>
                ))}

                {selected.confirmed_date && (
                  <div style={{ background: 'rgba(74,175,122,0.08)', border: '0.5px solid rgba(74,175,122,0.25)', borderRadius: '5px', padding: '8px 12px', marginTop: '12px', fontSize: '12px', color: '#4AAF7A' }}>
                    Confirmada: {new Date(selected.confirmed_date).toLocaleDateString('es-GT')} · {selected.confirmed_time?.slice(0,5)}
                  </div>
                )}

                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selected.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(selected)} disabled={loading} style={{
                        width: '100%', padding: '9px', background: '#4AAF7A', color: '#0D0D0D',
                        border: 'none', borderRadius: '5px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                      }}>
                        Aprobar cita ✓
                      </button>

                      <button onClick={() => setShowReschedule(!showReschedule)} style={{
                        width: '100%', padding: '9px', background: 'transparent', color: '#C9A84C',
                        border: '0.5px solid rgba(201,168,76,0.3)', borderRadius: '5px', fontSize: '12px', cursor: 'pointer',
                      }}>
                        Proponer otra fecha
                      </button>

                      {showReschedule && (
                        <div style={{ background: '#1E1E1E', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: '#8A8680', marginBottom: '4px' }}>Nueva fecha</div>
                            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ ...input, width: '100%' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: '#8A8680', marginBottom: '4px' }}>Nueva hora</div>
                            <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} style={{ ...input, width: '100%' }} />
                          </div>
                          <button onClick={() => handleReschedule(selected.id)} disabled={!newDate || !newTime || loading} style={{
                            padding: '8px', background: '#C9A84C', color: '#0D0D0D',
                            border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                          }}>
                            Confirmar nueva fecha
                          </button>
                        </div>
                      )}

                      <button onClick={() => handleReject(selected.id)} disabled={loading} style={{
                        width: '100%', padding: '9px', background: 'transparent', color: '#E8748A',
                        border: '0.5px solid rgba(232,116,138,0.3)', borderRadius: '5px', fontSize: '12px', cursor: 'pointer',
                      }}>
                        Rechazar cita ✕
                      </button>
                    </>
                  )}

                  {['approved','rescheduled'].includes(selected.status) && (
                    <button onClick={() => handleComplete(selected.id)} disabled={loading} style={{
                      width: '100%', padding: '9px', background: 'rgba(74,175,122,0.1)', color: '#4AAF7A',
                      border: '0.5px solid rgba(74,175,122,0.3)', borderRadius: '5px', fontSize: '12px', cursor: 'pointer',
                    }}>
                      Marcar como completada ✓
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}