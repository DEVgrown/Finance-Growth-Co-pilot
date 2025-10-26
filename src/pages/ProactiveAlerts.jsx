import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  Zap,
  CheckCircle,
  RefreshCw
} from "lucide-react";

import AlertCard from "../components/alerts/AlertCard";
import AlertFilters from "../components/alerts/AlertFilters";

export default function ProactiveAlerts() {
  const [filters, setFilters] = useState({ priority: "all", type: "all", status: "active" });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ['proactive-alerts'],
    queryFn: () => base44.entities.ProactiveAlert.list('-created_date'),
    initialData: []
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-transaction_date', 90),
    initialData: []
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date'),
    initialData: []
  });

  const runMonitoringMutation = useMutation({
    mutationFn: async () => {
      setIsMonitoring(true);
      const newAlerts = await monitorFinancialHealth();
      return newAlerts;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proactive-alerts'] });
      setIsMonitoring(false);
    }
  });

  const resolveAlertMutation = useMutation({
    mutationFn: (alertId) => base44.entities.ProactiveAlert.update(alertId, { 
      status: 'resolved',
      resolved_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proactive-alerts'] });
    }
  });

  const monitorFinancialHealth = async () => {
    const alerts = [];

    // Check 1: Overdue Invoices
    const overdueInvoices = invoices.filter(i => {
      if (i.status !== 'sent') return false;
      const dueDate = new Date(i.due_date);
      return dueDate < new Date();
    });

    if (overdueInvoices.length > 0) {
      const totalOverdue = overdueInvoices.reduce((sum, i) => sum + i.total_amount, 0);
      await base44.entities.ProactiveAlert.create({
        alert_type: "overdue_invoice",
        priority: overdueInvoices.length > 5 ? "critical" : "high",
        title: `${overdueInvoices.length} Overdue Invoices Detected`,
        message: `You have ${overdueInvoices.length} overdue invoices totaling KES ${totalOverdue.toLocaleString()}. Consider sending payment reminders.`,
        suggested_action: "Send automated payment reminders via n8n workflow",
        affected_entities: overdueInvoices.map(i => i.id),
        status: "active"
      });
    }

    // Check 2: Low Cash Flow
    const last30Days = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date >= thirtyDaysAgo;
    });

    const income = last30Days.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = last30Days.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netFlow = income - expenses;

    if (netFlow < 0) {
      await base44.entities.ProactiveAlert.create({
        alert_type: "negative_cash_flow",
        priority: "critical",
        title: "Negative Cash Flow Alert",
        message: `Your cash flow for the past 30 days is negative (KES ${Math.abs(netFlow).toLocaleString()}). Income: KES ${income.toLocaleString()}, Expenses: KES ${expenses.toLocaleString()}.`,
        suggested_action: "Review expense categories and consider delaying non-essential purchases",
        status: "active"
      });
    }

    // Check 3: High Expense Categories
    const expensesByCategory = {};
    last30Days.filter(t => t.type === 'expense').forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

    const sortedExpenses = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);
    if (sortedExpenses.length > 0) {
      const topCategory = sortedExpenses[0];
      const percentage = (topCategory[1] / expenses) * 100;

      if (percentage > 40) {
        await base44.entities.ProactiveAlert.create({
          alert_type: "high_expense_category",
          priority: "medium",
          title: `High Spending in ${topCategory[0].replace(/_/g, ' ')}`,
          message: `${topCategory[0].replace(/_/g, ' ')} represents ${percentage.toFixed(1)}% of your expenses (KES ${topCategory[1].toLocaleString()}). Consider negotiating better terms with suppliers.`,
          suggested_action: "Review supplier contracts and negotiate volume discounts",
          status: "active"
        });
      }
    }

    // Check 4: Upcoming Invoice Payments
    const upcomingDue = invoices.filter(i => {
      if (i.status !== 'sent') return false;
      const dueDate = new Date(i.due_date);
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      return dueDate <= threeDaysFromNow && dueDate >= new Date();
    });

    if (upcomingDue.length > 0) {
      const totalUpcoming = upcomingDue.reduce((sum, i) => sum + i.total_amount, 0);
      await base44.entities.ProactiveAlert.create({
        alert_type: "upcoming_payment",
        priority: "low",
        title: `${upcomingDue.length} Invoices Due Soon`,
        message: `You have ${upcomingDue.length} invoices totaling KES ${totalUpcoming.toLocaleString()} due within 3 days. Ensure sufficient funds are available.`,
        suggested_action: "Review cash position and prepare for upcoming payments",
        status: "active"
      });
    }

    return alerts;
  };

  const filteredAlerts = alerts.filter(alert => {
    const priorityMatch = filters.priority === "all" || alert.priority === filters.priority;
    const typeMatch = filters.type === "all" || alert.alert_type === filters.type;
    const statusMatch = filters.status === "all" || alert.status === filters.status;
    return priorityMatch && typeMatch && statusMatch;
  });

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalAlerts = activeAlerts.filter(a => a.priority === 'critical');

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-orange-600" />
            Proactive Alerts
          </h1>
          <p className="text-gray-600 mt-1">AI-powered monitoring and early warnings</p>
        </div>
        <Button
          onClick={() => runMonitoringMutation.mutate()}
          disabled={isMonitoring}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
        >
          {isMonitoring ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Monitoring...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Run Monitoring
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <Badge className="bg-red-100 text-red-800">{criticalAlerts.length}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">Critical Alerts</p>
            <p className="text-3xl font-bold text-gray-900">{criticalAlerts.length}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Bell className="w-6 h-6 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-800">{activeAlerts.length}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">Active Alerts</p>
            <p className="text-3xl font-bold text-gray-900">{activeAlerts.length}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Resolved Today</p>
            <p className="text-3xl font-bold text-gray-900">
              {alerts.filter(a => {
                if (!a.resolved_date) return false;
                const resolved = new Date(a.resolved_date);
                const today = new Date();
                return resolved.toDateString() === today.toDateString();
              }).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <AlertFilters filters={filters} onFilterChange={setFilters} />

      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onResolve={() => resolveAlertMutation.mutate(alert.id)}
          />
        ))}

        {filteredAlerts.length === 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
              <p className="text-gray-600 mb-6">
                No alerts matching your filters. Your business is running smoothly.
              </p>
              <Button
                onClick={() => runMonitoringMutation.mutate()}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Check Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
