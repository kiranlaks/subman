import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subscriptionService } from '@/lib/supabase/subscriptions'
import { auditLogger } from '@/lib/supabase/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    // Authentication temporarily disabled
    // const { data: { user } } = await supabase.auth.getUser()
    
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const subscription = await subscriptionService.getById(parseInt(params.id))
    
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }
    
    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    // Authentication temporarily disabled
    // const { data: { user } } = await supabase.auth.getUser()
    
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const id = parseInt(params.id)
    
    const subscription = await subscriptionService.update(id, body)
    
    // Log update - temporarily disabled
    // await auditLogger.log(user.id, 'subscription.edit', 'subscription', String(id), {
    //   changes: body,
    //   imei: subscription.imei
    // })
    
    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    // Authentication temporarily disabled
    // const { data: { user } } = await supabase.auth.getUser()
    
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Check user role for delete permission
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const id = parseInt(params.id)
    
    // Get subscription details before deletion for audit log
    const subscription = await subscriptionService.getById(id)
    
    await subscriptionService.delete(id)
    
    // Log deletion - temporarily disabled
    // await auditLogger.log(user.id, 'subscription.delete', 'subscription', String(id), {
    //   imei: subscription?.imei,
    //   customer: subscription?.customer
    // })
    
    return NextResponse.json({ message: 'Subscription deleted successfully' })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    )
  }
}

