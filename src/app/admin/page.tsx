'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { LoadingButton, LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProviderProfile {
  id: string;
  name: string;
  city: string;
  bio: string;
  isVerified: boolean;
  isHidden: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface Report {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details?: string;
  status: string;
  createdAt: string;
  reporter: {
    name: string;
    email: string;
  };
  provider?: {
    name: string;
    city: string;
  };
  review?: {
    text: string;
    rating: number;
    user: {
      name: string;
    };
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'providers' | 'reports'>('providers');

  // Fetch unverified providers
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['admin', 'providers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/providers');
      if (!response.ok) throw new Error('Failed to fetch providers');
      return response.json() as Promise<ProviderProfile[]>;
    },
    enabled: session?.user?.role === 'admin',
  });

  // Fetch open reports
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
      const response = await fetch('/api/reports?status=pending');
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json() as Promise<Report[]>;
    },
    enabled: session?.user?.role === 'admin',
  });

  // Provider actions
  const verifyProviderMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const response = await fetch(`/api/admin/providers/${providerId}/verify`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to verify provider');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
      toast.success('Provider verified successfully');
    },
    onError: () => {
      toast.error('Failed to verify provider');
    },
  });

  const toggleProviderVisibilityMutation = useMutation({
    mutationFn: async ({ providerId, isHidden }: { providerId: string; isHidden: boolean }) => {
      const response = await fetch(`/api/admin/providers/${providerId}/visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHidden }),
      });
      if (!response.ok) throw new Error('Failed to update provider visibility');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
      toast.success('Provider visibility updated');
    },
    onError: () => {
      toast.error('Failed to update provider visibility');
    },
  });

  // Report actions
  const resolveReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to resolve report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      toast.success('Report resolved');
    },
    onError: () => {
      toast.error('Failed to resolve report');
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      toast.success('Review deleted');
    },
    onError: () => {
      toast.error('Failed to delete review');
    },
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage providers, reviews, and reports</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('providers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'providers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Providers ({providers?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Open Reports ({reports?.length || 0})
            </button>
          </nav>
        </div>

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Provider Management</h2>
              <p className="text-sm text-gray-500">Verify providers and manage visibility</p>
            </div>
            <div className="divide-y divide-gray-200">
              {providersLoading ? (
                <div className="p-6 text-center">
                  <LoadingSpinner size="md" text="Loading providers..." />
                </div>
              ) : providers?.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No providers to review</div>
              ) : (
                providers?.map((provider) => (
                  <div key={provider.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
                          <div className="flex space-x-2">
                            {provider.isVerified ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Unverified
                              </span>
                            )}
                            {provider.isHidden && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{provider.city}</p>
                        <p className="text-sm text-gray-500 mt-1">{provider.user.email}</p>
                        <p className="text-sm text-gray-700 mt-2">{provider.bio}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Created: {new Date(provider.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {!provider.isVerified && (
                          <LoadingButton
                            onClick={() => verifyProviderMutation.mutate(provider.id)}
                            isLoading={verifyProviderMutation.isPending && verifyProviderMutation.variables === provider.id}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            Verify
                          </LoadingButton>
                        )}
                        <LoadingButton
                          onClick={() =>
                            toggleProviderVisibilityMutation.mutate({
                              providerId: provider.id,
                              isHidden: !provider.isHidden,
                            })
                          }
                          isLoading={toggleProviderVisibilityMutation.isPending && toggleProviderVisibilityMutation.variables?.providerId === provider.id}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                            provider.isHidden
                              ? 'text-white bg-blue-600 hover:bg-blue-700'
                              : 'text-white bg-red-600 hover:bg-red-700'
                          } disabled:opacity-50`}
                        >
                          {provider.isHidden ? 'Show' : 'Hide'}
                        </LoadingButton>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Report Management</h2>
              <p className="text-sm text-gray-500">Review and resolve user reports</p>
            </div>
            <div className="divide-y divide-gray-200">
              {reportsLoading ? (
                <div className="p-6 text-center">
                  <LoadingSpinner size="md" text="Loading reports..." />
                </div>
              ) : reports?.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No open reports</div>
              ) : (
                reports?.map((report) => (
                  <div key={report.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {report.targetType === 'provider' ? 'Provider Report' : 'Review Report'}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {report.reason}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Reported by: {report.reporter.name} ({report.reporter.email})
                        </p>
                        {report.details && (
                          <p className="text-sm text-gray-700 mt-2">{report.details}</p>
                        )}
                        {report.provider && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm font-medium">Provider: {report.provider.name}</p>
                            <p className="text-sm text-gray-600">Location: {report.provider.city}</p>
                          </div>
                        )}
                        {report.review && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm font-medium">
                              Review by {report.review.user.name} ({report.review.rating}/5 stars)
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{report.review.text}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Reported: {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {report.targetType === 'review' && (
                          <LoadingButton
                            onClick={() => deleteReviewMutation.mutate(report.targetId)}
                            isLoading={deleteReviewMutation.isPending && deleteReviewMutation.variables === report.targetId}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                          >
                            Delete Review
                          </LoadingButton>
                        )}
                        <LoadingButton
                          onClick={() => resolveReportMutation.mutate(report.id)}
                          isLoading={resolveReportMutation.isPending && resolveReportMutation.variables === report.id}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          Resolve
                        </LoadingButton>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}