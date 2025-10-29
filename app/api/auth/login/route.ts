import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Authentication temporarily disabled
    // TODO: Implement proper authentication when Supabase is configured
    return NextResponse.json(
      { error: 'Authentication temporarily disabled' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}

