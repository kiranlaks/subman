import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auditLogger } from '@/lib/supabase/audit'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      // Log failed login attempt
      await auditLogger.logAnonymous('user.login', 'failed_login', email, {
        error: error.message,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      })
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (data.user) {
      // Update last login time
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id)
      
      // Log successful login
      await auditLogger.log(data.user.id, 'user.login', 'user', data.user.id, {
        email: data.user.email,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      })
      
      // Create session record
      await supabase
        .from('user_sessions')
        .insert({
          user_id: data.user.id,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          user_agent: request.headers.get('user-agent') || null
        })
    }

    return NextResponse.json({
      user: data.user,
      session: data.session
    })
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}

