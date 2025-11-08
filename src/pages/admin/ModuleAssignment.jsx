import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Package, Users, Building2, CheckCircle, XCircle,
  Settings, Shield, BarChart3, FileText, DollarSign
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const MODULES = [
  {
    id: 'transactions',
    name: 'Transactions',
    description: 'Manage income and expenses',
    icon: DollarSign,
    color: 'bg-green-100 text-green-700'
  },
  {
    id: 'invoices',
    name: 'Invoices',
    description: 'Create and manage invoices',
    icon: FileText,
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Financial reports and insights',
    icon: BarChart3,
    color: 'bg-purple-100 text-purple-700'
  },
  {
    id: 'team',
    name: 'Team Management',
    description: 'Manage team members',
    icon: Users,
    color: 'bg-orange-100 text-orange-700'
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Business settings and configuration',
    icon: Settings,
    color: 'bg-gray-100 text-gray-700'
  }
];

export default function ModuleAssignment() {
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const queryClient = useQueryClient();

  // Fetch businesses
  const { data: businesses = [], isLoading: businessesLoading } = useQuery({
    queryKey: ['businesses-list'],
    queryFn: async () => {
      const response = await apiClient.request('/core/admin/businesses/');
      return response;
    },
    staleTime: 60000
  });

  // Fetch module assignments for selected business
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['module-assignments', selectedBusiness?.id],
    queryFn: async () => {
      if (!selectedBusiness) return [];
      const response = await apiClient.request(`/core/admin/businesses/${selectedBusiness.id}/modules/`);
      return response;
    },
    enabled: !!selectedBusiness,
    staleTime: 30000
  });

  // Toggle module mutation
  const toggleModuleMutation = useMutation({
    mutationFn: ({ businessId, moduleId, enabled }) =>
      apiClient.request(`/core/admin/businesses/${businessId}/modules/${moduleId}/`, {
        method: 'POST',
        data: { enabled }
      }),
    onSuccess: () => {
      toast.success('Module updated successfully');
      queryClient.invalidateQueries({ queryKey: ['module-assignments'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update module');
    }
  });

  const isModuleEnabled = (moduleId) => {
    return assignments.some(a => a.module_id === moduleId && a.enabled);
  };

  if (businessesLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading businesses..." />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-600" />
          Module Assignment
        </h1>
        <p className="text-gray-600 mt-1">
          Assign and manage modules for businesses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Businesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {businesses.map((business) => (
                <button
                  key={business.id}
                  onClick={() => setSelectedBusiness(business)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedBusiness?.id === business.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium text-gray-900">{business.legal_name}</p>
                  <p className="text-xs text-gray-500">{business.business_type}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module Assignment */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedBusiness ? `Modules for ${selectedBusiness.legal_name}` : 'Select a Business'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedBusiness ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a business to manage modules</p>
              </div>
            ) : assignmentsLoading ? (
              <LoadingSpinner text="Loading modules..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODULES.map((module) => {
                  const Icon = module.icon;
                  const enabled = isModuleEnabled(module.id);
                  
                  return (
                    <Card
                      key={module.id}
                      className={`border-2 transition-all ${
                        enabled ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${module.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <button
                            onClick={() => {
                              toggleModuleMutation.mutate({
                                businessId: selectedBusiness.id,
                                moduleId: module.id,
                                enabled: !enabled
                              });
                            }}
                            disabled={toggleModuleMutation.isPending}
                            className={`p-2 rounded-full transition-colors ${
                              enabled
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          >
                            {enabled ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <XCircle className="w-5 h-5 text-white" />
                            )}
                          </button>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{module.name}</h3>
                        <p className="text-sm text-gray-600">{module.description}</p>
                        <Badge className={`mt-3 ${enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
