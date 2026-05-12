'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OrdersClient({ orders, userId }: { orders: any[], userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [selected, setSelected] = useState<any>(orders[0] || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pending   = orders.filter(o => o.status === 'pending')
  const verified  = orders.filter(o => o.status === 'payment_verified')

  async function handleVerify() {
    if (!selected) return
    setLoading(true)
    setError('')

    const { error: err } = await supabase
      .from('orders')
      .update({
        status: 'payment_verified',
        payment_verified_at: new Date().toISOString(),
        payment_verified_by: userId,
      })
      .eq('id', selected.id)

    if (err) {
      setError('Error al verificar: ' + err.message)
      setLoading(false)
      return
    }

    // Marcar piezas como vendidas
    const pieceCodes = selected.order_pieces?.map((p: any) => p.piece_code) || []
    if (pieceCodes.length > 0) {
      await supabase
        .from('pieces')
        .update({ status: 'sold' })
        .in('code', pieceCodes)
    }

    setLoading(false)
    router.refresh()
  }

  async function handleReject() {
    if (!selected) return
    setLoading(true)

    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', selected.id)

    // Devolver piezas al catálogo
    const pieceCodes = selected.order_pieces?.map((p: any) => p.piece_code) || []
    if (pieceCodes.length > 0) {
      await supabase
        .from('pieces')
        .update({ status: 'active' })
        .in('code', pieceCodes)
    }

    setLoading(false)
    router.refresh()
  }

  const deliveryLabel: Record<string, string> = {
    pickup:   'Pick-up en tienda',
    city:     'Delivery ciudad',
    interior: 'Envío interior',
    instore:  'Venta en tienda',
  }

  const statusStyle = (s: string) => s === 'pending'
    ? { bg: 'rgba(232,116,138,0.1)', color: '#E8748A', label: 'Pendiente de pago' }
    : { bg: 'rgba(74,175,122,0.1)', color: '#4AAF7A', label: 'Pago verificado' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <a href="/vendor" style={{ fontSize: '12px', color: '#8A8680', textDecoration: 'none' }}>← Dashboard</a>
          <span style={{ color: '#3A3835' }}>/</span>
          <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#C9A84C' }}>
            Órdenes pendientes
            {pending.length > 0 && (
              <span style={{
                marginLeft: '10px', fontSize: '13px', padding: '2px 8px',
                background: 'rgba(232,116,138,0.1)', color: '#E8748A',
                borderRadius: '4px', fontWeight: 400,
              }}>
                {pending.length} sin verificar
              </span>
            )}
          </h1>
        </div>

        {orders.length === 0 ? (
          <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '48px', textAlign: 'center', fontSize: '13px', color: '#3A3835' }}>
            No hay órdenes pendientes
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: '14px' }}>

            {/* Lista de órdenes */}
            <div>
              {pending.length > 0 && (
                <>
                  <div style={{ fontSize: '10px', color: '#E8748A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', fontWeight: 500 }}>
                    Esperando comprobante
                  </div>
                  {pending.map(o => (
                    <div key={o.id} onClick={() => setSelected(o)} style={{
                      background: selected?.id === o.id ? 'rgba(201,168,76,0.04)' : '#161616',
                      border: `0.5px solid ${selected?.id === o.id ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
                      borderRadius: '7px', padding: '11px 13px', marginBottom: '8px', cursor: 'pointer',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#C9A84C', fontFamily: 'monospace' }}>{o.order_number}</span>
                        <span style={{ fontSize: '11px', color: '#8A8680' }}>{new Date(o.created_at).toLocaleDateString('es-GT')}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#8A8680', marginBottom: '4px' }}>
                        {(o.client as any)?.full_name || o.walk_in_name || 'Cliente sin cuenta'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#8A8680' }}>{deliveryLabel[o.delivery_type]}</span>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#C9A84C' }}>Q {o.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {verified.length > 0 && (
                <>
                  <div style={{ fontSize: '10px', color: '#4AAF7A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', fontWeight: 500, marginTop: pending.length > 0 ? '14px' : '0' }}>
                    Pago verificado
                  </div>
                  {verified.map(o => (
                    <div key={o.id} onClick={() => setSelected(o)} style={{
                      background: selected?.id === o.id ? 'rgba(201,168,76,0.04)' : '#161616',
                      border: `0.5px solid ${selected?.id === o.id ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
                      borderRadius: '7px', padding: '11px 13px', marginBottom: '8px', cursor: 'pointer',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#C9A84C', fontFamily: 'monospace' }}>{o.order_number}</span>
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '3px', background: 'rgba(74,175,122,0.1)', color: '#4AAF7A' }}>Verificado</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#8A8680' }}>{(o.client as any)?.full_name || 'Cliente'}</span>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#C9A84C' }}>Q {o.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Detalle de orden */}
            {selected && (
              <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 500, color: '#C9A84C', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                      {selected.order_number}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8A8680', marginTop: '2px' }}>
                      {new Date(selected.created_at).toLocaleString('es-GT')}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '3px', fontWeight: 500,
                    background: statusStyle(selected.status).bg,
                    color: statusStyle(selected.status).color,
                  }}>
                    {statusStyle(selected.status).label}
                  </span>
                </div>

                {/* Cliente */}
                <div style={{ marginBottom: '14px', padding: '10px 12px', background: '#1E1E1E', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#8A8680', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cliente</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#F0EDE6' }}>
                    {(selected.client as any)?.full_name || selected.walk_in_name || 'Cliente sin cuenta'}
                  </div>
                  {(selected.client as any)?.phone && (
                    <div style={{ fontSize: '11px', color: '#C9A84C', marginTop: '2px' }}>
                      WhatsApp: {(selected.client as any).phone}
                    </div>
                  )}
                </div>

                {/* Piezas */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '10px', color: '#8A8680', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Piezas</div>
                  {selected.order_pieces?.map((p: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)', fontSize: '12px' }}>
                      <div>
                        <div style={{ color: '#F0EDE6' }}>{p.piece_name}</div>
                        <div style={{ fontSize: '10px', color: '#8A8680', fontFamily: 'monospace' }}>{p.piece_code}</div>
                      </div>
                      <span style={{ color: '#C9A84C', fontWeight: 500 }}>Q {p.unit_price?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div style={{ background: 'rgba(201,168,76,0.05)', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '5px', padding: '10px 12px', marginBottom: '14px' }}>
                  {[
                    { label: 'Subtotal', value: `Q ${selected.subtotal?.toLocaleString()}` },
                    { label: 'Descuento', value: selected.discount_amt > 0 ? `-Q ${selected.discount_amt?.toLocaleString()}` : '—' },
                    { label: 'Envío', value: `Q ${selected.delivery_cost?.toLocaleString() || '0'}` },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '2px 0' }}>
                      <span style={{ color: '#8A8680' }}>{r.label}</span>
                      <span style={{ color: '#F0EDE6' }}>{r.value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 500, padding: '8px 0 0', marginTop: '6px', borderTop: '0.5px solid rgba(201,168,76,0.18)' }}>
                    <span style={{ color: '#F0EDE6' }}>Total</span>
                    <span style={{ color: '#C9A84C' }}>Q {selected.total?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Entrega */}
                <div style={{ fontSize: '12px', color: '#8A8680', marginBottom: '14px' }}>
                  <span style={{ color: '#F0EDE6', fontWeight: 500 }}>Entrega: </span>
                  {deliveryLabel[selected.delivery_type]}
                  {selected.delivery_date && ` · ${new Date(selected.delivery_date).toLocaleDateString('es-GT')}`}
                  {selected.pickup_deadline && ` · Plazo máx: ${new Date(selected.pickup_deadline).toLocaleDateString('es-GT')}`}
                </div>

                {error && (
                  <div style={{ fontSize: '12px', color: '#E8748A', marginBottom: '10px' }}>{error}</div>
                )}

                {/* Acciones */}
                {selected.status === 'pending' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button onClick={handleVerify} disabled={loading} style={{
                      padding: '10px', background: '#4AAF7A', color: '#0D0D0D',
                      border: 'none', borderRadius: '5px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                    }}>
                      {loading ? 'Procesando...' : 'Confirmar pago ✓'}
                    </button>
                    <button onClick={handleReject} disabled={loading} style={{
                      padding: '10px', background: 'transparent', color: '#E8748A',
                      border: '0.5px solid rgba(232,116,138,0.3)', borderRadius: '5px',
                      fontSize: '12px', cursor: 'pointer',
                    }}>
                      Comprobante inválido ✕
                    </button>
                  </div>
                )}

                {selected.status === 'payment_verified' && (
                  <div style={{ background: 'rgba(74,175,122,0.08)', border: '0.5px solid rgba(74,175,122,0.25)', borderRadius: '5px', padding: '10px 12px', fontSize: '12px', color: '#4AAF7A' }}>
                    Pago verificado — pieza marcada como vendida
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}