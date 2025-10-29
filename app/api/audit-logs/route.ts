import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Temporarily return empty data
    // TODO: Implement proper audit log retrieval when authentication is enabled
    return NextResponse.json({
      data: [],
      count: 0,
      totalPages: 0,
      currentPage: 1
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}

// Mark as dynamic route
export const dynamic = 'force-dynamic';

