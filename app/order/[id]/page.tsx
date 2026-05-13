import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/navbar'

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: order } = await adminClient
    .from('orders')
    .select(`
      id, order_number, status, total, subtotal,
      discount_amt, delivery_type, delivery_cost,
      payment_method, created_at,
      client:client_id (full_name, phone),
      order_pieces (piece_name, piece_code, unit_price)
    `)
    .eq('id', id)
    .single()

  if (!order) redirect('/')

  const statusLabel: Record<string, string> = {
    pending:          'Esperando pago',
    payment_verified: 'Pago verificado',
    completed:        'Completada',
    cancelled:        'Cancelada',
  }

  const deliveryLabel: Record<string, string> = {
    pickup:   'Pick-up en tienda',
    city:     'Delivery Guatemala ciudad',
    interior: 'Envío interior del país',
    instore:  'Venta en tienda',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>

        {/* Status */}
        <div style={{
          background: 'rgba(74,175,122,0.08)', border: '0.5px solid rgba(74,175,122,0.25)',
          borderRadius: '8px', padding: '12px 16px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4AAF7A', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#4AAF7A', fontWeight: 500 }}>
            Orden creada — {statusLabel[order.status]}
          </span>
        </div>

        {/* Número de orden */}
        <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', color: '#8A8680', marginBottom: '6px' }}>Número de orden</div>
          <div style={{ fontSize: '26px', fontWeight: 500, color: '#C9A84C', letterSpacing: '0.06em', fontFamily: 'monospace', marginBottom: '6px' }}>
            {order.order_number}
          </div>
          <div style={{ fontSize: '11px', color: '#8A8680' }}>
            Incluye este número en tu comprobante de pago
          </div>
        </div>

        {/* Piezas */}
        <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
            Resumen
          </div>
          {(order.order_pieces as any[])?.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)', fontSize: '13px' }}>
              <div>
                <div style={{ color: '#F0EDE6' }}>{p.piece_name}</div>
                <div style={{ fontSize: '10px', color: '#8A8680', fontFamily: 'monospace' }}>{p.piece_code}</div>
              </div>
              <span style={{ color: '#C9A84C', fontWeight: 500 }}>Q {p.unit_price?.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '0.5px solid rgba(201,168,76,0.08)' }}>
            <span style={{ color: '#8A8680' }}>Envío · {deliveryLabel[order.delivery_type]}</span>
            <span style={{ color: '#F0EDE6' }}>{order.delivery_cost > 0 ? `Q ${order.delivery_cost}` : 'Gratis'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 500, padding: '10px 0 0', marginTop: '4px' }}>
            <span style={{ color: '#F0EDE6' }}>Total a pagar</span>
            <span style={{ color: '#C9A84C' }}>Q {order.total?.toLocaleString()}</span>
          </div>
        </div>

        {/* Datos bancarios */}
        {order.status === 'pending' && (
          <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Datos de pago
            </div>

            {[
              { bank: 'Banco Industrial', account: '012-XXXXXX-X' },
              { bank: 'Banrural',         account: '3001-XXXXXXXXX' },
            ].map((b, i) => (
              <div key={i} style={{ background: '#1E1E1E', borderRadius: '6px', padding: '10px 12px', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#C9A84C', marginBottom: '4px' }}>{b.bank}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#8A8680' }}>Cuenta monetaria</span>
                  <span style={{ color: '#F0EDE6', fontFamily: 'monospace' }}>{b.account}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '2px' }}>
                  <span style={{ color: '#8A8680' }}>A nombre de</span>
                  <span style={{ color: '#F0EDE6' }}>RoyalReef GT</span>
                </div>
              </div>
            ))}

            <div style={{ background: 'rgba(201,168,76,0.05)', border: '0.5px solid rgba(201,168,76,0.45)', borderRadius: '5px', padding: '10px 12px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#8A8680' }}>Monto exacto a transferir</div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 500, color: '#C9A84C' }}>
                Q {order.total?.toLocaleString()}.00
              </div>
            </div>
          </div>
        )}

        {/* Pasos */}
        {order.status === 'pending' && (
          <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Pasos a seguir
            </div>
            {[
              `Realiza la transferencia por Q ${order.total?.toLocaleString()}.00`,
              'Toma foto o captura del comprobante',
              `Envíalo por WhatsApp indicando el número ${order.order_number}`,
              'Un asesor verificará el pago y confirmará tu envío en menos de 2 horas hábiles',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '6px 0', fontSize: '12px', color: '#8A8680' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(201,168,76,0.1)', border: '0.5px solid rgba(201,168,76,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', fontWeight: 500, color: '#C9A84C',
                }}>
                  {i + 1}
                </div>
                <span style={{ paddingTop: '1px' }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Aviso reserva */}
        <div style={{ fontSize: '11px', color: '#3A3835', textAlign: 'center', lineHeight: 1.6 }}>
          Tu pieza está reservada por 24 horas. Si no se confirma el pago en ese plazo,
          la orden se cancela automáticamente.
        </div>

      </div>
    </div>
  )
}