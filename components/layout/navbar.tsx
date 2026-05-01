'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/components/cart-context'

export default function Navbar() {
  const { count, items, removeItem, total } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        borderBottom: '0.5px solid rgba(201,168,76,0.18)',
        backgroundColor: '#0D0D0D',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: '17px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            color: '#C9A84C',
          }}>
            ROYALREEF<span style={{ color: '#8A8680', fontWeight: 400, fontSize: '13px', marginLeft: '5px' }}>GT</span>
          </span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/catalog" style={{ fontSize: '13px', color: '#8A8680', textDecoration: 'none' }}>
            Catálogo
          </Link>
          <Link href="/exclusives" style={{ fontSize: '13px', color: '#8A8680', textDecoration: 'none' }}>
            Exclusivos
          </Link>
          <Link href="/visit" style={{ fontSize: '13px', color: '#8A8680', textDecoration: 'none' }}>
            Visitar tienda
          </Link>

          {/* Puntos */}
          <Link href="/profile" style={{
            fontSize: '12px',
            background: 'rgba(201,168,76,0.1)',
            border: '0.5px solid rgba(201,168,76,0.18)',
            borderRadius: '20px',
            padding: '4px 12px',
            color: '#C9A84C',
            textDecoration: 'none',
          }}>
            Mis puntos ✦
          </Link>

          {/* Carrito */}
          <button
            onClick={() => setCartOpen(!cartOpen)}
            style={{
              position: 'relative',
              background: 'transparent',
              border: '0.5px solid rgba(201,168,76,0.18)',
              borderRadius: '6px',
              padding: '6px 12px',
              color: '#C9A84C',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1h2l1.5 7h6l1.5-5H4" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="12" r="1" fill="#C9A84C"/>
              <circle cx="10" cy="12" r="1" fill="#C9A84C"/>
            </svg>
            Carrito
            {count > 0 && (
              <span style={{
                background: '#E8748A',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 500,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {count}
              </span>
            )}
          </button>

          <Link href="/login" style={{ fontSize: '13px', color: '#C9A84C', textDecoration: 'none' }}>
            Ingresar
          </Link>
        </div>
      </nav>

      {/* Panel del carrito */}
      {cartOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '360px',
          height: '100vh',
          backgroundColor: '#161616',
          borderLeft: '0.5px solid rgba(201,168,76,0.18)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#F0EDE6' }}>
              Carrito ({count})
            </span>
            <button onClick={() => setCartOpen(false)} style={{
              background: 'transparent', border: 'none', color: '#8A8680', cursor: 'pointer', fontSize: '18px'
            }}>✕</button>
          </div>

          {items.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#3A3835', marginTop: '60px', fontSize: '13px' }}>
              Tu carrito está vacío
            </div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {items.map(item => (
                  <div key={item.id} style={{
                    background: '#1E1E1E',
                    border: '0.5px solid rgba(201,168,76,0.18)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#F0EDE6', marginBottom: '2px' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#8A8680' }}>
                        {item.code} · {item.size}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#C9A84C', marginTop: '4px' }}>
                        Q {item.price.toLocaleString()}
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} style={{
                      background: 'transparent', border: 'none', color: '#8A8680', cursor: 'pointer', fontSize: '14px'
                    }}>✕</button>
                  </div>
                ))}
              </div>

              <div style={{
                borderTop: '0.5px solid rgba(201,168,76,0.18)',
                paddingTop: '16px',
                marginTop: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', color: '#8A8680' }}>Total</span>
                  <span style={{ fontSize: '16px', fontWeight: 500, color: '#C9A84C' }}>
                    Q {total.toLocaleString()}
                  </span>
                </div>
                <Link href="/checkout" style={{
                  display: 'block',
                  width: '100%',
                  padding: '11px',
                  background: '#C9A84C',
                  color: '#0D0D0D',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none',
                }} onClick={() => setCartOpen(false)}>
                  Proceder al pago ↗
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* Overlay */}
      {cartOpen && (
        <div onClick={() => setCartOpen(false)} style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99
        }} />
      )}
    </>
  )
}