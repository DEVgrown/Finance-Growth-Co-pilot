import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import base44 from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AIAlerts({ insights }) {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: (insightId) => base44.entities.AIInsight.update(insightId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    }
  });

  return (
    <div className="space-y-3">
      {insights.map((insight) => (
        <Alert key={insight.id} className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-red-900">{insight.title}</p>
              <p className="text-sm text-red-700 mt-1">{insight.description}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => markAsReadMutation.mutate(insight.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}


