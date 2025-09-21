'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { X, Phone, Shield, Clock } from 'lucide-react';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

export default function PhoneVerificationModal({ 
  isOpen, 
  onClose, 
  onVerified 
}: PhoneVerificationModalProps) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendCodeMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const response = await fetch('/api/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send_code',
          phone: phoneNumber 
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send code');
      return data;
    },
    onSuccess: (data) => {
      setVerificationId(data.verificationId);
      setStep('code');
      toast({
        title: 'Code Sent',
        description: 'Please check your phone for the verification code.',
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

  const verifyCodeMutation = useMutation({
    mutationFn: async ({ phoneNumber, verificationCode }: { phoneNumber: string; verificationCode: string }) => {
      const response = await fetch('/api/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'verify_code',
          phone: phoneNumber,
          code: verificationCode
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to verify code');
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Phone Verified',
        description: 'Your phone number has been successfully verified!',
      });
      queryClient.invalidateQueries({ queryKey: ['phone-verification'] });
      onVerified?.();
      onClose();
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setStep('phone');
    setPhone('');
    setCode('');
    setVerificationId(null);
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    
    // Ensure phone number starts with +
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    setPhone(formattedPhone);
    sendCodeMutation.mutate(formattedPhone);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length !== 6) return;
    
    verifyCodeMutation.mutate({ 
      phoneNumber: phone, 
      verificationCode: code 
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Verify Phone Number
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 'phone' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">Why verify your phone?</h3>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Reduced review cooldown (14 days vs 30 days)</li>
                    <li>• Higher daily review limits</li>
                    <li>• Enhanced account security</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                className="mt-1"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Include country code (e.g., +1 for US, +44 for UK)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={sendCodeMutation.isPending || !phone.trim()}
            >
              {sendCodeMutation.isPending ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-900">Code Sent!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    We've sent a 6-digit code to {phone}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="mt-1 text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('phone')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={verifyCodeMutation.isPending || code.length !== 6}
              >
                {verifyCodeMutation.isPending ? 'Verifying...' : 'Verify Code'}
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() => sendCodeMutation.mutate(phone)}
              disabled={sendCodeMutation.isPending}
              className="w-full text-sm"
            >
              Didn't receive the code? Resend
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}