'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Campos obligatorios
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')

  // Campos opcionales
  const [address, setAddress] = useState('')
  const [department, setDepartment] = useState('')
  const [addressRefs, setAddressRefs] = useState('')
  const [isOutsideCity, setIsOutsideCity] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Crear usuario en Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Crear perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          role: 'client',
          full_name: fullName,
          phone,
          birth_date: birthDate || null,
          address: address || null,
          department: isOutsideCity ? department : null,
          address_refs: addressRefs || null,
        })

      if (profileError) {
        setError('Error al crear el perfil. Intenta de nuevo.')
        setLoading(false)
        return
      }

      router.push('/')
    }
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: '#1E1E1E',
    border: '0.5px solid rgba(201,168,76,0.18)',
    borderRadius: '5px',
    padding: '8px 10px',
    color: '#F0EDE6',
    fontSize: '13px',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block' as const,
    fontSize: '11px',
    color: '#8A8680',
    marginBottom: '5px',
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
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '0.08em', color: '#C9A84C' }}>
              ROYALREEF<span style={{ color: '#8A8680', fontWeight: 400, fontSize: '14px', marginLeft: '5px' }}>GT</span>
            </span>
          </Link>
          <p style={{ fontSize: '13px', color: '#8A8680', marginTop: '8px' }}>
            Crea tu cuenta
          </p>
        </div>

        {/* Indicador de pasos */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1, height: '3px', borderRadius: '2px',
              backgroundColor: s <= step ? '#C9A84C' : '#252525',
              transition: 'background-color 0.2s',
            }} />
          ))}
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleRegister}
          style={{
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

          {step === 1 && (
            <>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#F0EDE6', marginBottom: '16px' }}>
                Datos de tu cuenta
              </p>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Nombre completo <span style={{ color: '#E8748A' }}>*</span></label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  required placeholder="Tu nombre completo" style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Correo electrónico <span style={{ color: '#E8748A' }}>*</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="tu@correo.com" style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Número de teléfono <span style={{ color: '#E8748A' }}>*</span></label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  required placeholder="5555-5555" style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Fecha de nacimiento <span style={{ color: '#E8748A' }}>*</span></label>
                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                  required style={inputStyle} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Contraseña <span style={{ color: '#E8748A' }}>*</span></label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required placeholder="Mínimo 8 caracteres" minLength={8} style={inputStyle} />
              </div>

              <button type="submit" style={{
                width: '100%', padding: '10px',
                backgroundColor: '#C9A84C', color: '#0D0D0D',
                border: 'none', borderRadius: '5px',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}>
                Continuar →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#F0EDE6', marginBottom: '4px' }}>
                Dirección de entrega
              </p>
              <p style={{ fontSize: '11px', color: '#8A8680', marginBottom: '16px' }}>
                Opcional — necesaria solo si quieres recibir pedidos a domicilio
              </p>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Dirección</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Calle, zona, colonia..." style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Referencias</label>
                <input type="text" value={addressRefs} onChange={e => setAddressRefs(e.target.value)}
                  placeholder="Portón azul, frente al parque..." style={inputStyle} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '12px', color: '#8A8680', cursor: 'pointer',
                }}>
                  <input type="checkbox" checked={isOutsideCity}
                    onChange={e => setIsOutsideCity(e.target.checked)}
                    style={{ accentColor: '#C9A84C' }} />
                  Estoy fuera de Guatemala ciudad
                </label>
              </div>

              {isOutsideCity && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Departamento</label>
                  <select value={department} onChange={e => setDepartment(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Seleccionar departamento...</option>
                    {['Alta Verapaz','Baja Verapaz','Chimaltenango','Chiquimula',
                      'El Progreso','Escuintla','Huehuetenango','Izabal','Jalapa',
                      'Jutiapa','Petén','Quetzaltenango','Quiché','Retalhuleu',
                      'Sacatepéquez','San Marcos','Santa Rosa','Sololá','Suchitepéquez',
                      'Totonicapán','Zacapa'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setStep(1)} style={{
                  flex: 1, padding: '10px',
                  backgroundColor: 'transparent', color: '#8A8680',
                  border: '0.5px solid rgba(201,168,76,0.18)',
                  borderRadius: '5px', fontSize: '13px', cursor: 'pointer',
                }}>
                  ← Atrás
                </button>
                <button type="submit" disabled={loading} style={{
                  flex: 2, padding: '10px',
                  backgroundColor: loading ? '#252525' : '#C9A84C',
                  color: loading ? '#8A8680' : '#0D0D0D',
                  border: 'none', borderRadius: '5px',
                  fontSize: '13px', fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </div>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#8A8680' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" style={{ color: '#C9A84C', textDecoration: 'none' }}>
              Ingresar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}