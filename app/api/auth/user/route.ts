import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Authentication temporarily disabled
    // TODO: Implement proper user retrieval when Supabase is configured
    return NextResponse.json({ user: null })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'An error occurred fetching user' },
      { status: 500 }
    )
  }
}
