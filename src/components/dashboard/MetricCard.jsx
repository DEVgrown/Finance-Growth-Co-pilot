import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

const colorSchemes = {
  green: {
    bg: "from-green-50 to-emerald-50",
    icon: "bg-green-100",
    iconColor: "text-green-600",
    trend: "text-green-600"
  },
  red: {
    bg: "from-red-50 to-rose-50",
    icon: "bg-red-100",
    iconColor: "text-red-600",
    trend: "text-red-600"
  },
  blue: {
    bg: "from-blue-50 to-cyan-50",
    icon: "bg-blue-100",
    iconColor: "text-blue-600",
    trend: "text-blue-600"
  },
  purple: {
    bg: "from-purple-50 to-indigo-50",
    icon: "bg-purple-100",
    iconColor: "text-purple-600",
    trend: "text-purple-600"
  },
  orange: {
    bg: "from-orange-50 to-amber-50",
    icon: "bg-orange-100",
    iconColor: "text-orange-600",
    trend: "text-orange-600"
  }
};

export default function MetricCard({ title, value, icon: Icon, trend, trendUp, subtitle, color = "blue" }) {
  const scheme = colorSchemes[color];

  return (
    <Card className={`border-none shadow-lg bg-gradient-to-br ${scheme.bg} hover:shadow-xl transition-shadow duration-300`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{value}</h3>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${scheme.icon}`}>
            <Icon className={`w-6 h-6 ${scheme.iconColor}`} />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${scheme.trend}`}>
            {trendUp ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{trend}</span>
            <span className="text-gray-500 ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
