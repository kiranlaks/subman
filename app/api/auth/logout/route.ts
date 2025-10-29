import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Authentication temporarily disabled
    // TODO: Implement proper logout when Supabase is configured
    return NextResponse.json({ message: 'Logout temporarily disabled' })
  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}
