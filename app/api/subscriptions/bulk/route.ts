import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // API temporarily disabled
    // TODO: Implement when Supabase is configured
    return NextResponse.json({ error: 'API temporarily disabled' }, { status: 501 })
  } catch (error) {
    console.error('Error processing bulk operation:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk operation' },
      { status: 500 }
    )
  }
}
