import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import PieceClient from './piece-client'

export default async function PiecePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: piece } = await adminClient
    .from('pieces')
    .select(`
      id, code, name, size, tier,
      sale_price, discount_pct, discount_type,
      is_special_order, status, photos,
      species:species_id (name, code_prefix)
    `)
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!piece) redirect('/catalog')

  return <PieceClient piece={piece} />
}