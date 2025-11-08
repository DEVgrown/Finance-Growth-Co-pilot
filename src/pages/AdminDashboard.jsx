import React, { useState } from "react";
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
  X,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { CardSkeleton } from "../components/ui/skeleton";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState("");

  const { data: adminStats, isLoading: loadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      try {
        return await apiClient.getAdminStats();
      } catch (error) {
        console.error('Failed to load admin stats:', error);
        return null;
      }
    },
    enabled: !!user,
    retry: false
  });

  const { data: users = [], isLoading: loadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      try {
        return await apiClient.getAllUsers();
      } catch (error) {
        console.error('Failed to load users:', error);
        return [];
      }
    },
    enabled: !!user,
    retry: false
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      return await apiClient.adminUpdateUserRole(userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      setEditingUser(null);
      setNewRole("");
      setShowSuccess(true);
      toast.success('User role updated successfully!');
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error) => {
      const errorMessage = error.message || "Failed to update user role";
      setShowError(errorMessage);
      toast.error(errorMessage);
      setTimeout(() => setShowError(""), 5000);
    }
  });

  const handleRoleUpdate = (userId) => {
    if (!newRole) {
      setShowError("Please select a role");
      toast.error("Please select a role");
      return;
    }
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const startEditing = (userItem) => {
    setEditingUser(userItem.id);
    setNewRole(userItem.role || 'owner');
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setNewRole("");
  };

  const handleRefresh = () => {
    refetchStats();
    refetchUsers();
    toast.success('Data refreshed');
  };

  // Handle loading states
  if (loadingStats || loadingUsers) {
    return (
      <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
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
    owner_users: 0,
    recent_users: []
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
            Welcome, {user?.full_name || user?.username || 'Admin'}. Manage all users and system overview
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
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
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total_users || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.active_users || 0} active users
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Businesses</CardTitle>
            <Building2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total_businesses || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              Total registered
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Admin Users</CardTitle>
            <Shield className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.admin_users || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              System administrators
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Data Entry Users</CardTitle>
            <UserCheck className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.data_entry_users || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              Data entry staff
            </p>
          </CardContent>
        </Card>
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
                      <tr key={userItem.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
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
                                className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Save className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                                className="h-8 px-3"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(userItem)}
                              className="h-8 px-3 border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
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
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
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
