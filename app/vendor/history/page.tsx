import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HistoryClient from './history-client'

export default async function VendorHistoryPage() {
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

  // Si es vendor solo ve sus ventas, si es owner ve todas
  let query = adminClient
    .from('orders')
    .select(`
      id, order_number, status, sale_channel,
      payment_method, total, subtotal, discount_amt,
      delivery_type, extra_discount_pct, created_at,
      client:client_id (full_name),
      sold_by_profile:sold_by (full_name),
      order_pieces (piece_name, piece_code, unit_price)
    `)
    .in('status', ['completed', 'payment_verified', 'cancelled'])
    .order('created_at', { ascending: false })
    .limit(100)

  if (profile?.role === 'vendor') {
    query = query.eq('sold_by', user.id)
  }

  const { data: orders } = await query

  return <HistoryClient orders={orders || []} isOwner={profile?.role === 'owner'} />
}