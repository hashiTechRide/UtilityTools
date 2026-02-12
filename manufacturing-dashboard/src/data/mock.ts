// ===== Dashboard =====
export const kpiData = {
  dailyProduction: 1247,
  operationRate: 94.2,
  defectRate: 1.3,
  goalAchievement: 98.5,
};

export const productionTrend = [
  { time: "06:00", production: 45 },
  { time: "07:00", production: 82 },
  { time: "08:00", production: 120 },
  { time: "09:00", production: 115 },
  { time: "10:00", production: 130 },
  { time: "11:00", production: 125 },
  { time: "12:00", production: 60 },
  { time: "13:00", production: 118 },
  { time: "14:00", production: 122 },
  { time: "15:00", production: 128 },
  { time: "16:00", production: 110 },
  { time: "17:00", production: 95 },
];

export type LineStatus = "running" | "stopped" | "changeover";

export const lineStatuses: {
  id: string;
  name: string;
  status: LineStatus;
  product: string;
  progress: number;
}[] = [
  { id: "L1", name: "ライン1", status: "running", product: "製品A-100", progress: 78 },
  { id: "L2", name: "ライン2", status: "running", product: "製品B-200", progress: 52 },
  { id: "L3", name: "ライン3", status: "changeover", product: "製品C-300", progress: 0 },
  { id: "L4", name: "ライン4", status: "running", product: "製品D-400", progress: 91 },
  { id: "L5", name: "ライン5", status: "stopped", product: "-", progress: 0 },
];

export const alerts = [
  { id: 1, type: "error" as const, message: "ライン5: 設備異常により停止中", time: "14:32" },
  { id: 2, type: "warning" as const, message: "ライン3: 段取替え作業中（予定超過15分）", time: "13:45" },
  { id: 3, type: "info" as const, message: "ライン1: 本日の目標生産数を達成", time: "15:10" },
  { id: 4, type: "warning" as const, message: "製品A-100: 原材料在庫が安全在庫を下回りました", time: "12:20" },
  { id: 5, type: "info" as const, message: "ライン4: 製品D-400の生産が完了間近（進捗91%）", time: "15:30" },
];

// ===== Inventory =====
export type InventoryItem = {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  currentStock: number;
  safetyStock: number;
  unit: string;
  status: "normal" | "low" | "excess" | "shortage";
  lastUpdated: string;
};

export const inventoryItems: InventoryItem[] = [
  { id: "INV001", partNumber: "A-100", name: "ベアリング 6205", category: "部品", currentStock: 450, safetyStock: 200, unit: "個", status: "normal", lastUpdated: "2025-01-15" },
  { id: "INV002", partNumber: "A-101", name: "ベアリング 6206", category: "部品", currentStock: 80, safetyStock: 150, unit: "個", status: "low", lastUpdated: "2025-01-15" },
  { id: "INV003", partNumber: "B-200", name: "アルミ板 3mm", category: "素材", currentStock: 1200, safetyStock: 500, unit: "枚", status: "normal", lastUpdated: "2025-01-14" },
  { id: "INV004", partNumber: "B-201", name: "ステンレス板 2mm", category: "素材", currentStock: 30, safetyStock: 100, unit: "枚", status: "shortage", lastUpdated: "2025-01-14" },
  { id: "INV005", partNumber: "C-300", name: "ボルト M8x30", category: "部品", currentStock: 5000, safetyStock: 1000, unit: "本", status: "excess", lastUpdated: "2025-01-15" },
  { id: "INV006", partNumber: "C-301", name: "ナット M8", category: "部品", currentStock: 4800, safetyStock: 1000, unit: "個", status: "excess", lastUpdated: "2025-01-15" },
  { id: "INV007", partNumber: "D-400", name: "モーター 200W", category: "部品", currentStock: 25, safetyStock: 20, unit: "台", status: "normal", lastUpdated: "2025-01-13" },
  { id: "INV008", partNumber: "D-401", name: "モーター 400W", category: "部品", currentStock: 8, safetyStock: 10, unit: "台", status: "low", lastUpdated: "2025-01-13" },
  { id: "INV009", partNumber: "E-500", name: "潤滑油 10W-40", category: "消耗品", currentStock: 200, safetyStock: 50, unit: "L", status: "normal", lastUpdated: "2025-01-12" },
  { id: "INV010", partNumber: "E-501", name: "切削油 VG32", category: "消耗品", currentStock: 45, safetyStock: 50, unit: "L", status: "low", lastUpdated: "2025-01-12" },
];

export const inventoryTrend = [
  { month: "8月", stock: 320 },
  { month: "9月", stock: 280 },
  { month: "10月", stock: 350 },
  { month: "11月", stock: 410 },
  { month: "12月", stock: 380 },
  { month: "1月", stock: 450 },
];

// ===== Process Management =====
export type ProcessStatus = "pending" | "setup" | "processing" | "inspection" | "completed";

export type ManufacturingOrder = {
  id: string;
  orderNumber: string;
  product: string;
  quantity: number;
  status: ProcessStatus;
  priority: "high" | "medium" | "low";
  assignee: string;
  dueDate: string;
  progress: number;
};

export const initialOrders: ManufacturingOrder[] = [
  { id: "MO001", orderNumber: "MO-2025-001", product: "製品A-100", quantity: 500, status: "completed", priority: "high", assignee: "田中", dueDate: "2025-01-15", progress: 100 },
  { id: "MO002", orderNumber: "MO-2025-002", product: "製品B-200", quantity: 300, status: "processing", priority: "high", assignee: "佐藤", dueDate: "2025-01-16", progress: 65 },
  { id: "MO003", orderNumber: "MO-2025-003", product: "製品C-300", quantity: 200, status: "setup", priority: "medium", assignee: "鈴木", dueDate: "2025-01-17", progress: 15 },
  { id: "MO004", orderNumber: "MO-2025-004", product: "製品D-400", quantity: 150, status: "inspection", priority: "medium", assignee: "高橋", dueDate: "2025-01-16", progress: 85 },
  { id: "MO005", orderNumber: "MO-2025-005", product: "製品E-500", quantity: 1000, status: "pending", priority: "low", assignee: "伊藤", dueDate: "2025-01-20", progress: 0 },
  { id: "MO006", orderNumber: "MO-2025-006", product: "製品A-100", quantity: 600, status: "pending", priority: "high", assignee: "渡辺", dueDate: "2025-01-18", progress: 0 },
  { id: "MO007", orderNumber: "MO-2025-007", product: "製品F-600", quantity: 250, status: "processing", priority: "medium", assignee: "山本", dueDate: "2025-01-17", progress: 40 },
  { id: "MO008", orderNumber: "MO-2025-008", product: "製品B-200", quantity: 400, status: "inspection", priority: "low", assignee: "中村", dueDate: "2025-01-18", progress: 90 },
];

export const processColumns: { id: ProcessStatus; title: string }[] = [
  { id: "pending", title: "未着手" },
  { id: "setup", title: "段取り" },
  { id: "processing", title: "加工中" },
  { id: "inspection", title: "検査" },
  { id: "completed", title: "完了" },
];

// ===== Master Maintenance =====
export type Product = {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  leadTime: number;
  isActive: boolean;
};

export const initialProducts: Product[] = [
  { id: "P001", code: "A-100", name: "ベアリングユニット TypeA", category: "機械部品", price: 4500, unit: "個", leadTime: 5, isActive: true },
  { id: "P002", code: "A-101", name: "ベアリングユニット TypeB", category: "機械部品", price: 5200, unit: "個", leadTime: 7, isActive: true },
  { id: "P003", code: "B-200", name: "アルミフレーム 1000mm", category: "構造材", price: 3200, unit: "本", leadTime: 3, isActive: true },
  { id: "P004", code: "B-201", name: "ステンレスフレーム 1000mm", category: "構造材", price: 4800, unit: "本", leadTime: 5, isActive: true },
  { id: "P005", code: "C-300", name: "制御基板 Rev.3", category: "電子部品", price: 12000, unit: "枚", leadTime: 14, isActive: true },
  { id: "P006", code: "C-301", name: "制御基板 Rev.2", category: "電子部品", price: 10000, unit: "枚", leadTime: 14, isActive: false },
  { id: "P007", code: "D-400", name: "DCモーター 200W", category: "駆動部品", price: 18500, unit: "台", leadTime: 10, isActive: true },
  { id: "P008", code: "D-401", name: "DCモーター 400W", category: "駆動部品", price: 25000, unit: "台", leadTime: 10, isActive: true },
  { id: "P009", code: "E-500", name: "センサーモジュール TypeX", category: "電子部品", price: 7800, unit: "個", leadTime: 7, isActive: true },
  { id: "P010", code: "F-600", name: "油圧シリンダー 50mm", category: "駆動部品", price: 32000, unit: "本", leadTime: 21, isActive: true },
];

export const productCategories = ["機械部品", "構造材", "電子部品", "駆動部品"];
