"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Download,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
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
import {
  initialProducts,
  productCategories,
  type Product,
} from "@/data/mock";

type FormErrors = Partial<Record<keyof Product, string>>;

function validateProduct(product: Partial<Product>): FormErrors {
  const errors: FormErrors = {};
  if (!product.code?.trim()) errors.code = "製品コードは必須です";
  if (!product.name?.trim()) errors.name = "製品名は必須です";
  if (!product.category) errors.category = "カテゴリを選択してください";
  if (!product.price || product.price <= 0) errors.price = "単価は正の数を入力してください";
  if (!product.unit?.trim()) errors.unit = "単位は必須です";
  if (!product.leadTime || product.leadTime <= 0) errors.leadTime = "リードタイムは正の数を入力してください";
  return errors;
}

let nextId = 11;

export default function MasterPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    code: "",
    name: "",
    category: "",
    price: 0,
    unit: "",
    leadTime: 0,
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, search, categoryFilter]);

  // --- Add ---
  const handleAdd = () => {
    const errors = validateProduct(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const newProduct: Product = {
      id: `P${String(nextId++).padStart(3, "0")}`,
      code: formData.code!,
      name: formData.name!,
      category: formData.category!,
      price: formData.price!,
      unit: formData.unit!,
      leadTime: formData.leadTime!,
      isActive: formData.isActive ?? true,
    };
    setProducts((prev) => [...prev, newProduct]);
    toast(`${newProduct.name} を追加しました`, "success");
    setDialogOpen(false);
    setFormData({ code: "", name: "", category: "", price: 0, unit: "", leadTime: 0, isActive: true });
    setFormErrors({});
  };

  // --- Inline edit ---
  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditData({ ...product });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = () => {
    if (!editingId) return;
    const errors = validateProduct(editData);
    if (Object.keys(errors).length > 0) {
      toast("入力エラーがあります。値を確認してください。", "error");
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === editingId ? { ...p, ...editData } as Product : p))
    );
    toast("変更を保存しました", "success");
    setEditingId(null);
    setEditData({});
  };

  // --- Delete ---
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast(`${deleteTarget.name} を削除しました`, "success");
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  // --- CSV Export ---
  const exportCsv = () => {
    const header = "製品コード,製品名,カテゴリ,単価,単位,リードタイム(日),有効";
    const rows = filtered.map(
      (p) => `${p.code},${p.name},${p.category},${p.price},${p.unit},${p.leadTime},${p.isActive ? "有効" : "無効"}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("CSVをエクスポートしました", "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold lg:text-3xl">マスタメンテナンス</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-1 h-4 w-4" />
            CSV出力
          </Button>
          <Button onClick={() => { setFormErrors({}); setDialogOpen(true); }}>
            <Plus className="mr-1 h-4 w-4" />
            新規追加
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label className="mb-1.5 block text-xs">検索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="製品コードまたは製品名で検索..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label className="mb-1.5 block text-xs">カテゴリ</Label>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">すべて</option>
                {productCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">製品マスタ ({filtered.length}件)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-3 font-medium">コード</th>
                  <th className="pb-3 pr-3 font-medium">製品名</th>
                  <th className="pb-3 pr-3 font-medium">カテゴリ</th>
                  <th className="pb-3 pr-3 text-right font-medium">単価</th>
                  <th className="pb-3 pr-3 font-medium">単位</th>
                  <th className="pb-3 pr-3 text-right font-medium">LT(日)</th>
                  <th className="pb-3 pr-3 font-medium">状態</th>
                  <th className="pb-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const isEditing = editingId === product.id;
                  return (
                    <tr key={product.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="py-3 pr-3">
                        {isEditing ? (
                          <Input
                            value={editData.code || ""}
                            onChange={(e) => setEditData((d) => ({ ...d, code: e.target.value }))}
                            className="h-8 w-24 text-xs"
                          />
                        ) : (
                          <span className="font-mono text-xs">{product.code}</span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        {isEditing ? (
                          <Input
                            value={editData.name || ""}
                            onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                            className="h-8 text-xs"
                          />
                        ) : (
                          product.name
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        {isEditing ? (
                          <Select
                            value={editData.category || ""}
                            onChange={(e) => setEditData((d) => ({ ...d, category: e.target.value }))}
                            className="h-8 text-xs"
                          >
                            {productCategories.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </Select>
                        ) : (
                          <span className="text-muted-foreground">{product.category}</span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editData.price || ""}
                            onChange={(e) => setEditData((d) => ({ ...d, price: Number(e.target.value) }))}
                            className="h-8 w-24 text-right text-xs"
                          />
                        ) : (
                          `¥${product.price.toLocaleString()}`
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        {isEditing ? (
                          <Input
                            value={editData.unit || ""}
                            onChange={(e) => setEditData((d) => ({ ...d, unit: e.target.value }))}
                            className="h-8 w-16 text-xs"
                          />
                        ) : (
                          product.unit
                        )}
                      </td>
                      <td className="py-3 pr-3 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editData.leadTime || ""}
                            onChange={(e) => setEditData((d) => ({ ...d, leadTime: Number(e.target.value) }))}
                            className="h-8 w-16 text-right text-xs"
                          />
                        ) : (
                          product.leadTime
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <Badge variant={product.isActive ? "success" : "secondary"}>
                          {product.isActive ? "有効" : "無効"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={saveEdit}>
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => startEdit(product)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setDeleteTarget(product);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">該当する製品データがありません</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>製品マスタ追加</DialogTitle>
            <DialogDescription>新しい製品を登録します</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">製品コード *</Label>
                <Input
                  value={formData.code || ""}
                  onChange={(e) => setFormData((d) => ({ ...d, code: e.target.value }))}
                  placeholder="例: G-700"
                />
                {formErrors.code && <p className="mt-1 text-xs text-destructive">{formErrors.code}</p>}
              </div>
              <div>
                <Label className="mb-1.5 block">カテゴリ *</Label>
                <Select
                  value={formData.category || ""}
                  onChange={(e) => setFormData((d) => ({ ...d, category: e.target.value }))}
                >
                  <option value="">選択してください</option>
                  {productCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
                {formErrors.category && <p className="mt-1 text-xs text-destructive">{formErrors.category}</p>}
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">製品名 *</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                placeholder="例: 油圧ポンプ TypeA"
              />
              {formErrors.name && <p className="mt-1 text-xs text-destructive">{formErrors.name}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="mb-1.5 block">単価 *</Label>
                <Input
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => setFormData((d) => ({ ...d, price: Number(e.target.value) }))}
                  placeholder="0"
                />
                {formErrors.price && <p className="mt-1 text-xs text-destructive">{formErrors.price}</p>}
              </div>
              <div>
                <Label className="mb-1.5 block">単位 *</Label>
                <Input
                  value={formData.unit || ""}
                  onChange={(e) => setFormData((d) => ({ ...d, unit: e.target.value }))}
                  placeholder="例: 個"
                />
                {formErrors.unit && <p className="mt-1 text-xs text-destructive">{formErrors.unit}</p>}
              </div>
              <div>
                <Label className="mb-1.5 block">リードタイム(日) *</Label>
                <Input
                  type="number"
                  value={formData.leadTime || ""}
                  onChange={(e) => setFormData((d) => ({ ...d, leadTime: Number(e.target.value) }))}
                  placeholder="0"
                />
                {formErrors.leadTime && <p className="mt-1 text-xs text-destructive">{formErrors.leadTime}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="mr-1 h-4 w-4" />
              追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>削除確認</DialogTitle>
            <DialogDescription>
              「{deleteTarget?.name}」（{deleteTarget?.code}）を削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="mr-1 h-4 w-4" />
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
