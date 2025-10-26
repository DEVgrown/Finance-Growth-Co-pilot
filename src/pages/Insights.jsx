import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800"
};

const typeIcons = {
  cash_flow: TrendingUp,
  expense_optimization: AlertCircle,
  revenue_growth: Sparkles,
  supplier_negotiation: Lightbulb,
  credit_improvement: CheckCircle,
  market_opportunity: TrendingUp,
  risk_alert: AlertCircle
};

export default function Insights() {
  const queryClient = useQueryClient();

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: () => base44.entities.AIInsight.list('-created_date'),
    initialData: []
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.AIInsight.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    }
  });

  const markAsActionedMutation = useMutation({
    mutationFn: (id) => base44.entities.AIInsight.update(id, { is_actioned: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    }
  });

  const unreadInsights = insights.filter(i => !i.is_read);
  const actionedInsights = insights.filter(i => i.is_actioned);

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-600" />
            AI Insights
          </h1>
          <p className="text-gray-600 mt-1">Actionable recommendations powered by AI</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">Total Insights</p>
            <p className="text-3xl font-bold text-purple-600">{insights.length}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">Unread</p>
            <p className="text-3xl font-bold text-orange-600">{unreadInsights.length}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">Actioned</p>
            <p className="text-3xl font-bold text-green-600">{actionedInsights.length}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">Critical</p>
            <p className="text-3xl font-bold text-red-600">
              {insights.filter(i => i.priority === 'critical').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => {
          const Icon = typeIcons[insight.insight_type] || Lightbulb;
          return (
            <Card
              key={insight.id}
              className={`border-none shadow-lg ${insight.is_read ? 'opacity-75' : ''}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-yellow-100 rounded-xl">
                      <Icon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{insight.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={priorityColors[insight.priority]}>
                          {insight.priority}
                        </Badge>
                        <Badge variant="outline">
                          {insight.insight_type.replace(/_/g, ' ')}
                        </Badge>
                        {insight.is_actioned && (
                          <Badge className="bg-green-100 text-green-800">
                            Actioned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{insight.description}</p>

                {insight.potential_impact && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">Potential Impact</p>
                    <p className="text-sm text-gray-700">{insight.potential_impact}</p>
                  </div>
                )}

                {insight.action_items && insight.action_items.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Action Items:</p>
                    <ul className="space-y-2">
                      {insight.action_items.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {!insight.is_read && (
                    <Button
                      variant="outline"
                      onClick={() => markAsReadMutation.mutate(insight.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                  {!insight.is_actioned && (
                    <Button
                      onClick={() => markAsActionedMutation.mutate(insight.id)}
                      className="bg-gradient-to-r from-green-600 to-teal-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Actioned
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {insights.length === 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Insights Yet</h3>
              <p className="text-gray-600">
                AI insights will appear here as your business data grows
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
