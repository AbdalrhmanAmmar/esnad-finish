import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import {
  TrendingUp,
  Calendar as CalendarIcon,
  Activity,
  ClipboardList,
  PackageOpen,
  Users,
  Pill,
  ShoppingCart,
  BarChart3,
  Filter,
  RefreshCw,
  Eye,
  Download,
  User,
  Building,
  MapPin,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarInitials } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { getMedicalSalesData } from "@/api/MedicalSalesdata";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MedicalSalesdata: React.FC = () => {
  const { user } = useAuthStore();
  const medicalRepId = user?._id;
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctorVisits, setDoctorVisits] = useState<any[]>([]);
  const [approvedOrders, setApprovedOrders] = useState<any[]>([]);
  const [medicalRep, setMedicalRep] = useState<any>(null);
  const [salesReps, setSalesReps] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalDoctorVisits: 0,
    totalApprovedPharmacyOrders: 0,
    totalSamplesDistributed: 0,
    totalApprovedOrdersAmount: 0,
    totalSalesReps: 0,
  });

  const formatCurrencyLYD = (value: number) =>
    new Intl.NumberFormat("ar-LY", {
      style: "currency",
      currency: "LYD",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: ar });
    } catch {
      return dateStr;
    }
  };

  const fetchData = async () => {
    if (!medicalRepId) return;
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (dateRange?.from) params.startDate = format(dateRange.from, "yyyy-MM-dd");
      if (dateRange?.to) params.endDate = format(dateRange.to, "yyyy-MM-dd");
      const res = await getMedicalSalesData(medicalRepId, params);

      // دعم كلا الشكلين: {success, data: {...}} أو مباشرة {...}
      const payload = res && (res as any).data ? (res as any).data : (res as any);

      console.log("API Response:", payload); // للتصحيح

      // بيانات المندوب الطبي
      const srList: any[] = (payload?.salesReps || payload?.data?.salesReps || []) as any[];
      let rep = payload?.medicalRep || payload?.data?.medicalRep || null;

      if (!rep && srList.length > 0) {
        rep =
          srList.find((r: any) => r?.salesRep?._id === medicalRepId)?.salesRep ||
          srList[0]?.salesRep ||
          null;
      }
      setMedicalRep(rep);
      setSalesReps(srList);

      // زيارات الأطباء
      const dv: any[] = (payload?.doctorVisits || payload?.data?.doctorVisits || []) as any[];

      // الطلبات المعتمدة: إما موجودة مباشرة، أو عبر المندوبين
      let ao: any[] = [];

      // استخراج الطلبات من salesReps
      if (srList && srList.length > 0) {
        ao = srList.flatMap((repData: any) => {
          const repInfo = repData?.salesRep || {};
          const repName = repInfo.name || repInfo.username || "غير محدد";
          const orders = repData?.orders || [];

          return orders.map((order: any) => ({
            ...order,
            salesRepId: repInfo._id,
            salesRepName: repName,
            salesRep: repInfo,
          }));
        });
      }

      // إحصائيات عامة محسوبة
      const totalDoctorVisits = dv.length;
      const totalApprovedPharmacyOrders = ao.length;
      const totalSamplesDistributed = dv.reduce(
        (sum, v) => sum + Number(v?.totalSamplesCount || 0),
        0
      );
      const totalApprovedOrdersAmount = ao.reduce(
        (sum, o) => sum + Number(o?.totalOrderValue || 0),
        0
      );
      const totalSalesReps = srList.length;

      setDoctorVisits(dv);
      setApprovedOrders(ao);
      setStats({
        totalDoctorVisits,
        totalApprovedPharmacyOrders,
        totalSamplesDistributed,
        totalApprovedOrdersAmount,
        totalSalesReps,
      });
    } catch (err: any) {
      console.error("Medical sales data error:", err);
      setError(err?.response?.data?.message || "حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicalRepId, dateRange?.from, dateRange?.to]);

  // ==== Chart Data Preparation ====
  const movingAverage = (arr: number[], windowSize = 7) => {
    const result: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const slice = arr.slice(start, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      result.push(Math.round(avg));
    }
    return result;
  };

  const ordersByDayValueData = useMemo(() => {
    const map = new Map<string, number>();
    approvedOrders.forEach((o) => {
      const d = formatDate(o.visitDate || o.orderDate);
      if (!d) return;
      map.set(d, (map.get(d) || 0) + (o.totalOrderValue || 0));
    });
    const labels = Array.from(map.keys()).sort((a, b) => {
      const da = new Date(a.split("/").reverse().join("-")).getTime();
      const db = new Date(b.split("/").reverse().join("-")).getTime();
      return da - db;
    });
    const values = labels.map((l) => map.get(l) || 0);
    const avg = movingAverage(values, 7);
    return {
      labels,
      datasets: [
        {
          label: "القيمة اليومية للطلبات المعتمدة",
          data: values,
          borderColor: "rgba(99, 102, 241, 0.9)",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: "rgba(99, 102, 241, 1)",
        },
        {
          label: "المتوسط المتحرك (7 أيام)",
          data: avg,
          borderColor: "rgba(245, 158, 11, 0.9)",
          backgroundColor: "transparent",
          fill: false,
          tension: 0.3,
          borderDash: [5, 5],
          pointRadius: 0,
        },
      ],
    };
  }, [approvedOrders]);

  const salesRepPerformanceData = useMemo(() => {
    // تجميع الطلبات لكل مندوب مبيعات
    const repMap = new Map<string, { value: number; orders: number }>();

    salesReps.forEach((repData) => {
      const repInfo = repData.salesRep;
      const repId = repInfo._id;
      const orders = repData.orders || [];
      const totalValue = orders.reduce(
        (sum: number, order: any) => sum + (order.totalOrderValue || 0),
        0
      );

      repMap.set(repId, {
        value: totalValue,
        orders: orders.length,
      });
    });

    const entries = Array.from(repMap.entries())
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 10);

    const labels = entries.map(([id]) => {
      const rep = salesReps.find((r) => r.salesRep._id === id)?.salesRep;
      return rep?.name || rep?.username || "غير محدد";
    });
    const values = entries.map(([, data]) => data.value);
    const orderCounts = entries.map(([, data]) => data.orders);

    return {
      labels,
      datasets: [
        {
          label: "قيمة الطلبات",
          data: values,
          backgroundColor: "rgba(99, 102, 241, 0.7)",
          borderRadius: 6,
          borderWidth: 1,
          borderColor: "rgba(99, 102, 241, 0.9)",
        },
        {
          label: "عدد الطلبات",
          data: orderCounts,
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderRadius: 6,
          borderWidth: 1,
          borderColor: "rgba(16, 185, 129, 0.9)",
          type: "bar" as const,
        },
      ],
    };
  }, [salesReps]);

  const productDistributionData = useMemo(() => {
    const productMap = new Map<string, { samples: number; sales: number }>();

    // العينات من زيارات الأطباء
    doctorVisits.forEach((visit) => {
      (visit.products || []).forEach((product: any) => {
        const name = product.productName || "غير محدد";
        const samples = product.samplesCount || 0;
        const current = productMap.get(name) || { samples: 0, sales: 0 };
        productMap.set(name, { ...current, samples: current.samples + samples });
      });
    });

    // المبيعات من الطلبات
    approvedOrders.forEach((order) => {
      (order.products || []).forEach((product: any) => {
        const name = product.productName || "غير محدد";
        const sales = product.quantity || 0;
        const current = productMap.get(name) || { samples: 0, sales: 0 };
        productMap.set(name, { ...current, sales: current.sales + sales });
      });
    });

    const topProducts = Array.from(productMap.entries())
      .sort((a, b) => b[1].samples + b[1].sales - (a[1].samples + a[1].sales))
      .slice(0, 8);

    const labels = topProducts.map(([name]) => name);
    const samplesData = topProducts.map(([, data]) => data.samples);
    const salesData = topProducts.map(([, data]) => data.sales);

    return {
      labels,
      datasets: [
        {
          label: "العينات الموزعة",
          data: samplesData,
          backgroundColor: "rgba(245, 158, 11, 0.7)",
        },
        {
          label: "الكمية المباعة",
          data: salesData,
          backgroundColor: "rgba(16, 185, 129, 0.7)",
        },
      ],
    };
  }, [doctorVisits, approvedOrders]);

  const visitsByDayData = useMemo(() => {
    const map = new Map<string, number>();
    doctorVisits.forEach((v) => {
      const d = formatDate(v.visitDate);
      if (!d) return;
      map.set(d, (map.get(d) || 0) + 1);
    });

    const entries = Array.from(map.entries()).sort(([dateA], [dateB]) => {
      const da = new Date(dateA.split("/").reverse().join("-")).getTime();
      const db = new Date(dateB.split("/").reverse().join("-")).getTime();
      return da - db;
    });

    const labels = entries.map(([date]) => date);
    const values = entries.map(([, count]) => count);

    return {
      labels,
      datasets: [
        {
          label: "الزيارات اليومية",
          data: values,
          borderColor: "rgba(34, 197, 94, 0.8)",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [doctorVisits]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => {
            const value = ctx.parsed?.y ?? ctx.parsed;
            const label = ctx.dataset?.label || "القيمة";
            if (typeof value === "number" && value > 10 && ctx.dataset.label !== "عدد الطلبات") {
              return `${label}: ${formatCurrencyLYD(value)}`;
            }
            return `${label}: ${value}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: (val: any) => {
            const num = Number(val);
            if (Number.isNaN(num)) return val;
            return num >= 100 ? formatCurrencyLYD(num) : num;
          },
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };

  const getSalesRepStats = (repData: any) => {
    const orders = repData.orders || [];
    const totalValue = orders.reduce(
      (sum: number, order: any) => sum + (order.totalOrderValue || 0),
      0
    );
    const totalQuantity = orders.reduce(
      (sum: number, order: any) =>
        sum +
        (order.products || []).reduce(
          (prodSum: number, prod: any) => prodSum + (prod.quantity || 0),
          0
        ),
      0
    );

    return {
      ordersCount: orders.length,
      totalValue,
      totalQuantity,
      avgOrderValue: orders.length > 0 ? totalValue / orders.length : 0,
    };
  };

  const SalesRepCard = ({ repData }: { repData: any }) => {
    const rep = repData.salesRep;
    const stats = getSalesRepStats(repData);

    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500">
                <AvatarInitials className="text-white font-semibold">
                  {(rep?.name || "?")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)}
                </AvatarInitials>
              </Avatar>
              <div className="text-right">
                <CardTitle className="text-base">{rep?.name}</CardTitle>
                <CardDescription className="text-xs">@{rep?.username}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {rep?.role}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">{stats.ordersCount}</div>
                <div className="text-xs text-muted-foreground">عدد الطلبات</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrencyLYD(stats.totalValue)}
                </div>
                <div className="text-xs text-muted-foreground">القيمة الإجمالية</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">متوسط قيمة الطلب:</span>
                <span className="font-medium">{formatCurrencyLYD(stats.avgOrderValue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">إجمالي الكمية:</span>
                <span className="font-medium">{stats.totalQuantity} وحدة</span>
              </div>
            </div>

            {rep?.area && (
              <div className="pt-2">
                <div className="text-xs text-muted-foreground mb-1">المناطق:</div>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(rep.area) ? (
                    rep.area.slice(0, 2).map((area: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      {rep.area}
                    </Badge>
                  )}
                  {Array.isArray(rep.area) && rep.area.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{rep.area.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const DoctorVisitCard = ({ visit }: { visit: any }) => {
    return (
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="text-right">
              <div className="font-semibold">{visit?.doctor?.name || "غير محدد"}</div>
              <div className="text-sm text-muted-foreground">{visit?.doctor?.specialty}</div>
            </div>
            <Badge variant="outline" className="text-xs">
              {formatDate(visit.visitDate)}
            </Badge>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Building className="h-3 w-3" />
              {visit?.doctor?.organizationName || "غير محدد"}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {visit?.doctor?.city} - {visit?.doctor?.area}
            </div>
          </div>

          <Separator className="my-3" />

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">إجمالي العينات:</span>
              <Badge variant="secondary">{visit?.totalSamplesCount || 0}</Badge>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">المنتجات:</div>
              <div className="flex flex-wrap gap-1">
                {(visit?.products || []).slice(0, 3).map((product: any, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {product.productName} × {product.samplesCount}
                  </Badge>
                ))}
                {(visit?.products || []).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{(visit?.products || []).length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const StatCard = ({ title, value, icon: Icon, description, trend, color }: any) => (
    <Card
      className={`relative overflow-hidden border-0 shadow-sm ${
        color || "bg-gradient-to-br from-background to-muted/20"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div
          className={`p-2 rounded-lg ${
            color?.includes("blue")
              ? "bg-blue-100 dark:bg-blue-900/20"
              : color?.includes("green")
              ? "bg-green-100 dark:bg-green-900/20"
              : "bg-muted"
          }`}
        >
          <Icon
            className={`h-4 w-4 ${
              color?.includes("blue")
                ? "text-blue-600"
                : color?.includes("green")
                ? "text-green-600"
                : "text-muted-foreground"
            }`}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className={`h-3 w-3 ${trest > 0 ? "text-green-600" : "text-red-600"}`} />
            <span className={`text-xs ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            لوحة تحليلات المبيعات الطبية
          </h2>
          <p className="text-muted-foreground mt-1">
            عرض وتحليل بيانات زيارات الأطباء والطلبات المعتمدة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDateRange({ from: undefined, to: undefined })}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={fetchData} disabled={loading}>
            {loading ? "جاري التحديث..." : "تحديث البيانات"}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/20 bg-destructive/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-destructive"></div>
            <span className="text-destructive text-sm">{error}</span>
            <Button variant="ghost" size="sm" onClick={fetchData} className="mr-auto">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Medical Rep Info */}
      {medicalRep && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-white dark:border-gray-800 shadow-md">
                  <AvatarInitials className="text-xl font-bold">
                    {(medicalRep?.name || medicalRep?.username || "?")
                      .split(" ")
                      .slice(0, 2)
                      .map((s: string) => s[0])
                      .join("")}
                  </AvatarInitials>
                </Avatar>
                <div className="text-right">
                  <div className="font-bold text-xl">
                    {medicalRep?.name || medicalRep?.username}
                  </div>
                  <div className="text-sm text-muted-foreground">@{medicalRep?.username}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="gap-1">
                      <User className="h-3 w-3" />
                      {medicalRep?.role || "MEDICAL REP"}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {medicalRep?.teamProducts || "بدون فريق"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalDoctorVisits}</div>
                  <div className="text-xs text-muted-foreground">زيارات طبية</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalApprovedPharmacyOrders}
                  </div>
                  <div className="text-xs text-muted-foreground">طلبات معتمدة</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{stats.totalSalesReps}</div>
                  <div className="text-xs text-muted-foreground">مندوبي مبيعات</div>
                </div>
              </div>
            </div>

            {medicalRep?.area && medicalRep.area.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-medium mb-2">المناطق المغطاة</div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(medicalRep.area) ? (
                    medicalRep.area.map((area: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {area}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {medicalRep.area}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-5 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="إجمالي زيارات الأطباء"
            value={stats.totalDoctorVisits}
            icon={Activity}
            description="عدد زيارات الأطباء"
            color="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
          />
          <StatCard
            title="الطلبات المعتمدة"
            value={stats.totalApprovedPharmacyOrders}
            icon={ClipboardList}
            description="عدد الطلبات الموافق عليها"
            color="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30"
          />
          <StatCard
            title="العينات الموزعة"
            value={stats.totalSamplesDistributed}
            icon={PackageOpen}
            description="إجمالي العينات الطبية"
            color="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
          />
          <StatCard
            title="قيمة الطلبات"
            value={formatCurrencyLYD(stats.totalApprovedOrdersAmount)}
            icon={TrendingUp}
            description="إجمالي قيمة المبيعات"
            color="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30"
          />
        </div>
      )}

      {/* Tabs for Different Views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:w-fit">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="salesreps">مندوبو المبيعات</TabsTrigger>
          <TabsTrigger value="doctorvisits">زيارات الأطباء</TabsTrigger>
          <TabsTrigger value="analysis">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أداء مندوبي المبيعات</CardTitle>
                <CardDescription>قيمة وعدد الطلبات حسب المندوب</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 400 }}>
                <Bar data={salesRepPerformanceData} options={chartOptions} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع المنتجات</CardTitle>
                <CardDescription>مقارنة بين العينات الموزعة والكمية المباعة</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 400 }}>
                <Bar
                  data={productDistributionData}
                  options={{
                    ...chartOptions,
                    scales: {
                      x: {
                        stacked: true,
                      },
                      y: {
                        stacked: true,
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>القيمة اليومية للطلبات</CardTitle>
                <CardDescription>اتجاهات القيم مع المتوسط المتحرك</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 350 }}>
                <Line data={ordersByDayValueData} options={chartOptions} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الزيارات اليومية</CardTitle>
                <CardDescription>توزيع عدد الزيارات حسب اليوم</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 350 }}>
                <Line data={visitsByDayData} options={chartOptions} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="salesreps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مندوبو المبيعات المرتبطين</CardTitle>
              <CardDescription>عرض بيانات وأداء جميع مندوبي المبيعات</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : salesReps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {salesReps.map((repData, index) => (
                    <SalesRepCard key={repData.salesRep?._id || index} repData={repData} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium text-lg mb-1">لا توجد بيانات</h3>
                  <p className="text-muted-foreground text-sm">
                    لم يتم العثور على مندوبي مبيعات مرتبطين
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sales Reps Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل طلبات مندوبي المبيعات</CardTitle>
              <CardDescription>عرض تفصيلي لجميع الطلبات المعتمدة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {salesReps.map((repData, repIndex) => {
                  const rep = repData.salesRep;
                  const orders = repData.orders || [];

                  if (orders.length === 0) return null;

                  return (
                    <div key={rep._id || repIndex} className="space-y-3">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarInitials className="text-xs">
                            {(rep?.name || "?")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </AvatarInitials>
                        </Avatar>
                        <div>
                          <div className="font-medium">{rep.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {orders.length} طلب •{" "}
                            {formatCurrencyLYD(
                              orders.reduce(
                                (sum: number, o: any) => sum + (o.totalOrderValue || 0),
                                0
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="p-3 text-right">التاريخ</th>
                              <th className="p-3 text-right">الصيدلية</th>
                              <th className="p-3 text-right">المنطقة</th>
                              <th className="p-3 text-right">المنتجات</th>
                              <th className="p-3 text-right">القيمة</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((order: any, orderIndex: number) => (
                              <tr
                                key={order.orderId || orderIndex}
                                className="border-t hover:bg-muted/30 transition-colors"
                              >
                                <td className="p-3">
                                  <div className="font-medium">{formatDate(order.visitDate)}</div>
                                </td>
                                <td className="p-3">
                                  <div className="font-medium">{order.pharmacyName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {order.pharmacyCity}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <Badge variant="outline" className="text-xs">
                                    {order.pharmacyArea}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  <div className="flex flex-wrap gap-1">
                                    {(order.products || [])
                                      .slice(0, 2)
                                      .map((product: any, idx: number) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {product.productName} × {product.quantity}
                                        </Badge>
                                      ))}
                                    {(order.products || []).length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{(order.products || []).length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="font-bold text-green-600">
                                    {formatCurrencyLYD(order.totalOrderValue)}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}

                {salesReps.every((rep) => (rep.orders || []).length === 0) && (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium text-lg mb-1">لا توجد طلبات</h3>
                    <p className="text-muted-foreground text-sm">
                      لم يتم العثور على طلبات معتمدة في الفترة المحددة
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctorvisits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>زيارات الأطباء</CardTitle>
              <CardDescription>عرض جميع زيارات الأطباء والعينات الموزعة</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : doctorVisits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doctorVisits.map((visit, index) => (
                    <DoctorVisitCard key={visit._id || index} visit={visit} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium text-lg mb-1">لا توجد زيارات</h3>
                  <p className="text-muted-foreground text-sm">
                    لم يتم العثور على زيارات أطباء في الفترة المحددة
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doctor Visits Table */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل زيارات الأطباء</CardTitle>
              <CardDescription>عرض تفصيلي للزيارات والمنتجات الموزعة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-3 text-right">التاريخ</th>
                      <th className="p-3 text-right">الطبيب</th>
                      <th className="p-3 text-right">التخصص</th>
                      <th className="p-3 text-right">العيادة</th>
                      <th className="p-3 text-right">المدينة</th>
                      <th className="p-3 text-right">المنتجات</th>
                      <th className="p-3 text-right">العينات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorVisits.map((visit, index) => (
                      <tr
                        key={visit._id || index}
                        className="border-t hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3">
                          <div className="font-medium">{formatDate(visit.visitDate)}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{visit?.doctor?.name}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">
                            {visit?.doctor?.specialty}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="max-w-[200px] truncate">
                            {visit?.doctor?.organizationName}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {visit?.doctor?.city} - {visit?.doctor?.area}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {(visit?.products || [])
                              .slice(0, 2)
                              .map((product: any, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {product.productName}
                                </Badge>
                              ))}
                            {(visit?.products || []).length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(visit?.products || []).length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="text-xs">
                              {visit?.totalSamplesCount || 0}
                            </Badge>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {doctorVisits.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium text-lg mb-1">لا توجد زيارات</h3>
                  <p className="text-muted-foreground text-sm">
                    لم يتم العثور على زيارات أطباء في الفترة المحددة
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>العلاقة بين المنتجات</CardTitle>
                <CardDescription>مقارنة بين العينات الموزعة والكمية المباعة</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 400 }}>
                <Radar data={productDistributionData} options={chartOptions} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تحليل الأداء</CardTitle>
                <CardDescription>مؤشرات أداء مندوبي المبيعات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesReps.slice(0, 5).map((repData, index) => {
                    const rep = repData.salesRep;
                    const stats = getSalesRepStats(repData);
                    const maxValue = Math.max(
                      ...salesReps.map((r) => getSalesRepStats(r).totalValue)
                    );
                    const percentage = maxValue > 0 ? (stats.totalValue / maxValue) * 100 : 0;

                    return (
                      <div key={rep._id || index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarInitials className="text-xs">
                                {(rep?.name || "?")
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .substring(0, 2)}
                              </AvatarInitials>
                            </Avatar>
                            <span className="text-sm font-medium">{rep.name}</span>
                          </div>
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrencyLYD(stats.totalValue)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <Progress value={percentage} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{stats.ordersCount} طلب</span>
                            <span>{stats.totalQuantity} وحدة</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalSalesdata;
