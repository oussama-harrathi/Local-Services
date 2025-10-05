'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, MapPin, Camera, MessageCircle, Phone, ArrowLeft, Plus, Trash2, UtensilsCrossed } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { LoadingButton, LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useLanguage } from '@/contexts/LanguageContext'
import MapPicker from '@/components/MapPicker'
import PhotoUploadWithDelete from '@/components/PhotoUploadWithDelete'
import ScheduleManager from '@/components/ScheduleManager'
import ProviderOrdersManager from '@/components/ProviderOrdersManager'
import ProviderNotificationButtonFixed from '@/components/ProviderNotificationButtonFixed'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
}

interface ProviderProfile {
  id?: string
  name: string
  bio: string
  city: string
  latitude: number
  longitude: number
  categories: string[]
  photos: string[]
  whatsapp?: string
  messenger?: string
  menuItems?: MenuItem[]
}

const CATEGORIES = [
  { key: 'food_home', label: 'Home Cooking' },
  { key: 'haircut_mobile', label: 'Mobile Barber/Hairdresser' },
  { key: 'cleaning', label: 'Cleaning Services' },
  { key: 'tutoring', label: 'Tutoring' },
  { key: 'repairs', label: 'Home Repairs' },
  { key: 'pet_care', label: 'Pet Care' },
  { key: 'gardening', label: 'Gardening' },
  { key: 'photography', label: 'Photography' },
  { key: 'fitness_training', label: 'Fitness Training' },
  { key: 'music_lessons', label: 'Music Lessons' }
]

export default function ProviderDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { t } = useLanguage()
  
  const [formData, setFormData] = useState<ProviderProfile>({
    name: '',
    bio: '',
    city: '',
    latitude: 0,
    longitude: 0,
    categories: [],
    photos: [],
    whatsapp: '',
    messenger: '',
    menuItems: []
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?callbackUrl=/dashboard/provider')
    }
  }, [session, status, router])

  // Fetch existing provider profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: async () => {
      const response = await fetch('/api/me/provider-profile')
      if (response.status === 404) return null
      if (!response.ok) throw new Error('Failed to fetch profile')
      return response.json()
    },
    enabled: !!session
  })

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        id: profile.id,
        name: profile.name || '',
        bio: profile.bio || '',
        city: profile.city || '',
        latitude: profile.lat || 0,
        longitude: profile.lng || 0,
        categories: profile.categories || [],
        photos: profile.photos || [],
        whatsapp: profile.whatsapp || '',
        messenger: profile.messenger || '',
        menuItems: profile.menuItems ? JSON.parse(profile.menuItems) : []
      })
    }
  }, [profile])

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (data: ProviderProfile) => {
      const response = await fetch('/api/me/provider-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to save profile')
      return response.json()
    },
    onSuccess: () => {
      toast.success('Profile saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] })
    },
    onError: () => {
      toast.error('Failed to save profile')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveProfileMutation.mutate(formData)
  }

  const handleCategoryToggle = (categoryKey: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryKey)
        ? prev.categories.filter(c => c !== categoryKey)
        : [...prev.categories, categoryKey]
    }))
  }

  const handleLocationSelect = (lat: number, lng: number, city: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      city
    }))
  }

  // Menu management functions
  const addMenuItem = () => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0
    }
    setFormData(prev => ({
      ...prev,
      menuItems: [...(prev.menuItems || []), newItem]
    }))
  }

  const updateMenuItem = (id: string, field: keyof MenuItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      menuItems: prev.menuItems?.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ) || []
    }))
  }

  const removeMenuItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      menuItems: prev.menuItems?.filter(item => item.id !== id) || []
    }))
  }

  const isHomeCookingProvider = formData.categories.includes('food_home')

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2 rtl-flip" />
          {t('dashboard.back')}
        </button>
        
        {/* Provider Profile Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="h-6 w-6" />
                  {t('dashboard.providerDashboard')}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {t('dashboard.createAndManage')}
                </p>
              </div>
              {/* Provider Notification Button */}
              <ProviderNotificationButtonFixed />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Name Section */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('profileForm.name')}
              </label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            {/* Bio Section */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                {t('profileForm.bio')}
              </label>
              <textarea
                id="bio"
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell potential customers about yourself and your services..."
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                required
              />
            </div>

            {/* City Section */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                {t('profileForm.city')}
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  id="city"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Location Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('profileForm.location')}
              </label>
              <MapPicker
                onLocationSelect={handleLocationSelect}
                initialLat={formData.latitude}
                initialLng={formData.longitude}
                initialCity={formData.city}
              />
            </div>

            {/* Categories Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('dashboard.serviceCategories')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES.map((category) => (
                  <label key={category.key} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      checked={formData.categories.includes(category.key)}
                      onChange={() => handleCategoryToggle(category.key)}
                    />
                    <span className="ml-2 text-sm text-gray-700">{category.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Menu Items Section - Only show for home cooking providers */}
            {isHomeCookingProvider && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <UtensilsCrossed className="w-4 h-4 inline mr-2" />
                    Menu Items
                  </label>
                  <button
                    type="button"
                    onClick={addMenuItem}
                    className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </button>
                </div>
                
                {formData.menuItems && formData.menuItems.length > 0 ? (
                  <div className="space-y-4">
                    {formData.menuItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Item Name
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="e.g., Traditional Couscous"
                              value={item.name}
                              onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Price ($)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0.00"
                              value={item.price || ''}
                              onChange={(e) => updateMenuItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Description
                          </label>
                          <div className="flex gap-2">
                            <textarea
                              rows={2}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Describe your dish..."
                              value={item.description}
                              onChange={(e) => updateMenuItem(item.id, 'description', e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => removeMenuItem(item.id)}
                              className="flex items-center justify-center w-10 h-10 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No menu items yet. Add your first dish to get started!</p>
                  </div>
                )}
              </div>
            )}

            {/* Photos Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('dashboard.photos')}
              </label>
              <PhotoUploadWithDelete
                photos={formData.photos}
                onPhotosChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
                maxPhotos={6}
                showDeleteButton={true}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
                  {t('profileForm.whatsapp')}
                </label>
                <div className="mt-1 relative">
                  <input
                    type="tel"
                    id="whatsapp"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1234567890"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  />
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="messenger" className="block text-sm font-medium text-gray-700">
                  {t('profileForm.messenger')}
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    id="messenger"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="@username"
                    value={formData.messenger}
                    onChange={(e) => setFormData(prev => ({ ...prev, messenger: e.target.value }))}
                  />
                  <MessageCircle className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <LoadingButton
                type="submit"
                isLoading={saveProfileMutation.isPending}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveProfileMutation.isPending ? t('dashboard.saving') : t('dashboard.saveProfile')}
              </LoadingButton>
            </div>
          </form>
        </div>

        {/* Schedule Management Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Schedule Management</h2>
            <p className="mt-1 text-sm text-gray-600">
              Set your working hours and availability
            </p>
          </div>
          <div className="p-6">
            <ScheduleManager />
          </div>
        </div>

        {/* Orders & Appointments Management Section */}
        {formData.id && (
          <div className="mt-6">
            <ProviderOrdersManager providerId={formData.id} />
          </div>
        )}
      </div>
    </div>
  )
}