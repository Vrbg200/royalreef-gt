'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/navbar'
import { createClient } from '@/lib/supabase/client'

export default function ExclusivesClient({
  pieces, species
}: {
  pieces: any[], species: any[]
}) {
  const supabase = createClient()

  const [speciesId, setSpeciesId]   = useState('')
  const [size, setSize]             = useState('')
  const [budget, setBudget]         = useState('')
  const [notes, setNotes]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)

  const canSubmit = speciesId && !loading

  async function handleQuote(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Debes iniciar sesión para solicitar una cotización')
      setLoading(false)
      return
    }

    const year = new Date().getFullYear()
    const { count } = await supabase
      .from('special_orders')
      .select('*', { count: 'exact', head: true })
      .like('order_number', `RR-SP-${year}-%`)

    const num         = String((count || 0) + 1).padStart(5, '0')
    const orderNumber = `RR-SP-${year}-${num}`

    const { error: err } = await supabase
      .from('special_orders')
      .insert({
        order_number:    orderNumber,
        client_id:       user.id,
        species_id:      speciesId,
        size_preference: size || 'any',
        budget_gtq:      budget ? parseFloat(budget) : null,
        notes:           notes || null,
        status:          'pending_quote',
      })

    if (err) {
      setError('Error al enviar: ' + err.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

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
            Tu solicitud de cotización fue recibida. Un asesor te contactará pronto con los detalles y el precio.
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>

        {/* Hero */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#C9A84C', marginBottom: '8px', textTransform: 'uppercase' }}>
            Colección exclusiva
          </p>
          <h1 style={{ fontSize: '26px', fontWeight: 500, color: '#F0EDE6', marginBottom: '10px', maxWidth: '500px' }}>
            Piezas <span style={{ color: '#C9A84C' }}>únicas</span> bajo pedido
          </h1>
          <p style={{ fontSize: '13px', color: '#8A8680', maxWidth: '480px', lineHeight: 1.6 }}>
            Importamos corales premium directamente desde Estados Unidos. Si buscas una especie específica o una pieza de colección, cuéntanos y la conseguimos para ti.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '24px' }}>

          {/* Piezas exclusivas en catálogo */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
              Disponibles ahora
            </div>

            {pieces.length === 0 ? (
              <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '32px', textAlign: 'center', fontSize: '13px', color: '#3A3835' }}>
                No hay piezas exclusivas en este momento
              </div>
            ) : pieces.map(p => (
              <div key={p.id} style={{
                background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)',
                borderRadius: '8px', padding: '14px 16px', marginBottom: '10px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#F0EDE6', marginBottom: '3px' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: '#8A8680' }}>
                    {(p.species as any)?.name} · {p.size}
                  </div>
                  <div style={{ fontSize: '10px', color: '#3A3835', fontFamily: 'monospace', marginTop: '2px' }}>{p.code}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#C9A84C' }}>
                    Q {p.sale_price?.toLocaleString()}
                  </div>
                  <a href={`/catalog/${p.id}`} style={{
                    fontSize: '11px', padding: '4px 10px', borderRadius: '4px', marginTop: '6px', display: 'inline-block',
                    background: 'rgba(201,168,76,0.1)', color: '#C9A84C',
                    border: '0.5px solid rgba(201,168,76,0.3)', textDecoration: 'none',
                  }}>
                    Ver pieza ↗
                  </a>
                </div>
              </div>
            ))}

            {/* Info de anticipo */}
            <div style={{ background: 'rgba(201,168,76,0.04)', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '14px 16px', marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#C9A84C', marginBottom: '8px' }}>
                ¿Cómo funciona el proceso?
              </div>
              {[
                { n: '1', text: 'Envías tu solicitud con la especie y características que buscas' },
                { n: '2', text: 'Te enviamos una cotización con el precio y detalles de importación' },
                { n: '3', text: 'Confirmas con un anticipo del 50% del precio final' },
                { n: '4', text: 'Importamos la pieza y te notificamos cuando llegue' },
                { n: '5', text: 'Pagas el saldo restante y coordinas la entrega' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: '10px', padding: '4px 0', fontSize: '12px', color: '#8A8680' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(201,168,76,0.1)', border: '0.5px solid rgba(201,168,76,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', color: '#C9A84C', fontWeight: 500,
                  }}>
                    {s.n}
                  </div>
                  <span style={{ paddingTop: '1px' }}>{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario de cotización */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
              Solicitar cotización
            </div>

            <form onSubmit={handleQuote} style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {error && (
                <div style={{ background: 'rgba(232,116,138,0.08)', border: '0.5px solid rgba(232,116,138,0.25)', borderRadius: '5px', padding: '8px 10px', fontSize: '12px', color: '#E8748A' }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '5px' }}>
                  Especie que buscas <span style={{ color: '#E8748A' }}>*</span>
                </label>
                <select style={{ ...input, cursor: 'pointer' }} value={speciesId} onChange={e => setSpeciesId(e.target.value)} required>
                  <option value="">Seleccionar especie...</option>
                  {species.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '5px' }}>
                  Tamaño preferido
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { key: '',    label: 'Sin preferencia' },
                    { key: 'XS', label: 'XS — pequeño' },
                    { key: 'M',  label: 'M — mediano' },
                    { key: 'XL', label: 'XL — grande' },
                  ].map(s => (
                    <button key={s.key} type="button" onClick={() => setSize(s.key)} style={{
                      flex: 1, padding: '6px 4px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer',
                      background: size === s.key ? 'rgba(201,168,76,0.08)' : '#1E1E1E',
                      border: `0.5px solid ${size === s.key ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
                      color: size === s.key ? '#C9A84C' : '#8A8680',
                    }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '5px' }}>
                  Presupuesto aproximado (Q) <span style={{ color: '#3A3835' }}>(opcional)</span>
                </label>
                <input
                  style={input} type="number" min="0" step="50"
                  value={budget} onChange={e => setBudget(e.target.value)}
                  placeholder="Ej: 2000"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '5px' }}>
                  Notas adicionales <span style={{ color: '#3A3835' }}>(opcional)</span>
                </label>
                <textarea
                  style={{ ...input, resize: 'none' as const }} rows={3}
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Color preferido, cantidad de pólipos, referencias de imágenes..."
                />
              </div>

              <div style={{ background: '#1E1E1E', borderRadius: '5px', padding: '10px 12px', fontSize: '11px', color: '#8A8680', lineHeight: 1.6 }}>
                Al enviar esta solicitud acepto que el proceso de bajo pedido requiere un <strong style={{ color: '#C9A84C' }}>anticipo del 50%</strong> del precio final. El anticipo no es reembolsable si cancelo después de confirmado.
              </div>

              <button type="submit" disabled={!canSubmit} style={{
                width: '100%', padding: '11px',
                background: canSubmit ? '#C9A84C' : '#252525',
                color: canSubmit ? '#0D0D0D' : '#8A8680',
                border: 'none', borderRadius: '5px',
                fontSize: '13px', fontWeight: 500, cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}>
                {loading ? 'Enviando...' : 'Enviar solicitud de cotización ↗'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}