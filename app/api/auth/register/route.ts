import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password, fullName, phone, birthDate, address, department, addressRefs } = await request.json()

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Crear usuario en Auth
  const { data: newUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Crear perfil
  const { error: profileError } = await adminClient
    .from('profiles')
    .insert({
      id:           newUser.user.id,
      role:         'client',
      full_name:    fullName,
      phone:        phone || null,
      birth_date:   birthDate || null,
      address:      address || null,
      department:   department || null,
      address_refs: addressRefs || null,
      is_active:    true,
    })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}