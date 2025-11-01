import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";
import { format } from "date-fns";

const priorityConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-800",
    border: "border-red-200"
  },
  high: {
    icon: AlertCircle,
    color: "text-orange-600",
    bg: "bg-orange-50",
    badge: "bg-orange-100 text-orange-800",
    border: "border-orange-200"
  },
  medium: {
    icon: Info,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    badge: "bg-yellow-100 text-yellow-800",
    border: "border-yellow-200"
  },
  low: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-800",
    border: "border-blue-200"
  }
};

const typeLabels = {
  overdue_invoice: "Overdue Invoice",
  negative_cash_flow: "Cash Flow Alert",
  high_expense_category: "Expense Analysis",
  upcoming_payment: "Payment Reminder",
  low_credit_score: "Credit Warning",
  supplier_issue: "Supplier Alert"
};

export default function AlertCard({ alert, onResolve }) {
  const config = priorityConfig[alert.priority] || priorityConfig.low;
  const Icon = config.icon;

  return (
    <Card className={`border-2 ${config.border} ${config.bg}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-xl ${config.bg}`}>
              <Icon className={`w-6 h-6 ${config.color}`} />
            </div>
            <div>
              <CardTitle className="text-xl">{alert.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={config.badge}>
                  {alert.priority}
                </Badge>
                <Badge variant="outline">
                  {typeLabels[alert.alert_type] || alert.alert_type}
                </Badge>
                {alert.status === 'resolved' && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Resolved
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {alert.status === 'active' && (
            <Button
              onClick={onResolve}
              className="bg-gradient-to-r from-green-600 to-teal-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Resolved
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">{alert.message}</p>

        {alert.suggested_action && (
          <div className={`p-4 rounded-lg border-2 ${config.border} bg-white`}>
            <div className="flex items-start gap-2">
              <Zap className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
              <div>
                <p className="font-semibold text-gray-900 mb-1">Suggested Action</p>
                <p className="text-sm text-gray-700">{alert.suggested_action}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Created: {format(new Date(alert.created_date), 'MMM dd, yyyy h:mm a')}</span>
          </div>
          {alert.resolved_date && (
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Resolved: {format(new Date(alert.resolved_date), 'MMM dd, yyyy h:mm a')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


