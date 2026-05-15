import Navbar from '@/components/layout/navbar'

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
      <Navbar />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>

        <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#C9A84C', marginBottom: '6px' }}>
          Términos y condiciones
        </h1>
        <p style={{ fontSize: '12px', color: '#8A8680', marginBottom: '32px' }}>
          RoyalReef GT — Versión 1.0
        </p>

        {[
          {
            num: 'I',
            title: 'Naturaleza del producto',
            items: [
              {
                sub: '1.1 Organismos vivos',
                text: 'Todos los corales y organismos marinos comercializados por RoyalReef GT son seres vivos. Como tal, su estado, coloración, tamaño y comportamiento pueden variar con respecto a las fotografías publicadas en el catálogo, las cuales son tomadas en condiciones controladas de iluminación y acuario. RoyalReef GT no garantiza que el aspecto del organismo al momento de la entrega sea idéntico al de las imágenes de referencia.',
              },
              {
                sub: '1.2 Requerimientos del comprador',
                text: 'El comprador declara conocer y cumplir con los requisitos mínimos para el mantenimiento de organismos marinos vivos, incluyendo pero no limitado a: acuario marino establecido, parámetros de agua estables, sistema de filtración adecuado y experiencia básica en acuarismo marino. RoyalReef GT no se hace responsable por la muerte o deterioro del organismo derivado de condiciones inadecuadas en el acuario del comprador.',
              },
            ],
          },
          {
            num: 'II',
            title: 'Envíos y transferencia de responsabilidad',
            items: [
              {
                sub: '2.1 Transferencia de responsabilidad',
                text: 'Una vez que el organismo es entregado al servicio de mensajería seleccionado o al momento en que el cliente retira la pieza en tienda, RoyalReef GT transfiere toda responsabilidad sobre el estado, salud y supervivencia del organismo al comprador. A partir de ese momento, RoyalReef GT no ofrece garantía de ningún tipo sobre el producto.',
              },
              {
                sub: '2.2 Riesgos del transporte',
                text: 'El transporte de organismos vivos conlleva riesgos inherentes que escapan al control de RoyalReef GT, incluyendo: demoras del servicio de mensajería, exposición a temperaturas extremas durante el traslado, manejo inadecuado por parte del servicio de entrega, y estrés del organismo durante el transporte. El comprador acepta estos riesgos al seleccionar la opción de envío.',
              },
              {
                sub: '2.3 Embalaje especializado',
                text: 'RoyalReef GT realiza el embalaje de los organismos siguiendo prácticas estándar de la industria acuarística. Sin embargo, dicho embalaje no garantiza la supervivencia del organismo ante condiciones de transporte fuera de lo normal. El costo de envío incluye el embalaje especializado.',
              },
              {
                sub: '2.4 Pick-up en tienda',
                text: 'El cliente que opte por retirar su compra en tienda debe hacerlo en la fecha y hora acordada. RoyalReef GT reservará el organismo por un máximo de 48 horas desde la confirmación de la cita. Pasado ese tiempo sin presentarse el comprador y sin aviso previo, RoyalReef GT se reserva el derecho de liberar la reserva y volver a colocar la pieza en el catálogo, sin reembolso si el pago ya fue realizado, salvo acuerdo expreso entre las partes.',
              },
              {
                sub: '2.5 Zonas de cobertura',
                text: 'El servicio de delivery aplica únicamente dentro de la República de Guatemala. Para envíos dentro de Guatemala ciudad se utiliza Pedidos Ya o Traeló Ya con un costo fijo de Q 125. Para el interior del país se utiliza Guatex o Cargo Expreso con un costo fijo de Q 225. RoyalReef GT no realiza envíos internacionales.',
              },
            ],
          },
          {
            num: 'III',
            title: 'Garantías y devoluciones',
            items: [
              {
                sub: '3.1 Política de no devolución',
                text: 'Dado que los corales son organismos vivos, RoyalReef GT no acepta devoluciones una vez entregada la pieza. Tampoco se realizan reembolsos por muerte del organismo ocurrida después de la entrega, independientemente de la causa reportada por el comprador.',
              },
              {
                sub: '3.2 Excepción por error de RoyalReef GT',
                text: 'La única excepción a la política de no devolución aplica cuando RoyalReef GT entrega un organismo distinto al comprado. En ese caso, el comprador deberá reportarlo dentro de las 2 horas siguientes a la recepción del organismo, con fotografía como evidencia, y RoyalReef GT evaluará una solución que puede incluir nota de crédito, descuento en próxima compra, o reposición sujeta a disponibilidad.',
              },
            ],
          },
          {
            num: 'IV',
            title: 'Pagos y reservas',
            items: [
              {
                sub: '4.1 Reserva de pieza',
                text: 'Al generar una orden, la pieza queda reservada exclusivamente para el comprador por un período de 24 horas. Si el pago no es confirmado dentro de ese plazo, la orden se cancela automáticamente y la pieza vuelve a estar disponible en el catálogo sin previo aviso.',
              },
              {
                sub: '4.2 Confirmación de pago',
                text: 'El pago se considera confirmado únicamente cuando un representante de RoyalReef GT valida el comprobante enviado por el comprador. La generación de una orden no garantiza la compra hasta que el pago sea verificado. RoyalReef GT no es responsable por transferencias realizadas a cuentas incorrectas o por errores del comprador en el proceso de pago.',
              },
              {
                sub: '4.3 Precios',
                text: 'Los precios publicados en el catálogo están expresados en Quetzales guatemaltecos (Q) e incluyen el margen comercial de RoyalReef GT. Los costos de envío se cobran por separado y se detallan al momento del checkout. RoyalReef GT se reserva el derecho de modificar precios sin previo aviso, pero el precio aplicable a una orden es el vigente al momento de su confirmación.',
              },
            ],
          },
          {
            num: 'V',
            title: 'Sistema de puntos',
            items: [
              {
                sub: '5.1 Acumulación y canje',
                text: 'El programa de puntos RoyalReef es un beneficio gratuito para clientes registrados. Los puntos no tienen valor monetario, no son transferibles, no son canjeables por dinero en efectivo y no constituyen un derecho adquirido. RoyalReef GT se reserva el derecho de modificar, suspender o cancelar el programa de puntos en cualquier momento, con aviso previo de 30 días a los usuarios activos.',
              },
              {
                sub: '5.2 Expiración',
                text: 'Los puntos acumulados expiran el día 5 del mes que cumple 24 meses desde la fecha de registro del cliente. Los puntos expirados no son recuperables bajo ninguna circunstancia. RoyalReef GT notificará al cliente por correo electrónico con 60 y 15 días de anticipación antes de la fecha de expiración.',
              },
            ],
          },
          {
            num: 'VI',
            title: 'Visitas a la tienda y retiro de piezas',
            items: [
              {
                sub: '6.1 Naturaleza de la visita',
                text: 'Las visitas a las instalaciones de RoyalReef GT son de carácter informativo y deben ser agendadas con un mínimo de 24 horas de anticipación a través del sitio web. La aprobación de la visita queda sujeta a disponibilidad y criterio de RoyalReef GT.',
              },
              {
                sub: '6.2 Conducta en las instalaciones',
                text: 'Durante la visita está estrictamente prohibido tocar los tanques, introducir las manos en el agua, utilizar flash fotográfico o luces externas sobre los sistemas acuáticos, e introducir objetos externos en las áreas de exhibición. El incumplimiento de estas normas faculta a RoyalReef GT a dar por terminada la visita de forma inmediata.',
              },
              {
                sub: '6.3 Capacidad y duración',
                text: 'Cada cita admite un máximo de 3 visitantes y tiene una duración máxima de 45 minutos. No se realizan apartados de piezas durante las visitas.',
              },
              {
                sub: '6.4 Retiro de piezas compradas',
                text: 'El cliente dispone de un plazo máximo de 14 días calendario desde la confirmación del pago para retirar su pieza en tienda. Transcurrido dicho plazo sin retiro ni comunicación previa, RoyalReef GT no garantiza el estado de la pieza ni asume responsabilidad sobre su condición.',
              },
            ],
          },
          {
            num: 'VII',
            title: 'Pedidos especiales y anticipo',
            items: [
              {
                sub: '7.1 Naturaleza del pedido especial',
                text: 'Los pedidos especiales corresponden a organismos adquiridos bajo solicitud específica del comprador, importados desde proveedores en Estados Unidos. Al ser una importación bajo pedido, el proceso implica costos y gestiones no recuperables desde el momento en que RoyalReef GT confirma la orden con el proveedor.',
              },
              {
                sub: '7.2 Anticipo obligatorio',
                text: 'Todo pedido especial requiere el pago de un anticipo equivalente al 50% del precio de venta cotizado. El comprador tendrá un plazo de 7 días calendario desde la recepción de la cotización para realizar dicho anticipo. Transcurrido ese plazo sin confirmación de pago, la cotización queda sin efecto.',
              },
              {
                sub: '7.3 Pago del saldo restante',
                text: 'El 50% restante deberá ser pagado antes de la fecha de entrega acordada. RoyalReef GT notificará al comprador con al menos 48 horas de anticipación para coordinar el pago final y la entrega.',
              },
              {
                sub: '7.4 Política de reembolso del anticipo',
                text: 'El anticipo será reembolsado únicamente si el organismo muere o perece mientras se encuentra bajo custodia de RoyalReef GT, antes de ser entregado al comprador. En cualquier otro caso, incluyendo cancelación voluntaria por parte del comprador o cambio de decisión, el anticipo no será devuelto bajo ninguna circunstancia.',
              },
              {
                sub: '7.5 Aceptación expresa',
                text: 'Al confirmar un pedido especial y realizar el anticipo, el comprador declara haber leído y aceptado los términos de esta sección en su totalidad.',
              },
            ],
          },
          {
            num: 'VIII',
            title: 'Disposiciones generales',
            items: [
              {
                sub: '8.1 Jurisdicción',
                text: 'Cualquier controversia derivada de la relación comercial entre RoyalReef GT y el comprador se resolverá bajo las leyes de la República de Guatemala, en los tribunales competentes de la ciudad de Guatemala.',
              },
              {
                sub: '8.2 Aceptación',
                text: 'Al realizar una compra en RoyalReef GT, ya sea de forma presencial o a través del sitio web, el comprador declara haber leído, comprendido y aceptado en su totalidad los presentes términos y condiciones.',
              },
            ],
          },
        ].map(section => (
          <div key={section.num} style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#C9A84C', marginBottom: '14px', paddingBottom: '6px', borderBottom: '0.5px solid rgba(201,168,76,0.18)' }}>
              {section.num}. {section.title}
            </h2>
            {section.items.map((item, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#F0EDE6', marginBottom: '5px' }}>
                  {item.sub}
                </div>
                <div style={{ fontSize: '12px', color: '#8A8680', lineHeight: 1.7 }}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        ))}

      </div>
    </div>
  )
}