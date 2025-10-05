'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingCart, Plus, Minus, MapPin, MessageSquare, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { LoadingButton } from '@/components/ui/LoadingSpinner'
import { useLanguage } from '@/contexts/LanguageContext'

interface MenuItem {
  name: string
  price: number
  description: string
}

interface OrderItem {
  name: string
  price: number
  quantity: number
  notes?: string
}

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  providerId: string
  providerName: string
  menuItems: MenuItem[]
}

export default function OrderModal({ isOpen, onClose, providerId, providerName, menuItems }: OrderModalProps) {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [orderNotes, setOrderNotes] = useState('')

  const orderMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('=== ORDER MUTATION START ===');
      console.log('Provider ID:', providerId);
      console.log('Order data:', data);
      
      const requestBody = {
        providerId,
        items: data.items,
        deliveryAddress: data.deliveryAddress,
        notes: data.notes
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        
        // Only log detailed error info in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Order creation failed (dev only):', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
        }
        
        // Try to parse the error response to get a user-friendly message
        let errorMessage = 'Failed to place order. Please try again.';
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          // If parsing fails, use the raw error text if it's reasonable
          if (errorText && errorText.length < 200) {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('Order creation successful:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Order mutation success:', data);
      toast.success('Order placed successfully!')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      onClose()
      setOrderItems([])
      setDeliveryAddress('')
      setOrderNotes('')
    },
    onError: (error) => {
      // Only log in development for debugging, not as console.error
      if (process.env.NODE_ENV === 'development') {
        console.log('Order mutation error (dev only):', error);
      }
      toast.error(error.message || 'Failed to place order. Please try again.')
    }
  })

  const addItem = (menuItem: MenuItem) => {
    const existingItem = orderItems.find(item => item.name === menuItem.name)
    if (existingItem) {
      setOrderItems(prev => prev.map(item => 
        item.name === menuItem.name 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setOrderItems(prev => [...prev, {
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }])
    }
  }

  const updateQuantity = (itemName: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setOrderItems(prev => prev.filter(item => item.name !== itemName))
    } else {
      setOrderItems(prev => prev.map(item => 
        item.name === itemName 
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const getTotalPrice = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      toast.error('Please sign in to place an order')
      return
    }
    if (orderItems.length === 0) {
      toast.error('Please add items to your order')
      return
    }
    orderMutation.mutate({
      items: orderItems,
      deliveryAddress,
      notes: orderNotes
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-black">Order Food</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2 text-green-800">
              <ShoppingCart className="h-4 w-4" />
              <span className="font-medium">Ordering from {providerName}</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-black">Menu</h3>
            {menuItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No menu items available</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {menuItems.map((item) => {
                  const orderItem = orderItems.find(oi => oi.name === item.name)
                  return (
                    <div key={item.name} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-black">{item.name}</h4>
                          <p className="text-sm text-black mt-1">{item.description}</p>
                          <p className="text-lg font-semibold text-green-600 mt-2">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {orderItem ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.name, orderItem.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center font-medium text-black">{orderItem.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.name, orderItem.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addItem(item)}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Order Summary */}
          {orderItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-black">Order Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {orderItems.map((item) => (
                  <div key={item.name} className="flex justify-between items-center py-2">
                    <span className="text-black">{item.name} x {item.quantity}</span>
                    <span className="font-medium text-black">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span className="text-black">Total</span>
                    <span className="text-green-600">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Delivery Address
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                placeholder="Enter your delivery address..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                <MessageSquare className="h-4 w-4 inline mr-1" />
                Order Notes
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                placeholder="Any special instructions..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Order Information</p>
                  <p>Your order will be sent to the provider for confirmation. Estimated delivery time will be provided once confirmed.</p>
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
                isLoading={orderMutation.isPending}
                disabled={orderItems.length === 0}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Place Order (${getTotalPrice().toFixed(2)})
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}