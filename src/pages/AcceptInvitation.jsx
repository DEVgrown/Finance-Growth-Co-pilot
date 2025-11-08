import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle, XCircle, Loader2, LogIn } from 'lucide-react';

export default function AcceptInvitation() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [invitationData, setInvitationData] = useState(null);

  useEffect(() => {
    const acceptInvitation = async () => {
      try {
        const response = await apiClient.request(`/users/invitations/accept/${token}/`, {
          method: 'POST',
        });
        
        if (response.message) {
          setStatus('success');
          setMessage(response.message);
          setInvitationData(response);
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error) {
        setStatus('error');
        const errorMsg = error.message || '';
        if (errorMsg.includes('expired')) {
          setMessage('This invitation has expired. Please request a new one.');
        } else if (errorMsg.includes('not found') || errorMsg.includes('Invalid')) {
          setMessage('Invalid invitation link. Please check the link and try again.');
        } else if (errorMsg.includes('User not found')) {
          setMessage('You need to register first. Please sign up and then accept the invitation.');
          // Try to extract email from error if available
          try {
            const errorData = JSON.parse(errorMsg);
            if (errorData.email) {
              setInvitationData({ email: errorData.email });
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        } else {
          setMessage(errorMsg || 'Failed to accept invitation. Please try again.');
        }
      }
    };

    if (token) {
      acceptInvitation();
    } else {
      setStatus('error');
      setMessage('Invalid invitation token');
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            {status === 'loading' && <Loader2 className="w-8 h-8 text-white animate-spin" />}
            {status === 'success' && <CheckCircle className="w-8 h-8 text-white" />}
            {status === 'error' && <XCircle className="w-8 h-8 text-white" />}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Accepting Invitation...'}
            {status === 'success' && 'Invitation Accepted!'}
            {status === 'error' && 'Invitation Error'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <p className="text-center text-gray-600">Processing your invitation...</p>
          )}

          {status === 'success' && (
            <>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                  {invitationData?.business_name && (
                    <div className="mt-2">
                      <p className="font-semibold">You've been added to:</p>
                      <p>{invitationData.business_name}</p>
                      <p className="text-sm mt-1">Role: {invitationData.role}</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
              <p className="text-center text-sm text-gray-600">
                Redirecting to login page...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              
              {invitationData?.email && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800 mb-2">
                    Please register with this email: <strong>{invitationData.email}</strong>
                  </p>
                  <Button
                    onClick={() => navigate('/register')}
                    className="w-full"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Go to Registration
                  </Button>
                </div>
              )}
              
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full"
              >
                Go to Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

