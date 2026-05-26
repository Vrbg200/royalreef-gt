'use client'

import { useState } from 'react'

const TC = 7.75
const SPECIES = [
  'Zoanthid', 'Palythoa', 'LPS', 'Blastomussa',
  'Fungia', 'SPS', 'Acropora', 'NPS'
]

export default function CalculatorPage() {
  const [costUSD, setCostUSD]   = useState(0)
  const [margin, setMargin]     = useState(80)
  const [species, setSpecies]   = useState('')
  const [size, setSize]         = useState('M')

  const costGTQ    = costUSD * TC
  const importCost = costGTQ * 1.45
  const salePrice  = Math.round(importCost * (1 + margin / 100))
  const advance    = Math.round(salePrice * 0.5)
  const balance    = salePrice - advance
  const marginOk   = margin >= 60 && margin <= 100

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', padding: '24px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <a href="/owner" style={{ fontSize: '12px', color: '#8A8680', textDecoration: 'none' }}>← Dashboard</a>
          <span style={{ color: '#3A3835' }}>/</span>
          <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#C9A84C' }}>Calculadora bajo pedido</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
                Datos de la pieza
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '5px' }}>Especie</label>
                <select
                  value={species} onChange={e => setSpecies(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#1E1E1E', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '5px', padding: '8px 10px', color: '#F0EDE6', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">Seleccionar...</option>
                  {SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '5px' }}>Tamaño</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['XS','M','XL'].map(s => (
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
                <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '5px' }}>
                  Costo de compra (USD)
                </label>
                <input
                  type="number" min="0" step="0.5" value={costUSD || ''}
                  onChange={e => setCostUSD(+e.target.value)}
                  style={{ width: '100%', backgroundColor: '#1E1E1E', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '5px', padding: '8px 10px', color: '#F0EDE6', fontSize: '13px', outline: 'none' }}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '5px' }}>
                  Margen % (mín 60% — máx 100%)
                </label>
                <input
                  type="range" min={60} max={100} step={1} value={margin}
                  onChange={e => setMargin(+e.target.value)}
                  style={{ width: '100%', accentColor: '#C9A84C' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#8A8680', marginTop: '3px' }}>
                  <span>60%</span>
                  <span style={{ color: '#C9A84C', fontWeight: 500 }}>{margin}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Info TC */}
            <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '14px 16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <span style={{ color: '#8A8680' }}>Tipo de cambio</span>
                <span style={{ color: '#F0EDE6', fontWeight: 500 }}>Q {TC}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <span style={{ color: '#8A8680' }}>Gastos de importación</span>
                <span style={{ color: '#F0EDE6', fontWeight: 500 }}>45%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <span style={{ color: '#8A8680' }}>Anticipo requerido</span>
                <span style={{ color: '#F0EDE6', fontWeight: 500 }}>50%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <span style={{ color: '#8A8680' }}>Margen recomendado</span>
                <span style={{ color: '#C9A84C', fontWeight: 500 }}>80%</span>
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'rgba(201,168,76,0.05)', border: '0.5px solid rgba(201,168,76,0.45)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
                Desglose de precio
              </div>

              {[
                { label: 'Costo USD',          value: `USD ${costUSD.toFixed(2)}` },
                { label: `× TC (${TC})`,        value: `Q ${costGTQ.toFixed(2)}` },
                { label: '+ Importación (45%)', value: `Q ${(costGTQ * 0.45).toFixed(2)}` },
                { label: '= Costo real total',  value: `Q ${importCost.toFixed(2)}` },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)' }}>
                  <span style={{ color: '#8A8680' }}>{r.label}</span>
                  <span style={{ color: '#F0EDE6', fontWeight: 500 }}>{r.value}</span>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 500, padding: '12px 0 4px', marginTop: '6px' }}>
                <span style={{ color: '#F0EDE6' }}>Precio de venta</span>
                <span style={{ color: '#C9A84C' }}>Q {salePrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Anticipo y saldo */}
            <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                Estructura de pago
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <div style={{ flex: 1, background: '#1E1E1E', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#8A8680', marginBottom: '4px' }}>Anticipo 50%</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: '#C9A84C' }}>Q {advance.toLocaleString()}</div>
                  <div style={{ fontSize: '10px', color: '#3A3835', marginTop: '2px' }}>Al confirmar orden</div>
                </div>
                <div style={{ flex: 1, background: '#1E1E1E', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#8A8680', marginBottom: '4px' }}>Saldo 50%</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: '#F0EDE6' }}>Q {balance.toLocaleString()}</div>
                  <div style={{ fontSize: '10px', color: '#3A3835', marginTop: '2px' }}>Al entregar la pieza</div>
                </div>
              </div>

              {/* Ganancia estimada */}
              <div style={{ background: 'rgba(74,175,122,0.08)', border: '0.5px solid rgba(74,175,122,0.25)', borderRadius: '5px', padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                  <span style={{ color: '#8A8680' }}>Ganancia estimada</span>
                  <span style={{ color: '#4AAF7A', fontWeight: 500 }}>Q {(salePrice - importCost).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#8A8680' }}>Sobre costo real</span>
                  <span style={{ color: '#4AAF7A' }}>{margin}%</span>
                </div>
              </div>
            </div>

            {/* Resumen */}
            {species && costUSD > 0 && (
              <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '14px 16px', fontSize: '11px', color: '#8A8680', lineHeight: 1.8 }}>
                <span style={{ color: '#F0EDE6', fontWeight: 500 }}>{species} · {size}</span>
                <br />
                Costo USD {costUSD} → venta Q {salePrice.toLocaleString()}
                <br />
                Anticipo: <span style={{ color: '#C9A84C' }}>Q {advance.toLocaleString()}</span> · Saldo: Q {balance.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}