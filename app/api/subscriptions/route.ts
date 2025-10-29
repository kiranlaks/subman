import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // API temporarily disabled
    // TODO: Implement when Supabase is configured
    return NextResponse.json({ data: [], count: 0 })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // API temporarily disabled
    // TODO: Implement when Supabase is configured
    return NextResponse.json({ error: 'API temporarily disabled' }, { status: 501 })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
