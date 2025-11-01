import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, TrendingUp, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function CreditScore({ business }) {
  const score = business?.credit_score || 0;
  
  const getScoreColor = (score) => {
    if (score >= 75) return { bg: "from-green-50 to-emerald-50", text: "text-green-600", progress: "bg-green-600" };
    if (score >= 50) return { bg: "from-yellow-50 to-orange-50", text: "text-yellow-600", progress: "bg-yellow-600" };
    return { bg: "from-red-50 to-rose-50", text: "text-red-600", progress: "bg-red-600" };
  };

  const getScoreRating = (score) => {
    if (score >= 75) return "Excellent";
    if (score >= 50) return "Good";
    if (score >= 25) return "Fair";
    return "Needs Improvement";
  };

  const colors = getScoreColor(score);

  return (
    <Card className={`border-none shadow-lg bg-gradient-to-br ${colors.bg}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className={`w-5 h-5 ${colors.text}`} />
          Your Credit Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className={`text-5xl font-bold ${colors.text}`}>{score}</p>
            <p className="text-sm text-gray-600 mt-1">{getScoreRating(score)}</p>
          </div>
        </div>
        <Progress value={score} className={`h-3 ${colors.progress}`} />
        <p className="text-xs text-gray-500 mt-2">Based on transaction history and business performance</p>
      </CardContent>
    </Card>
  );
}


