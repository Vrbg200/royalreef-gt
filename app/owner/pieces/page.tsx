import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OwnerPiecesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'owner') redirect('/')

  const { data: pieces } = await adminClient
    .from('pieces')
    .select(`
      id, code, name, size, tier, status,
      cost_amount, cost_currency, exchange_rate,
      import_cost, sale_price, margin_pct,
      discount_pct, discount_type, is_special_order,
      created_at,
      species:species_id (name, code_prefix)
    `)
    .order('created_at', { ascending: false })

  const tierColor = (t: string) => t === 'low' ? '#4AAF7A' : t === 'mid' ? '#C9A84C' : '#E8748A'
  const statusColor = (s: string) => s === 'active' ? '#4AAF7A' : s === 'sold' ? '#8A8680' : '#E8748A'
  const statusLabel = (s: string) => s === 'active' ? 'Activo' : s === 'sold' ? 'Vendido' : s === 'deleted' ? 'Baja' : s

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <a href="/owner" style={{ fontSize: '12px', color: '#8A8680', textDecoration: 'none' }}>← Dashboard</a>
              <span style={{ color: '#3A3835' }}>/</span>
              <span style={{ fontSize: '12px', color: '#8A8680' }}>Catálogo interno</span>
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#C9A84C' }}>
              Catálogo interno
            </h1>
          </div>
          <a href="/owner/pieces/new" style={{
            padding: '9px 18px',
            background: '#C9A84C',
            color: '#0D0D0D',
            borderRadius: '5px',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
          }}>
            + Ingresar pieza
          </a>
        </div>

        {/* Stats rápidas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Total activas', value: pieces?.filter(p => p.status === 'active').length || 0 },
            { label: 'Low tier', value: pieces?.filter(p => p.tier === 'low').length || 0 },
            { label: 'Mid tier', value: pieces?.filter(p => p.tier === 'mid').length || 0 },
            { label: 'High tier', value: pieces?.filter(p => p.tier === 'high').length || 0 },
          ].map((s, i) => (
            <div key={i} style={{ background: '#1E1E1E', borderRadius: '6px', padding: '12px 14px' }}>
              <div style={{ fontSize: '10px', color: '#8A8680', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 500, color: '#F0EDE6' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', overflow: 'hidden' }}>

          {/* Header tabla */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 80px 60px 80px 80px 80px 70px 60px',
            padding: '8px 16px',
            borderBottom: '0.5px solid rgba(201,168,76,0.18)',
            background: '#1E1E1E',
          }}>
            {['Código','Nombre','Especie','Talla','Tier','Costo','Precio venta','Margen','Estado'].map((h, i) => (
              <span key={i} style={{ fontSize: '10px', color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
            ))}
          </div>

          {/* Filas */}
          {pieces && pieces.length > 0 ? pieces.map((p: any) => (
            <a key={p.id} href={`/owner/pieces/${p.id}`} style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 80px 60px 80px 80px 80px 70px 60px',
              padding: '10px 16px',
              borderBottom: '0.5px solid rgba(201,168,76,0.08)',
              textDecoration: 'none',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '10px', color: '#8A8680', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{p.code}</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#F0EDE6' }}>{p.name}</span>
              <span style={{ fontSize: '11px', color: '#8A8680' }}>{(p.species as any)?.name || '—'}</span>
              <span style={{ fontSize: '11px', color: '#8A8680' }}>{p.size}</span>
              <span style={{
                fontSize: '10px', padding: '2px 7px', borderRadius: '3px', fontWeight: 500,
                background: `${tierColor(p.tier)}18`,
                color: tierColor(p.tier),
                display: 'inline-block',
              }}>{p.tier}</span>
              <span style={{ fontSize: '11px', color: '#8A8680' }}>
                {p.cost_currency} {p.cost_amount}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#C9A84C' }}>
                Q {p.sale_price?.toLocaleString()}
              </span>
              <span style={{ fontSize: '11px', color: '#C9A84C' }}>{p.margin_pct}%</span>
              <span style={{
                fontSize: '10px', padding: '2px 6px', borderRadius: '3px', fontWeight: 500,
                background: `${statusColor(p.status)}18`,
                color: statusColor(p.status),
                display: 'inline-block',
              }}>{statusLabel(p.status)}</span>
            </a>
          )) : (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#3A3835' }}>
              No hay piezas en el inventario
            </div>
          )}
        </div>

      </div>
    </div>
  )
}