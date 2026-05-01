import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OwnerDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'owner') redirect('/')

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0D0D0D',
      color: '#F0EDE6',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          paddingBottom: '16px',
          borderBottom: '0.5px solid rgba(201,168,76,0.18)',
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#C9A84C', letterSpacing: '0.06em' }}>
              ROYALREEF GT
            </h1>
            <p style={{ fontSize: '12px', color: '#8A8680', marginTop: '2px' }}>
              Panel del owner — {profile?.full_name}
            </p>
          </div>
          <span style={{
            fontSize: '11px',
            padding: '3px 10px',
            borderRadius: '20px',
            background: 'rgba(201,168,76,0.1)',
            border: '0.5px solid rgba(201,168,76,0.45)',
            color: '#C9A84C',
          }}>
            Administrador
          </span>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '10px',
          marginBottom: '24px',
        }}>
          {[
            { label: 'Piezas activas', value: '0', sub: 'en catálogo' },
            { label: 'Ventas este mes', value: 'Q 0', sub: 'abril 2025' },
            { label: 'Margen promedio', value: '—', sub: 'sobre costo' },
            { label: 'Alertas activas', value: '0', sub: 'sin alertas' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: '#1E1E1E',
              borderRadius: '6px',
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: '10px', color: '#8A8680', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 500, color: '#F0EDE6' }}>{stat.value}</div>
              <div style={{ fontSize: '10px', color: '#3A3835', marginTop: '2px' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
        }}>
          {[
            { label: 'Ingresar pieza', href: '/owner/pieces/new', desc: 'Agregar al inventario' },
            { label: 'Catálogo interno', href: '/owner/pieces', desc: 'Ver y editar piezas' },
            { label: 'Campañas', href: '/owner/campaigns', desc: 'Descuentos por evento' },
            { label: 'Vendedores', href: '/owner/vendors', desc: 'Gestionar equipo' },
            { label: 'Reportes', href: '/owner/reports', desc: 'Métricas y estadísticas' },
            { label: 'Calculadora', href: '/owner/calculator', desc: 'Piezas bajo pedido' },
          ].map((action, i) => (
            <a key={i} href={action.href} style={{
              background: '#161616',
              border: '0.5px solid rgba(201,168,76,0.18)',
              borderRadius: '7px',
              padding: '14px 16px',
              textDecoration: 'none',
              display: 'block',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#C9A84C', marginBottom: '3px' }}>
                {action.label}
              </div>
              <div style={{ fontSize: '11px', color: '#8A8680' }}>
                {action.desc}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}