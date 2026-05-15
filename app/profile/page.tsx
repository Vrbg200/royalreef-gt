import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './profile-client'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (['owner', 'vendor'].includes(profile.role)) redirect('/')

  // Historial de órdenes
  const { data: orders } = await adminClient
    .from('orders')
    .select(`
      id, order_number, status, total,
      delivery_type, created_at,
      order_pieces (piece_name, piece_code, unit_price)
    `)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  // Puntos
  const { data: pointsRows } = await adminClient
    .from('points')
    .select('amount, type, description, created_at, expires_at')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  const pointsBalance = pointsRows?.reduce((sum, p) => {
    if (p.type !== 'expired') return sum + p.amount
    return sum
  }, 0) || 0

  const nextExpiry = pointsRows?.find(p => p.expires_at)?.expires_at || null

  return (
    <ProfileClient
      profile={profile}
      orders={orders || []}
      pointsBalance={pointsBalance}
      pointsHistory={pointsRows || []}
      nextExpiry={nextExpiry}
    />
  )
}