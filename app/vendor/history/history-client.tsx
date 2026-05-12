'use client'

import { useState } from 'react'

export default function HistoryClient({
  orders, isOwner
}: {
  orders: any[], isOwner: boolean
}) {
  const [search, setSearch]       = useState('')
  const [channel, setChannel]     = useState('all')
  const [selected, setSelected]   = useState<any>(null)

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (o.client as any)?.full_name?.toLowerCase().includes(search.toLowerCase())
    const matchChannel = channel === 'all' || o.sale_channel === channel
    return matchSearch && matchChannel
  })

  const totalSales   = orders.filter(o => o.status !== 'cancelled')
  const totalRevenue = totalSales.reduce((sum, o) => sum + (o.total || 0), 0)
  const online       = totalSales.filter(o => o.sale_channel === 'online').length
  const instore      = totalSales.filter(o => o.sale_channel === 'instore').length

  const channelLabel: Record<string, string> = {
    online:  'Online',
    instore: 'En tienda',
  }
  const statusLabel: Record<string, { label: string, color: string }> = {
    completed:        { label: 'Completada',      color: '#4AAF7A' },
    payment_verified: { label: 'Pago verificado', color: '#C9A84C' },
    cancelled:        { label: 'Cancelada',        color: '#E8748A' },
  }
  const payLabel: Record<string, string> = {
    cash:     'Efectivo',
    card:     'Tarjeta',
    transfer: 'Transferencia',
  }

  const input = {
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <a href="/vendor" style={{ fontSize: '12px', color: '#8A8680', textDecoration: 'none' }}>← Dashboard</a>
          <span style={{ color: '#3A3835' }}>/</span>
          <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#C9A84C' }}>Historial de ventas</h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Total ventas',   value: totalSales.length },
            { label: 'Total facturado', value: `Q ${totalRevenue.toLocaleString()}`, gold: true },
            { label: 'Online',         value: online },
            { label: 'En tienda',      value: instore },
          ].map((s, i) => (
            <div key={i} style={{ background: '#1E1E1E', borderRadius: '6px', padding: '12px 14px' }}>
              <div style={{ fontSize: '10px', color: '#8A8680', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 500, color: s.gold ? '#C9A84C' : '#F0EDE6' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <input
            style={{ ...input, flex: 1, minWidth: '200px' }}
            placeholder="Buscar por orden o cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {['all','online','instore'].map(c => (
            <button key={c} onClick={() => setChannel(c)} style={{
              padding: '7px 14px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer',
              background: channel === c ? 'rgba(201,168,76,0.08)' : '#1E1E1E',
              border: `0.5px solid ${channel === c ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
              color: channel === c ? '#C9A84C' : '#8A8680',
            }}>
              {c === 'all' ? 'Todos' : c === 'online' ? 'Online' : 'En tienda'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? 'minmax(0,1fr) minmax(0,1fr)' : '1fr', gap: '14px' }}>

          {/* Tabla */}
          <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 80px 80px 80px 80px',
              padding: '8px 14px',
              background: '#1E1E1E',
              borderBottom: '0.5px solid rgba(201,168,76,0.18)',
            }}>
              {['Orden','Cliente','Canal','Pago','Total','Estado'].map((h, i) => (
                <span key={i} style={{ fontSize: '10px', color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#3A3835' }}>
                No hay ventas con estos filtros
              </div>
            ) : filtered.map(o => {
              const st = statusLabel[o.status] || { label: o.status, color: '#8A8680' }
              return (
                <div key={o.id} onClick={() => setSelected(selected?.id === o.id ? null : o)} style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr 80px 80px 80px 80px',
                  padding: '9px 14px',
                  borderBottom: '0.5px solid rgba(201,168,76,0.06)',
                  cursor: 'pointer',
                  background: selected?.id === o.id ? 'rgba(201,168,76,0.04)' : 'transparent',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '11px', color: '#C9A84C', fontFamily: 'monospace' }}>{o.order_number}</span>
                  <span style={{ fontSize: '12px', color: '#F0EDE6' }}>
                    {(o.client as any)?.full_name || 'En tienda'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#8A8680' }}>{channelLabel[o.sale_channel]}</span>
                  <span style={{ fontSize: '11px', color: '#8A8680' }}>{payLabel[o.payment_method] || '—'}</span>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#C9A84C' }}>Q {o.total?.toLocaleString()}</span>
                  <span style={{
                    fontSize: '10px', padding: '2px 6px', borderRadius: '3px', fontWeight: 500,
                    background: `${st.color}18`, color: st.color, display: 'inline-block',
                  }}>{st.label}</span>
                </div>
              )
            })}
          </div>

          {/* Detalle */}
          {selected && (
            <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '15px', fontWeight: 500, color: '#C9A84C', fontFamily: 'monospace' }}>
                  {selected.order_number}
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: '#8A8680', cursor: 'pointer', fontSize: '16px' }}>✕</button>
              </div>

              <div style={{ fontSize: '11px', color: '#8A8680', marginBottom: '14px' }}>
                {new Date(selected.created_at).toLocaleString('es-GT')}
              </div>

              {/* Piezas */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '10px', color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Piezas</div>
                {selected.order_pieces?.map((p: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)', fontSize: '12px' }}>
                    <div>
                      <div style={{ color: '#F0EDE6' }}>{p.piece_name}</div>
                      <div style={{ fontSize: '10px', color: '#8A8680', fontFamily: 'monospace' }}>{p.piece_code}</div>
                    </div>
                    <span style={{ color: '#C9A84C', fontWeight: 500 }}>Q {p.unit_price?.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div style={{ background: 'rgba(201,168,76,0.05)', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '5px', padding: '10px 12px', marginBottom: '12px' }}>
                {[
                  { label: 'Subtotal',        value: `Q ${selected.subtotal?.toLocaleString()}` },
                  { label: 'Descuento',       value: selected.discount_amt > 0 ? `-Q ${selected.discount_amt?.toLocaleString()}` : '—' },
                  { label: 'Descuento extra', value: selected.extra_discount_pct > 0 ? `-${selected.extra_discount_pct}%` : '—' },
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

              {/* Info adicional */}
              {[
                { label: 'Canal',    value: channelLabel[selected.sale_channel] },
                { label: 'Pago',     value: payLabel[selected.payment_method] || '—' },
                { label: 'Entrega',  value: selected.delivery_type === 'instore' ? 'En tienda' : selected.delivery_type },
                isOwner ? { label: 'Vendedor', value: (selected.sold_by_profile as any)?.full_name || '—' } : null,
              ].filter(Boolean).map((r: any, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '0.5px solid rgba(201,168,76,0.06)' }}>
                  <span style={{ color: '#8A8680' }}>{r.label}</span>
                  <span style={{ color: '#F0EDE6', fontWeight: 500 }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}