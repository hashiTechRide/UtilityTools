"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Factory,
  TrendingUp,
  AlertTriangle,
  Target,
  AlertCircle,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  kpiData,
  productionTrend,
  lineStatuses,
  alerts,
  type LineStatus,
} from "@/data/mock";

const statusConfig: Record<
  LineStatus,
  { label: string; color: string; bgColor: string }
> = {
  running: {
    label: "稼働中",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  stopped: {
    label: "停止",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  changeover: {
    label: "段取替え",
    color: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
};

const alertIcons = {
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold lg:text-3xl">ダッシュボード</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="本日の生産数"
          value={kpiData.dailyProduction.toLocaleString()}
          unit="個"
          icon={<Factory className="h-5 w-5" />}
          color="text-blue-600"
        />
        <KpiCard
          title="稼働率"
          value={kpiData.operationRate.toString()}
          unit="%"
          icon={<TrendingUp className="h-5 w-5" />}
          color="text-green-600"
        />
        <KpiCard
          title="不良率"
          value={kpiData.defectRate.toString()}
          unit="%"
          icon={<AlertTriangle className="h-5 w-5" />}
          color="text-red-600"
        />
        <KpiCard
          title="目標達成率"
          value={kpiData.goalAchievement.toString()}
          unit="%"
          icon={<Target className="h-5 w-5" />}
          color="text-purple-600"
        />
      </div>

      {/* Charts & Status Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Production Trend Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">生産推移（時間帯別）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productionTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value) => [`${value} 個`, "生産数"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="production"
                    stroke="hsl(221.2, 83.2%, 53.3%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(221.2, 83.2%, 53.3%)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Line Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ライン別ステータス</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lineStatuses.map((line) => {
              const config = statusConfig[line.status];
              return (
                <div
                  key={line.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg p-3",
                    config.bgColor
                  )}
                >
                  <div>
                    <p className="font-medium">{line.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {line.product}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        line.status === "running"
                          ? "success"
                          : line.status === "stopped"
                          ? "destructive"
                          : "warning"
                      }
                    >
                      {config.label}
                    </Badge>
                    {line.status === "running" && (
                      <p className="mt-1 text-xs font-medium">
                        進捗 {line.progress}%
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">アラート一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3",
                  alert.type === "error" && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
                  alert.type === "warning" && "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30",
                  alert.type === "info" && "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
                )}
              >
                <div className="mt-0.5">{alertIcons[alert.type]}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {alert.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  title,
  value,
  unit,
  icon,
  color,
}: {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={color}>{icon}</div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </CardContent>
    </Card>
  );
}
