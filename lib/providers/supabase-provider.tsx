'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { authService } from '@/lib/supabase/auth'
import { subscriptionService } from '@/lib/supabase/subscriptions'
import type { UserProfile } from '@/types/supabase'
import type { LegacySubscription } from '@/types/supabase'

interface SupabaseContextType {
  // Auth
  user: User | null
  userProfile: UserProfile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  hasPermission: (permission: string) => Promise<boolean>
  isAdmin: () => Promise<boolean>
  
  // Subscriptions
  subscriptions: LegacySubscription[]
  loadingSubscriptions: boolean
  refreshSubscriptions: () => Promise<void>
  createSubscription: (subscription: Omit<LegacySubscription, 'id'>) => Promise<LegacySubscription>
  updateSubscription: (id: number, updates: Partial<LegacySubscription>) => Promise<LegacySubscription>
  deleteSubscription: (id: number) => Promise<void>
  bulkCreateSubscriptions: (subscriptions: Omit<LegacySubscription, 'id'>[]) => Promise<LegacySubscription[]>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState<LegacySubscription[]>([])
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false)

  const supabase = createClient()

  // Initialize auth state - TEMPORARILY DISABLED
  useEffect(() => {
    // Authentication temporarily disabled - setting mock state
    setUser(null)
    setUserProfile(null)
    setIsLoading(false)
    
    // let mounted = true

    // async function getInitialSession() {
    //   const { data: { session } } = await supabase.auth.getSession()
      
    //   if (mounted) {
    //     setUser(session?.user ?? null)
    //     if (session?.user) {
    //       const profile = await authService.getCurrentUserProfile()
    //       setUserProfile(profile)
    //     }
    //     setIsLoading(false)
    //   }
    // }

    // getInitialSession()

    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     if (mounted) {
    //       setUser(session?.user ?? null)
    //       if (session?.user) {
    //         const profile = await authService.getCurrentUserProfile()
    //         setUserProfile(profile)
    //       } else {
    //         setUserProfile(null)
    //       }
    //       setIsLoading(false)
    //     }
    //   }
    // )

    // return () => {
    //   mounted = false
    //   subscription?.unsubscribe()
    // }
  }, [])

  // Load subscriptions automatically since auth is disabled
  useEffect(() => {
    refreshSubscriptions()
  }, [])

  // Subscription methods
  const refreshSubscriptions = async () => {
    // Auth check temporarily disabled
    // if (!user) return
    
    setLoadingSubscriptions(true)
    try {
      const data = await subscriptionService.getAll()
      setSubscriptions(data)
    } catch (error) {
      console.error('Error loading subscriptions:', error)
    } finally {
      setLoadingSubscriptions(false)
    }
  }

  const createSubscription = async (subscription: Omit<LegacySubscription, 'id'>) => {
    const newSubscription = await subscriptionService.create(subscription)
    setSubscriptions(prev => [newSubscription, ...prev])
    return newSubscription
  }

  const updateSubscription = async (id: number, updates: Partial<LegacySubscription>) => {
    const updatedSubscription = await subscriptionService.update(id, updates)
    setSubscriptions(prev => 
      prev.map(sub => sub.id === id ? updatedSubscription : sub)
    )
    return updatedSubscription
  }

  const deleteSubscription = async (id: number) => {
    await subscriptionService.delete(id)
    setSubscriptions(prev => prev.filter(sub => sub.id !== id))
  }

  const bulkCreateSubscriptions = async (subscriptionsData: Omit<LegacySubscription, 'id'>[]) => {
    const newSubscriptions = await subscriptionService.bulkCreate(subscriptionsData)
    setSubscriptions(prev => [...newSubscriptions, ...prev])
    return newSubscriptions
  }

  // Auth methods - TEMPORARILY DISABLED
  const signIn = async (email: string, password: string) => {
    // Authentication temporarily disabled
    return { user: null, error: null }
    
    // const result = await authService.signIn(email, password)
    // if (result.user) {
    //   const profile = await authService.getCurrentUserProfile()
    //   setUserProfile(profile)
    // }
    // return result
  }

  const signOut = async () => {
    // Authentication temporarily disabled
    return { error: null }
    
    // const result = await authService.signOut()
    // if (!result.error) {
    //   setUser(null)
    //   setUserProfile(null)
    //   setSubscriptions([])
    // }
    // return result
  }

  const hasPermission = async (permission: string) => {
    // Authentication temporarily disabled - allow all permissions
    return true
    
    // return authService.hasPermission(permission)
  }

  const isAdmin = async () => {
    // Authentication temporarily disabled - grant admin access
    return true
    
    // return authService.isAdmin()
  }

  const value: SupabaseContextType = {
    // Auth
    user,
    userProfile,
    isLoading,
    signIn,
    signOut,
    hasPermission,
    isAdmin,
    
    // Subscriptions
    subscriptions,
    loadingSubscriptions,
    refreshSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    bulkCreateSubscriptions
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

// Hook for auth specifically
export function useAuth() {
  const { user, userProfile, isLoading, signIn, signOut, hasPermission, isAdmin } = useSupabase()
  return { user, userProfile, isLoading, signIn, signOut, hasPermission, isAdmin }
}

// Hook for subscriptions specifically
export function useSubscriptions() {
  const { 
    subscriptions, 
    loadingSubscriptions, 
    refreshSubscriptions, 
    createSubscription, 
    updateSubscription, 
    deleteSubscription, 
    bulkCreateSubscriptions 
  } = useSupabase()
  
  return { 
    subscriptions, 
    loadingSubscriptions, 
    refreshSubscriptions, 
    createSubscription, 
    updateSubscription, 
    deleteSubscription, 
    bulkCreateSubscriptions 
  }
}

