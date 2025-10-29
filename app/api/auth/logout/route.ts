import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auditLogger } from '@/lib/supabase/audit'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Log logout
      await auditLogger.log(user.id, 'user.logout', 'user', user.id, {
        email: user.email
      })
      
      // Update active sessions
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true)
    }
    
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error during logout:', error)
      return NextResponse.json(
        { error: 'Failed to logout' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}

