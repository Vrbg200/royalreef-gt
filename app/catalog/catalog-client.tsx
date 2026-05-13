'use client'

import { useState } from 'react'
import { useCart } from '@/components/cart-context'
import Navbar from '@/components/layout/navbar'

export default function CatalogClient({
  pieces, species
}: {
  pieces: any[], species: any[]
}) {
  const { addItem } = useCart()

  const [selectedSpecies, setSelectedSpecies] = useState('all')
  const [selectedSize, setSelectedSize]       = useState('all')
  const [onlyDiscount, setOnlyDiscount]       = useState(false)
  const [search, setSearch]                   = useState('')

  const filtered = pieces.filter(p => {
    const matchSpecies  = selectedSpecies === 'all' || (p.species as any)?.code_prefix === selectedSpecies
    const matchSize     = selectedSize === 'all' || p.size === selectedSize
    const matchDiscount = !onlyDiscount || p.discount_pct > 0
    const matchSearch   = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
    return matchSpecies && matchSize && matchDiscount && matchSearch
  })

  function effectivePrice(p: any) {
    if (p.discount_pct > 0) return Math.round(p.sale_price * (1 - p.discount_pct / 100))
    return p.sale_price
  }

  function discountLabel(p: any) {
    if (p.discount_type === 'campaign') return 'Descuento especial'
    if (p.discount_type === 'auto')     return 'Oferta especial'
    return ''
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>

        <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#C9A84C', marginBottom: '4px' }}>
          Catálogo
        </h1>
        <p style={{ fontSize: '13px', color: '#8A8680', marginBottom: '24px' }}>
          {filtered.length} pieza{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Filtros */}
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Búsqueda */}
          <input
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', maxWidth: '400px',
              backgroundColor: '#1E1E1E',
              border: '0.5px solid rgba(201,168,76,0.18)',
              borderRadius: '5px', padding: '8px 12px',
              color: '#F0EDE6', fontSize: '13px', outline: 'none',
            }}
          />

          {/* Especies */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setSelectedSpecies('all')} style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
              background: selectedSpecies === 'all' ? 'rgba(201,168,76,0.08)' : '#1E1E1E',
              border: `0.5px solid ${selectedSpecies === 'all' ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
              color: selectedSpecies === 'all' ? '#C9A84C' : '#8A8680',
            }}>
              Todos
            </button>
            {species.map(s => (
              <button key={s.id} onClick={() => setSelectedSpecies(s.code_prefix)} style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                background: selectedSpecies === s.code_prefix ? 'rgba(201,168,76,0.08)' : '#1E1E1E',
                border: `0.5px solid ${selectedSpecies === s.code_prefix ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
                color: selectedSpecies === s.code_prefix ? '#C9A84C' : '#8A8680',
              }}>
                {s.name}
              </button>
            ))}
          </div>

          {/* Talla y descuento */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {['all','XS','M','XL'].map(s => (
              <button key={s} onClick={() => setSelectedSize(s)} style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer',
                background: selectedSize === s ? 'rgba(201,168,76,0.08)' : '#1E1E1E',
                border: `0.5px solid ${selectedSize === s ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
                color: selectedSize === s ? '#C9A84C' : '#8A8680',
              }}>
                {s === 'all' ? 'Todas las tallas' : s}
              </button>
            ))}
            <button onClick={() => setOnlyDiscount(!onlyDiscount)} style={{
              padding: '5px 12px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer',
              background: onlyDiscount ? 'rgba(232,116,138,0.08)' : '#1E1E1E',
              border: `0.5px solid ${onlyDiscount ? 'rgba(232,116,138,0.45)' : 'rgba(201,168,76,0.18)'}`,
              color: onlyDiscount ? '#E8748A' : '#8A8680',
            }}>
              Solo con descuento
            </button>
          </div>
        </div>

        {/* Grid de piezas */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', fontSize: '13px', color: '#3A3835' }}>
            No hay piezas con estos filtros
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '14px',
          }}>
            {filtered.map(p => {
              const effPrice = effectivePrice(p)
              const hasDisc  = p.discount_pct > 0
              const discLbl  = discountLabel(p)
              const isSpec   = p.is_special_order

              return (
                <div key={p.id} style={{
                  background: '#161616',
                  border: '0.5px solid rgba(201,168,76,0.18)',
                  borderRadius: '8px', overflow: 'hidden',
                }}>
                  {/* Imagen placeholder */}
                  <a href={`/catalog/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{
                      width: '100%', aspectRatio: '1',
                      background: 'linear-gradient(135deg, #1A1A1A 0%, #252525 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}>
                      <span style={{ fontSize: '32px', opacity: 0.3 }}>🪸</span>
                      {hasDisc && (
                        <div style={{
                          position: 'absolute', top: '8px', left: '8px',
                          fontSize: '10px', padding: '2px 7px', borderRadius: '3px',
                          background: 'rgba(232,116,138,0.18)', color: '#E8748A', fontWeight: 500,
                        }}>
                          -{p.discount_pct}%
                        </div>
                      )}
                      {isSpec && (
                        <div style={{
                          position: 'absolute', top: '8px', left: '8px',
                          fontSize: '10px', padding: '2px 7px', borderRadius: '3px',
                          background: 'rgba(201,168,76,0.15)', color: '#C9A84C', fontWeight: 500,
                        }}>
                          Exclusivo
                        </div>
                      )}
                    </div>
                  </a>

                  <div style={{ padding: '11px 13px' }}>
                    <div style={{ fontSize: '10px', color: '#3A3835', fontFamily: 'monospace', marginBottom: '3px' }}>
                      {p.code}
                    </div>
                    <a href={`/catalog/${p.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#F0EDE6', marginBottom: '2px' }}>
                        {p.name}
                      </div>
                    </a>
                    <div style={{ fontSize: '11px', color: '#8A8680', marginBottom: '8px' }}>
                      {(p.species as any)?.name} · {p.size}
                    </div>

                    {hasDisc && discLbl && (
                      <div style={{ fontSize: '10px', color: '#E8748A', marginBottom: '4px' }}>
                        {discLbl}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        {hasDisc && (
                          <div style={{ fontSize: '10px', color: '#8A8680', textDecoration: 'line-through' }}>
                            Q {p.sale_price?.toLocaleString()}
                          </div>
                        )}
                        <div style={{ fontSize: '14px', fontWeight: 500, color: hasDisc ? '#E8748A' : '#C9A84C' }}>
                          {isSpec ? 'Consultar' : `Q ${effPrice.toLocaleString()}`}
                        </div>
                      </div>

                      {!isSpec && (
                        <button
                          onClick={() => addItem({
                            id:           p.id,
                            code:         p.code,
                            name:         p.name,
                            species:      (p.species as any)?.name || '',
                            size:         p.size,
                            price:        effPrice,
                            originalPrice: p.sale_price,
                            discountPct:  p.discount_pct,
                          })}
                          style={{
                            padding: '5px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer',
                            background: 'transparent', color: '#C9A84C',
                            border: '0.5px solid rgba(201,168,76,0.45)',
                          }}
                        >
                          + Agregar
                        </button>
                      )}

                      {isSpec && (
                        <a href="/exclusives" style={{
                          padding: '5px 10px', borderRadius: '4px', fontSize: '11px',
                          background: 'transparent', color: '#C9A84C',
                          border: '0.5px solid rgba(201,168,76,0.45)',
                          textDecoration: 'none',
                        }}>
                          Pedir ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}