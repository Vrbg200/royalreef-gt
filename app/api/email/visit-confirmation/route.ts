import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendVisitConfirmation } from '@/lib/email/send'

export async function POST(request: Request) {
  const { visitId } = await request.json()

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: visit } = await adminClient
    .from('store_visits')
    .select('confirmed_date, confirmed_time, guests, visit_type, client_id')
    .eq('id', visitId)
    .single()

  if (!visit || !visit.client_id) {
    return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })
  }

  const { data: profile } = await adminClient
    .from('profiles')
    .select('full_name')
    .eq('id', visit.client_id)
    .single()

  const { data: userData } = await adminClient.auth.admin.getUserById(visit.client_id)
  const email = userData?.user?.email

  if (!email) return NextResponse.json({ error: 'Sin email' }, { status: 400 })

  await sendVisitConfirmation({
    to:         email,
    clientName: profile?.full_name || 'Cliente',
    date:       visit.confirmed_date,
    time:       visit.confirmed_time,
    guests:     visit.guests,
    visitType:  visit.visit_type,
  })

  return NextResponse.json({ success: true })
}