import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'RoyalReef GT <onboarding@resend.dev>'

// Email de confirmación de orden
export async function sendOrderConfirmation({
  to, orderNumber, total, deliveryType, pieces
}: {
  to: string
  orderNumber: string
  total: number
  deliveryType: string
  pieces: { name: string, code: string, price: number }[]
}) {
  const deliveryLabel: Record<string, string> = {
    pickup:   'Pick-up en tienda',
    city:     'Delivery Guatemala ciudad (Q 125)',
    interior: 'Envío interior del país (Q 225)',
  }

  const pieceRows = pieces.map(p =>
    `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #252525;color:#F0EDE6">${p.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #252525;color:#8A8680;font-family:monospace">${p.code}</td>
      <td style="padding:8px 0;border-bottom:1px solid #252525;color:#C9A84C;text-align:right">Q ${p.price.toLocaleString()}</td>
    </tr>`
  ).join('')

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Orden ${orderNumber} recibida — RoyalReef GT`,
    html: `
      <div style="background:#0D0D0D;color:#F0EDE6;font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <div style="font-size:20px;font-weight:500;color:#C9A84C;letter-spacing:0.08em;margin-bottom:4px">ROYALREEF GT</div>
        <div style="font-size:12px;color:#8A8680;margin-bottom:28px">Confirmación de orden</div>

        <div style="background:#161616;border:1px solid #252525;border-radius:8px;padding:18px 20px;margin-bottom:20px">
          <div style="font-size:11px;color:#8A8680;margin-bottom:6px">Número de orden</div>
          <div style="font-size:26px;font-weight:500;color:#C9A84C;font-family:monospace;letter-spacing:0.06em">${orderNumber}</div>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          ${pieceRows}
        </table>

        <div style="background:#161616;border:1px solid #252525;border-radius:6px;padding:14px 16px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
            <span style="color:#8A8680">Entrega</span>
            <span style="color:#F0EDE6">${deliveryLabel[deliveryType] || deliveryType}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:500;padding-top:10px;border-top:1px solid #252525">
            <span style="color:#F0EDE6">Total a pagar</span>
            <span style="color:#C9A84C">Q ${total.toLocaleString()}.00</span>
          </div>
        </div>

        <div style="background:#161616;border:1px solid #C9A84C33;border-radius:6px;padding:14px 16px;margin-bottom:24px;font-size:12px;color:#8A8680;line-height:1.7">
          <strong style="color:#F0EDE6">Próximos pasos:</strong><br>
          1. Realiza la transferencia por Q ${total.toLocaleString()}.00<br>
          2. Toma foto de tu comprobante<br>
          3. Envíalo por WhatsApp indicando el número <strong style="color:#C9A84C">${orderNumber}</strong><br>
          4. Un asesor confirmará tu pago en menos de 2 horas hábiles
        </div>

        <div style="font-size:10px;color:#3A3835;text-align:center">
          Tu pieza está reservada por 24 horas. RoyalReef GT · Guatemala
        </div>
      </div>
    `,
  })
}

// Email de pago verificado
export async function sendPaymentVerified({
  to, orderNumber, total
}: {
  to: string
  orderNumber: string
  total: number
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Pago confirmado — Orden ${orderNumber}`,
    html: `
      <div style="background:#0D0D0D;color:#F0EDE6;font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <div style="font-size:20px;font-weight:500;color:#C9A84C;letter-spacing:0.08em;margin-bottom:4px">ROYALREEF GT</div>
        <div style="font-size:12px;color:#8A8680;margin-bottom:28px">Pago confirmado</div>

        <div style="background:rgba(74,175,122,0.08);border:1px solid rgba(74,175,122,0.25);border-radius:8px;padding:16px 20px;margin-bottom:20px;text-align:center">
          <div style="font-size:28px;margin-bottom:8px">✓</div>
          <div style="font-size:14px;font-weight:500;color:#4AAF7A">Pago verificado exitosamente</div>
          <div style="font-size:12px;color:#8A8680;margin-top:4px">Orden ${orderNumber} · Q ${total.toLocaleString()}.00</div>
        </div>

        <div style="font-size:12px;color:#8A8680;line-height:1.7;margin-bottom:24px">
          Tu pago fue verificado por nuestro equipo. Pronto recibirás información sobre la entrega de tu pieza.
        </div>

        <div style="font-size:10px;color:#3A3835;text-align:center">
          RoyalReef GT · Guatemala
        </div>
      </div>
    `,
  })
}

// Email de confirmación de visita
export async function sendVisitConfirmation({
  to, clientName, date, time, guests, visitType
}: {
  to: string
  clientName: string
  date: string
  time: string
  guests: number
  visitType: string
}) {
  const typeLabel = visitType === 'pickup' ? 'Retiro de compra' : 'Visita a la tienda'

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Cita confirmada — ${new Date(date).toLocaleDateString('es-GT')}`,
    html: `
      <div style="background:#0D0D0D;color:#F0EDE6;font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <div style="font-size:20px;font-weight:500;color:#C9A84C;letter-spacing:0.08em;margin-bottom:4px">ROYALREEF GT</div>
        <div style="font-size:12px;color:#8A8680;margin-bottom:28px">Cita confirmada</div>

        <div style="background:#161616;border:1px solid #252525;border-radius:8px;padding:18px 20px;margin-bottom:20px">
          <div style="font-size:13px;color:#8A8680;margin-bottom:12px">Hola ${clientName}, tu cita fue confirmada:</div>
          <div style="font-size:22px;font-weight:500;color:#C9A84C;margin-bottom:4px">
            ${new Date(date).toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div style="font-size:16px;color:#F0EDE6;margin-bottom:12px">${time} hrs</div>
          <div style="font-size:12px;color:#8A8680">${typeLabel} · ${guests} persona${guests > 1 ? 's' : ''}</div>
        </div>

        <div style="background:#161616;border:1px solid #252525;border-radius:6px;padding:14px 16px;margin-bottom:20px;font-size:12px;color:#8A8680;line-height:1.8">
          <strong style="color:#F0EDE6">Recuerda:</strong><br>
          · Prohibido tocar los tanques o meter las manos al agua<br>
          · No se apartan piezas durante la visita<br>
          · Si llegas con más de 15 minutos de retraso la cita se cancela<br>
          · Máximo ${guests} visitante${guests > 1 ? 's' : ''}
        </div>

        <div style="font-size:10px;color:#3A3835;text-align:center">
          RoyalReef GT · Guatemala
        </div>
      </div>
    `,
  })
}

// Email de aviso de expiración de puntos
export async function sendPointsExpiry({
  to, clientName, points, expiryDate, daysLeft
}: {
  to: string
  clientName: string
  points: number
  expiryDate: string
  daysLeft: number
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Tus puntos vencen en ${daysLeft} días — RoyalReef GT`,
    html: `
      <div style="background:#0D0D0D;color:#F0EDE6;font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <div style="font-size:20px;font-weight:500;color:#C9A84C;letter-spacing:0.08em;margin-bottom:4px">ROYALREEF GT</div>
        <div style="font-size:12px;color:#8A8680;margin-bottom:28px">Aviso de puntos</div>

        <div style="background:rgba(232,116,138,0.08);border:1px solid rgba(232,116,138,0.25);border-radius:8px;padding:18px 20px;margin-bottom:20px;text-align:center">
          <div style="font-size:13px;color:#8A8680;margin-bottom:6px">Hola ${clientName}</div>
          <div style="font-size:28px;font-weight:500;color:#E8748A;margin-bottom:4px">${points} puntos</div>
          <div style="font-size:12px;color:#8A8680">vencen el ${new Date(expiryDate).toLocaleDateString('es-GT')} (en ${daysLeft} días)</div>
        </div>

        <div style="font-size:12px;color:#8A8680;line-height:1.7;margin-bottom:20px">
          Usa tus puntos antes de que venzan para obtener descuentos en tu próxima compra.
          Cada 500 puntos = 5% de descuento en piezas de catálogo.
        </div>

        <a href="https://royalreef-gt.vercel.app/catalog" style="display:block;text-align:center;padding:12px;background:#C9A84C;color:#0D0D0D;border-radius:6px;font-size:13px;font-weight:500;text-decoration:none;margin-bottom:24px">
          Ver catálogo ↗
        </a>

        <div style="font-size:10px;color:#3A3835;text-align:center">
          RoyalReef GT · Guatemala
        </div>
      </div>
    `,
  })
}