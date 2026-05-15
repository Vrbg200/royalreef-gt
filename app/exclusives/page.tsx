import { createClient as createAdminClient } from '@supabase/supabase-js'
import ExclusivesClient from './exclusives-client'

export default async function ExclusivesPage() {
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: pieces } = await adminClient
    .from('pieces')
    .select(`
      id, code, name, size, sale_price,
      discount_pct, discount_type, status,
      species:species_id (name)
    `)
    .eq('status', 'active')
    .eq('is_special_order', true)
    .order('created_at', { ascending: false })

  const { data: species } = await adminClient
    .from('species')
    .select('id, name, code_prefix')
    .order('name')

  return <ExclusivesClient pieces={pieces || []} species={species || []} />
}