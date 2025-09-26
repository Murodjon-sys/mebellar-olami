"use client";

import * as React from "react";
import { Navigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
  AlertTriangle,
  Star,
  Eye,
  Clock,
} from "lucide-react";

// Simple Chart Components
const LineChart = ({ data, height = 200, color = "#10b981" }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    const { width, height: canvasHeight } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, canvasHeight);

    // Get data values
    const values = data.map((d) => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    if (maxValue === minValue) return;

    // Draw grid lines
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = (canvasHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = (width / (data.length - 1)) * index;
      const y =
        canvasHeight -
        ((point.value - minValue) / (maxValue - minValue)) * canvasHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    ctx.fillStyle = color;
    data.forEach((point, index) => {
      const x = (width / (data.length - 1)) * index;
      const y =
        canvasHeight -
        ((point.value - minValue) / (maxValue - minValue)) * canvasHeight;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [data, color]);

  return (
    <canvas
      ref={canvasRef}
      width="400"
      height={height}
      className="w-full"
      style={{ height: `${height}px` }}
    />
  );
};

const BarChart = ({ data, height = 200, color = "#3b82f6" }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    const { width, height: canvasHeight } = canvas;

    ctx.clearRect(0, 0, width, canvasHeight);

    const values = data.map((d) => d.value);
    const maxValue = Math.max(...values);

    if (maxValue === 0) return;

    const barWidth = width / data.length - 10;

    data.forEach((item, index) => {
      const x = (width / data.length) * index + 5;
      const barHeight = (item.value / maxValue) * canvasHeight;
      const y = canvasHeight - barHeight;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);
    });
  }, [data, color]);

  return (
    <canvas
      ref={canvasRef}
      width="400"
      height={height}
      className="w-full"
      style={{ height: `${height}px` }}
    />
  );
};

const PieChart = ({ data, size = 200 }) => {
  const canvasRef = React.useRef(null);

  const colors = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
  ];

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;

    ctx.clearRect(0, 0, size, size);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2;

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.closePath();

      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      currentAngle += sliceAngle;
    });
  }, [data, size]);

  return (
    <div className="flex items-center gap-4">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="flex-shrink-0"
      />
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span>
              {item.label}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// KPI Card Component
const KPICard = ({ title, value, change, icon: Icon, format = "number" }) => {
  const formatValue = (val) => {
    if (format === "currency") return `${Number(val).toLocaleString()} so'm`;
    if (format === "percentage") return `${val}%`;
    return Number(val).toLocaleString();
  };

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{formatValue(value)}</p>
          {change !== undefined && (
            <p className="text-xs flex items-center gap-1">
              {isPositive && <TrendingUp className="h-3 w-3 text-green-400" />}
              {isNegative && <TrendingDown className="h-3 w-3 text-red-400" />}
              <span
                className={`${isPositive ? "text-green-400" : isNegative ? "text-red-400" : "text-gray-400"}`}
              >
                {change > 0 ? "+" : ""}
                {change}% o'tgan davr bilan
              </span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function ReportsPage() {
  // Reports section is disabled — redirect to admin dashboard
  return <Navigate to="/admin" replace />;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [dateRange, setDateRange] = React.useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });
  const [selectedPeriod, setSelectedPeriod] = React.useState("30d");

  // Data states
  const [kpis, setKpis] = React.useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    customerAcquisitionCost: 0,
    customerLifetimeValue: 0,
    conversionRate: 0,
  });

  const [salesData, setSalesData] = React.useState({
    daily: [],
    weekly: [],
    monthly: [],
    yearly: [],
    topProducts: [],
    categoryBreakdown: [],
  });

  const [ordersData, setOrdersData] = React.useState({
    statusDistribution: [],
    ordersOverTime: [],
    completionRate: 0,
  });

  const [customersData, setCustomersData] = React.useState({
    newCustomers: [],
    retention: 0,
    topCustomers: [],
  });

  const [productsData, setProductsData] = React.useState({
    inventory: [],
    lowStock: [],
    performance: [],
    categoryPerformance: [],
  });

  const API = (path) => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:3001";
    return `${base}${path}`;
  };

  // Date range presets
  const datePresets = {
    "7d": { label: "7 kun", days: 7 },
    "30d": { label: "30 kun", days: 30 },
    "90d": { label: "3 oy", days: 90 },
    "365d": { label: "1 yil", days: 365 },
  };

  const applyDatePreset = (period) => {
    setSelectedPeriod(period);
    const days = datePresets[period].days;
    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    setDateRange({
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    });
  };

  // Fetch data functions
  const fetchKPIs = async () => {
    try {
      const params = new URLSearchParams(dateRange);
      const response = await fetch(API(`/api/reports/kpis?${params}`));
      const data = await response.json();

      if (response.ok && data.success) {
        setKpis(data.data);
      } else {
        // Mock data for development
        setKpis({
          totalRevenue: 15750000,
          totalOrders: 234,
          averageOrderValue: 67307,
          customerAcquisitionCost: 12500,
          customerLifetimeValue: 456000,
          conversionRate: 3.2,
        });
      }
    } catch (error) {
      // Mock data on error
      setKpis({
        totalRevenue: 15750000,
        totalOrders: 234,
        averageOrderValue: 67307,
        customerAcquisitionCost: 12500,
        customerLifetimeValue: 456000,
        conversionRate: 3.2,
      });
    }
  };

  const fetchSalesData = async () => {
    try {
      const params = new URLSearchParams(dateRange);
      const response = await fetch(API(`/api/reports/sales?${params}`));
      const data = await response.json();

      if (response.ok && data.success) {
        setSalesData(data.data);
      } else {
        // Mock data
        setSalesData({
          daily: [
            { label: "1-kun", value: 450000 },
            { label: "2-kun", value: 670000 },
            { label: "3-kun", value: 520000 },
            { label: "4-kun", value: 890000 },
            { label: "5-kun", value: 720000 },
            { label: "6-kun", value: 1100000 },
            { label: "7-kun", value: 950000 },
          ],
          topProducts: [
            { name: "Zamonaviy Divan", sales: 45, revenue: 6750000 },
            { name: "Ofis Stul", sales: 67, revenue: 4020000 },
            { name: "Yotoq Komplekti", sales: 23, revenue: 3450000 },
            { name: "Shkaf", sales: 34, revenue: 2720000 },
            { name: "Stol", sales: 56, revenue: 2240000 },
          ],
          categoryBreakdown: [
            { label: "Mebel", value: 8500000 },
            { label: "Elektronika", value: 4200000 },
            { label: "Kiyim", value: 2100000 },
            { label: "Boshqa", value: 950000 },
          ],
        });
      }
    } catch (error) {
      setSalesData({
        daily: [
          { label: "1-kun", value: 450000 },
          { label: "2-kun", value: 670000 },
          { label: "3-kun", value: 520000 },
          { label: "4-kun", value: 890000 },
          { label: "5-kun", value: 720000 },
          { label: "6-kun", value: 1100000 },
          { label: "7-kun", value: 950000 },
        ],
        topProducts: [
          { name: "Zamonaviy Divan", sales: 45, revenue: 6750000 },
          { name: "Ofis Stul", sales: 67, revenue: 4020000 },
          { name: "Yotoq Komplekti", sales: 23, revenue: 3450000 },
          { name: "Shkaf", sales: 34, revenue: 2720000 },
          { name: "Stol", sales: 56, revenue: 2240000 },
        ],
        categoryBreakdown: [
          { label: "Mebel", value: 8500000 },
          { label: "Elektronika", value: 4200000 },
          { label: "Kiyim", value: 2100000 },
          { label: "Boshqa", value: 950000 },
        ],
      });
    }
  };

  const fetchOrdersData = async () => {
    try {
      const params = new URLSearchParams(dateRange);
      const response = await fetch(API(`/api/reports/orders?${params}`));
      const data = await response.json();

      if (response.ok && data.success) {
        setOrdersData(data.data);
      } else {
        setOrdersData({
          statusDistribution: [
            { label: "Yangi", value: 45 },
            { label: "Jarayonda", value: 78 },
            { label: "Yetkazildi", value: 123 },
            { label: "Bekor qilingan", value: 12 },
          ],
          ordersOverTime: [
            { label: "Dush", value: 12 },
            { label: "Sesh", value: 18 },
            { label: "Chor", value: 23 },
            { label: "Pay", value: 19 },
            { label: "Jum", value: 34 },
            { label: "Shan", value: 45 },
            { label: "Yak", value: 38 },
          ],
          completionRate: 84.6,
        });
      }
    } catch (error) {
      setOrdersData({
        statusDistribution: [
          { label: "Yangi", value: 45 },
          { label: "Jarayonda", value: 78 },
          { label: "Yetkazildi", value: 123 },
          { label: "Bekor qilingan", value: 12 },
        ],
        ordersOverTime: [
          { label: "Dush", value: 12 },
          { label: "Sesh", value: 18 },
          { label: "Chor", value: 23 },
          { label: "Pay", value: 19 },
          { label: "Jum", value: 34 },
          { label: "Shan", value: 45 },
          { label: "Yak", value: 38 },
        ],
        completionRate: 84.6,
      });
    }
  };

  const fetchCustomersData = async () => {
    try {
      const params = new URLSearchParams(dateRange);
      const response = await fetch(API(`/api/reports/customers?${params}`));
      const data = await response.json();

      if (response.ok && data.success) {
        setCustomersData(data.data);
      } else {
        setCustomersData({
          newCustomers: [
            { label: "Hafta 1", value: 23 },
            { label: "Hafta 2", value: 34 },
            { label: "Hafta 3", value: 28 },
            { label: "Hafta 4", value: 41 },
          ],
          retention: 67.8,
          topCustomers: [
            { name: "Ali Vali", spending: 2450000, orders: 12 },
            { name: "Farid Karim", spending: 1890000, orders: 8 },
            { name: "Aziz Olim", spending: 1670000, orders: 15 },
            { name: "Diyor Bek", spending: 1340000, orders: 6 },
            { name: "Nilufar Xon", spending: 1120000, orders: 9 },
          ],
        });
      }
    } catch (error) {
      setCustomersData({
        newCustomers: [
          { label: "Hafta 1", value: 23 },
          { label: "Hafta 2", value: 34 },
          { label: "Hafta 3", value: 28 },
          { label: "Hafta 4", value: 41 },
        ],
        retention: 67.8,
        topCustomers: [
          { name: "Ali Vali", spending: 2450000, orders: 12 },
          { name: "Farid Karim", spending: 1890000, orders: 8 },
          { name: "Aziz Olim", spending: 1670000, orders: 15 },
          { name: "Diyor Bek", spending: 1340000, orders: 6 },
          { name: "Nilufar Xon", spending: 1120000, orders: 9 },
        ],
      });
    }
  };

  const fetchProductsData = async () => {
    try {
      const response = await fetch(API("/api/reports/products"));
      const data = await response.json();

      if (response.ok && data.success) {
        setProductsData(data.data);
      } else {
        setProductsData({
          inventory: [
            { name: "Zamonaviy Divan", stock: 23, category: "Mebel" },
            { name: "Ofis Stul", stock: 67, category: "Mebel" },
            { name: "Yotoq Komplekti", stock: 12, category: "Mebel" },
            { name: "Shkaf", stock: 8, category: "Mebel" },
            { name: "Stol", stock: 34, category: "Mebel" },
          ],
          lowStock: [
            { name: "Shkaf", stock: 8, minStock: 10 },
            { name: "Yotoq Komplekti", stock: 12, minStock: 15 },
            { name: "Parda", stock: 5, minStock: 20 },
          ],
          performance: [
            {
              name: "Zamonaviy Divan",
              views: 1245,
              sales: 45,
              conversion: 3.6,
            },
            { name: "Ofis Stul", views: 892, sales: 67, conversion: 7.5 },
            { name: "Yotoq Komplekti", views: 567, sales: 23, conversion: 4.1 },
          ],
          categoryPerformance: [
            { label: "Mebel", value: 145 },
            { label: "Elektronika", value: 78 },
            { label: "Kiyim", value: 234 },
            { label: "Boshqa", value: 56 },
          ],
        });
      }
    } catch (error) {
      setProductsData({
        inventory: [
          { name: "Zamonaviy Divan", stock: 23, category: "Mebel" },
          { name: "Ofis Stul", stock: 67, category: "Mebel" },
          { name: "Yotoq Komplekti", stock: 12, category: "Mebel" },
          { name: "Shkaf", stock: 8, category: "Mebel" },
          { name: "Stol", stock: 34, category: "Mebel" },
        ],
        lowStock: [
          { name: "Shkaf", stock: 8, minStock: 10 },
          { name: "Yotoq Komplekti", stock: 12, minStock: 15 },
          { name: "Parda", stock: 5, minStock: 20 },
        ],
        performance: [
          { name: "Zamonaviy Divan", views: 1245, sales: 45, conversion: 3.6 },
          { name: "Ofis Stul", views: 892, sales: 67, conversion: 7.5 },
          { name: "Yotoq Komplekti", views: 567, sales: 23, conversion: 4.1 },
        ],
        categoryPerformance: [
          { label: "Mebel", value: 145 },
          { label: "Elektronika", value: 78 },
          { label: "Kiyim", value: 234 },
          { label: "Boshqa", value: 56 },
        ],
      });
    }
  };

  // Load all data
  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchKPIs(),
        fetchSalesData(),
        fetchOrdersData(),
        fetchCustomersData(),
        fetchProductsData(),
      ]);
    } catch (err) {
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Export functions
  const exportToPDF = () => {
    // Mock PDF export
    alert("PDF eksport funksiyasi ishga tushirildi");
  };

  const exportToExcel = () => {
    // Mock Excel export
    alert("Excel eksport funksiyasi ishga tushirildi");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Hisobotlar</h1>
          <p className="text-gray-400">Biznes ko'rsatkichlari va tahlillar</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportToPDF}
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">Vaqt oralig'i:</span>
            </div>

            <div className="flex gap-2">
              {Object.entries(datePresets).map(([key, preset]) => (
                <Button
                  key={key}
                  onClick={() => applyDatePreset(key)}
                  variant={selectedPeriod === key ? "default" : "outline"}
                  size="sm"
                  className={
                    selectedPeriod === key
                      ? "bg-blue-600"
                      : "border-gray-600 text-gray-300"
                  }
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="start_date" className="text-sm">
                Dan:
              </Label>
              <Input
                id="start_date"
                type="date"
                value={dateRange.start_date}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                  }))
                }
                className="bg-gray-700 border-gray-600 text-white w-auto"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="end_date" className="text-sm">
                Gacha:
              </Label>
              <Input
                id="end_date"
                type="date"
                value={dateRange.end_date}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    end_date: e.target.value,
                  }))
                }
                className="bg-gray-700 border-gray-600 text-white w-auto"
              />
            </div>

            <Button
              onClick={loadData}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Yangilash
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-10">
          <p className="text-gray-400">Ma'lumotlar yuklanmoqda...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <KPICard
              title="Umumiy daromad"
              value={kpis.totalRevenue}
              change={15.2}
              icon={DollarSign}
              format="currency"
            />
            <KPICard
              title="Buyurtmalar soni"
              value={kpis.totalOrders}
              change={8.4}
              icon={ShoppingCart}
            />
            <KPICard
              title="O'rtacha buyurtma qiymati"
              value={kpis.averageOrderValue}
              change={-2.1}
              icon={BarChart3}
              format="currency"
            />
            <KPICard
              title="Mijoz jalb etish narxi"
              value={kpis.customerAcquisitionCost}
              change={-5.3}
              icon={Users}
              format="currency"
            />
            <KPICard
              title="Mijozning umriy qiymati"
              value={kpis.customerLifetimeValue}
              change={12.7}
              icon={Activity}
              format="currency"
            />
            <KPICard
              title="Konversiya darajasi"
              value={kpis.conversionRate}
              change={1.2}
              icon={TrendingUp}
              format="percentage"
            />
          </div>

          {/* Reports Tabs */}
          <Tabs defaultValue="sales" className="space-y-4">
            <TabsList className="bg-gray-700">
              <TabsTrigger value="sales">Sotuvlar</TabsTrigger>
              <TabsTrigger value="orders">Buyurtmalar</TabsTrigger>
              <TabsTrigger value="customers">Mijozlar</TabsTrigger>
              <TabsTrigger value="products">Mahsulotlar</TabsTrigger>
              <TabsTrigger value="financial">Moliyaviy</TabsTrigger>
            </TabsList>

            {/* Sales Reports */}
            <TabsContent value="sales" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5" />
                      Kunlik sotuvlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart data={salesData.daily} color="#10b981" />
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Kategoriya bo'yicha sotuvlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PieChart data={salesData.categoryBreakdown} size={200} />
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800 border-gray-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top sotilayotgan mahsulotlar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesData.topProducts?.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-600">{index + 1}</Badge>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-400">
                            {Number(product.revenue).toLocaleString()} so'm
                          </div>
                          <div className="text-sm text-gray-400">
                            {product.sales} ta sotildi
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Reports */}
            <TabsContent value="orders" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                      Buyurtma holati taqsimoti
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PieChart data={ordersData.statusDistribution} size={200} />
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Haftalik buyurtmalar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      data={ordersData.ordersOverTime}
                      color="#3b82f6"
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                  title="Buyurtmalar tugallanishi"
                  value={ordersData.completionRate}
                  icon={Activity}
                  format="percentage"
                />
                <KPICard
                  title="Bekor qilingan buyurtmalar"
                  value={12}
                  change={-15.3}
                  icon={AlertTriangle}
                />
                <KPICard
                  title="O'rtacha yetkazish vaqti"
                  value="2.5 kun"
                  change={-8.2}
                  icon={Clock}
                />
              </div>
            </TabsContent>

            {/* Customers Reports */}
            <TabsContent value="customers" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChartIcon className="h-5 w-5" />
                      Yangi mijozlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={customersData.newCustomers}
                      color="#8b5cf6"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Top mijozlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {customersData.topCustomers?.map((customer, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge className="bg-purple-600">{index + 1}</Badge>
                            <span className="font-medium">{customer.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-400">
                              {Number(customer.spending).toLocaleString()} so'm
                            </div>
                            <div className="text-sm text-gray-400">
                              {customer.orders} ta buyurtma
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <KPICard
                  title="Mijozlar saqlanishi"
                  value={customersData.retention}
                  change={3.4}
                  icon={Users}
                  format="percentage"
                />
                <KPICard
                  title="Yangi mijozlar (oylik)"
                  value={126}
                  change={18.7}
                  icon={TrendingUp}
                />
              </div>
            </TabsContent>

            {/* Products Reports */}
            <TabsContent value="products" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      Kam qolgan mahsulotlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {productsData.lowStock?.map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
                        >
                          <span className="font-medium">{product.name}</span>
                          <div className="text-right">
                            <div className="text-red-400 font-semibold">
                              {product.stock} ta qoldi
                            </div>
                            <div className="text-sm text-gray-400">
                              Min: {product.minStock} ta
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Kategoriya bo'yicha sotuvlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      data={productsData.categoryPerformance}
                      color="#f59e0b"
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800 border-gray-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Mahsulot ko'rsatkichlari
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left p-3">Mahsulot</th>
                          <th className="text-left p-3">Ko'rishlar</th>
                          <th className="text-left p-3">Sotuvlar</th>
                          <th className="text-left p-3">Konversiya</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productsData.performance?.map((product, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-700/50"
                          >
                            <td className="p-3 font-medium">{product.name}</td>
                            <td className="p-3">
                              {Number(product.views).toLocaleString()}
                            </td>
                            <td className="p-3 text-green-400">
                              {product.sales}
                            </td>
                            <td className="p-3">
                              <Badge
                                variant="outline"
                                className="border-blue-500 text-blue-400"
                              >
                                {product.conversion}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Financial Reports */}
            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                  title="Umumiy daromad"
                  value={kpis.totalRevenue}
                  change={15.2}
                  icon={DollarSign}
                  format="currency"
                />
                <KPICard
                  title="Xarajatlar"
                  value={8750000}
                  change={-3.2}
                  icon={TrendingDown}
                  format="currency"
                />
                <KPICard
                  title="Sof foyda"
                  value={7000000}
                  change={28.4}
                  icon={TrendingUp}
                  format="currency"
                />
                <KPICard
                  title="Foyda marjasi"
                  value={44.4}
                  change={5.8}
                  icon={Activity}
                  format="percentage"
                />
              </div>

              <Card className="bg-gray-800 border-gray-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    To'lov usullari taqsimoti
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart
                    data={[
                      { label: "Naqd pul", value: 45 },
                      { label: "Plastik karta", value: 78 },
                      { label: "Online to'lov", value: 134 },
                      { label: "Bank o'tkazmasi", value: 23 },
                    ]}
                    size={250}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
