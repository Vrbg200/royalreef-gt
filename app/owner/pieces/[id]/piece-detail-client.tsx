'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const TC = 7.75
const TIERS = {
  low:  { label: 'Low',  min: 20, max: 50 },
  mid:  { label: 'Mid',  min: 25, max: 65 },
  high: { label: 'High', min: 30, max: 80 },
}

export default function PieceDetailClient({ piece, history }: { piece: any, history: any[] }) {
  const router = useRouter()
  const supabase = createClient()

  const t = TIERS[piece.tier as keyof typeof TIERS]

  const [margin, setMargin]   = useState(piece.margin_pct)
  const [cost, setCost]       = useState(piece.cost_amount)
  const [currency]            = useState(piece.cost_currency)
  const [notes, setNotes]     = useState(piece.internal_notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [bajaType, setBajaType] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const costGTQ    = currency === 'USD' ? cost * TC : cost
  const importCost = costGTQ * 1.45
  const salePrice  = Math.round(importCost * (1 + margin / 100))
  const minPrice   = Math.round(importCost * (1 + t.min / 100))
  const marginOk   = margin >= t.min && margin <= t.max

  async function handleSave() {
    setLoading(true)
    setError('')
    setSuccess('')

    const { error: err } = await supabase
      .from('pieces')
      .update({
        cost_amount:     cost,
        margin_pct:      margin,
        sale_price:      salePrice,
        internal_notes:  notes || null,
      })
      .eq('id', piece.id)

    if (err) {
      setError('Error al guardar: ' + err.message)
    } else {
      setSuccess('Cambios guardados correctamente')
    }
    setLoading(false)
  }

  async function handleBaja() {
    if (!bajaType) return
    setLoading(true)

    const newStatus = bajaType === 'retiro' ? 'inactive' : 'deleted'

    const { error: err } = await supabase
      .from('pieces')
      .update({ status: newStatus })
      .eq('id', piece.id)

    if (err) {
      setError('Error al dar de baja: ' + err.message)
      setLoading(false)
      return
    }

    router.push('/owner/pieces')
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

  const reasonLabel: Record<string, string> = {
    initial:          'Ingreso inicial',
    auto_discount_3m: 'Descuento automático 3 meses',
    auto_discount_6m: 'Descuento automático 6 meses',
    campaign:         'Campaña de descuento',
    manual:           'Ajuste manual',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '12px', color: '#8A8680' }}>
          <a href="/owner" style={{ color: '#8A8680', textDecoration: 'none' }}>Dashboard</a>
          <span style={{ color: '#3A3835' }}>/</span>
          <a href="/owner/pieces" style={{ color: '#8A8680', textDecoration: 'none' }}>Catálogo</a>
          <span style={{ color: '#3A3835' }}>/</span>
          <span>{piece.code}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '16px' }}>

          {/* Columna izquierda — info y historial */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Info de la pieza */}
            <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#3A3835', fontFamily: 'monospace', letterSpacing: '0.04em', marginBottom: '4px' }}>{piece.code}</div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#F0EDE6' }}>{piece.name}</div>
                  <div style={{ fontSize: '12px', color: '#C9A84C', marginTop: '2px' }}>{(piece.species as any)?.name}</div>
                </div>
                <span style={{
                  fontSize: '10px', padding: '2px 8px', borderRadius: '3px', fontWeight: 500,
                  background: piece.status === 'active' ? 'rgba(74,175,122,0.1)' : 'rgba(232,116,138,0.1)',
                  color: piece.status === 'active' ? '#4AAF7A' : '#E8748A',
                }}>
                  {piece.status === 'active' ? 'Activo' : piece.status}
                </span>
              </div>

              {[
                { label: 'Tamaño', value: piece.size },
                { label: 'Tier', value: TIERS[piece.tier as keyof typeof TIERS]?.label },
                { label: 'Costo de compra', value: `${piece.cost_currency} ${piece.cost_amount}` },
                { label: 'Costo real (+45%)', value: `Q ${piece.import_cost?.toFixed(2)}` },
                { label: 'Bajo pedido', value: piece.is_special_order ? 'Sí' : 'No' },
                { label: 'Ingresado', value: new Date(piece.created_at).toLocaleDateString('es-GT') },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)', fontSize: '12px' }}>
                  <span style={{ color: '#8A8680' }}>{r.label}</span>
                  <span style={{ color: '#F0EDE6', fontWeight: 500 }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Historial de precio */}
            <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                Historial de precio
              </div>
              {history.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#3A3835' }}>Sin cambios de precio</div>
              ) : history.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '6px 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)', fontSize: '11px' }}>
                  <div>
                    <div style={{ color: '#F0EDE6' }}>{reasonLabel[h.reason] || h.reason}</div>
                    <div style={{ color: '#3A3835', marginTop: '1px' }}>{new Date(h.created_at).toLocaleDateString('es-GT')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {h.old_price && <div style={{ color: '#8A8680', textDecoration: 'line-through' }}>Q {h.old_price}</div>}
                    <div style={{ color: '#C9A84C', fontWeight: 500 }}>Q {h.new_price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha — editar y dar de baja */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Editor de precio */}
            <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
                Editar precio y margen
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '5px' }}>
                  Costo de compra ({currency})
                </label>
                <input style={input} type="number" min="0" step="0.5" value={cost} onChange={e => setCost(+e.target.value)} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '5px' }}>
                  Margen % (mín {t.min}% — máx {t.max}%)
                </label>
                <input type="range" min={t.min} max={t.max} step="1" value={margin}
                  onChange={e => setMargin(+e.target.value)}
                  style={{ width: '100%', accentColor: '#C9A84C' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#8A8680', marginTop: '3px' }}>
                  <span>Mín {t.min}%</span>
                  <span style={{ color: marginOk ? '#C9A84C' : '#E8748A', fontWeight: 500 }}>{margin}%</span>
                  <span>Máx {t.max}%</span>
                </div>
              </div>

              {/* Preview */}
              <div style={{ background: 'rgba(201,168,76,0.05)', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '5px', padding: '10px 12px', marginBottom: '12px' }}>
                {[
                  { label: 'Costo real (+45%)', value: `Q ${importCost.toFixed(2)}` },
                  { label: 'Precio de venta', value: `Q ${salePrice.toLocaleString()}`, gold: true },
                  { label: 'Precio mínimo', value: `Q ${minPrice.toLocaleString()}` },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '2px 0' }}>
                    <span style={{ color: '#8A8680' }}>{r.label}</span>
                    <span style={{ color: r.gold ? '#C9A84C' : '#F0EDE6', fontWeight: r.gold ? 500 : 400 }}>{r.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '5px' }}>Notas internas</label>
                <textarea style={{ ...input, resize: 'none' as const }} rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              {error && <div style={{ fontSize: '12px', color: '#E8748A', marginBottom: '8px' }}>{error}</div>}
              {success && <div style={{ fontSize: '12px', color: '#4AAF7A', marginBottom: '8px' }}>{success}</div>}

              <button onClick={handleSave} disabled={loading || !marginOk} style={{
                width: '100%', padding: '10px',
                background: !marginOk ? '#252525' : '#C9A84C',
                color: !marginOk ? '#8A8680' : '#0D0D0D',
                border: 'none', borderRadius: '5px',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}>
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>

            {/* Dar de baja */}
            {piece.status === 'active' && (
              <div style={{ background: 'rgba(232,116,138,0.05)', border: '0.5px solid rgba(232,116,138,0.25)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 500, color: '#E8748A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                  Dar de baja
                </div>

                {[
                  { key: 'murio', label: 'La pieza murió', sub: 'Se elimina del inventario — afecta métricas de pérdida' },
                  { key: 'error', label: 'Error de ingreso', sub: 'Se elimina sin afectar métricas' },
                  { key: 'retiro', label: 'Retirar del catálogo', sub: 'Se oculta pero el registro se conserva' },
                ].map(opt => (
                  <div key={opt.key} onClick={() => { setBajaType(opt.key); setShowConfirm(false) }} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '8px 0', borderBottom: '0.5px solid rgba(232,116,138,0.15)',
                    cursor: 'pointer',
                  }}>
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                      border: `0.5px solid ${bajaType === opt.key ? '#E8748A' : 'rgba(232,116,138,0.3)'}`,
                      background: bajaType === opt.key ? '#E8748A' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {bajaType === opt.key && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0D0D0D' }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#F0EDE6' }}>{opt.label}</div>
                      <div style={{ fontSize: '10px', color: '#8A8680', marginTop: '1px' }}>{opt.sub}</div>
                    </div>
                  </div>
                ))}

                <button onClick={() => setShowConfirm(true)} disabled={!bajaType} style={{
                  width: '100%', padding: '9px', marginTop: '12px',
                  background: bajaType ? 'rgba(232,116,138,0.1)' : '#1E1E1E',
                  color: bajaType ? '#E8748A' : '#3A3835',
                  border: `0.5px solid ${bajaType ? 'rgba(232,116,138,0.3)' : 'transparent'}`,
                  borderRadius: '5px', fontSize: '12px', fontWeight: 500, cursor: bajaType ? 'pointer' : 'not-allowed',
                }}>
                  Dar de baja
                </button>

                {showConfirm && (
                  <div style={{ background: '#1E1E1E', border: '0.5px solid rgba(232,116,138,0.3)', borderRadius: '6px', padding: '12px', marginTop: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#E8748A', marginBottom: '6px' }}>¿Confirmar baja?</div>
                    <div style={{ fontSize: '11px', color: '#8A8680', marginBottom: '12px' }}>
                      Esta acción no se puede deshacer.
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button onClick={handleBaja} style={{
                        padding: '8px', background: '#E8748A', color: '#0D0D0D',
                        border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                      }}>
                        Confirmar
                      </button>
                      <button onClick={() => setShowConfirm(false)} style={{
                        padding: '8px', background: 'transparent', color: '#8A8680',
                        border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '4px', fontSize: '12px', cursor: 'pointer',
                      }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}