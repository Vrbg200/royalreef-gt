'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/navbar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfileClient({
  profile, orders, pointsBalance, pointsHistory, nextExpiry
}: {
  profile: any
  orders: any[]
  pointsBalance: number
  pointsHistory: any[]
  nextExpiry: string | null
}) {
  const supabase = createClient()
  const router   = useRouter()

  const [tab, setTab]           = useState<'orders'|'points'|'data'>('orders')
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [phone, setPhone]       = useState(profile.phone || '')
  const [address, setAddress]   = useState(profile.address || '')
  const [addressRefs, setAddressRefs] = useState(profile.address_refs || '')
  const [department, setDepartment]  = useState(profile.department || '')
  const [isOutside, setIsOutside]    = useState(!!profile.department)
  const [saving, setSaving]          = useState(false)
  const [saveMsg, setSaveMsg]        = useState('')

  const statusLabel: Record<string, { label: string, color: string }> = {
    pending:          { label: 'Pendiente de pago', color: '#C9A84C' },
    payment_verified: { label: 'Pago verificado',   color: '#4AAF7A' },
    completed:        { label: 'Completada',         color: '#4AAF7A' },
    cancelled:        { label: 'Cancelada',           color: '#E8748A' },
  }

  const deliveryLabel: Record<string, string> = {
    pickup:   'Pick-up en tienda',
    city:     'Delivery ciudad',
    interior: 'Envío interior',
    instore:  'En tienda',
  }

  // Próximo escalón de puntos
  const nextStep    = Math.ceil(pointsBalance / 500) * 500 || 500
  const progressPct = Math.min(100, Math.round((pointsBalance % 500) / 500 * 100))

  async function handleSave() {
    setSaving(true)
    setSaveMsg('')
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name:    fullName,
        phone,
        address:      address || null,
        address_refs: addressRefs || null,
        department:   isOutside ? department : null,
      })
      .eq('id', profile.id)

    setSaveMsg(error ? 'Error al guardar' : 'Datos actualizados correctamente')
    setSaving(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
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

  const label = {
    display: 'block' as const,
    fontSize: '11px',
    color: '#8A8680',
    marginBottom: '5px',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#F0EDE6' }}>{profile.full_name}</h1>
            <p style={{ fontSize: '12px', color: '#8A8680', marginTop: '2px' }}>Mi cuenta</p>
          </div>
          <button onClick={handleLogout} style={{
            fontSize: '12px', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer',
            background: 'transparent', color: '#8A8680',
            border: '0.5px solid rgba(201,168,76,0.18)',
          }}>
            Cerrar sesión
          </button>
        </div>

        {/* Puntos banner */}
        <div style={{
          background: 'rgba(201,168,76,0.05)', border: '0.5px solid rgba(201,168,76,0.45)',
          borderRadius: '8px', padding: '14px 18px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(201,168,76,0.1)', border: '0.5px solid rgba(201,168,76,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
            }}>✦</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 500, color: '#C9A84C' }}>{pointsBalance} puntos</div>
              <div style={{ fontSize: '11px', color: '#8A8680', marginTop: '1px' }}>
                {nextExpiry ? `Vencen el ${new Date(nextExpiry).toLocaleDateString('es-GT')}` : 'Sin vencimiento próximo'}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={{ height: '4px', background: '#252525', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
              <div style={{ height: '100%', background: '#C9A84C', borderRadius: '2px', width: `${progressPct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#8A8680' }}>
              <span>{pointsBalance % 500} / 500 pts</span>
              <span>Próximo canje 5%</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[
            { key: 'orders', label: 'Mis órdenes' },
            { key: 'points', label: 'Mis puntos' },
            { key: 'data',   label: 'Mis datos' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)} style={{
              padding: '7px 16px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
              background: tab === t.key ? 'rgba(201,168,76,0.08)' : '#1E1E1E',
              border: `0.5px solid ${tab === t.key ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.18)'}`,
              color: tab === t.key ? '#C9A84C' : '#8A8680',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Órdenes */}
        {tab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '40px', textAlign: 'center', fontSize: '13px', color: '#3A3835' }}>
                Aún no tienes órdenes
              </div>
            ) : orders.map(o => {
              const st = statusLabel[o.status] || { label: o.status, color: '#8A8680' }
              const isPending = o.status === 'pending'
              return (
                <div key={o.id} style={{
                  background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)',
                  borderRadius: '8px', padding: '14px 16px', marginBottom: '10px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#C9A84C', fontFamily: 'monospace' }}>
                      {o.order_number}
                    </span>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '3px', background: `${st.color}18`, color: st.color, fontWeight: 500 }}>
                      {st.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#8A8680', marginBottom: '6px' }}>
                    {new Date(o.created_at).toLocaleDateString('es-GT')} · {deliveryLabel[o.delivery_type]}
                  </div>
                  {(o.order_pieces as any[])?.map((p: any, i: number) => (
                    <div key={i} style={{ fontSize: '12px', color: '#F0EDE6', marginBottom: '2px' }}>
                      {p.piece_name} <span style={{ color: '#8A8680', fontFamily: 'monospace', fontSize: '10px' }}>{p.piece_code}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#C9A84C' }}>Q {o.total?.toLocaleString()}</span>
                    {isPending && (
                      <a href={`/order/${o.id}`} style={{
                        fontSize: '11px', padding: '4px 12px', borderRadius: '4px',
                        background: 'rgba(201,168,76,0.1)', color: '#C9A84C',
                        border: '0.5px solid rgba(201,168,76,0.3)', textDecoration: 'none',
                      }}>
                        Ver datos de pago ↗
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Puntos */}
        {tab === 'points' && (
          <div>
            <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '14px 16px', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                Escalones de canje
              </div>
              {[
                { pts: 500,  disc: '5%',  type: 'catálogo' },
                { pts: 1000, disc: '10%', type: 'catálogo' },
                { pts: 1500, disc: '15%', type: 'catálogo' },
                { pts: 2000, disc: '20%', type: 'catálogo' },
                { pts: 2500, disc: '25%', type: 'catálogo' },
                { pts: 750,  disc: '5%',  type: 'exclusivo' },
                { pts: 1500, disc: '10%', type: 'exclusivo' },
                { pts: 3000, disc: '20%', type: 'exclusivo' },
              ].filter(e => e.pts <= pointsBalance + 500).map((e, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)', fontSize: '12px' }}>
                  <span style={{ color: pointsBalance >= e.pts ? '#4AAF7A' : '#8A8680' }}>
                    {pointsBalance >= e.pts ? '✓ ' : ''}{e.pts} pts → {e.disc} en {e.type}
                  </span>
                  {pointsBalance >= e.pts && (
                    <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '3px', background: 'rgba(74,175,122,0.1)', color: '#4AAF7A' }}>Disponible</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                Historial de puntos
              </div>
              {pointsHistory.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#3A3835' }}>Sin movimientos de puntos</div>
              ) : pointsHistory.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)', fontSize: '12px' }}>
                  <div>
                    <div style={{ color: '#F0EDE6' }}>{p.description || p.type}</div>
                    <div style={{ fontSize: '10px', color: '#8A8680', marginTop: '1px' }}>{new Date(p.created_at).toLocaleDateString('es-GT')}</div>
                  </div>
                  <span style={{ fontWeight: 500, color: p.amount > 0 ? '#4AAF7A' : '#E8748A' }}>
                    {p.amount > 0 ? '+' : ''}{p.amount} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Datos */}
        {tab === 'data' && (
          <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={label}>Nombre completo</label>
                <input style={input} value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div>
                <label style={label}>Teléfono</label>
                <input style={input} value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={label}>Dirección de entrega</label>
              <input style={input} value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, zona, colonia..." />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={label}>Referencias</label>
              <input style={input} value={addressRefs} onChange={e => setAddressRefs(e.target.value)} placeholder="Portón azul, frente al parque..." />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={isOutside} onChange={e => setIsOutside(e.target.checked)} style={{ accentColor: '#C9A84C' }} />
                Estoy fuera de Guatemala ciudad
              </label>
            </div>

            {isOutside && (
              <div style={{ marginBottom: '16px' }}>
                <label style={label}>Departamento</label>
                <select style={{ ...input, cursor: 'pointer' }} value={department} onChange={e => setDepartment(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {['Alta Verapaz','Baja Verapaz','Chimaltenango','Chiquimula','El Progreso','Escuintla',
                    'Huehuetenango','Izabal','Jalapa','Jutiapa','Petén','Quetzaltenango','Quiché',
                    'Retalhuleu','Sacatepéquez','San Marcos','Santa Rosa','Sololá','Suchitepéquez',
                    'Totonicapán','Zacapa'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            {saveMsg && (
              <div style={{ fontSize: '12px', color: saveMsg.includes('Error') ? '#E8748A' : '#4AAF7A', marginBottom: '10px' }}>
                {saveMsg}
              </div>
            )}

            <button onClick={handleSave} disabled={saving} style={{
              width: '100%', padding: '10px',
              background: '#C9A84C', color: '#0D0D0D',
              border: 'none', borderRadius: '5px',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            }}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}