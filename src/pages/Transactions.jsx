import React, { useState } from "react";
import apiClient from "../lib/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { CardSkeleton, TableSkeleton } from "../components/ui/skeleton";

import TransactionForm from "../components/transactions/TransactionForm";
import TransactionList from "../components/transactions/TransactionList";
import TransactionFilters from "../components/transactions/TransactionFilters";
import TransactionStats from "../components/transactions/TransactionStats";

export default function Transactions() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({ type: "all", category: "all", source: "all" });
  const queryClient = useQueryClient();
  const { getBusinesses, activeBusinessId, user } = useAuth();
  const businesses = getBusinesses();
  const businessId = activeBusinessId || businesses[0]?.id;

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', businessId],
    queryFn: async () => {
      if (!businessId) {
        return [];
      }
      const params = { business: businessId };
      return await apiClient.getTransactions(params);
    },
    enabled: !!businessId,
    initialData: [],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0 // Always consider data stale to force refetch
  });
  
  if (!businessId) {
    return (
      <div className="p-4 md:p-8 space-y-6 bg-white min-h-screen">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Business Selected</h2>
          <p className="text-gray-600">Please select a business to view transactions.</p>
        </div>
      </div>
    );
  }

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (!businessId) {
        throw new Error('No business selected. Please select a business first.');
      }
      const transactionData = {
        business: businessId,
        user: user?.id,
        amount: parseFloat(data.amount),
        currency: data.currency || 'KES',
        transaction_type: data.type || data.transaction_type,
        category: data.category || 'other',
        description: data.description || data.category || 'Transaction',
        payment_method: data.source || data.payment_method || 'mpesa',
        transaction_date: data.transaction_date || new Date().toISOString().split('T')[0],
        party_name: data.party_name || '',
        notes: data.notes || '',
        status: 'completed'
      };
      return await apiClient.createTransaction(transactionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
      setShowForm(false);
      setEditingTransaction(null);
      toast.success('Transaction created successfully');
    },
    onError: (error) => {
      console.error('Transaction creation error:', error);
      toast.error(error.message || 'Failed to create transaction');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await apiClient.request(`/finance/transactions/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowForm(false);
      setEditingTransaction(null);
      toast.success('Transaction updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update transaction');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await apiClient.request(`/finance/transactions/${id}/`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete transaction');
    }
  });

  const handleSubmit = (data) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const filteredTransactions = transactions.filter(t => {
    const typeMatch = filters.type === "all" || 
      (t.transaction_type || t.type) === filters.type;
    const categoryMatch = filters.category === "all" || 
      (t.category || '') === filters.category;
    const sourceMatch = filters.source === "all" || 
      (t.payment_method || t.source) === filters.source;
    return typeMatch && categoryMatch && sourceMatch;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Status'];
    const rows = filteredTransactions.map(t => [
      t.transaction_date || '',
      t.transaction_type || t.type || '',
      t.category || '',
      t.description || '',
      t.amount || 0,
      t.payment_method || t.source || '',
      t.status || 'completed'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="p-4 md:p-8 space-y-6 bg-white min-h-screen">
        <CardSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Track all your income and expenses</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={filteredTransactions.length === 0}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => {
              setEditingTransaction(null);
              setShowForm(!showForm);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      <TransactionStats transactions={filteredTransactions} isLoading={isLoading} />

      <TransactionFilters filters={filters} onFilterChange={setFilters} />

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}

      <TransactionList
        transactions={filteredTransactions}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={deleteMutation.mutate}
      />
    </div>
  );
}


