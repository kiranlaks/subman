import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

    // Users can view their own profile, admins can view any profile
    if (user.id !== params.id) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
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

    // Users can update their own profile (limited fields)
    // Admins can update any profile (all fields)
    if (user.id !== params.id) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    } else {
      // Non-admin users can only update certain fields
      const allowedFields = ['first_name', 'last_name', 'phone_number', 'avatar_url', 'department']
      const filteredBody = Object.keys(body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = body[key]
          return obj
        }, {} as any)
      
      Object.assign(body, filteredBody)
    }

    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Log profile update
    await auditLogger.log(user.id, 'user.profile_update', 'user_profile', params.id, {
      updatedFields: Object.keys(body),
      updatedBy: user.id
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
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

    // Only admins can delete users
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Prevent self-deletion
    if (user.id === params.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Soft delete - just mark as inactive
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: false })
      .eq('id', params.id)

    if (error) {
      throw error
    }

    // Log user deletion
    await auditLogger.log(user.id, 'user.delete', 'user', params.id, {
      deletedBy: user.id
    })

    return NextResponse.json({ message: 'User deactivated successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

