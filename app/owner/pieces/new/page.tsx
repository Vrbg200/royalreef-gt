'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SPECIES = [
  { name: 'Zoanthid',    prefix: 'ZOA' },
  { name: 'Palythoa',    prefix: 'PAL' },
  { name: 'LPS',         prefix: 'LPS' },
  { name: 'Blastomussa', prefix: 'BLA' },
  { name: 'Fungia',      prefix: 'FUN' },
  { name: 'SPS',         prefix: 'SPS' },
  { name: 'Acropora',    prefix: 'ACR' },
  { name: 'NPS',         prefix: 'NPS' },
]

const TIERS = {
  low:  { label: 'Low',  base: 30, min: 20, max: 50 },
  mid:  { label: 'Mid',  base: 40, min: 25, max: 65 },
  high: { label: 'High', base: 40, min: 30, max: 80 },
}

const TC = 7.75

export default function NewPiecePage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName]             = useState('')
  const [speciesIdx, setSpeciesIdx] = useState(0)
  const [size, setSize]             = useState<'XS'|'M'|'XL'>('M')
  const [tier, setTier]             = useState<'low'|'mid'|'high'>('mid')
  const [currency, setCurrency]     = useState<'USD'|'GTQ'>('USD')
  const [cost, setCost]             = useState(0)
  const [margin, setMargin]         = useState(40)
  const [notes, setNotes]           = useState('')
  const [isSpecial, setIsSpecial]   = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const t          = TIERS[tier]
  const costGTQ    = currency === 'USD' ? cost * TC : cost
  const importCost = costGTQ * 1.45
  const salePrice  = Math.round(importCost * (1 + margin / 100))
  const minPrice   = Math.round(importCost * (1 + t.min / 100))
  const marginOk   = margin >= t.min && margin <= t.max

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!marginOk) return
    setLoading(true)
    setError('')

    try {
      const sp   = SPECIES[speciesIdx]
      const year = new Date().getFullYear()

      // Obtener el siguiente número disponible
      const { count, error: countError } = await supabase
        .from('pieces')
        .select('*', { count: 'exact', head: true })
        .like('code', `${sp.prefix}-${year}-%`)

      console.log('COUNT:', count, 'ERROR:', countError)

      const num  = String((count || 0) + 1).padStart(3, '0')
      const code = `${sp.prefix}-${year}-${num}`

      // Obtener species_id
      const { data: speciesRow, error: speciesError } = await supabase
        .from('species')
        .select('id')
        .eq('code_prefix', sp.prefix)
        .single()

      console.log('SPECIES ROW:', speciesRow, 'ERROR:', speciesError)

      const { error: insertError } = await supabase
        .from('pieces')
        .insert({
          code,
          name,
          species_id:       speciesRow?.id,
          size,
          tier,
          cost_currency:    currency,
          cost_amount:      cost,
          exchange_rate:    TC,
          margin_pct:       margin,
          sale_price:       salePrice,
          is_special_order: isSpecial,
          internal_notes:   notes || null,
          status:           'active',
        })

      console.log('INSERT ERROR:', insertError)

      if (insertError) {
        setError('Error al guardar: ' + insertError.message)
        setLoading(false)
        return
      }

      router.push('/owner/pieces')

    } catch (err) {
      console.log('CATCH ERROR:', err)
      setError('Error inesperado')
      setLoading(false)
    }
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
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <a href="/owner" style={{ fontSize: '12px', color: '#8A8680', textDecoration: 'none' }}>← Dashboard</a>
          <span style={{ color: '#3A3835' }}>/</span>
          <span style={{ fontSize: '12px', color: '#8A8680' }}>Ingresar pieza</span>
        </div>

        <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#C9A84C', marginBottom: '20px' }}>
          Nueva pieza al inventario
        </h1>

        {error && (
          <div style={{
            background: 'rgba(232,116,138,0.08)',
            border: '0.5px solid rgba(232,116,138,0.25)',
            borderRadius: '5px', padding: '10px 12px',
            fontSize: '12px', color: '#E8748A', marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', letterSpacing: '0.04em', textTransform: 'uppercase' as const, marginBottom: '14px' }}>
                  Clasificación
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>Nombre comercial *</label>
                  <input style={input} value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Blasto rojo profundo" />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>Especie *</label>
                  <select style={{ ...input, cursor: 'pointer' }} value={speciesIdx} onChange={e => setSpeciesIdx(+e.target.value)}>
                    {SPECIES.map((s, i) => (
                      <option key={i} value={i}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>Tamaño *</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['XS','M','XL'] as const).map(s => (
                      <button key={s} type="button" onClick={() => setSize(s)} style={{
                        flex: 1, padding: '7px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer',
                        background: size === s ? 'rgba(201,168,76,0.08)' : '#1E1E1E',
                        border: `0.5px solid ${size === s ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
                        color: size === s ? '#C9A84C' : '#8A8680',
                      }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>Tier *</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(Object.entries(TIERS) as [string, typeof t][]).map(([key, val]) => (
                      <button key={key} type="button" onClick={() => { setTier(key as 'low'|'mid'|'high'); setMargin(val.base) }} style={{
                        flex: 1, padding: '7px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer',
                        background: tier === key ? 'rgba(201,168,76,0.06)' : '#1E1E1E',
                        border: `0.5px solid ${tier === key ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
                        color: tier === key ? '#C9A84C' : '#8A8680',
                      }}>
                        <div style={{ fontWeight: 500 }}>{val.label}</div>
                        <div style={{ fontSize: '9px', opacity: 0.7 }}>{val.min}–{val.max}%</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ ...label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isSpecial} onChange={e => setIsSpecial(e.target.checked)} style={{ accentColor: '#C9A84C' }} />
                    Pieza bajo pedido (especial)
                  </label>
                </div>
              </div>

              <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', letterSpacing: '0.04em', textTransform: 'uppercase' as const, marginBottom: '14px' }}>
                  Notas internas
                </div>
                <textarea style={{ ...input, resize: 'none' as const }} rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Proveedor, lote, observaciones..." />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', letterSpacing: '0.04em', textTransform: 'uppercase' as const, marginBottom: '14px' }}>
                  Precio
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>Moneda</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['USD','GTQ'] as const).map(c => (
                      <button key={c} type="button" onClick={() => setCurrency(c)} style={{
                        flex: 1, padding: '7px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer',
                        background: currency === c ? 'rgba(201,168,76,0.08)' : '#1E1E1E',
                        border: `0.5px solid ${currency === c ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
                        color: currency === c ? '#C9A84C' : '#8A8680',
                      }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>Costo de compra *</label>
                  <input style={input} type="number" min="0" step="0.5" value={cost || ''} onChange={e => setCost(+e.target.value)} required placeholder="0.00" />
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <label style={label}>Margen % (mín {t.min}% — máx {t.max}%)</label>
                  <input type="range" min={t.min} max={t.max} step="1" value={margin} onChange={e => setMargin(+e.target.value)} style={{ width: '100%', accentColor: '#C9A84C' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#8A8680', marginTop: '3px' }}>
                    <span>Mín {t.min}%</span>
                    <span style={{ color: marginOk ? '#C9A84C' : '#E8748A', fontWeight: 500 }}>{margin}%</span>
                    <span>Máx {t.max}%</span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(201,168,76,0.05)', border: '0.5px solid rgba(201,168,76,0.45)', borderRadius: '8px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', letterSpacing: '0.04em', textTransform: 'uppercase' as const, marginBottom: '12px' }}>
                  Cálculo de precio
                </div>
                {[
                  { label: 'Costo de compra', value: `${currency} ${cost.toFixed(2)}${currency === 'USD' ? ` · Q ${costGTQ.toFixed(2)}` : ''}` },
                  { label: '+ Importación (45%)', value: `Q ${(costGTQ * 0.45).toFixed(2)}` },
                  { label: '= Costo real total', value: `Q ${importCost.toFixed(2)}` },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0', borderBottom: '0.5px solid rgba(201,168,76,0.1)' }}>
                    <span style={{ color: '#8A8680' }}>{r.label}</span>
                    <span style={{ color: '#F0EDE6', fontWeight: 500 }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', padding: '10px 0 3px', marginTop: '4px' }}>
                  <span style={{ color: '#F0EDE6' }}>Precio de venta</span>
                  <span style={{ color: '#C9A84C', fontWeight: 500 }}>Q {salePrice.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#8A8680' }}>Precio mínimo permitido</span>
                  <span style={{ color: '#8A8680' }}>Q {minPrice.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', color: '#8A8680', marginBottom: '6px' }}>Código asignado al guardar</div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#C9A84C', letterSpacing: '0.06em', fontFamily: 'monospace' }}>
                  {SPECIES[speciesIdx].prefix}-{new Date().getFullYear()}-###
                </div>
                <div style={{ fontSize: '11px', color: '#3A3835', marginTop: '4px' }}>El número se asigna automáticamente</div>
              </div>

              <button type="submit" disabled={loading || !marginOk || !name || cost <= 0} style={{
                width: '100%', padding: '12px',
                background: loading || !marginOk || !name || cost <= 0 ? '#252525' : '#C9A84C',
                color: loading || !marginOk || !name || cost <= 0 ? '#8A8680' : '#0D0D0D',
                border: 'none', borderRadius: '6px',
                fontSize: '13px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Guardando...' : 'Guardar pieza al inventario ↗'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}