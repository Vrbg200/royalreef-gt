import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReportsClient from './reports-client'

export default async function ReportsPage() {
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

  // Ventas completadas
  const { data: orders } = await adminClient
    .from('orders')
    .select(`
      id, total, sale_channel, created_at,
      order_pieces (piece_name, piece_code, unit_price)
    `)
    .in('status', ['completed', 'payment_verified'])
    .order('created_at', { ascending: false })

  // Piezas activas
  const { data: pieces } = await adminClient
    .from('pieces')
    .select(`
      id, code, name, tier, status,
      sale_price, import_cost, margin_pct,
      discount_pct, created_at,
      species:species_id (name)
    `)
    .order('created_at', { ascending: true })

  // Vendedores
  const { data: vendors } = await adminClient
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'vendor')

  return (
    <ReportsClient
      orders={orders || []}
      pieces={pieces || []}
      vendors={vendors || []}
    />
  )
}