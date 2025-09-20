'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { AlertTriangle, X } from 'lucide-react';
import { LoadingButton } from './ui/LoadingSpinner';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'provider' | 'review';
  targetId: string;
  targetName?: string; // Provider name or review author name
  onSuccess?: () => void;
}

const REPORT_REASONS = {
  provider: [
    'Inappropriate behavior',
    'Poor service quality',
    'Fraudulent activity',
    'Spam or fake profile',
    'Harassment',
    'Other'
  ],
  review: [
    'Fake review',
    'Inappropriate content',
    'Spam',
    'Harassment',
    'Off-topic',
    'Other'
  ]
};

export function ReportModal({ isOpen, onClose, targetType, targetId, targetName, onSuccess }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const queryClient = useQueryClient();

  const submitReportMutation = useMutation({
    mutationFn: async (data: { targetType: string; targetId: string; reason: string; details?: string }) => {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit report');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      toast.success('Report submitted successfully. We will review it shortly.');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit report');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }
    
    submitReportMutation.mutate({
      targetType,
      targetId,
      reason,
      details: details.trim() || undefined,
    });
  };

  const handleClose = () => {
    setReason('');
    setDetails('');
    onClose();
  };

  if (!isOpen) return null;

  const reasons = REPORT_REASONS[targetType];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Report {targetType === 'provider' ? 'Provider' : 'Review'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={submitReportMutation.isPending}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              You are reporting {targetType === 'provider' ? 'the provider' : 'a review by'}{' '}
              <span className="font-semibold">{targetName}</span>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please help us understand what's wrong so we can take appropriate action.
            </p>
            
            {/* Reason Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Reason for reporting *
              </label>
              <div className="space-y-2">
                {reasons.map((reasonOption) => (
                  <label key={reasonOption} className="flex items-center">
                    <input
                      type="radio"
                      name="reason"
                      value={reasonOption}
                      checked={reason === reasonOption}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      disabled={submitReportMutation.isPending}
                    />
                    <span className="ml-3 text-sm text-gray-700">{reasonOption}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="mb-6">
              <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
                Additional details (optional)
              </label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please provide any additional information that might help us understand the issue..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                disabled={submitReportMutation.isPending}
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-2">
                {details.length}/500 characters
              </p>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">
                    Important
                  </h4>
                  <p className="text-sm text-yellow-700">
                    False reports may result in action against your account. Please only report content that violates our community guidelines.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={submitReportMutation.isPending}
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              isLoading={submitReportMutation.isPending}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit Report
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}