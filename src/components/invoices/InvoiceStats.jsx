import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, Clock, CheckCircle, XCircle } from "lucide-react";

export default function InvoiceStats({ invoices }) {
  const stats = [
    {
      label: "Total Invoices",
      value: invoices.length,
      icon: Receipt,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      label: "Pending",
      value: invoices.filter(i => i.status === 'sent').length,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Paid",
      value: invoices.filter(i => i.status === 'paid').length,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      label: "Overdue",
      value: invoices.filter(i => i.status === 'overdue').length,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={`border-none shadow-lg ${stat.bg}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
