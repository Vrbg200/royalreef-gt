'use client'

import { useState } from 'react'
import { useCart } from '@/components/cart-context'
import Navbar from '@/components/layout/navbar'

export default function PieceClient({ piece }: { piece: any }) {
  const { addItem, items } = useCart()
  const [delivery, setDelivery]     = useState<'pickup'|'city'|'interior'>('city')
  const [termsOk, setTermsOk]       = useState(false)
  const [added, setAdded]           = useState(false)

  const inCart = items.find(i => i.id === piece.id)

  const effectivePrice = piece.discount_pct > 0
    ? Math.round(piece.sale_price * (1 - piece.discount_pct / 100))
    : piece.sale_price

  const deliveryCost = delivery === 'pickup' ? 0 : delivery === 'city' ? 125 : 225
  const total        = effectivePrice + deliveryCost

  const discountLabel = piece.discount_type === 'campaign'
    ? 'Descuento especial'
    : piece.discount_type === 'auto'
    ? 'Oferta especial'
    : ''

    function handleAdd() {
    addItem({
        id:            piece.id,
        code:          piece.code,
        name:          piece.name,
        species:       piece.species?.name || '',
        size:          piece.size,
        price:         effectivePrice,
        originalPrice: piece.sale_price,
        discountPct:   piece.discount_pct,
        delivery:      delivery,
        deliveryCost:  deliveryCost,
    })
    setAdded(true)
    }

  const deliveryOptions = [
    { key: 'pickup',   label: 'Pick-up en tienda',      sub: 'Agenda tu cita',              price: 'Gratis' },
    { key: 'city',     label: 'Delivery Guatemala ciudad', sub: 'Pedidos Ya · Traeló Ya',   price: 'Q 125' },
    { key: 'interior', label: 'Envío interior del país', sub: 'Guatex · Cargo Expreso',     price: 'Q 225' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px', fontSize: '12px', color: '#8A8680' }}>
          <a href="/catalog" style={{ color: '#8A8680', textDecoration: 'none' }}>Catálogo</a>
          <span style={{ color: '#3A3835' }}>/</span>
          <span>{piece.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '24px' }}>

          {/* Imagen */}
          <div>
            <div style={{
              width: '100%', aspectRatio: '1',
              background: 'linear-gradient(135deg, #1A1A1A 0%, #252525 100%)',
              borderRadius: '10px', border: '0.5px solid rgba(201,168,76,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', marginBottom: '10px',
            }}>
              <span style={{ fontSize: '80px', opacity: 0.2 }}>🪸</span>
              {piece.discount_pct > 0 && (
                <div style={{
                  position: 'absolute', top: '12px', left: '12px',
                  fontSize: '11px', padding: '3px 9px', borderRadius: '4px',
                  background: 'rgba(232,116,138,0.18)', color: '#E8748A', fontWeight: 500,
                }}>
                  -{piece.discount_pct}%
                </div>
              )}
            </div>
            {/* Specs */}
            <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                Especificaciones
              </div>
              {[
                { label: 'Especie',        value: piece.species?.name },
                { label: 'Código',         value: piece.code },
                { label: 'Tamaño',         value: piece.size },
                { label: 'Disponibilidad', value: 'En stock', green: true },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)', fontSize: '12px' }}>
                  <span style={{ color: '#8A8680' }}>{r.label}</span>
                  <span style={{ color: r.green ? '#4AAF7A' : '#F0EDE6', fontWeight: 500 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info y compra */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div>
              <div style={{ fontSize: '10px', color: '#3A3835', fontFamily: 'monospace', letterSpacing: '0.04em', marginBottom: '4px' }}>
                {piece.code}
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#F0EDE6', marginBottom: '4px' }}>
                {piece.name}
              </h1>
              <div style={{ fontSize: '13px', color: '#C9A84C', marginBottom: '14px' }}>
                {piece.species?.name}
              </div>

              {discountLabel && (
                <div style={{ fontSize: '11px', color: '#E8748A', marginBottom: '8px' }}>
                  {discountLabel}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                {piece.discount_pct > 0 && (
                  <span style={{ fontSize: '16px', color: '#8A8680', textDecoration: 'line-through' }}>
                    Q {piece.sale_price?.toLocaleString()}
                  </span>
                )}
                <span style={{ fontSize: '28px', fontWeight: 500, color: piece.discount_pct > 0 ? '#E8748A' : '#C9A84C' }}>
                  Q {effectivePrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Puntos */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.18)',
              borderRadius: '20px', padding: '6px 14px', fontSize: '12px', color: '#C9A84C',
              width: 'fit-content',
            }}>
              ✦ Esta compra te da <strong style={{ margin: '0 4px' }}>{Math.round(effectivePrice * 6 / 100)}</strong> puntos
            </div>

            {/* Entrega */}
            <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                Método de entrega
              </div>
              {deliveryOptions.map(opt => (
                <div key={opt.key} onClick={() => setDelivery(opt.key as any)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 10px', borderRadius: '6px', cursor: 'pointer', marginBottom: '6px',
                  background: delivery === opt.key ? 'rgba(201,168,76,0.04)' : 'transparent',
                  border: `0.5px solid ${delivery === opt.key ? 'rgba(201,168,76,0.45)' : 'transparent'}`,
                }}>
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
                    border: `0.5px solid ${delivery === opt.key ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {delivery === opt.key && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#C9A84C' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#F0EDE6' }}>{opt.label}</div>
                    <div style={{ fontSize: '10px', color: '#8A8680', marginTop: '1px' }}>{opt.sub}</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#C9A84C' }}>{opt.price}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ background: 'rgba(201,168,76,0.05)', border: '0.5px solid rgba(201,168,76,0.45)', borderRadius: '7px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#8A8680' }}>Pieza</span>
                <span style={{ color: '#F0EDE6' }}>Q {effectivePrice.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                <span style={{ color: '#8A8680' }}>Envío</span>
                <span style={{ color: '#F0EDE6' }}>{delivery === 'pickup' ? 'Gratis' : `Q ${deliveryCost}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 500, paddingTop: '8px', borderTop: '0.5px solid rgba(201,168,76,0.18)' }}>
                <span style={{ color: '#F0EDE6' }}>Total</span>
                <span style={{ color: '#C9A84C' }}>Q {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Términos */}
            <div onClick={() => setTermsOk(!termsOk)} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)',
              borderRadius: '6px', padding: '10px 12px', cursor: 'pointer',
            }}>
              <div style={{
                width: '15px', height: '15px', borderRadius: '3px', flexShrink: 0, marginTop: '1px',
                border: `0.5px solid ${termsOk ? '#C9A84C' : 'rgba(201,168,76,0.45)'}`,
                background: termsOk ? '#C9A84C' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {termsOk && <span style={{ fontSize: '9px', color: '#0D0D0D', fontWeight: 700 }}>✓</span>}
              </div>
              <div style={{ fontSize: '11px', color: '#8A8680', lineHeight: 1.5 }}>
                He leído y acepto los{' '}
                <a href="/terms" style={{ color: '#C9A84C' }}>términos y condiciones</a>,
                incluyendo que la pieza deja de ser responsabilidad de RoyalReef GT
                una vez entregada al servicio de mensajería o retirada en tienda.
              </div>
            </div>

            {/* Botón */}
            {!added ? (
              <button
                onClick={handleAdd}
                disabled={!termsOk}
                style={{
                  width: '100%', padding: '12px',
                  background: termsOk ? '#C9A84C' : '#252525',
                  color: termsOk ? '#0D0D0D' : '#8A8680',
                  border: 'none', borderRadius: '6px',
                  fontSize: '13px', fontWeight: 500,
                  cursor: termsOk ? 'pointer' : 'not-allowed',
                }}
              >
                Agregar al carrito ↗
              </button>
            ) : (
              <a href="/checkout" style={{
                display: 'block', width: '100%', padding: '12px',
                background: '#C9A84C', color: '#0D0D0D',
                borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                textDecoration: 'none', textAlign: 'center',
              }}>
                Ir al checkout ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}