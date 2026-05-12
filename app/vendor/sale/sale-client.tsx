'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const TIER_MARGINS = {
  low:  { min: 20 },
  mid:  { min: 25 },
  high: { min: 30 },
}

export default function SaleClient({
  pieces, userId, vendorName
}: {
  pieces: any[], userId: string, vendorName: string
}) {
  const supabase = createClient()
  const router = useRouter()

  const [search, setSearch]         = useState('')
  const [cart, setCart]             = useState<any[]>([])
  const [payMethod, setPayMethod]   = useState<'cash'|'card'|'transfer'>('cash')
  const [extraDisc, setExtraDisc]   = useState(0)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')

  const filtered = pieces.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  )

  function addToCart(piece: any) {
    if (cart.find(c => c.id === piece.id)) return
    setCart(prev => [...prev, piece])
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(c => c.id !== id))
  }

  // Calcular precio con descuento activo
  function effectivePrice(p: any) {
    if (p.discount_pct > 0) {
      return Math.round(p.sale_price * (1 - p.discount_pct / 100))
    }
    return p.sale_price
  }

  const subtotal = cart.reduce((sum, p) => sum + effectivePrice(p), 0)

  // Verificar si el descuento extra es válido para todas las piezas
  function extraDiscOk(pct: number) {
    if (pct === 0) return true
    return cart.every(p => {
      const t = TIER_MARGINS[p.tier as keyof typeof TIER_MARGINS]
      const currentDiscPct = p.discount_pct || 0
      const minMargin = t?.min || 20
      const minPrice = p.import_cost * (1 + minMargin / 100)
      const priceAfter = effectivePrice(p) * (1 - pct / 100)
      return priceAfter >= minPrice
    })
  }

  const discOk = extraDiscOk(extraDisc)
  const total  = Math.round(subtotal * (1 - extraDisc / 100))

  async function handleSale() {
    if (cart.length === 0) return
    setLoading(true)
    setError('')

    // Generar número de orden
    const year = new Date().getFullYear()
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .like('order_number', `RR-${year}-%`)

    const num         = String((count || 0) + 1).padStart(5, '0')
    const orderNumber = `RR-${year}-${num}`

    // Crear orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number:      orderNumber,
        sale_channel:      'instore',
        status:            'completed',
        payment_method:    payMethod,
        delivery_type:     'instore',
        delivery_cost:     0,
        subtotal:          subtotal,
        discount_amt:      subtotal - total,
        total:             total,
        extra_discount_pct: extraDisc,
        sold_by:           userId,
        points_earned:     0,
      })
      .select()
      .single()

    if (orderError) {
      setError('Error al crear orden: ' + orderError.message)
      setLoading(false)
      return
    }

    // Insertar piezas en la orden
    const orderPieces = cart.map(p => ({
      order_id:    order.id,
      piece_id:    p.id,
      piece_name:  p.name,
      piece_code:  p.code,
      unit_price:  effectivePrice(p),
      discount_pct: p.discount_pct || 0,
    }))

    await supabase.from('order_pieces').insert(orderPieces)

    // Marcar piezas como vendidas
    await supabase
      .from('pieces')
      .update({ status: 'sold' })
      .in('id', cart.map(p => p.id))

    setSuccess(`Venta registrada — Orden ${orderNumber} · Total Q ${total.toLocaleString()}`)
    setCart([])
    setExtraDisc(0)
    setSearch('')
    setLoading(false)
    router.refresh()
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <a href="/vendor" style={{ fontSize: '12px', color: '#8A8680', textDecoration: 'none' }}>← Dashboard</a>
          <span style={{ color: '#3A3835' }}>/</span>
          <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#C9A84C' }}>Venta en tienda</h1>
        </div>

        {success && (
          <div style={{ background: 'rgba(74,175,122,0.08)', border: '0.5px solid rgba(74,175,122,0.25)', borderRadius: '6px', padding: '12px 16px', fontSize: '13px', color: '#4AAF7A', marginBottom: '16px' }}>
            {success}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: '16px' }}>

          {/* Buscador de piezas */}
          <div>
            <div style={{ marginBottom: '12px' }}>
              <input
                style={input}
                placeholder="Buscar pieza por nombre o código..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', overflow: 'hidden', maxHeight: '480px', overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#3A3835' }}>
                  No hay piezas disponibles
                </div>
              ) : filtered.map(p => {
                const inCart    = cart.find(c => c.id === p.id)
                const effPrice  = effectivePrice(p)
                const hasDisc   = p.discount_pct > 0

                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px',
                    borderBottom: '0.5px solid rgba(201,168,76,0.08)',
                    background: inCart ? 'rgba(201,168,76,0.04)' : 'transparent',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#F0EDE6' }}>{p.name}</div>
                      <div style={{ fontSize: '10px', color: '#8A8680', marginTop: '1px' }}>
                        {p.code} · {p.size} · {(p.species as any)?.name}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', marginRight: '10px' }}>
                      {hasDisc && (
                        <div style={{ fontSize: '10px', color: '#8A8680', textDecoration: 'line-through' }}>
                          Q {p.sale_price?.toLocaleString()}
                        </div>
                      )}
                      <div style={{ fontSize: '13px', fontWeight: 500, color: hasDisc ? '#E8748A' : '#C9A84C' }}>
                        Q {effPrice.toLocaleString()}
                      </div>
                    </div>
                    <button onClick={() => inCart ? removeFromCart(p.id) : addToCart(p)} style={{
                      padding: '5px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer',
                      background: inCart ? 'rgba(232,116,138,0.1)' : 'rgba(201,168,76,0.1)',
                      color: inCart ? '#E8748A' : '#C9A84C',
                      border: `0.5px solid ${inCart ? 'rgba(232,116,138,0.3)' : 'rgba(201,168,76,0.3)'}`,
                    }}>
                      {inCart ? 'Quitar' : '+ Agregar'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Resumen de venta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                Carrito ({cart.length})
              </div>

              {cart.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#3A3835', padding: '16px 0', textAlign: 'center' }}>
                  Agrega piezas desde el catálogo
                </div>
              ) : (
                <>
                  {cart.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)', fontSize: '12px' }}>
                      <div>
                        <div style={{ color: '#F0EDE6' }}>{p.name}</div>
                        <div style={{ fontSize: '10px', color: '#8A8680', fontFamily: 'monospace' }}>{p.code}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#C9A84C', fontWeight: 500 }}>Q {effectivePrice(p).toLocaleString()}</span>
                        <button onClick={() => removeFromCart(p.id)} style={{ background: 'transparent', border: 'none', color: '#8A8680', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {cart.length > 0 && (
              <>
                <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                    Método de pago
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                    {(['cash','card','transfer'] as const).map(m => (
                      <button key={m} onClick={() => setPayMethod(m)} style={{
                        flex: 1, padding: '7px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer',
                        background: payMethod === m ? 'rgba(201,168,76,0.08)' : '#1E1E1E',
                        border: `0.5px solid ${payMethod === m ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
                        color: payMethod === m ? '#C9A84C' : '#8A8680',
                      }}>
                        {m === 'cash' ? 'Efectivo' : m === 'card' ? 'Tarjeta' : 'Transferencia'}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: '11px', color: '#8A8680', marginBottom: '5px' }}>
                    Descuento extra ocasional % (máx 5%)
                  </div>
                  <input
                    type="number" min={0} max={5} step={1}
                    value={extraDisc}
                    onChange={e => setExtraDisc(Math.min(5, Math.max(0, +e.target.value)))}
                    style={{ ...input, width: '80px', textAlign: 'center' }}
                  />
                  {!discOk && (
                    <div style={{ fontSize: '11px', color: '#E8748A', marginTop: '6px' }}>
                      Descuento no permitido — reduciría la ganancia por debajo del mínimo
                    </div>
                  )}
                </div>

                <div style={{ background: 'rgba(201,168,76,0.05)', border: '0.5px solid rgba(201,168,76,0.45)', borderRadius: '8px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#8A8680' }}>Subtotal</span>
                    <span style={{ color: '#F0EDE6' }}>Q {subtotal.toLocaleString()}</span>
                  </div>
                  {extraDisc > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#8A8680' }}>Descuento extra -{extraDisc}%</span>
                      <span style={{ color: '#E8748A' }}>-Q {(subtotal - total).toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 500, paddingTop: '8px', borderTop: '0.5px solid rgba(201,168,76,0.18)', marginTop: '6px' }}>
                    <span style={{ color: '#F0EDE6' }}>Total a cobrar</span>
                    <span style={{ color: '#C9A84C' }}>Q {total.toLocaleString()}</span>
                  </div>
                </div>

                {error && (
                  <div style={{ fontSize: '12px', color: '#E8748A' }}>{error}</div>
                )}

                <button onClick={handleSale} disabled={loading || !discOk} style={{
                  width: '100%', padding: '12px',
                  background: !discOk ? '#252525' : '#C9A84C',
                  color: !discOk ? '#8A8680' : '#0D0D0D',
                  border: 'none', borderRadius: '6px',
                  fontSize: '13px', fontWeight: 500, cursor: !discOk ? 'not-allowed' : 'pointer',
                }}>
                  {loading ? 'Registrando...' : `Registrar venta · Q ${total.toLocaleString()} ↗`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}