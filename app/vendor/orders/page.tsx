import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrdersClient from './orders-client'

export default async function VendorOrdersPage() {
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

  if (!['owner', 'vendor'].includes(profile?.role || '')) redirect('/')

  const { data: orders } = await adminClient
    .from('orders')
    .select(`
      id, order_number, status, sale_channel,
      payment_method, total, subtotal, discount_amt,
      delivery_type, delivery_cost, delivery_date,
      pickup_deadline, created_at, walk_in_name,
      client:client_id (full_name, phone),
      order_pieces (
        piece_name, piece_code, unit_price, discount_pct
      )
    `)
    .in('status', ['pending', 'payment_verified'])
    .order('created_at', { ascending: true })

  return <OrdersClient orders={orders || []} userId={user.id} />
}