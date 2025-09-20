'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Star, X } from 'lucide-react';
import { LoadingButton } from './ui/LoadingSpinner';

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
  const queryClient = useQueryClient();

  const submitReviewMutation = useMutation({
    mutationFn: async (data: { providerId: string; rating: number; text: string }) => {
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
      toast.success('Review submitted successfully!');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit review');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (comment.trim().length < 10) {
      toast.error('Please write at least 10 characters in your review');
      return;
    }
    
    submitReviewMutation.mutate({
      providerId,
      rating,
      text: comment.trim(),
    });
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
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
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this provider..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
            <LoadingButton
              type="submit"
              isLoading={submitReviewMutation.isPending}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit Review
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}