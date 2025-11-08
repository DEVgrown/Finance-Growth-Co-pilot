import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Shield, Lock, Key, Activity, AlertTriangle, CheckCircle,
  Eye, EyeOff, RefreshCw, UserX, Search, Filter
} from 'lucide-react';
import LoadingSpinner, { LoadingTable } from '../../components/LoadingSpinner';

export default function SecurityModule() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();

  // Fetch security logs
  const { data: securityLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['security-logs'],
    queryFn: async () => {
      const response = await apiClient.request('/core/admin/security-logs/');
      return response;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000
  });

  // Fetch active sessions
  const { data: activeSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: async () => {
      const response = await apiClient.request('/core/admin/active-sessions/');
      return response;
    },
    refetchInterval: 15000,
    staleTime: 10000
  });

  // Fetch failed login attempts
  const { data: failedLogins = [], isLoading: failedLoading } = useQuery({
    queryKey: ['failed-logins'],
    queryFn: async () => {
      const response = await apiClient.request('/core/admin/failed-logins/');
      return response;
    },
    refetchInterval: 20000,
    staleTime: 15000
  });

  // Password reset mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, password }) => 
      apiClient.adminResetPassword(userId, password),
    onSuccess: () => {
      toast.success('Password reset successfully');
      setSelectedUser(null);
      setNewPassword('');
      queryClient.invalidateQueries({ queryKey: ['security-logs'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset password');
    }
  });

  // Terminate session mutation
  const terminateSessionMutation = useMutation({
    mutationFn: (sessionId) =>
      apiClient.request(`/core/admin/sessions/${sessionId}/terminate/`, {
        method: 'POST'
      }),
    onSuccess: () => {
      toast.success('Session terminated');
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to terminate session');
    }
  });

  // Lock user account mutation
  const lockAccountMutation = useMutation({
    mutationFn: (userId) =>
      apiClient.request(`/core/admin/users/${userId}/lock/`, {
        method: 'POST'
      }),
    onSuccess: () => {
      toast.success('Account locked');
      queryClient.invalidateQueries({ queryKey: ['security-logs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to lock account');
    }
  });

  if (logsLoading || sessionsLoading || failedLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading security data..." />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-600" />
            Security & Monitoring
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor system security, manage access, and track activities
          </p>
        </div>
        <Button
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['security-logs'] });
            queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
            queryClient.invalidateQueries({ queryKey: ['failed-logins'] });
          }}
          variant="outline"
          className="border-gray-300"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Active Sessions</p>
                <p className="text-3xl font-bold text-green-900">{activeSessions.length}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Failed Logins (24h)</p>
                <p className="text-3xl font-bold text-red-900">{failedLogins.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Security Events</p>
                <p className="text-3xl font-bold text-blue-900">{securityLogs.length}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">System Status</p>
                <p className="text-lg font-bold text-purple-900">Secure</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeSessions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No active sessions</p>
            ) : (
              activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{session.user_email}</p>
                      <p className="text-sm text-gray-600">
                        IP: {session.ip_address} • {session.user_agent}
                      </p>
                      <p className="text-xs text-gray-500">
                        Started: {new Date(session.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => terminateSessionMutation.mutate(session.id)}
                    disabled={terminateSessionMutation.isPending}
                  >
                    <UserX className="w-4 h-4 mr-1" />
                    Terminate
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Failed Login Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Failed Login Attempts (Last 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {failedLogins.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No failed login attempts</p>
            ) : (
              failedLogins.slice(0, 10).map((attempt, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{attempt.username || attempt.email}</p>
                    <p className="text-sm text-gray-600">
                      IP: {attempt.ip_address} • {new Date(attempt.attempted_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-red-600">Reason: {attempt.reason}</p>
                  </div>
                  {attempt.user_id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => lockAccountMutation.mutate(attempt.user_id)}
                      className="border-red-600 text-red-600"
                    >
                      <Lock className="w-4 h-4 mr-1" />
                      Lock Account
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Recent Security Events
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {securityLogs
              .filter(log => 
                !searchQuery || 
                log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .slice(0, 20)
              .map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={`${
                      log.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      log.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {log.severity || 'info'}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{log.action}</p>
                      <p className="text-xs text-gray-600">
                        {log.user_email} • {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{log.ip_address}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Password Reset Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Resetting password for: <strong>{selectedUser.email}</strong>
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedUser(null);
                    setNewPassword('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (newPassword.length >= 8) {
                      resetPasswordMutation.mutate({
                        userId: selectedUser.id,
                        password: newPassword
                      });
                    } else {
                      toast.error('Password must be at least 8 characters');
                    }
                  }}
                  disabled={newPassword.length < 8 || resetPasswordMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
