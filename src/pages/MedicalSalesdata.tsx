import React, { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { TrendingUp, Calendar as CalendarIcon, Activity, ClipboardList, PackageOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarInitials } from '@/components/ui/avatar';
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
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { getMedicalSalesData } from '@/api/MedicalSalesdata';

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
  const [stats, setStats] = useState<any>({
    totalDoctorVisits: 0,
    totalApprovedPharmacyOrders: 0,
    totalSamplesDistributed: 0,
    totalApprovedOrdersAmount: 0,
  });

  const formatCurrencyLYD = (value: number) =>
    new Intl.NumberFormat('ar-LY', { style: 'currency', currency: 'LYD', maximumFractionDigits: 0 }).format(value || 0);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ar });
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
      if (dateRange?.from) params.startDate = format(dateRange.from, 'yyyy-MM-dd');
      if (dateRange?.to) params.endDate = format(dateRange.to, 'yyyy-MM-dd');
      const res = await getMedicalSalesData(medicalRepId, params);
      // دعم كلا الشكلين: {success, data: {...}} أو مباشرة {...}
      const payload = (res && (res as any).data) ? (res as any).data : (res as any);

      // بيانات المندوب الطبي
      const srList: any[] = (payload?.salesReps || payload?.data?.salesReps || []) as any[];
      let rep = payload?.medicalRep || payload?.data?.medicalRep || null;
      if (!rep && srList.length > 0) {
        rep = (srList.find((r: any) => r?.salesRep?._id === medicalRepId)?.salesRep) || srList[0]?.salesRep || null;
      }
      setMedicalRep(rep);

      // زيارات الأطباء
      const dv: any[] = (payload?.doctorVisits || payload?.data?.doctorVisits || []) as any[];

      // الطلبات المعتمدة: إما موجودة مباشرة، أو عبر المندوبين
      let ao: any[] = (payload?.approvedPharmacyOrders || payload?.data?.approvedPharmacyOrders || []) as any[];
      if ((!ao || ao.length === 0) && (payload?.salesReps || payload?.data?.salesReps)) {
        const reps = (payload?.salesReps || payload?.data?.salesReps) as any[];
        ao = reps.flatMap((r: any) => {
          const repName = r?.salesRep?.name || r?.salesRep?.username || 'غير محدد';
          const orders = (r?.orders || []).filter((o: any) => (o?.finalStatus || o?.orderStatus) === 'approved');
          return orders.map((o: any) => ({
            orderId: o?.orderId || o?._id,
            visitDate: o?.visitDate || o?.orderDate || o?.createdAt,
            pharmacyName: o?.pharmacyName || 'غير محدد',
            pharmacyArea: o?.pharmacyArea,
            pharmacyCity: o?.pharmacyCity,
            salesRepName: repName,
            products: o?.products || [],
            totalOrderValue: Number(o?.totalOrderValue || o?.totalValue || 0),
            orderStatus: o?.finalStatus || o?.orderStatus,
          }));
        });
      }

      // إحصائيات عامة محسوبة
      const totalDoctorVisits = dv.length;
      const totalApprovedPharmacyOrders = ao.length;
      const totalSamplesDistributed = dv.reduce((sum, v) => sum + Number(v?.totalSamplesCount || 0), 0);
      const totalApprovedOrdersAmount = ao.reduce((sum, o) => sum + Number(o?.totalOrderValue || 0), 0);

      setDoctorVisits(dv);
      setApprovedOrders(ao);
      setStats({
        totalDoctorVisits,
        totalApprovedPharmacyOrders,
        totalSamplesDistributed,
        totalApprovedOrdersAmount,
      });
    } catch (err: any) {
      console.error('Medical sales data error:', err);
      setError(err?.response?.data?.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicalRepId, dateRange?.from, dateRange?.to]);

  // ==== Chart Data Preparation ====
  // Helper: Moving Average
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
      const da = new Date(a.split('/').reverse().join('-')).getTime();
      const db = new Date(b.split('/').reverse().join('-')).getTime();
      return da - db;
    });
    const values = labels.map((l) => map.get(l) || 0);
    const avg = movingAverage(values, 7);
    return {
      labels,
      datasets: [
        {
          label: 'القيمة اليومية للطلبات المعتمدة',
          data: values,
          borderColor: 'rgba(59, 130, 246, 0.9)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.35,
          pointRadius: 2.5,
        },
        {
          label: 'المتوسط المتحرك (7 أيام)',
          data: avg,
          borderColor: 'rgba(234, 179, 8, 0.9)',
          backgroundColor: 'rgba(234, 179, 8, 0.15)',
          fill: false,
          tension: 0.25,
          borderDash: [6, 6],
          pointRadius: 0,
        },
      ],
    };
  }, [approvedOrders]);

  const visitsByDayData = useMemo(() => {
    const map = new Map<string, number>();
    doctorVisits.forEach((v) => {
      const d = formatDate(v.visitDate);
      if (!d) return;
      map.set(d, (map.get(d) || 0) + 1);
    });
    const labels = Array.from(map.keys());
    const values = Array.from(map.values());
    return {
      labels,
      datasets: [
        {
          label: 'الزيارات اليومية',
          data: values,
          borderColor: 'rgba(34, 197, 94, 0.8)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          tension: 0.3,
        },
      ],
    };
  }, [doctorVisits]);

  const samplesByProductData = useMemo(() => {
    const productMap = new Map<string, number>();
    doctorVisits.forEach((v) => {
      (v.products || []).forEach((p: any) => {
        const name = p.productName || 'غير محدد';
        productMap.set(name, (productMap.get(name) || 0) + (p.samplesCount || 0));
      });
    });
    const topEntries = Array.from(productMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const labels = topEntries.map(([k]) => k);
    const values = topEntries.map(([, v]) => v);
    return {
      labels,
      datasets: [
        {
          label: 'أكثر المنتجات توزيعاً للعينات',
          data: values,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderRadius: 8,
        },
      ],
    };
  }, [doctorVisits]);

  const ordersAmountByPharmacyData = useMemo(() => {
    const pharmacyMap = new Map<string, number>();
    approvedOrders.forEach((o) => {
      const name = o.pharmacyName || 'غير محدد';
      pharmacyMap.set(name, (pharmacyMap.get(name) || 0) + (o.totalOrderValue || 0));
    });
    const entries = Array.from(pharmacyMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const labels = entries.map(([k]) => k);
    const values = entries.map(([, v]) => v);
    const colors = [
      '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f43f5e',
    ];
    return {
      labels,
      datasets: [
        {
          label: 'قيمة الطلبات المعتمدة حسب الصيدلية',
          data: values,
          backgroundColor: colors,
        },
      ],
    };
  }, [approvedOrders]);

  const ordersBySalesRepData = useMemo(() => {
    const repMap = new Map<string, number>();
    approvedOrders.forEach((o) => {
      const rep = o.salesRepName || 'غير محدد';
      repMap.set(rep, (repMap.get(rep) || 0) + (o.totalOrderValue || 0));
    });
    const entries = Array.from(repMap.entries()).sort((a, b) => b[1] - a[1]);
    const labels = entries.map(([k]) => k);
    const values = entries.map(([, v]) => v);
    return {
      labels,
      datasets: [
        {
          label: 'قيمة الطلبات حسب مندوب المبيعات',
          data: values,
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderRadius: 6,
        },
      ],
    };
  }, [approvedOrders]);

  const topProductsByQuantityData = useMemo(() => {
    const productMap = new Map<string, number>();
    approvedOrders.forEach((o) => {
      (o.products || []).forEach((p: any) => {
        const name = p.productName || 'غير محدد';
        const qty = Number(p.quantity || 0);
        productMap.set(name, (productMap.get(name) || 0) + qty);
      });
    });
    const topEntries = Array.from(productMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const labels = topEntries.map(([k]) => k);
    const values = topEntries.map(([, v]) => v);
    return {
      labels,
      datasets: [
        {
          label: 'أعلى المنتجات حسب الكمية',
          data: values,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderRadius: 8,
        },
      ],
    };
  }, [approvedOrders]);

  // علاقات المنتجات بين المندوب الطبي والمبيعات
  const relationsByProduct = useMemo(() => {
    // منتجات المندوب الطبي (زيارات الأطباء): اسم المنتج -> مجموع العينات
    const mrProductSamples = new Map<string, number>();
    doctorVisits.forEach((v) => {
      (v.products || []).forEach((p: any) => {
        const name = p?.productName || 'غير محدد';
        const samples = Number(p?.samplesCount || 0);
        mrProductSamples.set(name, (mrProductSamples.get(name) || 0) + samples);
      });
    });

    // منتجات المبيعات (الطلبات المعتمدة): اسم المنتج -> { كمية, قيمة }
    const srProductAgg = new Map<string, { qty: number; value: number }>();
    approvedOrders.forEach((o) => {
      (o.products || []).forEach((p: any) => {
        const name = p?.productName || 'غير محدد';
        const qty = Number(p?.quantity || 0);
        const val = Number(p?.totalValue || p?.unitPrice * qty || 0);
        const prev = srProductAgg.get(name) || { qty: 0, value: 0 };
        srProductAgg.set(name, { qty: prev.qty + qty, value: prev.value + val });
      });
    });

    // اتحاد الأسماء
    const allNames = new Set<string>([...mrProductSamples.keys(), ...srProductAgg.keys()]);
    const rows = Array.from(allNames).map((name) => {
      const samples = mrProductSamples.get(name) || 0;
      const sales = srProductAgg.get(name) || { qty: 0, value: 0 };
      const conversion = samples > 0 ? Math.round((sales.qty / samples) * 100) : null;
      return { name, samples, qty: sales.qty, value: sales.value, conversion };
    });

    // ترتيب حسب أعلى قيمة مبيعات
    return rows.sort((a, b) => b.value - a.value).slice(0, 20);
  }, [doctorVisits, approvedOrders]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx: any) => {
            const value = ctx.parsed?.y ?? ctx.parsed;
            const label = ctx.dataset?.label ? ` ${ctx.dataset.label}: ` : 'القيمة: ';
            // If value is currency-worthy (non-integer or large), show currency
            if (typeof value === 'number' && value > 10) {
              return `${label}${formatCurrencyLYD(value)}`;
            }
            return `${label}${value}`;
          },
        },
      },
      title: { display: false },
    },
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: {
          callback: (val: any) => {
            const num = Number(val);
            if (Number.isNaN(num)) return val;
            return num >= 100 ? formatCurrencyLYD(num) : num;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6" style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">تحليلات المبيعات الطبية</h2>
          <p className="text-sm text-muted-foreground">عرض زيارات الأطباء والطلبات المعتمدة من الصيدليات</p>
        </div>
        <div className="flex items-center gap-2">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button variant="outline" onClick={() => setDateRange({ from: undefined, to: undefined })}>
            إعادة ضبط
          </Button>
        </div>
      </div>

      {/* معلومات المندوب الطبي */}
      {medicalRep && (
        <Card className="bg-gradient-to-br from-background to-muted/30 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">بيانات مندوب المبيعات</CardTitle>
            <CardDescription>نظرة سريعة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarInitials className="text-base">
                    {(medicalRep?.name || medicalRep?.username || '?')
                      .split(' ')
                      .slice(0,2)
                      .map((s: string) => s[0])
                      .join('')}
                  </AvatarInitials>
                </Avatar>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {medicalRep?.name || medicalRep?.username}
                  </div>
                  {medicalRep?.username && (
                    <div className="text-sm text-muted-foreground">@{medicalRep.username}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{medicalRep?.role || 'SALES REP'}</Badge>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-muted-foreground mb-2">المناطق</div>
              <div className="flex flex-wrap gap-2">
                {(medicalRep?.area || []).map((a: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">إجمالي زيارات الأطباء</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDoctorVisits || 0}</div>
              <p className="text-xs text-muted-foreground">ضمن الفترة المحددة</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">الطلبات المعتمدة</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApprovedPharmacyOrders || 0}</div>
              <p className="text-xs text-muted-foreground">عدد الطلبات المعتمدة</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">إجمالي العينات الموزعة</CardTitle>
              <PackageOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSamplesDistributed || 0}</div>
              <p className="text-xs text-muted-foreground">من زيارات الأطباء</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">قيمة الطلبات المعتمدة</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrencyLYD(stats.totalApprovedOrdersAmount || 0)}
              </div>
              <p className="text-xs text-muted-foreground">إجمالي المبلغ</p>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="p-4 text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* المؤشرات والرسوم */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>القيمة اليومية للطلبات المعتمدة</CardTitle>
            <CardDescription>اتجاهات القيم مع متوسط متحرك (7 أيام)</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 340 }}>
            <Line data={ordersByDayValueData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>قيمة الطلبات حسب الصيدلية</CardTitle>
            <CardDescription>أعلى الصيدليات من حيث قيمة الطلبات</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 340 }}>
            <Doughnut
              data={ordersAmountByPharmacyData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                      label: (ctx: any) => `${ctx.label}: ${formatCurrencyLYD(ctx.parsed)}`,
                    },
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
            <CardTitle>قيمة الطلبات حسب مندوب المبيعات</CardTitle>
            <CardDescription>تصنيف تنازلي حسب إجمالي القيمة</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 360 }}>
            <Bar
              data={ordersBySalesRepData}
              options={{
                ...chartOptions,
                indexAxis: 'y' as const,
                scales: {
                  x: {
                    ticks: {
                      callback: (val: any) => formatCurrencyLYD(Number(val) || 0),
                    },
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أعلى المنتجات حسب الكمية</CardTitle>
            <CardDescription>أفضل 10 منتجات من حيث الكمية</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 360 }}>
            <Bar
              data={topProductsByQuantityData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                      label: (ctx: any) => `${ctx.label}: ${ctx.parsed} وحدة`,
                    },
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* زيارات الأطباء */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>الزيارات اليومية</CardTitle>
            <CardDescription>توزيع عدد الزيارات حسب اليوم</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 320 }}>
            <Line data={visitsByDayData} options={chartOptions} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>زيارات الأطباء (تفصيل)</CardTitle>
          <CardDescription>عرض تفصيلي للزيارات والمنتجات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="p-2 text-right">التاريخ</th>
                  <th className="p-2 text-right">الطبيب</th>
                  <th className="p-2 text-right">العيادة</th>
                  <th className="p-2 text-right">المدينة - المنطقة</th>
                  <th className="p-2 text-right">المنتجات</th>
                  <th className="p-2 text-right">العينات</th>
                </tr>
              </thead>
              <tbody>
                {doctorVisits.map((v, idx) => (
                  <tr key={v._id || idx} className="border-t">
                    <td className="p-2">{formatDate(v.visitDate)}</td>
                    <td className="p-2">{v?.doctor?.name}</td>
                    <td className="p-2">{v?.doctor?.organizationName}</td>
                    <td className="p-2">{v?.doctor?.city} - {v?.doctor?.area}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-2">
                        {(v?.products || []).map((p: any, i: number) => (
                          <span key={i} className="px-2 py-1 rounded bg-muted text-xs">{p.productName}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-2">{Number(v?.totalSamplesCount || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* مندوبو المبيعات وطلباتُهم */}
      <Card>
        <CardHeader>
          <CardTitle>مندوبو المبيعات والطلبات المعتمدة</CardTitle>
          <CardDescription>عرض اسم المندوب ومنتجات طلباته</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* تجميع الطلبات حسب اسم المندوب */}
            {(() => {
              const byRep = new Map<string, any[]>();
              approvedOrders.forEach((o) => {
                const rep = o.salesRepName || 'غير محدد';
                byRep.set(rep, [...(byRep.get(rep) || []), o]);
              });
              const entries = Array.from(byRep.entries());
              if (entries.length === 0) {
                return <div className="text-sm text-muted-foreground">لا توجد طلبات معتمدة ضمن الفترة المحددة.</div>;
              }
              return entries.map(([rep, orders]) => (
                <div key={rep} className="border rounded">
                  <div className="p-3 bg-muted flex items-center justify-between">
                    <div className="font-medium">{rep}</div>
                    <div className="text-sm text-muted-foreground">عدد الطلبات: {orders.length}</div>
                  </div>
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="p-2 text-right">التاريخ</th>
                          <th className="p-2 text-right">الصيدلية</th>
                          <th className="p-2 text-right">القيمة</th>
                          <th className="p-2 text-right">المنتجات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o: any, idx: number) => (
                          <tr key={o.orderId || idx} className="border-t">
                            <td className="p-2">{formatDate(o.visitDate || o.orderDate || o.createdAt)}</td>
                            <td className="p-2">{o.pharmacyName}</td>
                            <td className="p-2">{formatCurrencyLYD(Number(o.totalOrderValue || 0))}</td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-2">
                                {(o.products || []).map((p: any, i: number) => (
                                  <span key={i} className="px-2 py-1 rounded bg-muted text-xs">
                                    {p.productName} × {Number(p.quantity || 0)}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ));
            })()}
          </div>
        </CardContent>
      </Card>

      {/* العلاقة بين منتجات المندوب الطبي ومنتجات المبيعات */}
      <Card>
        <CardHeader>
          <CardTitle>العلاقة بين منتجات المندوب الطبي ومنتجات المبيعات</CardTitle>
          <CardDescription>مقارنة العينات الموزعة والكمية المباعة والقيمة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="p-2 text-right">المنتج</th>
                  <th className="p-2 text-right">العينات الموزعة</th>
                  <th className="p-2 text-right">الكمية المباعة</th>
                  <th className="p-2 text-right">قيمة المبيعات</th>
                  <th className="p-2 text-right">نسبة التحويل</th>
                </tr>
              </thead>
              <tbody>
                {relationsByProduct.length === 0 ? (
                  <tr>
                    <td className="p-2" colSpan={5}>
                      <span className="text-sm text-muted-foreground">لا توجد بيانات لعرض العلاقة في الفترة المحددة.</span>
                    </td>
                  </tr>
                ) : (
                  relationsByProduct.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{row.name}</td>
                      <td className="p-2">{row.samples}</td>
                      <td className="p-2">{row.qty}</td>
                      <td className="p-2">{formatCurrencyLYD(row.value)}</td>
                      <td className="p-2">{row.conversion !== null ? `${row.conversion}%` : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalSalesdata;
