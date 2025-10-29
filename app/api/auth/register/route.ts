import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, username, role } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // Check if user can create new accounts (must be admin)
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (currentUser) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()
      
      if (!profile || profile.role !== 'admin') {
        return NextResponse.json(
          { error: 'Only admins can create new accounts' },
          { status: 403 }
        )
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || 'User',
          last_name: lastName || 'Name',
          username: username || email.split('@')[0],
          role: role || 'viewer'
        }
      }
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      user: data.user,
      message: 'User created successfully. Please check email for verification.'
    })
  } catch (error) {
    console.error('Error during registration:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}

