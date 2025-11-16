import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { getSalesRepFinalOrders } from '@/api/FinancialCollector';
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  MapPin,
  User,
  Package,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  ShoppingCart,
  Building2,
  Activity,
  CalendarIcon,
  X
} from 'lucide-react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useAuthStore } from '@/stores/authStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Navigate, useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Product {
  productId: string;
  productName: string;
  productCode: string;
  productBrand: string;
  price: number;
  quantity: number;
  totalValue: number;
}

interface OrderData {
  orderId: string;
  visitDate: string;
  salesRepName: string;
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyArea: string;
  products: Product[];
  totalOrderValue: number;
  orderStatus: string;
  FinalOrderStatusValue: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: OrderData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

interface Filters {
  search: string;
  pharmacyName: string;
  area: string;
  salesRep: string;
  status: string;
  finalOrderStatus: string;
  dateFrom: string;
  dateTo: string;
}

const AdminDashboard: React.FC = () => {
  const naviagte=useNavigate()
  const user = useAuthStore()
  const [data, setData] = useState<OrderData[]>([]);
  const [ordersData, setOrdersData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Date states for the date picker
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  
  // متغيرات للقيم الفريدة للفلاتر
  const [uniqueAreas, setUniqueAreas] = useState<string[]>([]);
  const [uniqueSalesReps, setUniqueSalesReps] = useState<string[]>([]);
  const [uniquePharmacies, setUniquePharmacies] = useState<string[]>([]);
  const [uniqueOrderStatuses, setUniqueOrderStatuses] = useState<string[]>([]);
  const [uniqueFinalOrderStatuses, setUniqueFinalOrderStatuses] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    pharmacyName: 'all',
    area: 'all',
    salesRep: 'all',
    status: 'all',
    finalOrderStatus: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Update filters when date picker values change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : '',
      dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : ''
    }));
  }, [dateFrom, dateTo]);

  const filteredData = React.useMemo(() => {
    return ordersData.filter(order => {
      const matchesSearch = !filters.search || 
        order.pharmacyName.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.salesRepName.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.orderId.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesPharmacyName = !filters.pharmacyName || filters.pharmacyName === 'all' || 
        order.pharmacyName.toLowerCase().includes(filters.pharmacyName.toLowerCase());
      
      const matchesArea = !filters.area || filters.area === 'all' || order.pharmacyArea === filters.area;
      const matchesSalesRep = !filters.salesRep || filters.salesRep === 'all' || order.salesRepName === filters.salesRep;
      const matchesStatus = !filters.status || filters.status === 'all' || order.orderStatus === filters.status;
      const matchesFinalOrderStatus = !filters.finalOrderStatus || filters.finalOrderStatus === 'all' || order.FinalOrderStatusValue === filters.finalOrderStatus;
      
      // Date filtering
      const orderDate = new Date(order.visitDate);
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
      
      let matchesDate = true;
      if (fromDate && toDate) {
        matchesDate = orderDate >= fromDate && orderDate <= toDate;
      } else if (fromDate) {
        matchesDate = orderDate >= fromDate;
      } else if (toDate) {
        matchesDate = orderDate <= toDate;
      }
      
      return matchesSearch && matchesPharmacyName && matchesArea && matchesSalesRep && matchesStatus && matchesFinalOrderStatus && matchesDate;
    });
  }, [ordersData, filters]);

  // إحصائيات محسوبة
  const stats = React.useMemo(() => {
    const totalOrders = filteredData.length;
    const totalRevenue = filteredData.reduce((sum, order) => sum + order.totalOrderValue, 0);
    const uniquePharmacies = new Set(filteredData.map(order => order.pharmacyName)).size;
    const uniqueSalesReps = new Set(filteredData.map(order => order.salesRepName)).size;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      totalRevenue,
      uniquePharmacies,
      uniqueSalesReps,
      avgOrderValue
    };
  }, [filteredData]);

  // بيانات الرسوم البيانية
  const chartData = React.useMemo(() => {
    // أداء مندوبي المبيعات
    const salesRepPerformance = filteredData.reduce((acc, order) => {
      const rep = order.salesRepName;
      if (!acc[rep]) {
        acc[rep] = { orders: 0, revenue: 0 };
      }
      acc[rep].orders += 1;
      acc[rep].revenue += order.totalOrderValue;
      return acc;
    }, {} as Record<string, { orders: number; revenue: number }>);

    // أداء المناطق
    const areaPerformance = filteredData.reduce((acc, order) => {
      const area = order.pharmacyArea;
      if (!acc[area]) {
        acc[area] = { orders: 0, revenue: 0 };
      }
      acc[area].orders += 1;
      acc[area].revenue += order.totalOrderValue;
      return acc;
    }, {} as Record<string, { orders: number; revenue: number }>);

    // أداء الصيدليات
    const pharmacyPerformance = filteredData.reduce((acc, order) => {
      const pharmacy = order.pharmacyName;
      if (!acc[pharmacy]) {
        acc[pharmacy] = { orders: 0, revenue: 0 };
      }
      acc[pharmacy].orders += 1;
      acc[pharmacy].revenue += order.totalOrderValue;
      return acc;
    }, {} as Record<string, { orders: 0; revenue: 0 }>);

    // أداء المنتجات
    const productSales = filteredData.reduce((acc, order) => {
      order.products.forEach(product => {
        const brand = product.productName;
        if (!acc[brand]) {
          acc[brand] = { quantity: 0, revenue: 0 };
        }
        acc[brand].quantity += product.quantity;
        acc[brand].revenue += product.totalValue;
      });
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number }>);

    return {
      salesRepPerformance,
      areaPerformance,
      productSales,
      pharmacyPerformance
    };
  }, [filteredData]);

  // جلب البيانات من API
  const AdminId = user.user._id
  console.log(AdminId)
  const fetchOrders = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      
      // إعداد المعاملات للـ API
      const params = {
        page,
        limit,
        pharmacyName: filters.pharmacyName !== 'all' ? filters.pharmacyName : '',
        orderStatus: filters.status !== 'all' ? filters.status : '',
        finalOrderStatus: filters.finalOrderStatus !== 'all' ? filters.finalOrderStatus : '',
        area: filters.area !== 'all' ? filters.area : '',
        salesRep: filters.salesRep !== 'all' ? filters.salesRep : '',
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      };
      
      const result: ApiResponse = await getSalesRepFinalOrders(AdminId, page, limit, params);
      
      if (result.success) {
        console.log(result)
        setData(result.data);
        setOrdersData(result.data);
        setCurrentPage(result.pagination.currentPage);
        setTotalPages(result.pagination.totalPages);
        setTotalRecords(result.pagination.totalRecords);
        
        // استخراج القيم الفريدة للفلاتر
        const areasData = [...new Set(result.data.map(order => order.pharmacyArea))];
        const salesRepsData = [...new Set(result.data.map(order => order.salesRepName))];
        const pharmaciesData = [...new Set(result.data.map(order => order.pharmacyName))];
        const orderStatusesData = [...new Set(result.data.map(order => order.orderStatus))];
        const finalOrderStatusesData = [...new Set(result.data.map(order => order.FinalOrderStatusValue))];
        
        setUniqueAreas(areasData);
        setUniqueSalesReps(salesRepsData);
        setUniquePharmacies(pharmaciesData);
        setUniqueOrderStatuses(orderStatusesData);
        setUniqueFinalOrderStatuses(finalOrderStatusesData);
      } else {
        toast({
          title: "خطأ",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [filters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchOrders(page);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      pharmacyName: 'all',
      area: 'all',
      salesRep: 'all',
      status: 'all',
      finalOrderStatus: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const clearDateFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  // دالة لترجمة حالات الطلبات
  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'انتظار مالي',
      'approved': 'مقبول مالي',
      'rejected': 'مرفوض مالي'
    };
    return statusMap[status] || status;
  };

  // دالة لترجمة حالات الطلبيات النهائية
  const getFinalOrderStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'انتظار طلبيات',
      'approved': 'موافق طلبيات',
      'rejected': 'مرفوض طلبيات'
    };
    return statusMap[status] || status;
  };

  // دالة لتحديد لون الحالة
  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* العنوان الرئيسي */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">لوحة تحكم الأدمن</h1>
          <p className="text-muted-foreground mt-2">إدارة ومراقبة جميع الطلبات النهائية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            تصدير البيانات
          </Button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">إجمالي الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalOrders}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">طلب نهائي</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 dark:text-green-400">دينار ليبي</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">عدد الصيدليات</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.uniquePharmacies}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">صيدلية فريدة</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">مندوبي المبيعات</CardTitle>
            <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.uniqueSalesReps}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400">مندوب نشط</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 border-teal-200 dark:border-teal-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-300">متوسط قيمة الطلب</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900 dark:text-teal-100">{stats.avgOrderValue.toFixed(0)}</div>
            <p className="text-xs text-teal-600 dark:text-teal-400">دينار ليبي</p>
          </CardContent>
        </Card>
      </div>

      {/* الفلاتر */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلترة البيانات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">البحث العام</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث في الطلبات..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">اسم الصيدلية</label>
              <Select value={filters.pharmacyName} onValueChange={(value) => setFilters(prev => ({ ...prev, pharmacyName: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الصيدلية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الصيدليات</SelectItem>
                  {uniquePharmacies.map(pharmacy => (
                    <SelectItem key={pharmacy} value={pharmacy}>{pharmacy}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">المنطقة</label>
              <Select value={filters.area} onValueChange={(value) => setFilters(prev => ({ ...prev, area: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المنطقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المناطق</SelectItem>
                  {uniqueAreas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">مندوب المبيعات</label>
              <Select value={filters.salesRep} onValueChange={(value) => setFilters(prev => ({ ...prev, salesRep: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المندوب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المندوبين</SelectItem>
                  {uniqueSalesReps.map(rep => (
                    <SelectItem key={rep} value={rep}>{rep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الحالة المالية</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة المالية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات المالية</SelectItem>
                  <SelectItem value="pending">انتظار مالي</SelectItem>
                  <SelectItem value="approved">مقبول مالي</SelectItem>
                  <SelectItem value="rejected">مرفوض مالي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">حالة الطلبيات</label>
              <Select value={filters.finalOrderStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, finalOrderStatus: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر حالة الطلبيات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع حالات الطلبيات</SelectItem>
                  <SelectItem value="pending">انتظار طلبيات</SelectItem>
                  <SelectItem value="approved">موافق طلبيات</SelectItem>
                  <SelectItem value="rejected">مرفوض طلبيات</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">من تاريخ</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "yyyy-MM-dd") : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    locale={ar}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">إلى تاريخ</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "yyyy-MM-dd") : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    locale={ar}
                    disabled={dateFrom ? { before: dateFrom } : undefined}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 flex items-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearDateFilters}
                className="w-full"
                disabled={!dateFrom && !dateTo}
              >
                <X className="h-4 w-4 ml-2" />
                مسح التواريخ
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={resetFilters} variant="outline" size="sm">
              إعادة تعيين جميع الفلاتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* التحليلات والرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* أداء مندوبي المبيعات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              أداء مندوبي المبيعات
            </CardTitle>
            <CardDescription>إجمالي الإيرادات لكل مندوب مبيعات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                data={{
                  labels: Object.keys(chartData.salesRepPerformance).slice(0, 10),
                  datasets: [
                    {
                      label: 'الإيرادات',
                      data: Object.values(chartData.salesRepPerformance).slice(0, 10).map(rep => rep.revenue),
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 1,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `الإيرادات: ${context.parsed.y.toLocaleString()} د.ل`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return value.toLocaleString() + ' د.ل';
                        }
                      }
                    },
                    x: {
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* أداء المناطق */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              أداء المناطق
            </CardTitle>
            <CardDescription>توزيع الطلبات حسب المناطق</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut
                data={{
                  labels: Object.keys(chartData.areaPerformance).slice(0, 8),
                  datasets: [
                    {
                      data: Object.values(chartData.areaPerformance).slice(0, 8).map(area => area.orders),
                      backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(147, 51, 234, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(20, 184, 166, 0.8)',
                        'rgba(156, 163, 175, 0.8)',
                      ],
                      borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(147, 51, 234, 1)',
                        'rgba(236, 72, 153, 1)',
                        'rgba(20, 184, 166, 1)',
                        'rgba(156, 163, 175, 1)',
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed;
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} طلب (${percentage}%)`;
                        }
                      }
                    }
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* مخططات المنتجات والصيدليات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* أفضل المنتجات مبيعاً */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              أفضل المنتجات مبيعاً
            </CardTitle>
            <CardDescription>المنتجات الأكثر مبيعاً حسب الكمية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                data={{
                  labels: Object.keys(chartData.productSales)
                    .sort((a, b) => chartData.productSales[b].quantity - chartData.productSales[a].quantity)
                    .slice(0, 8),
                  datasets: [
                    {
                      label: 'الكمية المباعة',
                      data: Object.keys(chartData.productSales)
                        .sort((a, b) => chartData.productSales[b].quantity - chartData.productSales[a].quantity)
                        .slice(0, 8)
                        .map(product => chartData.productSales[product].quantity),
                      backgroundColor: 'rgba(34, 197, 94, 0.8)',
                      borderColor: 'rgba(34, 197, 94, 1)',
                      borderWidth: 1,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `الكمية: ${context.parsed.y.toLocaleString()} قطعة`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return value.toLocaleString() + ' قطعة';
                        }
                      }
                    },
                    x: {
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* أفضل الصيدليات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              أفضل الصيدليات
            </CardTitle>
            <CardDescription>الصيدليات الأكثر طلباً وإيراداً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Pie
                data={{
                  labels: Object.keys(chartData.pharmacyPerformance).slice(0, 8),
                  datasets: [
                    {
                      data: Object.values(chartData.pharmacyPerformance).slice(0, 8).map(pharmacy => pharmacy.orders),
                      backgroundColor: [
                        'rgba(147, 51, 234, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(20, 184, 166, 0.8)',
                        'rgba(156, 163, 175, 0.8)',
                      ],
                      borderColor: [
                        'rgba(147, 51, 234, 1)',
                        'rgba(236, 72, 153, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(20, 184, 166, 1)',
                        'rgba(156, 163, 175, 1)',
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                      labels: {
                        boxWidth: 12,
                        padding: 8,
                        font: {
                          size: 11
                        }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed;
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} طلب (${percentage}%)`;
                        }
                      }
                    }
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أفضل المناطق أداءً - Chart احترافي */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            أفضل المناطق أداءً
          </CardTitle>
          <CardDescription>المناطق الأكثر إيراداً وطلبات مع رسم بياني تفاعلي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* الرسم البياني */}
            <div className="h-80">
              <Bar
                data={{
                  labels: Object.keys(chartData.areaPerformance).slice(0, 6),
                  datasets: [
                    {
                      label: 'الإيرادات (د.ل)',
                      data: Object.values(chartData.areaPerformance).slice(0, 6).map(area => area.revenue),
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)'
                      ],
                      borderColor: [
                        'rgba(59, 130, 246, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(236, 72, 153, 1)'
                      ],
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: 'white',
                      bodyColor: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: 1,
                      callbacks: {
                        label: function(context) {
                          const areaName = context.label;
                          const areaData = chartData.areaPerformance[areaName];
                          return [
                            `الإيرادات: ${context.parsed.y.toLocaleString()} د.ل`,
                            `عدد الطلبات: ${areaData.orders}`
                          ];
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                      },
                      ticks: {
                        callback: function(value) {
                          return value.toLocaleString() + ' د.ل';
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
            
            {/* قائمة أفضل 3 مناطق */}
            <div className="space-y-4">
              {Object.entries(chartData.areaPerformance)
                .sort(([,a], [,b]) => b.revenue - a.revenue)
                .slice(0, 3)
                .map(([area, data], index) => (
                  <div key={area} className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-50 via-yellow-100 to-amber-50 border-yellow-300 dark:from-yellow-950 dark:to-amber-900 dark:border-yellow-700' :
                    index === 1 ? 'bg-gradient-to-r from-gray-50 via-slate-100 to-gray-50 border-gray-300 dark:from-gray-950 dark:to-slate-900 dark:border-gray-700' :
                    'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-orange-300 dark:from-orange-950 dark:to-amber-900 dark:border-orange-700'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                          index === 1 ? 'bg-gradient-to-r from-gray-500 to-slate-500' :
                          'bg-gradient-to-r from-orange-500 to-amber-500'
                        }`}>
                          #{index + 1}
                        </div>
                        <h3 className="font-bold text-lg">{area}</h3>
                      </div>
                      <Badge variant={index === 0 ? 'default' : 'secondary'} className="text-xs">
                        {index === 0 ? '🏆 الأول' : index === 1 ? '🥈 الثاني' : '🥉 الثالث'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-2 bg-white/50 rounded-lg dark:bg-black/20">
                        <p className="text-2xl font-bold text-green-600">{data.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">إجمالي الإيرادات (د.ل)</p>
                      </div>
                      <div className="text-center p-2 bg-white/50 rounded-lg dark:bg-black/20">
                        <p className="text-2xl font-bold text-blue-600">{data.orders}</p>
                        <p className="text-xs text-muted-foreground">عدد الطلبات</p>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* أفضل الصيدليات أداءً */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-green-600" />
            أفضل الصيدليات أداءً
          </CardTitle>
          <CardDescription>الصيدليات الأكثر إيراداً وطلبات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* الرسم البياني الدائري */}
            <div className="h-80">
              <Doughnut
                data={{
                  labels: Object.keys(chartData.pharmacyPerformance).slice(0, 5),
                  datasets: [{
                    data: Object.values(chartData.pharmacyPerformance).slice(0, 5).map(pharmacy => pharmacy.revenue),
                    backgroundColor: [
                      'rgba(34, 197, 94, 0.8)',
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(239, 68, 68, 0.8)',
                      'rgba(139, 92, 246, 0.8)'
                    ],
                    borderColor: [
                      'rgba(34, 197, 94, 1)',
                      'rgba(59, 130, 246, 1)',
                      'rgba(245, 158, 11, 1)',
                      'rgba(239, 68, 68, 1)',
                      'rgba(139, 92, 246, 1)'
                    ],
                    borderWidth: 3,
                    hoverOffset: 10
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: 'white',
                      bodyColor: 'white',
                      callbacks: {
                        label: function(context) {
                          const pharmacyName = context.label;
                          const pharmacyData = chartData.pharmacyPerformance[pharmacyName];
                          const total = Object.values(chartData.pharmacyPerformance).reduce((sum, p) => sum + p.revenue, 0);
                          const percentage = ((pharmacyData.revenue / total) * 100).toFixed(1);
                          return [
                            `${pharmacyName}`,
                            `الإيرادات: ${pharmacyData.revenue.toLocaleString()} د.ل`,
                            `النسبة: ${percentage}%`,
                            `الطلبات: ${pharmacyData.orders}`
                          ];
                        }
                      }
                    }
                  }
                }}
              />
            </div>
            
            {/* قائمة أفضل الصيدليات */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {Object.entries(chartData.pharmacyPerformance)
                .sort(([,a], [,b]) => b.revenue - a.revenue)
                .slice(0, 8)
                .map(([pharmacy, data], index) => (
                  <div key={pharmacy} className="p-3 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-900 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{pharmacy}</h4>
                          <p className="text-xs text-muted-foreground">{data.orders} طلب</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{data.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">د.ل</p>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* أفضل المنتجات مبيعاً */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            أفضل المنتجات مبيعاً
          </CardTitle>
          <CardDescription>المنتجات الأكثر مبيعاً من حيث الكمية والإيرادات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* الرسم البياني الأفقي */}
            <div className="h-80">
              <Bar
                data={{
                  labels: Object.keys(chartData.productSales).slice(0, 6),
                  datasets: [
                    {
                      label: 'الكمية المباعة',
                      data: Object.values(chartData.productSales).slice(0, 6).map(product => product.quantity),
                      backgroundColor: 'rgba(147, 51, 234, 0.8)',
                      borderColor: 'rgba(147, 51, 234, 1)',
                      borderWidth: 2,
                      borderRadius: 6,
                    }
                  ]
                }}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: 'white',
                      bodyColor: 'white',
                      callbacks: {
                        label: function(context) {
                          const productName = context.label;
                          const productData = chartData.productSales[productName];
                          return [
                            `الكمية: ${productData.quantity.toLocaleString()}`,
                            `الإيرادات: ${productData.revenue.toLocaleString()} د.ل`
                          ];
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                      }
                    },
                    y: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
            
            {/* قائمة أفضل المنتجات */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {Object.entries(chartData.productSales)
                .sort(([,a], [,b]) => b.quantity - a.quantity)
                .slice(0, 8)
                .map(([product, data], index) => (
                  <div key={product} className="p-3 rounded-lg border bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-900 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{product}</h4>
                          <p className="text-xs text-muted-foreground">{data.revenue.toLocaleString()} د.ل</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">{data.quantity.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">قطعة</p>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </CardContent>
      </Card>



      {/* جدول البيانات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>جميع الطلبات النهائية ({filteredData.length})</span>
            <Badge variant="secondary">{totalRecords} إجمالي</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-start p-3 font-medium">تاريخ الزيارة</th>
                  <th className="text-start p-3 font-medium">مندوب المبيعات</th>
                  <th className="text-start p-3 font-medium">الصيدلية</th>
                  <th className="text-start p-3 font-medium">المنطقة</th>
                  <th className="text-start p-3 font-medium">الحالة المالية</th>
                  <th className="text-start p-3 font-medium">حالة الطلبيات</th>
                  <th className="text-start p-3 font-medium">قيمة الطلب</th>
                  <th className="text-start p-3 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((order) => (
                  <tr key={order.orderId} className="border-b hover:bg-muted/50">
            
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(order.visitDate).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{order.salesRepName}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs">
                        <div className="font-medium text-sm">{order.pharmacyName}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {order.pharmacyAddress}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">
                        {order.pharmacyArea}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={`text-xs ${getStatusColor(order.orderStatus)}`}>
                        {getStatusLabel(order.orderStatus)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={`text-xs ${getStatusColor(order.FinalOrderStatusValue)}`}>
                        {getFinalOrderStatusLabel(order.FinalOrderStatusValue)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-sm">
                        {order.totalOrderValue.toLocaleString()} د.ل
                      </div>
                    </td>
                    <td className="p-3">
                      <Button onClick={()=>naviagte(`${order.orderId}`)} variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* التنقل بين الصفحات */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">
                عرض {((currentPage - 1) * 10) + 1} إلى {Math.min(currentPage * 10, totalRecords)} من {totalRecords} نتيجة
              </div>
              
              <div className="flex items-center gap-4">
                {/* اختيار عدد العناصر في الصفحة */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">عرض:</span>
                  <Select 
                    value="10" 
                    onValueChange={(value) => {
                      const newLimit = parseInt(value);
                      fetchOrders(1, newLimit);
                    }}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* أزرار التنقل */}
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-2"
                  >
                    الأولى
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3"
                  >
                    السابق
                  </Button>
                  
                  {/* أرقام الصفحات */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3"
                  >
                    التالي
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2"
                  >
                    الأخيرة
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;