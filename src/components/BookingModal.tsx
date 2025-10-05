'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, Clock, User, MessageSquare, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { LoadingButton } from '@/components/ui/LoadingSpinner'
import { useLanguage } from '@/contexts/LanguageContext'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  providerId: string
  providerName: string
  categories: string[]
}

interface ProviderSchedule {
  id: string
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  isActive: boolean
}

export default function BookingModal({ isOpen, onClose, providerId, providerName, categories }: BookingModalProps) {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    serviceType: categories.filter(cat => cat !== 'food_home')[0] || '',
    date: '',
    time: '',
    duration: 60,
    notes: ''
  })
  const [providerSchedules, setProviderSchedules] = useState<ProviderSchedule[]>([])
  const [timeError, setTimeError] = useState('')

  // Fetch provider schedules when modal opens
  useEffect(() => {
    if (isOpen && providerId) {
      fetch(`/api/providers/${providerId}/schedules`)
        .then(res => res.json())
        .then(data => setProviderSchedules(data))
        .catch(err => console.error('Failed to fetch provider schedules:', err))
    }
  }, [isOpen, providerId])

  // Validate time selection
  const validateTimeSelection = (date: string, time: string) => {
    setTimeError('')
    
    if (!date || !time) return true
    
    const selectedDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    
    // Check if selected time is in the past
    if (selectedDateTime <= now) {
      setTimeError('Please select a future time')
      return false
    }
    
    // Check if selected time is within provider's working hours
    const selectedDay = selectedDateTime.getDay() // 0 = Sunday, 6 = Saturday
    const selectedTimeStr = time
    
    const daySchedule = providerSchedules.find(schedule => 
      schedule.dayOfWeek === selectedDay && schedule.isActive
    )
    
    if (!daySchedule) {
      setTimeError('Provider is not available on this day')
      return false
    }
    
    // Convert time strings to minutes for comparison
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours * 60 + minutes
    }
    
    const selectedMinutes = timeToMinutes(selectedTimeStr)
    const startMinutes = timeToMinutes(daySchedule.startTime)
    const endMinutes = timeToMinutes(daySchedule.endTime)
    
    if (selectedMinutes < startMinutes || selectedMinutes >= endMinutes) {
      setTimeError(`Provider is available from ${daySchedule.startTime} to ${daySchedule.endTime} on this day`)
      return false
    }
    
    return true
  }

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          serviceType: data.serviceType,
          date: new Date(`${data.date}T${data.time}`).toISOString(),
          duration: data.duration,
          notes: data.notes
        }),
      })
      if (!response.ok) throw new Error('Failed to create booking')
      return response.json()
    },
    onSuccess: () => {
      toast.success('Booking request sent successfully!')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      onClose()
      setFormData({
        serviceType: categories.filter(cat => cat !== 'food_home')[0] || '',
        date: '',
        time: '',
        duration: 60,
        notes: ''
      })
    },
    onError: () => {
      toast.error('Failed to create booking')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      toast.error('Please sign in to book an appointment')
      return
    }
    
    // Validate time selection before submitting
    if (!validateTimeSelection(formData.date, formData.time)) {
      return
    }
    
    bookingMutation.mutate(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-black">Book Appointment</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <User className="h-4 w-4" />
              <span className="font-medium">Booking with {providerName}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Service Type
            </label>
            <select
              value={formData.serviceType}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            >
              {categories?.length > 0 ? (
                categories.filter(category => category !== 'food_home').map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                  </option>
                ))
              ) : (
                <option value="">No services available</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, date: e.target.value }))
                  // Validate time selection when date changes
                  if (formData.time) {
                    validateTimeSelection(e.target.value, formData.time)
                  }
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, time: e.target.value }))
                  // Validate time selection in real-time
                  validateTimeSelection(formData.date, e.target.value)
                }}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 text-black ${
                  timeError 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              />
              {timeError && (
                <p className="mt-1 text-sm text-red-600">{timeError}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Duration (minutes)
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Any special requirements or notes..."
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Booking Request</p>
                <p>Your booking request will be sent to the provider for confirmation. You'll be notified once they respond.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              isLoading={bookingMutation.isPending}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Send Booking Request
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  )
}