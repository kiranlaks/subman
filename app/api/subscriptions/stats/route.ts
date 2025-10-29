import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subscriptionService } from '@/lib/supabase/subscriptions'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    // Authentication temporarily disabled
    // const { data: { user } } = await supabase.auth.getUser()
    
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const stats = await subscriptionService.getStats()
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching subscription stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

