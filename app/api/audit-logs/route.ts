import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    // Authentication temporarily disabled
    // const { data: { user } } = await supabase.auth.getUser()
    
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Check if user can view all logs (admin) or just their own
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    let query = supabase
      .from('audit_logs')
      .select('*, user_profiles!user_id(username, first_name, last_name)', { count: 'exact' })

    // Apply filters
    if (!isAdmin) {
      // Non-admin users can only see their own logs
      query = query.eq('user_id', user.id)
    } else if (userId) {
      // Admin filtering by specific user
      query = query.eq('user_id', userId)
    }

    if (action) {
      query = query.eq('action', action)
    }

    if (startDate) {
      query = query.gte('timestamp', startDate)
    }

    if (endDate) {
      query = query.lte('timestamp', endDate)
    }

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: logs, error, count } = await query
      .range(from, to)
      .order('timestamp', { ascending: false })

    if (error) {
      throw error
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 0

    return NextResponse.json({
      data: logs,
      count: count || 0,
      totalPages,
      currentPage: page
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}

