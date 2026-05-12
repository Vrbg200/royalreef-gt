import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CampaignsClient from './campaigns-client'

export default async function CampaignsPage() {
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

  const { data: campaigns } = await adminClient
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: pieces } = await adminClient
    .from('pieces')
    .select('id, code, name, tier, sale_price, discount_type, status')
    .eq('status', 'active')
    .order('name')

  return <CampaignsClient campaigns={campaigns || []} pieces={pieces || []} userId={user.id} />
}