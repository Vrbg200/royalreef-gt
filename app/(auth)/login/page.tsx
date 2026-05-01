'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    // Obtener rol del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    // Redirigir según rol
    if (profile?.role === 'owner') {
      router.push('/owner')
    } else if (profile?.role === 'vendor') {
      router.push('/vendor')
    } else {
      router.push('/')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0D0D0D',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: '20px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: '#C9A84C',
            }}>
              ROYALREEF<span style={{ color: '#8A8680', fontWeight: 400, fontSize: '14px', marginLeft: '5px' }}>GT</span>
            </span>
          </Link>
          <p style={{ fontSize: '13px', color: '#8A8680', marginTop: '8px' }}>
            Inicia sesión en tu cuenta
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} style={{
          backgroundColor: '#161616',
          border: '0.5px solid rgba(201,168,76,0.18)',
          borderRadius: '10px',
          padding: '28px 24px',
        }}>
          {error && (
            <div style={{
              background: 'rgba(232,116,138,0.08)',
              border: '0.5px solid rgba(232,116,138,0.25)',
              borderRadius: '5px',
              padding: '10px 12px',
              fontSize: '12px',
              color: '#E8748A',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: '#8A8680',
              marginBottom: '5px',
            }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
              style={{
                width: '100%',
                backgroundColor: '#1E1E1E',
                border: '0.5px solid rgba(201,168,76,0.18)',
                borderRadius: '5px',
                padding: '8px 10px',
                color: '#F0EDE6',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: '#8A8680',
              marginBottom: '5px',
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                backgroundColor: '#1E1E1E',
                border: '0.5px solid rgba(201,168,76,0.18)',
                borderRadius: '5px',
                padding: '8px 10px',
                color: '#F0EDE6',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: loading ? '#252525' : '#C9A84C',
              color: loading ? '#8A8680' : '#0D0D0D',
              border: 'none',
              borderRadius: '5px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            fontSize: '12px',
            color: '#8A8680',
          }}>
            ¿No tienes cuenta?{' '}
            <Link href="/register" style={{ color: '#C9A84C', textDecoration: 'none' }}>
              Regístrate
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}