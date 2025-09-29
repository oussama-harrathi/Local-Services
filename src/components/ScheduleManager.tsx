'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { Clock, Plus, Trash2, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { LoadingButton } from '@/components/ui/LoadingSpinner'
import { useLanguage } from '@/contexts/LanguageContext'

interface Schedule {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
  isActive?: boolean // For API compatibility
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

export default function ScheduleManager() {
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()
  
  const [schedules, setSchedules] = useState<Schedule[]>([])

  // Check if user has a provider profile
  const { data: providerProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: async () => {
      const response = await fetch('/api/me/provider-profile')
      if (response.status === 404) return null
      if (!response.ok) throw new Error('Failed to fetch profile')
      return response.json()
    },
    enabled: !!session
  })

  // Fetch existing schedules
  const { data: existingSchedules, isLoading } = useQuery({
    queryKey: ['provider-schedules'],
    queryFn: async () => {
      const response = await fetch('/api/schedules')
      if (!response.ok) throw new Error('Failed to fetch schedules')
      return response.json()
    },
    enabled: !!session && !!providerProfile
  })

  // Initialize schedules with existing data or default empty schedule
  useEffect(() => {
    // Always create a full 7-day schedule structure
    const defaultSchedules = DAYS_OF_WEEK.map((_, index) => ({
      dayOfWeek: index,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: false
    }))

    if (existingSchedules && existingSchedules.length > 0) {
      // Merge existing schedules with defaults
      const mergedSchedules = defaultSchedules.map(defaultSchedule => {
        const existingSchedule = existingSchedules.find(
          (schedule: Schedule) => schedule.dayOfWeek === defaultSchedule.dayOfWeek
        )
        
        if (existingSchedule) {
          return {
            ...defaultSchedule,
            id: existingSchedule.id,
            dayOfWeek: existingSchedule.dayOfWeek,
            startTime: existingSchedule.startTime || '09:00',
            endTime: existingSchedule.endTime || '17:00',
            isAvailable: existingSchedule.isActive !== undefined ? existingSchedule.isActive : false
          }
        }
        
        return defaultSchedule
      })
      setSchedules(mergedSchedules)
    } else {
      setSchedules(defaultSchedules)
    }
  }, [existingSchedules])

  // Save schedules mutation
  const saveSchedulesMutation = useMutation({
    mutationFn: async (schedulesToSave: Schedule[]) => {
      console.log('Sending schedules:', schedulesToSave)
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schedulesToSave),
      })
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error('Failed to save schedules')
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success(t('schedules.saved'))
      queryClient.invalidateQueries({ queryKey: ['provider-schedules'] })
    },
    onError: () => {
      toast.error(t('schedules.saveError'))
    },
  })

  const handleScheduleChange = (dayIndex: number, field: keyof Schedule, value: any) => {
    setSchedules(prev => prev.map((schedule, index) => 
      index === dayIndex ? { ...schedule, [field]: value } : schedule
    ))
  }

  const handleSaveSchedules = () => {
    if (!providerProfile) {
      toast.error(t('schedules.profileRequired'))
      return
    }
    
    const activeSchedules = schedules.filter(schedule => schedule.isAvailable).map(schedule => ({
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isAvailable: true,
      isActive: true
    }))
    saveSchedulesMutation.mutate(activeSchedules)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Working Hours</h2>
        </div>
        <LoadingButton
          onClick={handleSaveSchedules}
          isLoading={saveSchedulesMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Schedule
        </LoadingButton>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {schedules.map((schedule, index) => (
            <div key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`available-${index}`}
                      checked={schedule.isAvailable}
                      onChange={(e) => handleScheduleChange(index, 'isAvailable', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`available-${index}`} className="ml-2 text-sm font-medium text-gray-700 min-w-[80px]">
                      {DAYS_OF_WEEK[index]}
                    </label>
                  </div>
                  
                  {schedule.isAvailable && (
                    <div className="flex items-center space-x-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <span className="text-gray-400">-</span>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Time</label>
                        <input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {!schedule.isAvailable && (
                  <span className="text-sm text-gray-400">Closed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Schedule Tips
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Set your available working hours for each day</li>
                <li>Customers can only book appointments during these hours</li>
                <li>You can update your schedule anytime</li>
                <li>Uncheck days when you're not available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}