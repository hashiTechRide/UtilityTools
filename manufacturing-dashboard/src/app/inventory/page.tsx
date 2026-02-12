"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Search, Plus, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/toast";
import { inventoryItems, inventoryTrend, type InventoryItem } from "@/data/mock";

const statusLabel: Record<InventoryItem["status"], { text: string; variant: "success" | "warning" | "destructive" | "default" }> = {
  normal: { text: "正常", variant: "success" },
  low: { text: "低在庫", variant: "warning" },
  shortage: { text: "欠品", variant: "destructive" },
  excess: { text: "過剰", variant: "default" },
};

export default function InventoryPage() {
  const { toast } = useToast();
  const [items, setItems] = useState(inventoryItems);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"in" | "out">("in");
  const [modalQuantity, setModalQuantity] = useState("");
  const [modalTarget, setModalTarget] = useState<InventoryItem | null>(null);

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))), [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.partNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [items, search, categoryFilter, statusFilter]);

  const openModal = (type: "in" | "out", item: InventoryItem) => {
    setModalType(type);
    setModalTarget(item);
    setModalQuantity("");
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!modalTarget || !modalQuantity) return;
    const qty = parseInt(modalQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      toast("数量は正の整数を入力してください", "error");
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== modalTarget.id) return item;
        const newStock = modalType === "in" ? item.currentStock + qty : item.currentStock - qty;
        if (newStock < 0) {
          toast("在庫数が不足しています", "error");
          return item;
        }
        let status: InventoryItem["status"] = "normal";
        if (newStock <= 0) status = "shortage";
        else if (newStock < item.safetyStock) status = "low";
        else if (newStock > item.safetyStock * 3) status = "excess";
        return { ...item, currentStock: newStock, status, lastUpdated: new Date().toISOString().split("T")[0] };
      })
    );

    toast(
      `${modalTarget.name} の${modalType === "in" ? "入庫" : "出庫"}を登録しました（${qty}${modalTarget.unit}）`,
      "success"
    );
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold lg:text-3xl">在庫管理</h1>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label className="mb-1.5 block text-xs">品番・品名検索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="品番または品名で検索..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-40">
              <Label className="mb-1.5 block text-xs">カテゴリ</Label>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">すべて</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <Label className="mb-1.5 block text-xs">在庫状態</Label>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">すべて</option>
                <option value="normal">正常</option>
                <option value="low">低在庫</option>
                <option value="shortage">欠品</option>
                <option value="excess">過剰</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Inventory Table */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">在庫一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">品番</th>
                    <th className="pb-3 pr-4 font-medium">品名</th>
                    <th className="pb-3 pr-4 font-medium">カテゴリ</th>
                    <th className="pb-3 pr-4 text-right font-medium">現在庫</th>
                    <th className="pb-3 pr-4 text-right font-medium">安全在庫</th>
                    <th className="pb-3 pr-4 font-medium">状態</th>
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const sl = statusLabel[item.status];
                    return (
                      <tr
                        key={item.id}
                        className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                        onClick={() => setSelectedItem(item)}
                      >
                        <td className="py-3 pr-4 font-mono text-xs">{item.partNumber}</td>
                        <td className="py-3 pr-4">{item.name}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{item.category}</td>
                        <td className="py-3 pr-4 text-right font-medium">
                          {item.currentStock.toLocaleString()} {item.unit}
                        </td>
                        <td className="py-3 pr-4 text-right text-muted-foreground">
                          {item.safetyStock.toLocaleString()} {item.unit}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={sl.variant}>{sl.text}</Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="outline" onClick={() => openModal("in", item)}>
                              <ArrowDownToLine className="mr-1 h-3 w-3" />
                              入庫
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openModal("out", item)}>
                              <ArrowUpFromLine className="mr-1 h-3 w-3" />
                              出庫
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredItems.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">該当する在庫データがありません</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              在庫推移{selectedItem ? ` - ${selectedItem.name}` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value) => [`${value}`, "在庫数"]}
                  />
                  <Bar dataKey="stock" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* In/Out Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalType === "in" ? "入庫登録" : "出庫登録"}
            </DialogTitle>
            <DialogDescription>
              {modalTarget?.name}（{modalTarget?.partNumber}）
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-1.5 block">現在庫数</Label>
              <p className="text-lg font-bold">
                {modalTarget?.currentStock.toLocaleString()} {modalTarget?.unit}
              </p>
            </div>
            <div>
              <Label htmlFor="quantity" className="mb-1.5 block">
                {modalType === "in" ? "入庫" : "出庫"}数量
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={modalQuantity}
                onChange={(e) => setModalQuantity(e.target.value)}
                placeholder="数量を入力"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSubmit}>
              <Plus className="mr-1 h-4 w-4" />
              登録
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
