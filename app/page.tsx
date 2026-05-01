import Navbar from '@/components/layout/navbar'

export default function Home() {
  return (
    <main>
      <Navbar />
      <div style={{
        padding: '48px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <p style={{
          fontSize: '11px',
          letterSpacing: '0.12em',
          color: '#C9A84C',
          marginBottom: '12px',
          textTransform: 'uppercase' as const
        }}>
          Corales premium · Guatemala
        </p>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 500,
          color: '#F0EDE6',
          lineHeight: 1.25,
          marginBottom: '16px',
          maxWidth: '500px'
        }}>
          Cada pieza, <span style={{ color: '#C9A84C' }}>una obra</span> del océano
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#8A8680',
          maxWidth: '420px',
          lineHeight: 1.6,
          marginBottom: '28px'
        }}>
          Corales seleccionados de los mejores proveedores en Estados Unidos, disponibles en Guatemala.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a href="/catalog" style={{
            padding: '10px 24px',
            background: '#C9A84C',
            color: '#0D0D0D',
            borderRadius: '5px',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
          }}>
            Ver catálogo
          </a>
          <a href="/exclusives" style={{
            padding: '10px 24px',
            background: 'transparent',
            color: '#C9A84C',
            border: '0.5px solid rgba(201,168,76,0.45)',
            borderRadius: '5px',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
          }}>
            Piezas exclusivas
          </a>
        </div>
      </div>
    </main>
  )
}