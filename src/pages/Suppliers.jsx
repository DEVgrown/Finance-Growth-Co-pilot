import React, { useState } from "react";
import apiClient from "../lib/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

import SupplierForm from "../components/suppliers/SupplierForm";
import SupplierList from "../components/suppliers/SupplierList";

export default function Suppliers() {
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const queryClient = useQueryClient();
  const { getBusinesses, activeBusinessId, user } = useAuth();
  const businesses = getBusinesses();
  const businessId = activeBusinessId || businesses[0]?.id;

  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ['suppliers', businessId],
    queryFn: async () => {
      try {
        if (!businessId) {
          return [];
        }
        const queryString = new URLSearchParams({ business: businessId }).toString();
        return await apiClient.get(`/finance/suppliers/?${queryString}`);
      } catch (error) {
        console.error('Failed to load suppliers:', error);
        return [];
      }
    },
    enabled: !!businessId,
    initialData: [],
    retry: false
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const supplierData = {
        business: businessId,
        user: user?.id,
        supplier_name: data.supplier_name,
        contact_person: data.contact_person || '',
        email: data.email || '',
        phone_number: data.phone_number,
        address: data.address || '',
        city: data.city || '',
        country: data.country || 'Kenya',
        category: data.category || '',
        tax_id: data.tax_id || '',
        registration_number: data.registration_number || '',
        status: data.status || 'active',
        reliability_score: data.reliability_score || null,
        payment_terms: data.payment_terms || '',
        credit_limit: data.credit_limit || null,
        notes: data.notes || '',
        tags: data.tags || []
      };
      return await apiClient.post('/finance/suppliers/', supplierData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setShowForm(false);
      setEditingSupplier(null);
      toast.success('Supplier created successfully');
    },
    onError: (error) => {
      console.error('Supplier creation error:', error);
      toast.error(error.message || 'Failed to create supplier');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await apiClient.put(`/finance/suppliers/${id}/`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setShowForm(false);
      setEditingSupplier(null);
      toast.success('Supplier updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update supplier');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await apiClient.delete(`/finance/suppliers/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete supplier');
    }
  });

  const handleSubmit = (data) => {
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const preferredSuppliers = suppliers.filter(s => s.status === 'preferred');
  const activeSuppliers = suppliers.filter(s => s.status === 'active');

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage your business suppliers and relationships</p>
        </div>
        <Button
          onClick={() => {
            setEditingSupplier(null);
            setShowForm(!showForm);
          }}
          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Total Suppliers</p>
            <p className="text-3xl font-bold text-gray-900">{suppliers.length}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Preferred Suppliers</p>
            <p className="text-3xl font-bold text-gray-900">{preferredSuppliers.length}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-teal-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Active Suppliers</p>
            <p className="text-3xl font-bold text-gray-900">{activeSuppliers.length}</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <SupplierForm
          supplier={editingSupplier}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingSupplier(null);
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}

      <SupplierList
        suppliers={suppliers}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={deleteMutation.mutate}
      />
    </div>
  );
}


