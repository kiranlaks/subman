import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Authentication temporarily disabled
    // TODO: Implement proper registration when Supabase is configured
    return NextResponse.json(
      { error: 'Registration temporarily disabled' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error during registration:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
