import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VisitsClient from './visits-client'

export default async function VendorVisitsPage() {
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

  const { data: visits } = await adminClient
    .from('store_visits')
    .select(`
      id, visit_type, status, requested_date, requested_time,
      confirmed_date, confirmed_time, guests, reason, notes,
      created_at,
      client:client_id (full_name, phone),
      order:order_id (order_number)
    `)
    .order('created_at', { ascending: false })

  const { data: reschedules } = await adminClient
    .from('visit_reschedule_requests')
    .select(`
      id, visit_id, status, created_at,
      option_1_date, option_1_time,
      option_2_date, option_2_time,
      option_3_date, option_3_time,
      client:client_id (full_name)
    `)
    .eq('status', 'pending')

  return <VisitsClient visits={visits || []} reschedules={reschedules || []} userId={user.id} />
}