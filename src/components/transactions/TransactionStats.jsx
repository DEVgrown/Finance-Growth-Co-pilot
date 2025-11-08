import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function TransactionStats({ transactions, isLoading }) {
  // Handle both 'type' and 'transaction_type' fields
  const income = transactions.filter(t => (t.type || t.transaction_type) === 'income').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const expenses = transactions.filter(t => (t.type || t.transaction_type) === 'expense').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const net = income - expenses;

  const stats = [
    {
      label: "Total Income",
      value: income,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      label: "Total Expenses",
      value: expenses,
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      label: "Net Balance",
      value: net,
      icon: Activity,
      color: net >= 0 ? "text-blue-600" : "text-orange-600",
      bg: net >= 0 ? "bg-blue-50" : "bg-orange-50"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label} className={`border-none shadow-lg ${stat.bg}`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className={`text-3xl font-bold mt-2 ${stat.color}`}>
                  KES {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


