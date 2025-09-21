'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Phone, Clock, Users, AlertTriangle } from 'lucide-react';

interface RateLimitEntry {
  id: string;
  userId?: string;
  phone?: string;
  ipAddress?: string;
  action: string;
  count: number;
  windowStart: string;
  expiresAt: string;
  user?: {
    name?: string;
    email?: string;
    phoneVerified?: boolean;
  };
}

interface PhoneVerification {
  id: string;
  userId: string;
  phone: string;
  verified: boolean;
  createdAt: string;
  user: {
    name?: string;
    email?: string;
  };
}

export default function RateLimitsAdminPage() {
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch rate limit entries
  const { data: rateLimits, isLoading: rateLimitsLoading } = useQuery({
    queryKey: ['admin', 'rate-limits', selectedAction],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedAction !== 'all') {
        params.append('action', selectedAction);
      }
      
      const response = await fetch(`/api/admin/rate-limits?${params}`);
      if (!response.ok) throw new Error('Failed to fetch rate limits');
      return response.json();
    },
  });

  // Fetch phone verifications
  const { data: phoneVerifications, isLoading: phoneLoading } = useQuery({
    queryKey: ['admin', 'phone-verifications'],
    queryFn: async () => {
      const response = await fetch('/api/admin/phone-verifications');
      if (!response.ok) throw new Error('Failed to fetch phone verifications');
      return response.json();
    },
  });

  // Clear rate limit entry
  const clearRateLimitMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const response = await fetch(`/api/admin/rate-limits/${entryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to clear rate limit');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'rate-limits'] });
      toast({
        title: 'Rate limit cleared',
        description: 'The rate limit entry has been removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'review_submission':
        return 'bg-blue-100 text-blue-800';
      case 'phone_verification':
        return 'bg-green-100 text-green-800';
      case 'suspicious_activity':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rate Limits & Phone Verification</h1>
        <p className="text-gray-600">Monitor and manage rate limiting and phone verification status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate Limits</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rateLimits?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Phones</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {phoneVerifications?.filter((p: PhoneVerification) => p.verified).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {phoneVerifications?.filter((p: PhoneVerification) => !p.verified).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{phoneVerifications?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limits Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Active Rate Limits</span>
          </CardTitle>
          <CardDescription>
            Current rate limiting entries across all actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter */}
          <div className="mb-4">
            <Label htmlFor="action-filter">Filter by Action</Label>
            <select
              id="action-filter"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="review_submission">Review Submission</option>
              <option value="phone_verification">Phone Verification</option>
              <option value="suspicious_activity">Suspicious Activity</option>
            </select>
          </div>

          {rateLimitsLoading ? (
            <div className="text-center py-8">Loading rate limits...</div>
          ) : rateLimits?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No active rate limits</div>
          ) : (
            <div className="space-y-4">
              {rateLimits?.map((entry: RateLimitEntry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getActionColor(entry.action)}>
                        {entry.action.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Count: {entry.count}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => clearRateLimitMutation.mutate(entry.id)}
                      disabled={clearRateLimitMutation.isPending}
                    >
                      Clear
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">User:</span>{' '}
                      {entry.user?.name || entry.user?.email || 'Anonymous'}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{' '}
                      {entry.phone || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">IP:</span>{' '}
                      {entry.ipAddress || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Expires:</span> {formatDate(entry.expiresAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Verifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Phone Verifications</span>
          </CardTitle>
          <CardDescription>
            User phone verification status and history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {phoneLoading ? (
            <div className="text-center py-8">Loading phone verifications...</div>
          ) : phoneVerifications?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No phone verifications</div>
          ) : (
            <div className="space-y-4">
              {phoneVerifications?.map((verification: PhoneVerification) => (
                <div key={verification.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={verification.verified ? 'default' : 'secondary'}>
                        {verification.verified ? 'Verified' : 'Pending'}
                      </Badge>
                      <span className="font-medium">
                        {verification.user.name || verification.user.email}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDate(verification.createdAt)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {verification.phone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}