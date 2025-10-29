import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // API temporarily disabled
    // TODO: Implement when Supabase is configured
    return NextResponse.json({
      total: 0,
      active: 0,
      expiring: 0,
      expired: 0
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
