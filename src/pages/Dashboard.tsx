import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Download,
  Calendar,
  Building2,
  Stethoscope,
  Filter,
  RefreshCw,
  Tag,
  Package,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getDetailedVisits,
  DetailedVisit,
  DetailedVisitsResponse,
  DetailedVisitsParams,
  exportVisitsToExcel,
} from "@/api/Visits";
import { useAuthStore } from "@/stores/authStore";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
);

// Interface for processed visit data for display
interface ProcessedVisit {
  _id: string;
  visitDate: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  classification: string;
  brand: string;
  products: string[];
  samplesCount: number;
  notes?: string;
  medicalRepName: string;
  teamArea: string;
  teamProducts: string;
  doctorId: string; // إضافة معرف الطبيب
}

// Mock data for analytics
const mockAnalyticsData = {
  kpis: {
    totalVisits: 2847,
    totalRevenue: 125600,
    activeClinic: 45,
    avgVisitsPerDay: 23.7,
    growthRate: 12.5,
    satisfactionRate: 94.2,
  },
  monthlyTrends: {
    labels: [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ],
    visits: [180, 220, 195, 267, 289, 312, 298, 345, 378, 392, 415, 428],
    revenue: [8500, 11200, 9800, 13400, 14500, 15600, 14900, 17250, 18900, 19600, 20750, 21400],
  },
  specialtyDistribution: {
    labels: [
      "طب الأطفال",
      "طب الباطنة",
      "طب الأسنان",
      "طب العيون",
      "طب الجلدية",
      "طب النساء",
      "طب العظام",
    ],
    data: [25, 20, 18, 12, 10, 8, 7],
  },
  clinicComparison: {
    labels: ["عيادة النور", "عيادة الشفاء", "عيادة الأمل", "عيادة السلام", "عيادة الحياة"],
    visits: [450, 380, 320, 290, 250],
    revenue: [22500, 19000, 16000, 14500, 12500],
  },
  productPerformance: {
    labels: ["المنتج الأول", "المنتج الثاني", "المنتج الثالث", "المنتج الرابع", "المنتج الخامس"],
    sales: [85, 72, 68, 45, 38],
    satisfaction: [92, 88, 85, 78, 75],
  },
  timeAnalysis: {
    labels: [
      "8:00",
      "9:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ],
    visits: [12, 25, 35, 42, 38, 28, 45, 52, 38, 22],
  },
};

const ClinicsAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore();
  const id = user.user?._id;

  // Data states
  const [visits, setVisits] = useState<ProcessedVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<ProcessedVisit[]>([]);
  const [analyticsData, setAnalyticsData] = useState<DetailedVisitsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [medicalRepId, setMedicalRepId] = useState(id); // Default medical rep ID

  // Filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedClinic, setSelectedClinic] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(50);
  const [exportLoading, setExportLoading] = useState(false);

  // Process raw API data to display format
  const processVisitsData = (rawVisits: DetailedVisit[]): ProcessedVisit[] => {
    return rawVisits.map((visit) => ({
      _id: visit._id,
      visitDate: new Date(visit.visitDate).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        calendar: "gregory",
      }),
      doctorName: visit.doctorId.drName,
      specialty: visit.doctorId.specialty,
      clinicName: visit.doctorId.organizationName,
      classification: visit.doctorId.segment,
      brand: visit.doctorId.brand,
      products: visit.products.map((p) => p.productId?.PRODUCT || "غير محدد"),
      samplesCount: visit.products.reduce((sum, p) => sum + p.samplesCount, 0),
      notes: visit.notes,
      medicalRepName: `${visit.medicalRepId.firstName} ${visit.medicalRepId.lastName}`,
      teamArea: visit.medicalRepId.teamArea,
      teamProducts: visit.medicalRepId.teamProducts,
      doctorId: visit.doctorId._id, // إضافة معرف الطبيب
    }));
  };

  // Get unique values for filters from all data (not filtered data)
  const [allVisits, setAllVisits] = useState<ProcessedVisit[]>([]);

  // Store all visits separately to keep filters stable
  useEffect(() => {
    if (visits.length > 0 && allVisits.length === 0) {
      setAllVisits(visits);
    }
  }, [visits]);

  // Helper to sanitize unique lists (remove empty/blank values)
  const sanitizeUnique = (values: (string | undefined | null)[]) => [
    ...new Set(
      values
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
    ),
  ];
  const uniqueDoctors = sanitizeUnique(allVisits.map((visit) => visit.doctorName));
  const uniqueSpecialties = sanitizeUnique(allVisits.map((visit) => visit.specialty));
  const uniqueSegments = sanitizeUnique(allVisits.map((visit) => visit.classification));
  const uniqueBrands = sanitizeUnique(allVisits.map((visit) => visit.brand));
  const uniqueClinics = sanitizeUnique(allVisits.map((visit) => visit.clinicName));
  const uniqueProducts = sanitizeUnique(allVisits.flatMap((visit) => visit.products));

  // Fetch data from API
  const fetchVisitsData = async () => {
    setLoading(true);
    try {
      const params: DetailedVisitsParams = {
        page: currentPage,
        limit: pageLimit,
        startDate: fromDate || undefined,
        endDate: toDate || undefined,
        doctorName: selectedDoctor !== "all" ? selectedDoctor : undefined,
        specialization: selectedSpecialty !== "all" ? selectedSpecialty : undefined,
        segment: selectedSegment !== "all" ? selectedSegment : undefined,
        clinic: selectedClinic !== "all" ? selectedClinic : undefined,
        brand: selectedBrand !== "all" ? selectedBrand : undefined,
        products: selectedProducts.length > 0 ? selectedProducts : undefined,
      };

      const response = await getDetailedVisits(medicalRepId, params);
      console.log(response.data, "response");
      if (response.success && response.data) {
        setAnalyticsData(response.data);
        const processedVisits = processVisitsData(response.data.visits);
        setVisits(processedVisits);
        setFilteredVisits(processedVisits);
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchVisitsData();
  }, [
    medicalRepId,
    currentPage,
    fromDate,
    toDate,
    selectedDoctor,
    selectedSpecialty,
    selectedSegment,
    selectedBrand,
    selectedClinic,
    selectedProducts,
  ]);

  // Apply local filters (for immediate UI response)
  useEffect(() => {
    let filtered = visits;

    // Additional local filtering if needed
    setFilteredVisits(filtered);
  }, [visits]);

  const handleRefresh = () => {
    fetchVisitsData();
    toast.success("تم تحديث البيانات بنجاح");
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setSelectedDoctor("all");
    setSelectedSpecialty("all");
    setSelectedSegment("all");
    setSelectedBrand("all");
    setSelectedClinic("all");
    setSelectedProducts([]);
    setSelectedPeriod("daily");
    setCurrentPage(1);
    toast.success("تم مسح جميع الفلاتر");
  };

  // Export visits to Excel
  const handleExportToExcel = async () => {
    try {
      setExportLoading(true);

      const params: DetailedVisitsParams = {
        startDate: fromDate || undefined,
        endDate: toDate || undefined,
        doctorName: selectedDoctor !== "all" ? selectedDoctor : undefined,
        specialization: selectedSpecialty !== "all" ? selectedSpecialty : undefined,
        segment: selectedSegment !== "all" ? selectedSegment : undefined,
        clinic: selectedClinic !== "all" ? selectedClinic : undefined,
        brand: selectedBrand !== "all" ? selectedBrand : undefined,
        products: selectedProducts.length > 0 ? selectedProducts : undefined,
      };

      const blob = await exportVisitsToExcel(medicalRepId, params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const dateRange = fromDate && toDate ? `_${fromDate}_to_${toDate}` : `_${currentDate}`;
      link.download = `visits_report${dateRange}.xlsx`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("تم تصدير التقرير بنجاح");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("حدث خطأ أثناء تصدير التقرير");
    } finally {
      setExportLoading(false);
    }
  };

  // Calculate product performance from real data
  const productPerformanceData = () => {
    const productStats = uniqueProducts
      .map((product) => {
        const productVisits = visits.filter((visit) => visit.products.includes(product));
        const totalSamples = productVisits.reduce((sum, visit) => sum + visit.samplesCount, 0);
        const avgSamples =
          productVisits.length > 0 ? Math.round(totalSamples / productVisits.length) : 0;
        const satisfaction = Math.min(95, Math.max(70, 75 + Math.random() * 20)); // تقدير رضا العملاء

        return {
          product,
          visits: productVisits.length,
          samples: totalSamples,
          avgSamples,
          satisfaction: Math.round(satisfaction),
        };
      })
      .sort((a, b) => b.samples - a.samples);

    return {
      labels: productStats.map((p) => p.product),
      sales: productStats.map((p) => p.avgSamples),
      satisfaction: productStats.map((p) => p.satisfaction),
    };
  };

  // Update analytics data based on real data
  const updatedAnalyticsData = {
    ...mockAnalyticsData,
    kpis: {
      ...mockAnalyticsData.kpis,
      totalVisits: analyticsData?.statistics.totalVisits || 0,
      activeClinic: uniqueClinics.length,
      totalRevenue: (analyticsData?.statistics.totalSamplesDistributed || 0) * 50, // تقدير الإيرادات
      avgVisitsPerDay: analyticsData
        ? Math.round((analyticsData.statistics.totalVisits / 30) * 10) / 10
        : 0,
    },
    productPerformance: productPerformanceData(),
  };

  // Chart options with RTL support and professional styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        rtl: true,
        labels: {
          font: {
            family: "Cairo, sans-serif",
            size: 12,
          },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#3b82f6",
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: "Cairo, sans-serif",
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          family: "Cairo, sans-serif",
          size: 12,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          font: {
            family: "Cairo, sans-serif",
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          font: {
            family: "Cairo, sans-serif",
            size: 11,
          },
        },
      },
    },
  };

  // Monthly trends chart data
  const monthlyTrendsData = {
    labels: updatedAnalyticsData.monthlyTrends.labels,
    datasets: [
      {
        label: "عدد الزيارات",
        data: updatedAnalyticsData.monthlyTrends.visits,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: "الإيرادات (بالآلاف)",
        data: updatedAnalyticsData.monthlyTrends.revenue.map((r) => r / 1000),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  // Specialty distribution chart data
  const specialtyData = {
    labels: updatedAnalyticsData.specialtyDistribution.labels,
    datasets: [
      {
        data: updatedAnalyticsData.specialtyDistribution.data,
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#06b6d4",
          "#84cc16",
        ],
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverBorderWidth: 4,
      },
    ],
  };

  // Clinic comparison chart data
  const clinicComparisonData = {
    labels: updatedAnalyticsData.clinicComparison.labels,
    datasets: [
      {
        label: "عدد الزيارات",
        data: updatedAnalyticsData.clinicComparison.visits,
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "#3b82f6",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: "الإيرادات (بالآلاف)",
        data: updatedAnalyticsData.clinicComparison.revenue.map((r) => r / 1000),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "#10b981",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تحليلات العيادات المتقدمة</h1>
          <p className="text-gray-600">
            لوحة تحكم شاملة لمراقبة أداء العيادات والإحصائيات التفصيلية
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`} />
            تحديث البيانات
          </Button>
          <Button onClick={clearFilters} variant="outline" size="sm">
            <Filter className="h-4 w-4 ml-2" />
            مسح الفلاتر
          </Button>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">يومي</SelectItem>
              <SelectItem value="weekly">أسبوعي</SelectItem>
              <SelectItem value="monthly">شهري</SelectItem>
              <SelectItem value="yearly">سنوي</SelectItem>
            </SelectContent>
          </Select>
          {/* <Button 
            onClick={handleExportToExcel} 
            disabled={exportLoading}
            variant="outline" 
            className="gap-2"
          >
            <Download className={`h-4 w-4 ${exportLoading ? 'animate-spin' : ''}`} />
            {exportLoading ? 'جاري التصدير...' : 'تصدير إلى Excel'}
          </Button> */}
        </div>
      </div>

      {/* Filters Section */}
      <Card className="p-6 shadow-lg border-0">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">فلاتر البحث المتقدمة</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4" />
              من تاريخ
            </label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4" />
              إلى تاريخ
            </label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Doctor Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <User className="h-4 w-4" />
              الطبيب
            </label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الطبيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأطباء</SelectItem>
                {uniqueDoctors.map((doctor) => (
                  <SelectItem key={doctor} value={doctor}>
                    {doctor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specialty Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Stethoscope className="h-4 w-4" />
              التخصص
            </label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="اختر التخصص" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التخصصات</SelectItem>
                {uniqueSpecialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Segment Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Tag className="h-4 w-4" />
              الشريحة
            </label>
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الشريحة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الشرائح</SelectItem>
                {uniqueSegments.map((segment) => (
                  <SelectItem key={segment} value={segment}>
                    {segment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clinic Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Building2 className="h-4 w-4" />
              العيادة
            </label>
            <Select value={selectedClinic} onValueChange={setSelectedClinic}>
              <SelectTrigger>
                <SelectValue placeholder="اختر العيادة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع العيادات</SelectItem>
                {uniqueClinics.map((clinic) => (
                  <SelectItem key={clinic} value={clinic}>
                    {clinic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Tag className="h-4 w-4" />
              العلامة التجارية
            </label>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger>
                <SelectValue placeholder="اختر العلامة التجارية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع العلامات التجارية</SelectItem>
                {uniqueBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Package className="h-4 w-4" />
              المنتجات
            </label>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id="all-products"
                    checked={selectedProducts.length === 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedProducts([]);
                      }
                    }}
                  />
                  <label htmlFor="all-products" className="text-sm font-medium">
                    جميع المنتجات
                  </label>
                </div>
                {uniqueProducts.map((product) => (
                  <div key={product} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id={`product-${product}`}
                      checked={selectedProducts.includes(product)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProducts((prev) => [...prev, product]);
                        } else {
                          setSelectedProducts((prev) => prev.filter((p) => p !== product));
                        }
                      }}
                    />
                    <label htmlFor={`product-${product}`} className="text-sm">
                      {product}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">
            عرض <span className="font-semibold text-blue-600">{filteredVisits.length}</span> من أصل{" "}
            <span className="font-semibold text-blue-600">{visits.length}</span> زيارة
          </p>
        </div>
      </Card>

      {/* New Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctors Performance Chart */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              أداء الأطباء
            </CardTitle>
            <CardDescription>
              عدد الزيارات لكل طبيب - {uniqueDoctors.length} طبيب نشط
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                data={{
                  labels: uniqueDoctors,
                  datasets: [
                    {
                      label: "عدد الزيارات",
                      data: uniqueDoctors.map(
                        (doctor) => filteredVisits.filter((v) => v.doctorName === doctor).length
                      ),
                      backgroundColor: [
                        "rgba(59, 130, 246, 0.8)",
                        "rgba(16, 185, 129, 0.8)",
                        "rgba(245, 101, 101, 0.8)",
                        "rgba(251, 191, 36, 0.8)",
                        "rgba(139, 92, 246, 0.8)",
                        "rgba(236, 72, 153, 0.8)",
                        "rgba(6, 182, 212, 0.8)",
                      ],
                      borderColor: [
                        "rgb(59, 130, 246)",
                        "rgb(16, 185, 129)",
                        "rgb(245, 101, 101)",
                        "rgb(251, 191, 36)",
                        "rgb(139, 92, 246)",
                        "rgb(236, 72, 153)",
                        "rgb(6, 182, 212)",
                      ],
                      borderWidth: 2,
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    ...chartOptions.scales,
                    x: {
                      ...chartOptions.scales.x,
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Brands Performance Chart */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-500" />
              أداء العلامات التجارية
            </CardTitle>
            <CardDescription>
              توزيع الزيارات حسب العلامة التجارية - {uniqueBrands.length} علامة تجارية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut
                data={{
                  labels: uniqueBrands,
                  datasets: [
                    {
                      data: uniqueBrands.map(
                        (brand) => filteredVisits.filter((v) => v.brand === brand).length
                      ),
                      backgroundColor: [
                        "rgba(59, 130, 246, 0.8)",
                        "rgba(16, 185, 129, 0.8)",
                        "rgba(245, 101, 101, 0.8)",
                        "rgba(251, 191, 36, 0.8)",
                        "rgba(139, 92, 246, 0.8)",
                      ],
                      borderColor: [
                        "rgb(59, 130, 246)",
                        "rgb(16, 185, 129)",
                        "rgb(245, 101, 101)",
                        "rgb(251, 191, 36)",
                        "rgb(139, 92, 246)",
                      ],
                      borderWidth: 3,
                    },
                  ],
                }}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: "bottom",
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                          size: 12,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinics Performance Chart */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-500" />
              أداء العيادات
            </CardTitle>
            <CardDescription>
              عدد الزيارات لكل عيادة - {uniqueClinics.length} عيادة نشطة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                data={{
                  labels: uniqueClinics.map((clinic) =>
                    clinic.length > 15 ? clinic.substring(0, 15) + "..." : clinic
                  ),
                  datasets: [
                    {
                      label: "عدد الزيارات",
                      data: uniqueClinics.map(
                        (clinic) => filteredVisits.filter((v) => v.clinicName === clinic).length
                      ),
                      backgroundColor: "rgba(139, 92, 246, 0.8)",
                      borderColor: "rgb(139, 92, 246)",
                      borderWidth: 2,
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  ...chartOptions,
                  indexAxis: "y",
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Segments Performance Chart */}
        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-500" />
              أداء الشرائح A & B
            </CardTitle>
            <CardDescription>مقارنة أداء الشرائح المختلفة للأطباء</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                data={{
                  labels: ["الشريحة A", "الشريحة B"],
                  datasets: [
                    {
                      label: "عدد الزيارات",
                      data: [
                        filteredVisits.filter((v) => v.classification === "A").length,
                        filteredVisits.filter((v) => v.classification === "B").length,
                      ],
                      backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(16, 185, 129, 0.8)"],
                      borderColor: ["rgb(59, 130, 246)", "rgb(16, 185, 129)"],
                      borderWidth: 3,
                      borderRadius: 12,
                      borderSkipped: false,
                    },
                    {
                      label: "إجمالي العينات",
                      data: [
                        filteredVisits
                          .filter((v) => v.classification === "A")
                          .reduce((sum, v) => sum + v.samplesCount, 0),
                        filteredVisits
                          .filter((v) => v.classification === "B")
                          .reduce((sum, v) => sum + v.samplesCount, 0),
                      ],
                      backgroundColor: ["rgba(245, 101, 101, 0.8)", "rgba(251, 191, 36, 0.8)"],
                      borderColor: ["rgb(245, 101, 101)", "rgb(251, 191, 36)"],
                      borderWidth: 3,
                      borderRadius: 12,
                      borderSkipped: false,
                    },
                  ],
                }}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: true,
                      position: "top" as const,
                      labels: {
                        font: {
                          family: "Cairo, sans-serif",
                          size: 12,
                          weight: "bold",
                        },
                        usePointStyle: true,
                        padding: 20,
                      },
                    },
                    tooltip: {
                      ...chartOptions.plugins.tooltip,
                      callbacks: {
                        label: function (context: any) {
                          const label = context.dataset.label || "";
                          const value = context.parsed.y;
                          return `${label}: ${value.toLocaleString("ar-SA")}`;
                        },
                      },
                    },
                  },
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      beginAtZero: true,
                      ticks: {
                        ...chartOptions.scales.y.ticks,
                        callback: function (value: any) {
                          return value.toLocaleString("ar-SA");
                        },
                      },
                    },
                  },
                  animation: {
                    duration: 2000,
                    easing: "easeInOutQuart",
                  },
                  interaction: {
                    intersect: false,
                    mode: "index",
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        {/* <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              اتجاهات الزيارات والإيرادات الشهرية (البيانات المفلترة)
            </CardTitle>
            <CardDescription>
              مقارنة شهرية لعدد الزيارات والإيرادات المحققة - عرض {filteredVisits.length} من أصل {visits.length} زيارة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={{
                ...monthlyTrendsData,
                datasets: monthlyTrendsData.datasets.map(dataset => ({
                  ...dataset,
                  label: dataset.label + ` (${filteredVisits.length} زيارة مفلترة)`
                }))
              }} options={chartOptions} />
            </div>
          </CardContent>
        </Card> */}

        {/* Specialty Distribution */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              توزيع الزيارات حسب التخصص (البيانات المفلترة)
            </CardTitle>
            <CardDescription>
              نسبة الزيارات لكل تخصص طبي - إجمالي {filteredVisits.length} زيارة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut
                data={{
                  ...specialtyData,
                  labels: [...new Set(filteredVisits.map((v) => v.specialty))],
                  datasets: [
                    {
                      ...specialtyData.datasets[0],
                      data: [...new Set(filteredVisits.map((v) => v.specialty))].map(
                        (specialty) =>
                          filteredVisits.filter((v) => v.specialty === specialty).length
                      ),
                    },
                  ],
                }}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: "right" as const,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Clinic Comparison */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              مقارنة أداء العيادات (البيانات المفلترة)
            </CardTitle>
            <CardDescription>
              مقارنة الزيارات والإيرادات بين العيادات المختلفة - {uniqueClinics.length} عيادة نشطة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                data={{
                  labels: [...new Set(filteredVisits.map((v) => v.clinicName))],
                  datasets: [
                    {
                      ...clinicComparisonData.datasets[0],
                      label: `عدد الزيارات (${filteredVisits.length} إجمالي)`,
                      data: [...new Set(filteredVisits.map((v) => v.clinicName))].map(
                        (clinic) => filteredVisits.filter((v) => v.clinicName === clinic).length
                      ),
                    },
                    {
                      ...clinicComparisonData.datasets[1],
                      label: "الإيرادات المقدرة (بالآلاف)",
                      data: [...new Set(filteredVisits.map((v) => v.clinicName))].map((clinic) =>
                        Math.round(
                          (filteredVisits.filter((v) => v.clinicName === clinic).length * 500) /
                            1000
                        )
                      ),
                    },
                  ],
                }}
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    x: {
                      ...chartOptions.scales.x,
                      stacked: false,
                    },
                    y: {
                      ...chartOptions.scales.y,
                      stacked: false,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Performance Area Chart */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              أداء المنتجات
            </CardTitle>
            <CardDescription>تحليل شامل لأداء المنتجات ورضا العملاء</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line
                data={{
                  labels: updatedAnalyticsData.productPerformance.labels,
                  datasets: [
                    {
                      label: "المبيعات (%)",
                      data: updatedAnalyticsData.productPerformance.sales,
                      borderColor: "#f59e0b",
                      backgroundColor: "rgba(245, 158, 11, 0.1)",
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: "#f59e0b",
                      pointBorderColor: "#ffffff",
                      pointBorderWidth: 2,
                      pointRadius: 6,
                    },
                    {
                      label: "رضا العملاء (%)",
                      data: updatedAnalyticsData.productPerformance.satisfaction,
                      borderColor: "#8b5cf6",
                      backgroundColor: "rgba(139, 92, 246, 0.1)",
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: "#8b5cf6",
                      pointBorderColor: "#ffffff",
                      pointBorderWidth: 2,
                      pointRadius: 6,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}

      {/* Visits Table */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            جدول الزيارات
          </CardTitle>
          <CardDescription>عرض تفصيلي لجميع الزيارات المسجلة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table dir="rtl" className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-right">التاريخ</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">الطبيب</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">العيادة</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">الشريحة</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">التخصص</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">المنتجات</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">عدد العينات</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">المندوب</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="border border-gray-300 px-4 py-8 text-center text-gray-500"
                    >
                      لا توجد زيارات متاحة
                    </td>
                  </tr>
                ) : (
                  filteredVisits.map((visit, index) => (
                    <tr key={visit._id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{visit.visitDate}</td>
                      <td className="border border-gray-300 px-4 py-2">{visit.doctorName}</td>
                      <td className="border border-gray-300 px-4 py-2">{visit.clinicName}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Badge variant="outline">{visit.classification}</Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Badge variant="secondary">{visit.specialty}</Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {visit.products.map((product, idx) => (
                            <Badge key={idx} variant="default" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <Badge variant="destructive">{visit.samplesCount}</Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{visit.medicalRepName}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/doctor-card/${visit.doctorId}`)}
                          >
                            عرض الطبيب
                          </Button>
                        </div>
                      </td>
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

export default ClinicsAnalytics;
