'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CampaignsClient({
  campaigns, pieces, userId
}: {
  campaigns: any[], pieces: any[], userId: string
}) {
  const supabase = createClient()
  const router = useRouter()

  const [name, setName]         = useState('')
  const [discPct, setDiscPct]   = useState(10)
  const [startDate, setStart]   = useState('')
  const [endDate, setEnd]       = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const pctOk = discPct >= 1 && discPct <= 25
  const canSave = name && startDate && endDate && pctOk && selected.length > 0

  function togglePiece(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  async function handleCreate() {
    setLoading(true)
    setError('')
    setSuccess('')

    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .insert({
        name,
        label: `Descuento por ${name}`,
        discount_pct: discPct,
        starts_at: startDate,
        ends_at: endDate,
        created_by: userId,
      })
      .select()
      .single()

    if (campError) {
      setError('Error al crear campaña: ' + campError.message)
      setLoading(false)
      return
    }

    // Asociar piezas a la campaña
    const pivotRows = selected.map(pieceId => ({
      campaign_id: campaign.id,
      piece_id: pieceId,
    }))

    const { error: pivotError } = await supabase
      .from('campaign_pieces')
      .insert(pivotRows)

    if (pivotError) {
      setError('Error al asociar piezas: ' + pivotError.message)
      setLoading(false)
      return
    }

    // Actualizar discount en las piezas seleccionadas
    await supabase
      .from('pieces')
      .update({ discount_pct: discPct, discount_type: 'campaign', campaign_id: campaign.id })
      .in('id', selected)

    setSuccess('Campaña creada correctamente')
    setName('')
    setDiscPct(10)
    setStart('')
    setEnd('')
    setSelected([])
    setLoading(false)
    router.refresh()
  }

  async function handleDeactivate(id: string) {
    await supabase
      .from('campaigns')
      .update({ is_active: false })
      .eq('id', id)

    // Quitar descuento de las piezas
    await supabase
      .from('pieces')
      .update({ discount_pct: 0, discount_type: 'none', campaign_id: null })
      .eq('campaign_id', id)

    router.refresh()
  }

  const tierColor = (t: string) =>
    t === 'low' ? '#4AAF7A' : t === 'mid' ? '#C9A84C' : '#E8748A'

  const statusCampaign = (c: any) => {
    const now = new Date()
    const start = new Date(c.starts_at)
    const end = new Date(c.ends_at)
    if (!c.is_active) return { label: 'Desactivada', color: '#3A3835' }
    if (now < start)  return { label: 'Programada',  color: '#C9A84C' }
    if (now > end)    return { label: 'Terminada',   color: '#8A8680' }
    return { label: 'Activa', color: '#4AAF7A' }
  }

  const input = {
    width: '100%',
    backgroundColor: '#1E1E1E',
    border: '0.5px solid rgba(201,168,76,0.18)',
    borderRadius: '5px',
    padding: '8px 10px',
    color: '#F0EDE6',
    fontSize: '13px',
    outline: 'none',
  } as React.CSSProperties

  const label = {
    display: 'block' as const,
    fontSize: '11px',
    color: '#8A8680',
    marginBottom: '5px',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <a href="/owner" style={{ fontSize: '12px', color: '#8A8680', textDecoration: 'none' }}>← Dashboard</a>
          <span style={{ color: '#3A3835' }}>/</span>
          <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#C9A84C' }}>Campañas de descuento</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '16px' }}>

          {/* Lista de campañas */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Campañas activas y pasadas
            </div>

            {campaigns.length === 0 ? (
              <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '32px', textAlign: 'center', fontSize: '13px', color: '#3A3835' }}>
                No hay campañas creadas
              </div>
            ) : campaigns.map(c => {
              const st = statusCampaign(c)
              return (
                <div key={c.id} style={{
                  background: '#161616',
                  border: '0.5px solid rgba(201,168,76,0.18)',
                  borderRadius: '8px', padding: '14px 16px', marginBottom: '10px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#F0EDE6' }}>{c.name}</div>
                      <div style={{ fontSize: '11px', color: '#8A8680', marginTop: '2px' }}>{c.label}</div>
                    </div>
                    <span style={{
                      fontSize: '10px', padding: '2px 8px', borderRadius: '3px', fontWeight: 500,
                      background: `${st.color}18`, color: st.color,
                    }}>
                      {st.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#8A8680', marginBottom: '10px' }}>
                    <span>-{c.discount_pct}%</span>
                    <span>{new Date(c.starts_at).toLocaleDateString('es-GT')} → {new Date(c.ends_at).toLocaleDateString('es-GT')}</span>
                  </div>
                  {c.is_active && st.label !== 'Terminada' && (
                    <button onClick={() => handleDeactivate(c.id)} style={{
                      fontSize: '11px', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer',
                      background: 'transparent', color: '#E8748A',
                      border: '0.5px solid rgba(232,116,138,0.3)',
                    }}>
                      Desactivar campaña
                    </button>
                  )}
                </div>
              )
            })}

            {/* Reglas automáticas */}
            <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '14px 16px', marginTop: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                Reglas automáticas
              </div>
              {[
                { label: '3 meses sin venta', disc: '-20%', tag: '"Oferta especial"' },
                { label: '6 meses sin venta', disc: '-30%', tag: '"Oferta especial"' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i === 0 ? '0.5px solid rgba(201,168,76,0.08)' : 'none', fontSize: '12px' }}>
                  <div>
                    <div style={{ color: '#F0EDE6' }}>{r.label}</div>
                    <div style={{ fontSize: '10px', color: '#8A8680', marginTop: '1px' }}>Etiqueta al cliente: {r.tag}</div>
                  </div>
                  <span style={{ color: '#E8748A', fontWeight: 500 }}>{r.disc}</span>
                </div>
              ))}
              <div style={{ fontSize: '10px', color: '#3A3835', marginTop: '10px' }}>
                Gana el mayor descuento si hay conflicto con campaña activa
              </div>
            </div>
          </div>

          {/* Crear campaña */}
          <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
              Nueva campaña
            </div>

            {error && (
              <div style={{ background: 'rgba(232,116,138,0.08)', border: '0.5px solid rgba(232,116,138,0.25)', borderRadius: '5px', padding: '8px 10px', fontSize: '12px', color: '#E8748A', marginBottom: '12px' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ background: 'rgba(74,175,122,0.08)', border: '0.5px solid rgba(74,175,122,0.25)', borderRadius: '5px', padding: '8px 10px', fontSize: '12px', color: '#4AAF7A', marginBottom: '12px' }}>
                {success}
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <label style={label}>Nombre del evento *</label>
              <input style={input} value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Navidad, Verano, Feria..." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={label}>Fecha inicio *</label>
                <input style={input} type="date" value={startDate} onChange={e => setStart(e.target.value)} />
              </div>
              <div>
                <label style={label}>Fecha fin *</label>
                <input style={input} type="date" value={endDate} onChange={e => setEnd(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={label}>Descuento % (máx 25%)</label>
              <input type="range" min={1} max={25} step={1} value={discPct}
                onChange={e => setDiscPct(+e.target.value)}
                style={{ width: '100%', accentColor: '#C9A84C' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#8A8680', marginTop: '3px' }}>
                <span>1%</span>
                <span style={{ color: '#C9A84C', fontWeight: 500 }}>{discPct}%</span>
                <span>25%</span>
              </div>
            </div>

            {/* Preview etiqueta */}
            <div style={{ background: 'rgba(201,168,76,0.05)', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '5px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px' }}>
              <span style={{ color: '#8A8680' }}>Etiqueta al cliente: </span>
              <span style={{ color: '#C9A84C', fontWeight: 500 }}>
                {name ? `Descuento por ${name}` : 'Descuento por [evento]'}
              </span>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ ...label, marginBottom: '8px' }}>
                Piezas incluidas * ({selected.length} seleccionadas)
              </label>
              <div style={{
                maxHeight: '220px', overflowY: 'auto',
                border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '5px',
                background: '#1E1E1E',
              }}>
                {pieces.map(p => {
                  const isChosen = selected.includes(p.id)
                  const hasDisc = p.discount_type === 'campaign'
                  return (
                    <div key={p.id} onClick={() => togglePiece(p.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 12px',
                      borderBottom: '0.5px solid rgba(201,168,76,0.08)',
                      cursor: 'pointer',
                      background: isChosen ? 'rgba(201,168,76,0.05)' : 'transparent',
                    }}>
                      <div style={{
                        width: '14px', height: '14px', borderRadius: '3px', flexShrink: 0,
                        border: `0.5px solid ${isChosen ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`,
                        background: isChosen ? '#C9A84C' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isChosen && <span style={{ fontSize: '9px', color: '#0D0D0D', fontWeight: 700 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#F0EDE6' }}>{p.name}</div>
                        <div style={{ fontSize: '10px', color: '#8A8680' }}>
                          {p.code} · Q {p.sale_price?.toLocaleString()}
                          {hasDisc && <span style={{ color: '#E8748A', marginLeft: '6px' }}>ya en campaña</span>}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '9px', padding: '1px 6px', borderRadius: '3px',
                        background: `${tierColor(p.tier)}18`, color: tierColor(p.tier),
                      }}>{p.tier}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <button onClick={handleCreate} disabled={loading || !canSave} style={{
              width: '100%', padding: '10px',
              background: !canSave ? '#252525' : '#C9A84C',
              color: !canSave ? '#8A8680' : '#0D0D0D',
              border: 'none', borderRadius: '5px',
              fontSize: '13px', fontWeight: 500, cursor: canSave ? 'pointer' : 'not-allowed',
            }}>
              {loading ? 'Creando...' : 'Crear campaña ↗'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}