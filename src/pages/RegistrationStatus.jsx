import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle, XCircle, Clock, Loader2, Mail, Building2, ArrowLeft } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export default function RegistrationStatus() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState(email || '');
  const [searchEmail, setSearchEmail] = useState(email || '');

  const { data: registration, isLoading, refetch } = useQuery({
    queryKey: ['registration-status', searchEmail],
    queryFn: async () => {
      return await apiClient.checkRegistrationStatus(searchEmail);
    },
    enabled: !!searchEmail,
    retry: false
  });

  const handleCheckStatus = () => {
    if (!emailInput.trim()) {
      alert('Please enter an email address');
      return;
    }
    setSearchEmail(emailInput.trim());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Checking registration status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!searchEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="text-center">
            <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Check Registration Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Enter your email address</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCheckStatus();
                  }
                }}
              />
            </div>
            <Button onClick={handleCheckStatus} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Check Status
            </Button>
            <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardContent className="p-12 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Not Found</h2>
            <p className="text-gray-600 mb-6">
              No registration found for {searchEmail}
            </p>
            <Button onClick={() => navigate('/register')} className="bg-blue-600 hover:bg-blue-700 text-white">
              Register Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-8 h-8 text-red-600" />;
      case 'pending':
        return <Clock className="w-8 h-8 text-yellow-600 animate-pulse" />;
      default:
        return <Clock className="w-8 h-8 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-none shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            {getStatusIcon(registration.status)}
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            {registration.status === 'approved' && 'Registration Approved!'}
            {registration.status === 'rejected' && 'Registration Rejected'}
            {registration.status === 'pending' && 'Registration Pending'}
          </CardTitle>
          <Badge className={`mt-2 ${getStatusColor(registration.status)}`}>
            {registration.status.toUpperCase()}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-700 mb-2">Business Information</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Name:</strong> {registration.business_name}</p>
                <p><strong>Type:</strong> {registration.business_type}</p>
                <p><strong>Location:</strong> {registration.location}</p>
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-2">Owner Information</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Name:</strong> {registration.owner_name}</p>
                <p><strong>Email:</strong> {registration.email}</p>
                <p><strong>Phone:</strong> {registration.phone_number}</p>
              </div>
            </div>
          </div>

          {registration.status === 'approved' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Congratulations!</strong> Your business registration has been approved. You can now log in to access your dashboard.
                <div className="mt-2">
                  <p>Your login credentials have been sent to your email: <strong>{registration.email}</strong></p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {registration.status === 'rejected' && (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Registration Rejected</strong>
                {registration.rejection_reason && (
                  <div className="mt-2">
                    <p><strong>Reason:</strong> {registration.rejection_reason}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {registration.status === 'pending' && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Pending Review</strong>
                <p className="mt-2">Your registration is currently under review. We'll notify you via email once a decision has been made.</p>
                <p className="mt-1 text-sm">Submitted: {new Date(registration.created_at).toLocaleDateString()}</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            {registration.status === 'approved' && (
              <Button onClick={() => navigate('/login')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Go to Login
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/register')} className="flex-1">
              Register Another Business
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


