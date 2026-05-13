'use client'

import { useState } from 'react'
import { useCart } from '@/components/cart-context'
import Navbar from '@/components/layout/navbar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const subtotalPiezas = items.reduce((s, i) => s + i.price, 0)
  const totalDelivery  = items.reduce((s, i) => s + (i.deliveryCost || 0), 0)
  const grandTotal     = subtotalPiezas + totalDelivery
  const supabase = createClient()
  const router   = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleOrder() {
    if (items.length === 0) return
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    // Generar número de orden
    const year = new Date().getFullYear()
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .like('order_number', `RR-${year}-%`)

    const num         = String((count || 0) + 1).padStart(5, '0')
    const orderNumber = `RR-${year}-${num}`

    const subtotal     = items.reduce((s, i) => s + (i.originalPrice || i.price), 0)
    const discountAmt  = subtotal - items.reduce((s, i) => s + i.price, 0)

    // Crear orden
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number:   orderNumber,
        client_id:      user?.id || null,
        sale_channel:   'online',
        status:         'pending',
        payment_method: 'transfer',
        delivery_type:  'city',
        delivery_cost:  125,
        subtotal:       subtotal,
        discount_amt:   discountAmt,
        total:          total + 125,
        pickup_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
      .select()
      .single()

    if (orderErr) {
      setError('Error al crear la orden: ' + orderErr.message)
      setLoading(false)
      return
    }

    // Insertar piezas
    await supabase.from('order_pieces').insert(
      items.map(i => ({
        order_id:    order.id,
        piece_id:    i.id,
        piece_name:  i.name,
        piece_code:  i.code,
        unit_price:  i.price,
        discount_pct: i.discountPct || 0,
      }))
    )

    // Reservar piezas
    await supabase
      .from('pieces')
      .update({ status: 'reserved' })
      .in('id', items.map(i => i.id))

    clearCart()
    router.push(`/order/${order.id}`)
  }

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
        <Navbar />
        <div style={{ maxWidth: '600px', margin: '60px auto', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#3A3835', marginBottom: '16px' }}>Tu carrito está vacío</div>
          <a href="/catalog" style={{
            padding: '10px 22px', background: '#C9A84C', color: '#0D0D0D',
            borderRadius: '5px', fontSize: '13px', fontWeight: 500, textDecoration: 'none',
          }}>
            Ver catálogo
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
      <Navbar />
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px' }}>

        <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#C9A84C', marginBottom: '20px' }}>
          Confirmar orden
        </h1>

        {/* Piezas */}
        <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
            Piezas ({items.length})
          </div>
          {items.map(i => (
            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)', fontSize: '13px' }}>
              <div>
                <div style={{ color: '#F0EDE6', fontWeight: 500 }}>{i.name}</div>
                <div style={{ fontSize: '10px', color: '#8A8680', fontFamily: 'monospace', marginTop: '1px' }}>{i.code} · {i.size}</div>
              </div>
              <span style={{ color: '#C9A84C', fontWeight: 500 }}>Q {i.price.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div style={{ background: 'rgba(201,168,76,0.05)', border: '0.5px solid rgba(201,168,76,0.45)', borderRadius: '8px', padding: '14px 16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
            <span style={{ color: '#8A8680' }}>Subtotal piezas</span>
            <span style={{ color: '#F0EDE6' }}>Q {subtotalPiezas.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '10px' }}>
            <span style={{ color: '#8A8680' }}>
                Envío · {items[0]?.delivery === 'pickup' ? 'Pick-up en tienda' : items[0]?.delivery === 'interior' ? 'Interior del país' : 'Guatemala ciudad'}
            </span>
            <span style={{ color: '#F0EDE6' }}>{totalDelivery === 0 ? 'Gratis' : `Q ${totalDelivery}`}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 500, paddingTop: '10px', borderTop: '0.5px solid rgba(201,168,76,0.18)' }}>
            <span style={{ color: '#F0EDE6' }}>Total</span>
            <span style={{ color: '#C9A84C' }}>Q {grandTotal.toLocaleString()}</span>
        </div>
        </div>

        {/* Info de pago */}
        <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '14px 16px', marginBottom: '14px', fontSize: '12px', color: '#8A8680', lineHeight: 1.7 }}>
          <div style={{ fontWeight: 500, color: '#F0EDE6', marginBottom: '6px' }}>¿Cómo funciona el pago?</div>
          Al confirmar tu orden recibirás el número de orden y los datos bancarios para realizar la transferencia. Luego envías tu comprobante por WhatsApp y un asesor verifica y confirma tu compra.
        </div>

        {error && (
          <div style={{ fontSize: '12px', color: '#E8748A', marginBottom: '12px' }}>{error}</div>
        )}
        <a href="/catalog" style={{
            display: 'block', width: '100%', padding: '11px',
            background: 'transparent', color: '#8A8680',
            border: '0.5px solid rgba(201,168,76,0.18)',
            borderRadius: '6px', fontSize: '13px',
            textDecoration: 'none', textAlign: 'center',
            marginBottom: '8px',
        }}>
            ← Seguir comprando
        </a>

        <button onClick={handleOrder} disabled={loading} style={{
          width: '100%', padding: '12px',
          background: '#C9A84C', color: '#0D0D0D',
          border: 'none', borderRadius: '6px',
          fontSize: '13px', fontWeight: 500, cursor: 'pointer',
        }}>
          {loading ? 'Procesando...' : 'Confirmar orden ↗'}
        </button>
      </div>
    </div>
  )
}