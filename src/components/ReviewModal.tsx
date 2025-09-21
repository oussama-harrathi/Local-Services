'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Star, X, Shield, Phone } from 'lucide-react';
import PhoneVerificationModal from './PhoneVerificationModal';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName?: string;
  onSuccess?: () => void;
}

export function ReviewModal({ isOpen, onClose, providerId, providerName, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const queryClient = useQueryClient();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { toast } = useToast();

  // Check phone verification status
  const { data: phoneStatus } = useQuery({
    queryKey: ['phone-verification'],
    queryFn: async () => {
      const response = await fetch('/api/phone/verify');
      if (!response.ok) return { verified: false };
      return response.json();
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: { providerId: string; rating: number; text: string; captchaToken: string }) => {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', providerId] });
      toast({
        title: 'Review submitted successfully!',
        description: 'Thank you for your feedback.',
      });
      onSuccess?.();
      handleClose();
    },
    onError: (error: Error) => {
      // Check if it's a rate limit error that suggests phone verification
      if (error.message.includes('phone number') || error.message.includes('verification')) {
        toast({
          title: 'Rate limit exceeded',
          description: error.message,
          variant: 'destructive',
        });
        // Show phone verification modal for rate limit errors
        if (error.message.includes('Verify Phone')) {
          setShowPhoneModal(true);
        }
      } else {
        toast({
          title: 'Failed to submit review',
          description: error.message,
          variant: 'destructive',
        });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 ReviewModal: Starting form submission');
    console.log('🔍 executeRecaptcha available:', !!executeRecaptcha);
    
    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }
    
    if (comment.trim().length < 10) {
      toast({
        title: 'Review too short',
        description: 'Please write at least 10 characters in your review',
        variant: 'destructive',
      });
      return;
    }

    if (!executeRecaptcha) {
      console.error('❌ reCAPTCHA not available');
      toast({
        title: 'reCAPTCHA not available',
        description: 'Please refresh the page and try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('🔄 Generating CAPTCHA token...');
      // Generate CAPTCHA token
      const captchaToken = await executeRecaptcha('submit_review');
      console.log('✅ CAPTCHA token generated:', captchaToken ? 'Yes' : 'No');
      
      submitReviewMutation.mutate({
        providerId,
        rating,
        text: comment.trim(),
        captchaToken,
      });
    } catch (error) {
      console.error('❌ CAPTCHA error:', error);
      toast({
        title: 'CAPTCHA verification failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    setShowPhoneModal(false);
    onClose();
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          className={`transition-colors duration-200 ${
            isActive ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400`}
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <Star className="w-8 h-8 fill-current" />
        </button>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Write a Review
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={submitReviewMutation.isPending}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Phone Verification Status */}
          {!phoneStatus?.verified && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-amber-900">Enhance Your Experience</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Verify your phone number to reduce review cooldown from 30 to 14 days and increase daily limits.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPhoneModal(true)}
                    className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Verify Phone Number
                  </Button>
                </div>
              </div>
            </div>
          )}

          {phoneStatus?.verified && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-900">Phone Verified</h3>
                  <p className="text-sm text-green-700">
                    You have enhanced limits: 14-day cooldown and higher daily review limits.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              How was your experience with <span className="font-semibold">{providerName}</span>?
            </p>
            
            {/* Rating Stars */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rating *
              </label>
              <div className="flex items-center gap-1">
                {renderStars()}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="mb-6">
              <Label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this provider..."
                rows={4}
                className="resize-none"
                disabled={submitReviewMutation.isPending}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  Minimum 10 characters required
                </p>
                <p className="text-sm text-gray-500">
                  {comment.length}/1000
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={submitReviewMutation.isPending}
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={submitReviewMutation.isPending}
              className="flex-1"
            >
              {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </div>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onVerified={() => {
          queryClient.invalidateQueries({ queryKey: ['phone-verification'] });
          setShowPhoneModal(false);
        }}
      />
    </div>
  );
}