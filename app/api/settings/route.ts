import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auditLogger } from '@/lib/supabase/audit'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    // Authentication temporarily disabled
    // const { data: { user } } = await supabase.auth.getUser()
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'user' or 'application'

    // Temporarily return empty settings
    // TODO: Implement proper settings retrieval when authentication is enabled
    return NextResponse.json({});
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Temporarily disabled - return success
    // TODO: Implement proper settings update when authentication is enabled
    return NextResponse.json({ message: 'Settings update temporarily disabled' });
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

