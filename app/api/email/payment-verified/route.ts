import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendPaymentVerified } from '@/lib/email/send'

export async function POST(request: Request) {
  const { orderId } = await request.json()

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: order } = await adminClient
    .from('orders')
    .select('order_number, total, client_id')
    .eq('id', orderId)
    .single()

  if (!order || !order.client_id) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
  }

  const { data: userData } = await adminClient.auth.admin.getUserById(order.client_id)
  const email = userData?.user?.email

  if (!email) return NextResponse.json({ error: 'Sin email' }, { status: 400 })

  await sendPaymentVerified({
    to:          email,
    orderNumber: order.order_number,
    total:       order.total,
  })

  return NextResponse.json({ success: true })
}