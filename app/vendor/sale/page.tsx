import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SaleClient from './sale-client'

export default async function VendorSalePage() {
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

  const { data: pieces } = await adminClient
    .from('pieces')
    .select(`
      id, code, name, size, tier,
      sale_price, discount_pct, discount_type,
      import_cost, margin_pct,
      species:species_id (name)
    `)
    .eq('status', 'active')
    .order('name')

  return <SaleClient pieces={pieces || []} userId={user.id} vendorName={profile?.full_name} />
}