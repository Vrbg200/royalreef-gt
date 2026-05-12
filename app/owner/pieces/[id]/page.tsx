import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PieceDetailClient from './piece-detail-client'

export default async function PieceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  const { data: piece } = await adminClient
    .from('pieces')
    .select(`
      id, code, name, size, tier, status,
      cost_amount, cost_currency, exchange_rate,
      import_cost, sale_price, margin_pct,
      discount_pct, discount_type, is_special_order,
      internal_notes, created_at,
      species:species_id (name, code_prefix)
    `)
    .eq('id', id)
    .single()

  if (!piece) redirect('/owner/pieces')

  const { data: history } = await adminClient
    .from('price_history')
    .select('old_price, new_price, reason, created_at')
    .eq('piece_id', id)
    .order('created_at', { ascending: false })

  return <PieceDetailClient piece={piece} history={history || []} />
}