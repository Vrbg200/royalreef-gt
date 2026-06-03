import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendOrderConfirmation } from '@/lib/email/send'

export async function POST(request: Request) {
  const { orderId, userId } = await request.json()

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Obtener orden
  const { data: order } = await adminClient
    .from('orders')
    .select(`
      order_number, total, delivery_type,
      order_pieces (piece_name, piece_code, unit_price)
    `)
    .eq('id', orderId)
    .single()

  if (!order) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })

  // Obtener email del cliente
  const { data: userData } = await adminClient.auth.admin.getUserById(userId)
  const email = userData?.user?.email

  if (!email) return NextResponse.json({ error: 'Sin email' }, { status: 400 })

  await sendOrderConfirmation({
    to:           email,
    orderNumber:  order.order_number,
    total:        order.total,
    deliveryType: order.delivery_type,
    pieces:       (order.order_pieces as any[]).map((p: any) => ({
      name:  p.piece_name,
      code:  p.piece_code,
      price: p.unit_price,
    })),
  })

  return NextResponse.json({ success: true })
}