import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subscriptionService } from '@/lib/supabase/subscriptions'
import { auditLogger } from '@/lib/supabase/audit'

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Request body must be an array of updates' },
        { status: 400 }
      )
    }

    const updates = body.map(item => ({
      id: item.id,
      data: item.data
    }))

    const subscriptions = await subscriptionService.bulkUpdate(updates)
    
    // Log bulk update
    await auditLogger.log(user.id, 'subscription.bulk_renew', 'bulk_update', `${subscriptions.length} items`, {
      count: subscriptions.length,
      ids: subscriptions.map(s => s.id)
    })
    
    return NextResponse.json({
      updated: subscriptions.length,
      subscriptions
    })
  } catch (error) {
    console.error('Error bulk updating subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to bulk update subscriptions' },
      { status: 500 }
    )
  }
}

