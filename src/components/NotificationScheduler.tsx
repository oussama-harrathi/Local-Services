'use client'

import { useEffect } from 'react'
import { startNotificationScheduler } from '@/lib/cron'

export default function NotificationScheduler() {
  useEffect(() => {
    // Only start the scheduler in production or when explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_SCHEDULER === 'true') {
      console.log('Starting notification scheduler...')
      const interval = startNotificationScheduler()
      
      // Cleanup on unmount
      return () => {
        if (interval) {
          clearInterval(interval)
          console.log('Notification scheduler stopped')
        }
      }
    }
  }, [])

  // This component doesn't render anything
  return null
}