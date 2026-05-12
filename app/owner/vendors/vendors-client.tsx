'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VendorsClient({ vendors }: { vendors: any[] }) {
  const router = useRouter()

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const canCreate = name && email && password.length >= 8

  async function handleCreate() {
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/owner/create-vendor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error al crear vendedor')
      setLoading(false)
      return
    }

    setSuccess(`Vendedor ${name} creado correctamente`)
    setName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setLoading(false)
    router.refresh()
  }

  async function handleToggle(id: string, current: boolean) {
    await fetch('/api/owner/toggle-vendor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !current }),
    })
    router.refresh()
  }

  const input = {
    width: '100%',
    backgroundColor: '#1E1E1E',
    border: '0.5px solid rgba(201,168,76,0.18)',
    borderRadius: '5px',
    padding: '8px 10px',
    color: '#F0EDE6',
    fontSize: '13px',
    outline: 'none',
  } as React.CSSProperties

  const label = {
    display: 'block' as const,
    fontSize: '11px',
    color: '#8A8680',
    marginBottom: '5px',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', padding: '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <a href="/owner" style={{ fontSize: '12px', color: '#8A8680', textDecoration: 'none' }}>← Dashboard</a>
          <span style={{ color: '#3A3835' }}>/</span>
          <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#C9A84C' }}>Gestión de vendedores</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px' }}>

          {/* Lista de vendedores */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Equipo activo ({vendors.length})
            </div>

            {vendors.length === 0 ? (
              <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '32px', textAlign: 'center', fontSize: '13px', color: '#3A3835' }}>
                No hay vendedores registrados
              </div>
            ) : vendors.map(v => (
              <div key={v.id} style={{
                background: '#161616',
                border: '0.5px solid rgba(201,168,76,0.18)',
                borderRadius: '8px', padding: '14px 16px', marginBottom: '10px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#F0EDE6', marginBottom: '3px' }}>
                    {v.full_name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8A8680' }}>
                    {v.phone || 'Sin teléfono'} · Desde {new Date(v.created_at).toLocaleDateString('es-GT')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '3px', fontWeight: 500,
                    background: v.is_active ? 'rgba(74,175,122,0.1)' : 'rgba(58,56,53,0.3)',
                    color: v.is_active ? '#4AAF7A' : '#8A8680',
                  }}>
                    {v.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  <button onClick={() => handleToggle(v.id, v.is_active)} style={{
                    fontSize: '11px', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer',
                    background: 'transparent',
                    color: v.is_active ? '#E8748A' : '#4AAF7A',
                    border: `0.5px solid ${v.is_active ? 'rgba(232,116,138,0.3)' : 'rgba(74,175,122,0.3)'}`,
                  }}>
                    {v.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Crear vendedor */}
          <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#8A8680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
              Crear cuenta de vendedor
            </div>

            {error && (
              <div style={{ background: 'rgba(232,116,138,0.08)', border: '0.5px solid rgba(232,116,138,0.25)', borderRadius: '5px', padding: '8px 10px', fontSize: '12px', color: '#E8748A', marginBottom: '12px' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ background: 'rgba(74,175,122,0.08)', border: '0.5px solid rgba(74,175,122,0.25)', borderRadius: '5px', padding: '8px 10px', fontSize: '12px', color: '#4AAF7A', marginBottom: '12px' }}>
                {success}
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <label style={label}>Nombre completo *</label>
              <input style={input} value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del vendedor" />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={label}>Correo electrónico *</label>
              <input style={input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vendedor@correo.com" />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={label}>Teléfono</label>
              <input style={input} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="5555-5555" />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={label}>Contraseña inicial * (mín 8 caracteres)</label>
              <input style={input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña temporal" />
              <div style={{ fontSize: '10px', color: '#3A3835', marginTop: '4px' }}>
                El vendedor debe cambiarla en su primer inicio de sesión
              </div>
            </div>

            <button onClick={handleCreate} disabled={loading || !canCreate} style={{
              width: '100%', padding: '10px',
              background: !canCreate ? '#252525' : '#C9A84C',
              color: !canCreate ? '#8A8680' : '#0D0D0D',
              border: 'none', borderRadius: '5px',
              fontSize: '13px', fontWeight: 500, cursor: canCreate ? 'pointer' : 'not-allowed',
            }}>
              {loading ? 'Creando...' : 'Crear cuenta de vendedor ↗'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}