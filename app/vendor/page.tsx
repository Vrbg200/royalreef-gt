import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function VendorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!['owner', 'vendor'].includes(profile?.role || '')) redirect('/')

  // Órdenes pendientes de pago
  const { data: pending } = await adminClient
    .from('orders')
    .select('id, order_number, total, delivery_type, created_at')
    .eq('status', 'pending')
    .eq('sale_channel', 'online')
    .order('created_at', { ascending: true })

  // Ventas de hoy
  const today = new Date().toISOString().split('T')[0]
  const { data: todaySales } = await adminClient
    .from('orders')
    .select('id, total')
    .eq('status', 'completed')
    .gte('created_at', today)

  const todayTotal = todaySales?.reduce((sum, o) => sum + (o.total || 0), 0) || 0

  // Citas pendientes de aprobar
  const { count: pendingVisits } = await adminClient
    .from('store_visits')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '28px', paddingBottom: '16px',
          borderBottom: '0.5px solid rgba(201,168,76,0.18)',
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#C9A84C', letterSpacing: '0.06em' }}>
              ROYALREEF GT
            </h1>
            <p style={{ fontSize: '12px', color: '#8A8680', marginTop: '2px' }}>
              Panel del vendedor — {profile?.full_name}
            </p>
          </div>
          <span style={{
            fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
            background: 'rgba(201,168,76,0.08)', border: '0.5px solid rgba(201,168,76,0.45)',
            color: '#C9A84C',
          }}>
            Vendedor
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '24px' }}>
          {[
            { label: 'Órdenes pendientes', value: pending?.length || 0, color: (pending?.length || 0) > 0 ? '#E8748A' : '#F0EDE6' },
            { label: 'Ventas hoy', value: `Q ${todayTotal.toLocaleString()}`, color: '#C9A84C' },
            { label: 'Citas por aprobar', value: pendingVisits || 0, color: (pendingVisits || 0) > 0 ? '#C9A84C' : '#F0EDE6' },
            { label: 'Rol', value: profile?.role === 'owner' ? 'Owner' : 'Vendedor', color: '#8A8680' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#1E1E1E', borderRadius: '6px', padding: '12px 14px' }}>
              <div style={{ fontSize: '10px', color: '#8A8680', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 500, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Órdenes pendientes preview */}
        {(pending?.length || 0) > 0 && (
          <div style={{ background: '#161616', border: '0.5px solid rgba(232,116,138,0.25)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#E8748A' }}>
                {pending?.length} orden{(pending?.length || 0) > 1 ? 'es' : ''} esperando verificación de pago
              </span>
              <a href="/vendor/orders" style={{ fontSize: '12px', color: '#C9A84C', textDecoration: 'none' }}>Ver todas ↗</a>
            </div>
            {pending?.slice(0, 3).map(o => (
              <div key={o.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)', fontSize: '12px',
              }}>
                <span style={{ color: '#C9A84C', fontFamily: 'monospace' }}>{o.order_number}</span>
                <span style={{ color: '#8A8680' }}>{o.delivery_type}</span>
                <span style={{ color: '#F0EDE6', fontWeight: 500 }}>Q {o.total?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Accesos rápidos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '10px' }}>
          {[
            { label: 'Órdenes pendientes', href: '/vendor/orders', desc: 'Verificar pagos', alert: pending?.length || 0 },
            { label: 'Venta en tienda',    href: '/vendor/sale',   desc: 'Registrar venta física' },
            { label: 'Historial',          href: '/vendor/history', desc: 'Ventas y estadísticas' },
            { label: 'Citas',              href: '/vendor/visits',  desc: 'Aprobar y gestionar', alert: pendingVisits || 0 },
          ].map((a, i) => (
            <a key={i} href={a.href} style={{
              background: '#161616',
              border: '0.5px solid rgba(201,168,76,0.18)',
              borderRadius: '7px', padding: '14px 16px',
              textDecoration: 'none', display: 'block', position: 'relative',
            }}>
              {(a.alert || 0) > 0 && (
                <span style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: '#E8748A', color: '#fff',
                  fontSize: '10px', fontWeight: 500,
                  width: '18px', height: '18px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {a.alert}
                </span>
              )}
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#C9A84C', marginBottom: '3px' }}>
                {a.label}
              </div>
              <div style={{ fontSize: '11px', color: '#8A8680' }}>{a.desc}</div>
            </a>
          ))}
        </div>

      </div>
    </div>
  )
}