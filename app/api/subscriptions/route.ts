import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subscriptionService } from '@/lib/supabase/subscriptions'
import { auditLogger } from '@/lib/supabase/audit'

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
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status') as 'active' | 'inactive' | 'expired' | null
    const vendor = searchParams.get('vendor')
    const customer = searchParams.get('customer')
    const search = searchParams.get('search')

    let result

    if (search) {
      // Search functionality
      result = await subscriptionService.search(search)
      return NextResponse.json({
        data: result,
        count: result.length,
        totalPages: 1
      })
    } else if (page || pageSize || status || vendor || customer) {
      // Paginated results with filters
      result = await subscriptionService.getPaginated(page, pageSize, {
        status: status || undefined,
        vendor: vendor || undefined,
        customer: customer || undefined
      })
      return NextResponse.json(result)
    } else {
      // Get all subscriptions
      const subscriptions = await subscriptionService.getAll()
      return NextResponse.json({
        data: subscriptions,
        count: subscriptions.length,
        totalPages: 1
      })
    }
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
    const supabase = createClient()
    // Authentication temporarily disabled
    // const { data: { user } } = await supabase.auth.getUser()
    
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    
    // Handle bulk create
    if (Array.isArray(body)) {
      const subscriptions = await subscriptionService.bulkCreate(body)
      
      // Log bulk import - temporarily disabled
      // await auditLogger.log(user.id, 'subscription.import', 'bulk_import', `${subscriptions.length}`, {
      //   count: subscriptions.length,
      //   firstId: subscriptions[0]?.id,
      //   lastId: subscriptions[subscriptions.length - 1]?.id
      // })
      
      return NextResponse.json(subscriptions, { status: 201 })
    }
    
    // Single create
    const subscription = await subscriptionService.create(body)
    
    // Log creation - temporarily disabled
    // await auditLogger.log(user.id, 'subscription.create', 'subscription', String(subscription.id), {
    //   imei: subscription.imei,
    //   customer: subscription.customer
    // })
    
    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

