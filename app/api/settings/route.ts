import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auditLogger } from '@/lib/supabase/audit'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    // Authentication temporarily disabled
    // const { data: { user } } = await supabase.auth.getUser()
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'user' or 'application'

    // if (type === 'user') {
    //   if (!user) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    //   }

      // Get user settings - temporarily disabled
      // const { data: settings, error } = await supabase
      //   .from('user_settings')
      //   .select('*')
      //   .eq('user_id', user.id)

      // if (error) {
      //   throw error
      // }

      // Convert array to object for easier access
      // const settingsObject = settings.reduce((acc, setting) => {
      //   acc[setting.settings_key] = setting.settings_value
      //   return acc
      // }, {} as Record<string, any>)

      // return NextResponse.json(settingsObject)
      return NextResponse.json({})
    } else {
      // Get application settings (public ones for non-authenticated users)
      let query = supabase
        .from('application_settings')
        .select('*')

      // if (!user) {
        query = query.eq('is_public', true)
      // }

      const { data: settings, error } = await query

      if (error) {
        throw error
      }

      // Convert array to object
      const settingsObject = settings.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value
        return acc
      }, {} as Record<string, any>)

      return NextResponse.json(settingsObject)
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
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
    const { type, key, value } = body

    if (type === 'user') {
      // Upsert user setting
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings_key: key,
          settings_value: value
        }, {
          onConflict: 'user_id,settings_key'
        })

      if (error) {
        throw error
      }

      // Log settings update
      await auditLogger.log(user.id, 'settings.update', 'user_settings', key, {
        type: 'user',
        key,
        value
      })

      return NextResponse.json({ message: 'Setting updated successfully' })
    } else {
      // Check if user is admin for application settings
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      // Upsert application setting
      const { error } = await supabase
        .from('application_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_by: user.id
        }, {
          onConflict: 'setting_key'
        })

      if (error) {
        throw error
      }

      // Log settings update
      await auditLogger.log(user.id, 'settings.update', 'application_settings', key, {
        type: 'application',
        key,
        value
      })

      return NextResponse.json({ message: 'Setting updated successfully' })
    }
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

