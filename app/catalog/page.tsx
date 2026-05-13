import { createClient as createAdminClient } from '@supabase/supabase-js'
import CatalogClient from './catalog-client'

export default async function CatalogPage() {
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: pieces } = await adminClient
    .from('pieces')
    .select(`
      id, code, name, size, tier,
      sale_price, discount_pct, discount_type,
      is_special_order, status,
      species:species_id (name, code_prefix)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const { data: species } = await adminClient
    .from('species')
    .select('id, name, code_prefix')
    .order('name')

  return <CatalogClient pieces={pieces || []} species={species || []} />
}