'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Upload, FileText, Award, Shield, Star, Crown, ArrowLeft } from 'lucide-react';
import VerificationBadge from '@/components/VerificationBadge';

interface VerificationStatus {
  id: string;
  verificationStatus: string;
  verificationLevel: string | null;
  verificationBadgeType: string | null;
  verificationRequestedAt: string | null;
  verificationCompletedAt: string | null;
  verificationNotes: string | null;
}

export default function ProviderVerificationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    idPhoto: null as File | null,
    businessLicense: null as File | null,
    insurance: null as File | null,
    portfolio: null as File | null,
    customerReferences: '',
    backgroundCheck: null as File | null,
    additionalNotes: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchVerificationStatus();
  }, [session, status]);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/verification/request');
      
      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data.verification);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedLevel) {
      alert('Please select a verification level');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch('/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestedLevel: selectedLevel,
          formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit verification request');
      }

      // Refresh status
      await fetchVerificationStatus();
      alert('Verification request submitted successfully!');
    } catch (error) {
      console.error('Error submitting verification request:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit verification request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'verified':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Shield className="w-8 h-8 text-gray-400" />;
    }
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderVerificationForm = () => {
    const selectedLevelData = verificationLevels.find(level => level.id === selectedLevel);
    if (!selectedLevelData) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {selectedLevelData.name} Requirements
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Required Documents:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {selectedLevelData.requirements.map((req, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Basic Level Form */}
        {selectedLevel === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Government-issued ID Photo *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('idPhoto', e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a clear photo of your government-issued ID (driver's license, passport, etc.)
              </p>
            </div>
          </div>
        )}

        {/* Premium Level Form */}
        {selectedLevel === 'premium' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Government-issued ID Photo *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('idPhoto', e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business License Document *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange('businessLicense', e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Registration Certificate *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange('insurance', e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        )}

        {/* Elite Level Form */}
        {selectedLevel === 'elite' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Government-issued ID Photo *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('idPhoto', e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business License Document *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange('businessLicense', e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Documentation *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange('insurance', e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio/Work Samples *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.zip"
                onChange={(e) => handleFileChange('portfolio', e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer References *
              </label>
              <textarea
                rows={3}
                placeholder="Provide contact information for 3 recent customers who can vouch for your work quality"
                value={formData.customerReferences}
                  onChange={(e) => handleInputChange('customerReferences', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        )}

        {/* Additional Notes for all levels */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Information (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Any additional information you'd like to provide..."
            value={formData.additionalNotes}
            onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    );
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your verification request is being reviewed by our team.';
      case 'verified':
        return 'Congratulations! Your provider profile has been verified.';
      case 'rejected':
        return 'Your verification request was not approved. Please review the feedback and try again.';
      default:
        return 'Get verified to build trust with customers and stand out from the competition.';
    }
  };

  const verificationLevels = [
    {
      id: 'basic',
      name: 'Basic Verification',
      icon: <Shield className="w-6 h-6" />,
      description: 'Identity verification with basic trust indicators',
      badge: 'Identity Verified',
      badgeType: 'identity',
      features: ['Identity verification', 'Basic trust badge', 'Profile priority boost'],
      requirements: ['Government-issued ID photo', 'Phone number verification', 'Email verification']
    },
    {
      id: 'premium',
      name: 'Premium Verification',
      icon: <Award className="w-6 h-6" />,
      description: 'Enhanced verification with business credentials',
      badge: 'Business Verified',
      badgeType: 'business',
      features: ['Business license verification', 'Premium badge', 'Higher search ranking', 'Featured in premium section'],
      requirements: ['Business license document', 'Tax registration certificate', 'Professional certifications', 'All Basic requirements']
    },
    {
      id: 'elite',
      name: 'Elite Verification',
      icon: <Crown className="w-6 h-6" />,
      description: 'Highest level of verification with quality assurance',
      badge: 'Quality Assured',
      badgeType: 'quality',
      features: ['Complete background check', 'Elite badge', 'Top search priority', 'Quality guarantee seal', 'Featured placement'],
      requirements: ['Background check authorization', 'Insurance documentation', 'Customer references', 'Portfolio/work samples', 'All Premium requirements']
    }
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Provider Verification</h1>
          <p className="mt-2 text-gray-600">Build trust with customers through our verification program</p>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            {getStatusIcon(verificationStatus?.verificationStatus || 'unverified')}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                Verification Status
                {verificationStatus?.verificationStatus === 'verified' && (
                  <VerificationBadge
                    verificationStatus={verificationStatus.verificationStatus}
                    verificationLevel={verificationStatus.verificationLevel}
                    verificationBadgeType={verificationStatus.verificationBadgeType}
                    size="md"
                  />
                )}
              </h2>
              <p className="text-gray-600 capitalize">
                {verificationStatus?.verificationStatus || 'Not Verified'}
              </p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">
            {getStatusMessage(verificationStatus?.verificationStatus || 'unverified')}
          </p>

          {verificationStatus?.verificationRequestedAt && (
            <div className="text-sm text-gray-500">
              <p>Requested: {new Date(verificationStatus.verificationRequestedAt).toLocaleDateString()}</p>
              {verificationStatus.verificationCompletedAt && (
                <p>Completed: {new Date(verificationStatus.verificationCompletedAt).toLocaleDateString()}</p>
              )}
            </div>
          )}

          {verificationStatus?.verificationNotes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700">Admin Notes:</p>
              <p className="text-sm text-gray-600">{verificationStatus.verificationNotes}</p>
            </div>
          )}
        </div>

        {/* Request Form (only show if not verified or pending) */}
        {(!verificationStatus || ['unverified', 'rejected'].includes(verificationStatus.verificationStatus)) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Request Verification</h2>

            {/* Verification Levels */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Verification Level</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {verificationLevels.map((level) => (
                  <div
                    key={level.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedLevel === level.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedLevel(level.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {level.icon}
                      <h4 className="font-medium text-gray-900">{level.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{level.description}</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {level.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Form */}
            {selectedLevel && renderVerificationForm()}

            {/* Submit Button */}
            {selectedLevel && (
              <button
                onClick={handleSubmitRequest}
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Submitting...' : 'Submit Verification Request'}
              </button>
            )}
          </div>
        )}

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Get Verified?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Build Trust</h3>
                <p className="text-sm text-gray-600">Show customers you're a legitimate, trustworthy provider</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-6 h-6 text-yellow-500 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Stand Out</h3>
                <p className="text-sm text-gray-600">Get priority placement in search results</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Award className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Quality Assurance</h3>
                <p className="text-sm text-gray-600">Demonstrate your commitment to quality service</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Crown className="w-6 h-6 text-purple-500 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Premium Features</h3>
                <p className="text-sm text-gray-600">Access exclusive features and promotional opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}