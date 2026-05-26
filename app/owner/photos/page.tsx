'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function PhotosPage() {
  const supabase = createClient()
  const router   = useRouter()

  const [pieces, setPieces]       = useState<any[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [photos, setPhotos]       = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  useEffect(() => {
    supabase
      .from('pieces')
      .select('id, code, name, photos, status')
      .eq('status', 'active')
      .order('name')
      .then(({ data }) => setPieces(data || []))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const piece = pieces.find(p => p.id === selectedId)
    setPhotos(piece?.photos || [])
  }, [selectedId, pieces])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length || !selectedId) return
    if (photos.length + files.length > 3) {
      setError('Máximo 3 fotos por pieza')
      return
    }

    setUploading(true)
    setError('')

    const piece    = pieces.find(p => p.id === selectedId)
    const newUrls: string[] = []

    for (const file of files) {
      const ext  = file.name.split('.').pop()
      const path = `${piece.code}/${Date.now()}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('pieces')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadErr) {
        setError('Error al subir: ' + uploadErr.message)
        continue
      }

      const { data } = supabase.storage.from('pieces').getPublicUrl(path)
      newUrls.push(data.publicUrl)
    }

    const updated = [...photos, ...newUrls].slice(0, 3)
    await supabase.from('pieces').update({ photos: updated }).eq('id', selectedId)

    // Actualizar lista local
    setPieces(prev => prev.map(p => p.id === selectedId ? { ...p, photos: updated } : p))
    setPhotos(updated)
    setSuccess('Fotos guardadas correctamente')
    setUploading(false)
  }

  async function handleDelete(url: string) {
    const updated = photos.filter(p => p !== url)
    await supabase.from('pieces').update({ photos: updated }).eq('id', selectedId)
    setPieces(prev => prev.map(p => p.id === selectedId ? { ...p, photos: updated } : p))
    setPhotos(updated)
  }

  const selectedPiece = pieces.find(p => p.id === selectedId)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', padding: '24px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <a href="/owner" style={{ fontSize: '12px', color: '#8A8680', textDecoration: 'none' }}>← Dashboard</a>
          <span style={{ color: '#3A3835' }}>/</span>
          <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#C9A84C' }}>Fotos de piezas</h1>
        </div>

        {/* Selector de pieza */}
        <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px', marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#8A8680', marginBottom: '8px' }}>
            Selecciona la pieza
          </label>
          <select
            value={selectedId}
            onChange={e => { setSelectedId(e.target.value); setSuccess(''); setError('') }}
            style={{
              width: '100%', backgroundColor: '#1E1E1E',
              border: '0.5px solid rgba(201,168,76,0.18)',
              borderRadius: '5px', padding: '8px 10px',
              color: '#F0EDE6', fontSize: '13px', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="">Seleccionar pieza...</option>
            {pieces.map(p => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name} ({(p.photos || []).length}/3 fotos)
              </option>
            ))}
          </select>
        </div>

        {/* Panel de fotos */}
        {selectedPiece && (
          <div style={{ background: '#161616', border: '0.5px solid rgba(201,168,76,0.18)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#F0EDE6' }}>{selectedPiece.name}</div>
                <div style={{ fontSize: '10px', color: '#8A8680', fontFamily: 'monospace', marginTop: '2px' }}>{selectedPiece.code}</div>
              </div>
              <span style={{ fontSize: '11px', color: '#8A8680' }}>{photos.length}/3 fotos</span>
            </div>

            {error   && <div style={{ fontSize: '12px', color: '#E8748A', marginBottom: '10px' }}>{error}</div>}
            {success && <div style={{ fontSize: '12px', color: '#4AAF7A', marginBottom: '10px' }}>{success}</div>}

            {/* Grid de fotos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '14px' }}>
              {photos.map((url, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '6px', overflow: 'hidden', border: '0.5px solid rgba(201,168,76,0.18)' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => handleDelete(url)} style={{
                    position: 'absolute', top: '6px', right: '6px',
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.75)', border: 'none',
                    color: '#fff', fontSize: '12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>✕</button>
                </div>
              ))}

              {photos.length < 3 && (
                <label style={{
                  aspectRatio: '1', borderRadius: '6px', cursor: 'pointer',
                  background: '#1E1E1E', border: '0.5px dashed rgba(201,168,76,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: '6px', color: '#8A8680', fontSize: '12px',
                }}>
                  <span style={{ fontSize: '24px', opacity: 0.4 }}>+</span>
                  {uploading ? 'Subiendo...' : 'Agregar foto'}
                  <input
                    type="file" accept="image/jpeg,image/png,image/webp"
                    multiple style={{ display: 'none' }}
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
              )}

              {photos.length === 0 && (
                <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3A3835', fontSize: '12px' }}>
                  Sin fotos aún
                </div>
              )}
            </div>

            <div style={{ fontSize: '10px', color: '#3A3835' }}>
              JPG, PNG o WebP · Máximo 5MB por foto · Máximo 3 fotos por pieza
            </div>
          </div>
        )}

      </div>
    </div>
  )
}