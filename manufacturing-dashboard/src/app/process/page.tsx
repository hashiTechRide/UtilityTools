"use client";

import React, { useState, useCallback } from "react";
import { GripVertical, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";
import {
  initialOrders,
  processColumns,
  type ManufacturingOrder,
  type ProcessStatus,
} from "@/data/mock";

const priorityConfig = {
  high: { label: "高", variant: "destructive" as const },
  medium: { label: "中", variant: "warning" as const },
  low: { label: "低", variant: "secondary" as const },
};

const progressForStatus: Record<ProcessStatus, number> = {
  pending: 0,
  setup: 15,
  processing: 50,
  inspection: 85,
  completed: 100,
};

export default function ProcessPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<ManufacturingOrder[]>(initialOrders);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [dragItem, setDragItem] = useState<string | null>(null);

  const handleDragStart = useCallback((orderId: string) => {
    setDragItem(orderId);
  }, []);

  const handleDrop = useCallback(
    (targetStatus: ProcessStatus) => {
      if (!dragItem) return;
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== dragItem) return order;
          const newProgress = progressForStatus[targetStatus];
          toast(
            `${order.orderNumber} を「${processColumns.find((c) => c.id === targetStatus)?.title}」に移動しました`,
            "info"
          );
          return { ...order, status: targetStatus, progress: newProgress };
        })
      );
      setDragItem(null);
    },
    [dragItem, toast]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold lg:text-3xl">工程管理</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView("kanban")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              view === "kanban"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            カンバン
          </button>
          <button
            onClick={() => setView("table")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              view === "table"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            テーブル
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        /* Kanban Board */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {processColumns.map((col) => {
            const columnOrders = orders.filter((o) => o.status === col.id);
            return (
              <div
                key={col.id}
                className="min-w-[260px] flex-1"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(col.id)}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{col.title}</h3>
                  <Badge variant="secondary">{columnOrders.length}</Badge>
                </div>
                <div className="space-y-2 rounded-lg bg-muted/50 p-2 min-h-[200px]">
                  {columnOrders.map((order) => (
                    <div
                      key={order.id}
                      draggable
                      onDragStart={() => handleDragStart(order.id)}
                      className={cn(
                        "cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing",
                        dragItem === order.id && "opacity-50"
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground">
                          {order.orderNumber}
                        </span>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">{order.product}</p>
                      <p className="text-xs text-muted-foreground">
                        数量: {order.quantity.toLocaleString()} | 担当: {order.assignee}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant={priorityConfig[order.priority].variant}>
                          {priorityConfig[order.priority].label}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {order.dueDate}
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${order.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">製造指示一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">指示番号</th>
                    <th className="pb-3 pr-4 font-medium">製品</th>
                    <th className="pb-3 pr-4 text-right font-medium">数量</th>
                    <th className="pb-3 pr-4 font-medium">ステータス</th>
                    <th className="pb-3 pr-4 font-medium">優先度</th>
                    <th className="pb-3 pr-4 font-medium">担当</th>
                    <th className="pb-3 pr-4 font-medium">納期</th>
                    <th className="pb-3 font-medium">進捗</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="py-3 pr-4 font-mono text-xs">{order.orderNumber}</td>
                      <td className="py-3 pr-4">{order.product}</td>
                      <td className="py-3 pr-4 text-right">{order.quantity.toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline">
                          {processColumns.find((c) => c.id === order.status)?.title}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={priorityConfig[order.priority].variant}>
                          {priorityConfig[order.priority].label}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">{order.assignee}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{order.dueDate}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${order.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {order.progress}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
