import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Building2,
  Shield,
  TrendingUp,
  UserCheck,
  UserX,
  AlertCircle,
  Edit,
  Save,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MetricCard from "../components/dashboard/MetricCard";
import { apiClient } from "@/lib/apiClient";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState("");

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: adminStats, isLoading: loadingStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => apiClient.getAdminStats(),
    enabled: !!user,
    retry: false
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => apiClient.getAllUsers(),
    enabled: !!user,
    retry: false
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => apiClient.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      queryClient.invalidateQueries(['adminStats']);
      setEditingUser(null);
      setNewRole("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error) => {
      setShowError(error.message || "Failed to update user role");
      setTimeout(() => setShowError(""), 5000);
    }
  });

  const handleRoleUpdate = (userId) => {
    if (!newRole) {
      setShowError("Please select a role");
      return;
    }
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const startEditing = (user) => {
    setEditingUser(user.id);
    setNewRole(user.role || 'owner');
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setNewRole("");
  };

  // Handle loading states
  if (loadingStats || loadingUsers) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  const stats = adminStats || {
    total_users: 0,
    active_users: 0,
    inactive_users: 0,
    total_businesses: 0,
    admin_users: 0,
    data_entry_users: 0,
    owner_users: 0
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
            Admin Dashboard
            <Shield className="w-8 h-8 text-red-500" />
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome, {user?.full_name || 'Admin'}. Manage all users and system overview
          </p>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            User role updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {showError && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {showError}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={stats.total_users || 0}
          icon={Users}
          color="blue"
          subtitle={`${stats.active_users || 0} active`}
        />
        <MetricCard
          title="Businesses"
          value={stats.total_businesses || 0}
          icon={Building2}
          color="green"
          subtitle="Total registered"
        />
        <MetricCard
          title="Admin Users"
          value={stats.admin_users || 0}
          icon={Shield}
          color="red"
          subtitle="System administrators"
        />
        <MetricCard
          title="Data Entry Users"
          value={stats.data_entry_users || 0}
          icon={UserCheck}
          color="purple"
          subtitle="Data entry staff"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              Owner Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stats.owner_users || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Business owners</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stats.active_users || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserX className="w-5 h-5 text-orange-600" />
              Inactive Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stats.inactive_users || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Disabled accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Management */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Businesses</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userItem) => (
                      <tr key={userItem.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{userItem.full_name || userItem.username}</p>
                            <p className="text-xs text-gray-500">{userItem.username}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{userItem.email || 'N/A'}</td>
                        <td className="py-3 px-4">
                          {editingUser === userItem.id ? (
                            <Select value={newRole} onValueChange={setNewRole}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="owner">Owner</SelectItem>
                                <SelectItem value="data_entry">Data Entry</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              userItem.role === 'admin' ? 'bg-red-100 text-red-800' :
                              userItem.role === 'data_entry' ? 'bg-purple-100 text-purple-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {userItem.role === 'admin' ? 'Admin' :
                               userItem.role === 'data_entry' ? 'Data Entry' :
                               'Owner'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{userItem.businesses_count || 0}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            userItem.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {userItem.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {editingUser === userItem.id ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleRoleUpdate(userItem.id)}
                                disabled={updateRoleMutation.isPending}
                                className="h-7 px-2"
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                                className="h-7 px-2"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(userItem)}
                              className="h-7 px-2"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Users */}
      {stats.recent_users && stats.recent_users.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              Recent Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent_users.slice(0, 5).map((recentUser) => {
                const fullUser = users.find(u => u.id === recentUser.id);
                return (
                  <div
                    key={recentUser.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{fullUser?.full_name || recentUser.username}</p>
                      <p className="text-sm text-gray-500">{recentUser.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(recentUser.date_joined).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
