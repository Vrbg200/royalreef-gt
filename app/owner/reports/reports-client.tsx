'use client'

import { useState } from 'react'

export default function ReportsClient({
  orders, pieces, vendors
}: {
  orders: any[], pieces: any[], vendors: any[]
}) {
  const [tab, setTab] = useState<'sales'|'inventory'|'stagnant'>('sales')

  // Métricas generales
  const totalRevenue   = orders.reduce((s, o) => s + (o.total || 0), 0)
  const totalOrders    = orders.length
  const onlineOrders   = orders.filter(o => o.sale_channel === 'online').length
  const instoreOrders  = orders.filter(o => o.sale_channel === 'instore').length

  // Piezas por especie
  const speciesCount: Record<string, { sold: number, active: number, revenue: number }> = {}
  pieces.forEach(p => {
    const name = (p.species as any)?.name || 'Sin especie'
    if (!speciesCount[name]) speciesCount[name] = { sold: 0, active: 0, revenue: 0 }
    if (p.status === 'sold') speciesCount[name].sold++
    if (p.status === 'active') speciesCount[name].active++
  })

  orders.forEach(o => {
    ;(o.order_pieces as any[])?.forEach((op: any) => {
      speciesCount
    })
  })

  const speciesList = Object.entries(speciesCount)
    .sort((a, b) => b[1].sold - a[1].sold)

  // Inventario estancado — más de 60 días sin venderse
  const stagnant = pieces.filter(p => {
    if (p.status !== 'active') return false
    const days = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000)
    return days > 60
  }).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  // Ventas por mes (últimos 6 meses)
  const monthlySales: Record<string, number> = {}
  orders.forEach(o => {
    const month = new Date(o.created_at).toLocaleDateString('es-GT', { month: 'short', year: '2-digit' })
    monthlySales[month] = (monthlySales[month] || 0) + (o.total || 0)
  })
  const monthlyEntries = Object.entries(monthlySales).slice(-6)
  const maxMonthly = Math.max(...monthlyEntries.map(e => e[1]), 1)

  const tierColor = (t: string) =>
    t === 'low' ? '#4AAF7A' : t === 'mid' ? '#C9A84C' : '#E8748A'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <a href="/owner" style={{ fontSize: '12px', color: '#8A8680', textDecoration: 'none' }}>← Dashboard</a>
          <span style={{ color: '#3A3835' }}>/</span>
          <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#C9A84C' }}>Reportes y métricas</h1>
        </div>

        {/* Stats generales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Total facturado',  value: `Q ${totalRevenue.toLocaleString()}`, color: '#C9A84C' },
            { label: 'Total órdenes',    value: totalOrders,    color: '#F0EDE6' },
            { label: 'Ventas online',    value: onlineOrders,   color: '#F0EDE6' },
            { label: 'Ventas en tienda', value: instoreOrders,  color: '#F0EDE6' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#1E1E1E', borderRadius: '6px', padding: '12px 14px' }}>
              <div style={{ fontSize: '10px', color: '#8A8680', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 500, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[
            { key: 'sales',     label: 'Ventas por mes' },
            { key: 'inventory', label: 'Especies más vendidas' },
            { key: 'stagnant',  label: `Inventario estancado (${stagnant.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)} style={{
              padding: '7px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
              background: tab === t.key ? 'rgba(201,168,76,0.08)' : '#1E1E1E',
              border: `0.5px solid ${tab === t.key ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
              color: tab === t.key ? '#C9A84C' : '#8A8680',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Ventas por mes */}
        {tab === 'sales' && (
          <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '16px' }}>
              Facturación mensual
            </div>
            {monthlyEntries.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#3A3835', textAlign: 'center', padding: '32px' }}>Sin datos de ventas</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px', marginBottom: '8px' }}>
                {monthlyEntries.map(([month, amount]) => (
                  <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '10px', color: '#C9A84C', fontWeight: 500 }}>
                      Q {amount >= 1000 ? (amount/1000).toFixed(1)+'k' : amount}
                    </div>
                    <div style={{
                      width: '100%', borderRadius: '3px 3px 0 0',
                      background: 'rgba(201,168,76,0.6)',
                      height: `${Math.max(8, Math.round(amount / maxMonthly * 120))}px`,
                    }} />
                    <div style={{ fontSize: '10px', color: '#8A8680' }}>{month}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Especies más vendidas */}
        {tab === 'inventory' && (
          <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
              Demanda por especie
            </div>
            {speciesList.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#3A3835', textAlign: 'center', padding: '32px' }}>Sin datos</div>
            ) : speciesList.map(([name, data]) => {
              const maxSold = Math.max(...speciesList.map(s => s[1].sold), 1)
              return (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)', fontSize: '12px' }}>
                  <div style={{ minWidth: '100px', color: '#F0EDE6', fontWeight: 500 }}>{name}</div>
                  <div style={{ flex: 1, height: '5px', background: '#252525', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#C9A84C', borderRadius: '2px', width: `${Math.round(data.sold / maxSold * 100)}%` }} />
                  </div>
                  <div style={{ minWidth: '80px', textAlign: 'right', color: '#8A8680' }}>
                    <span style={{ color: '#4AAF7A', fontWeight: 500 }}>{data.sold}</span> vendidas · <span style={{ color: '#C9A84C' }}>{data.active}</span> activas
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Inventario estancado */}
        {tab === 'stagnant' && (
          <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', overflow: 'hidden' }}>
            {stagnant.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#3A3835', textAlign: 'center', padding: '40px' }}>
                No hay piezas estancadas — todo el inventario tiene menos de 60 días
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 80px 60px 80px 80px 70px', padding: '8px 16px', background: '#1E1E1E', borderBottom: '0.5px solid rgba(201,168,76,0.18)' }}>
                  {['Código','Nombre','Especie','Tier','Precio','Descuento','Días'].map((h, i) => (
                    <span key={i} style={{ fontSize: '10px', color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
                  ))}
                </div>
                {stagnant.map(p => {
                  const days = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000)
                  return (
                    <a key={p.id} href={`/owner/pieces/${p.id}`} style={{
                      display: 'grid',
                      gridTemplateColumns: '110px 1fr 80px 60px 80px 80px 70px',
                      padding: '9px 16px',
                      borderBottom: '0.5px solid rgba(201,168,76,0.06)',
                      textDecoration: 'none', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '10px', color: '#8A8680', fontFamily: 'monospace' }}>{p.code}</span>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#F0EDE6' }}>{p.name}</span>
                      <span style={{ fontSize: '11px', color: '#8A8680' }}>{(p.species as any)?.name}</span>
                      <span style={{
                        fontSize: '10px', padding: '2px 6px', borderRadius: '3px',
                        background: `${tierColor(p.tier)}18`, color: tierColor(p.tier), display: 'inline-block',
                      }}>{p.tier}</span>
                      <span style={{ fontSize: '12px', color: '#C9A84C', fontWeight: 500 }}>Q {p.sale_price?.toLocaleString()}</span>
                      <span style={{ fontSize: '11px', color: p.discount_pct > 0 ? '#E8748A' : '#3A3835' }}>
                        {p.discount_pct > 0 ? `-${p.discount_pct}%` : '—'}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: days > 90 ? '#E8748A' : '#C9A84C' }}>
                        {days}d
                      </span>
                    </a>
                  )
                })}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}