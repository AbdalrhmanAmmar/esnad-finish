import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, TrendingUp, TrendingDown, Package, DollarSign, Pill, BarChart3, Loader2, MapPin, Users, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { getSalesRepOneFinalOrders } from '@/api/FinancialCollector';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Types for API data
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
  page: number;
  limit: number;
  pharmacyName: string;
  productName: string;
  orderStatus: string;
  FinalOrderStatusValue: string;
}

const PharmacyDashboard = () => {
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 10,
    pharmacyName: '',
    productName: '',
    orderStatus: 'all',
    FinalOrderStatusValue: 'all'
  });

  const [ordersData, setOrdersData] = useState<OrderData[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  });
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalQuantity: 0,
    totalOrders: 0,
    averageOrderValue: 0
  });

  // Fetch orders data from API
  const fetchOrdersData = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const response: ApiResponse = await getSalesRepOneFinalOrders(
        user._id,
        filters.page,
        filters.limit
      );
      
      if (response.success) {
        let filteredOrders = response.data;
        
        // Apply client-side filters
        if (filters.pharmacyName) {
          filteredOrders = filteredOrders.filter(order => 
            order.pharmacyName.toLowerCase().includes(filters.pharmacyName.toLowerCase())
          );
        }
        
        if (filters.productName) {
          filteredOrders = filteredOrders.filter(order => 
            order.products.some(product => 
              product.productName.toLowerCase().includes(filters.productName.toLowerCase())
            )
          );
        }
        
        if (filters.orderStatus !== 'all') {
          filteredOrders = filteredOrders.filter(order => 
            order.orderStatus === filters.orderStatus
          );
        }
        
        if (filters.FinalOrderStatusValue !== 'all') {
          filteredOrders = filteredOrders.filter(order => 
            order.FinalOrderStatusValue === filters.FinalOrderStatusValue
          );
        }
        
        setOrdersData(filteredOrders);
        setPagination(response.pagination);
        
        // Calculate statistics
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalOrderValue, 0);
        const totalQuantity = filteredOrders.reduce((sum, order) => 
          sum + order.products.reduce((productSum, product) => productSum + product.quantity, 0), 0
        );
        const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
        
        setStatistics({
          totalRevenue,
          totalQuantity,
          totalOrders: filteredOrders.length,
          averageOrderValue
        });
      } else {
        toast({
          title: 'خطأ',
          description: response.message || 'فشل في جلب البيانات',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب البيانات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrdersData();
  }, [user?._id, filters.page, filters.limit]);

  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    if (key === 'page' || key === 'limit') {
      setFilters(prev => ({ ...prev, [key]: Number(value) }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value as string }));
    }
  };

  const applyFilters = () => {
    fetchOrdersData();
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      pharmacyName: '',
      productName: '',
      orderStatus: 'all',
      FinalOrderStatusValue: 'all'
    });
  };

  // Chart data preparation from real API data
  const chartData = {
    pharmacyRevenue: ordersData.reduce((acc, order) => {
      const existing = acc.find(item => item.name === order.pharmacyName);
      if (existing) {
        existing.value += order.totalOrderValue;
      } else {
        acc.push({ name: order.pharmacyName, value: order.totalOrderValue });
      }
      return acc;
    }, [] as { name: string; value: number }[]),
    
    brandPerformance: ordersData.reduce((acc, order) => {
      order.products.forEach(product => {
        const existing = acc.find(item => item.name === product.productBrand);
        if (existing) {
          existing.value += product.totalValue;
        } else {
          acc.push({ name: product.productBrand, value: product.totalValue });
        }
      });
      return acc;
    }, [] as { name: string; value: number }[]),
    
    productSales: ordersData.reduce((acc, order) => {
      order.products.forEach(product => {
        const existing = acc.find(item => item.name === product.productName);
        if (existing) {
          existing.value += product.quantity;
        } else {
          acc.push({ name: product.productName, value: product.quantity });
        }
      });
      return acc;
    }, [] as { name: string; value: number }[])
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-LY', {
      style: 'currency',
      currency: 'LYD'
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">لوحة تحكم الصيدليات</h1>
          <p className="text-muted-foreground mt-1">تحليل شامل لأداء الصيدليات والمبيعات</p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-primary" />
          <Badge variant="secondary" className="text-sm">
            {loading ? 'جاري التحميل...' : `${ordersData.length} طلب نهائي`}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            الفلاتر
          </CardTitle>
          <CardDescription>
            استخدم الفلاتر لتخصيص البيانات المعروضة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pharmacyName">اسم الصيدلية</Label>
              <Input
                id="pharmacyName"
                type="text"
                placeholder="ابحث عن صيدلية..."
                value={filters.pharmacyName}
                onChange={(e) => handleFilterChange('pharmacyName', e.target.value)}
                className="text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="productName" className="text-sm">اسم المنتج</Label>
              <Input
                id="productName"
                type="text"
                placeholder="ابحث عن منتج..."
                value={filters.productName}
                onChange={(e) => handleFilterChange('productName', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">الحاله الماليه</Label>
              <Select value={filters.orderStatus} onValueChange={(value) => handleFilterChange('orderStatus', value)}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="اختر حالة الطلب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="approved">موافق عليه</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">حاله الطلبيات</Label>
              <Select value={filters.FinalOrderStatusValue} onValueChange={(value) => handleFilterChange('FinalOrderStatusValue', value)}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="اختر حالة الطلب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="approved">موافق عليه</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">عدد النتائج</Label>
              <Select value={filters.limit.toString()} onValueChange={(value) => handleFilterChange('limit', value)}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="اختر العدد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button onClick={applyFilters} disabled={loading} className="w-full sm:w-auto">
               {loading ? (
                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
               ) : (
                 <Filter className="w-4 h-4 mr-2" />
               )}
               تطبيق الفلاتر
             </Button>
            <Button onClick={clearFilters} variant="outline" size="sm" disabled={loading} className="w-full sm:w-auto">
              مسح الفلاتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {formatCurrency(statistics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              من {ordersData.length} طلب نهائي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الكمية</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {statistics.totalQuantity.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              وحدة مباعة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد الطلبات</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {statistics.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              طلب نهائي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط قيمة الطلب</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">
              {formatCurrency(statistics.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              لكل عملية بيع
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Pharmacy Revenue Chart */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">إيرادات الصيدليات</CardTitle>
            <CardDescription className="text-sm">توزيع الإيرادات حسب الصيدلية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {chartData.pharmacyRevenue.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0`} />
                    <span className="text-sm font-medium truncate">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{formatCurrency(item.value)}</div>
                    <div className="w-full sm:w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(item.value / Math.max(...chartData.pharmacyRevenue.map(d => d.value))) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Brand Performance Chart */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">أداء العلامات التجارية</CardTitle>
            <CardDescription className="text-sm">إيرادات العلامات التجارية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {chartData.brandPerformance.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex-shrink-0`} />
                    <span className="text-sm font-medium truncate">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{formatCurrency(item.value)}</div>
                    <div className="w-full sm:w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(item.value / Math.max(...chartData.brandPerformance.map(d => d.value))) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Product Sales Chart */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">مبيعات المنتجات</CardTitle>
            <CardDescription className="text-sm">الكميات المباعة حسب المنتج</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {chartData.productSales.map((item, index) => (
                <div key={index} className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                    <Badge variant="outline" className="text-xs">{item.value} وحدة</Badge>
                  </div>
                  <h4 className="font-medium text-sm mb-2 truncate" title={item.name}>{item.name}</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(item.value / Math.max(...chartData.productSales.map(d => d.value))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Revenue Trend - Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              اتجاه الإيرادات الشهرية
            </CardTitle>
            <CardDescription>تطور الإيرادات عبر الأشهر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line
                data={{
                  labels: ['يناير', 'فبراير', 'مارس', 'أبريل'],
                  datasets: [
                    {
                      label: 'الإيرادات (د.ل)',
                      data: [
                        ordersData.filter(order => new Date(order.createdAt).getMonth() === 0).reduce((sum, order) => sum + order.totalOrderValue, 0),
                        ordersData.filter(order => new Date(order.createdAt).getMonth() === 1).reduce((sum, order) => sum + order.totalOrderValue, 0),
                        ordersData.filter(order => new Date(order.createdAt).getMonth() === 2).reduce((sum, order) => sum + order.totalOrderValue, 0),
                        ordersData.filter(order => new Date(order.createdAt).getMonth() === 3).reduce((sum, order) => sum + order.totalOrderValue, 0)
                      ],
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: 'rgb(59, 130, 246)',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 6,
                      pointHoverRadius: 8
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                      labels: {
                        font: {
                          family: 'Cairo, sans-serif',
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      borderColor: 'rgb(59, 130, 246)',
                      borderWidth: 1,
                      cornerRadius: 8,
                      displayColors: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                      },
                      ticks: {
                        font: {
                          family: 'Cairo, sans-serif'
                        },
                        callback: function(value) {
                          return value.toLocaleString('ar-LY') + ' د.ل';
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        font: {
                          family: 'Cairo, sans-serif'
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pharmacy Performance - Bar Chart */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-500" />
            أداء الصيدليات
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                data={{
                  labels: chartData.pharmacyRevenue.map(item => item.name),
                  datasets: [
                    {
                      label: 'إجمالي الإيرادات',
                      data: chartData.pharmacyRevenue.map(item => item.value),
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                      ],
                      borderColor: [
                        'rgb(34, 197, 94)',
                        'rgb(59, 130, 246)',
                        'rgb(168, 85, 247)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)'
                      ],
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false
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
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      cornerRadius: 8,
                      displayColors: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                      },
                      ticks: {
                        font: {
                          family: 'Cairo, sans-serif'
                        },
                        callback: function(value) {
                          return value.toLocaleString('ar-LY') + ' د.ل';
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        font: {
                          family: 'Cairo, sans-serif',
                          size: 10
                        },
                        maxRotation: 45
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Distribution Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Product Sales Distribution - Doughnut Chart */}
        <Card>
          <CardHeader className="flex items-center gap-2 text-lg sm:text-xl">
            <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            توزيع مبيعات المنتجات
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <Doughnut
                data={{
                  labels: ordersData.flatMap(order => order.products)
                    .reduce((acc, product) => {
                      const existing = acc.find(p => p.productName === product.productName);
                      if (existing) {
                        existing.quantity += product.quantity;
                      } else {
                        acc.push({ productName: product.productName, quantity: product.quantity });
                      }
                      return acc;
                    }, [] as { productName: string; quantity: number }[])
                    .slice(0, 5)
                    .map(product => product.productName),
                  datasets: [
                    {
                      data: ordersData.flatMap(order => order.products)
                        .reduce((acc, product) => {
                          const existing = acc.find(p => p.productName === product.productName);
                          if (existing) {
                            existing.quantity += product.quantity;
                          } else {
                            acc.push({ productName: product.productName, quantity: product.quantity });
                          }
                          return acc;
                        }, [] as { productName: string; quantity: number }[])
                        .slice(0, 5)
                        .map(product => product.quantity),
                      backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(168, 85, 247, 0.8)'
                      ],
                      borderColor: [
                        'rgb(239, 68, 68)',
                        'rgb(245, 158, 11)',
                        'rgb(34, 197, 94)',
                        'rgb(59, 130, 246)',
                        'rgb(168, 85, 247)'
                      ],
                      borderWidth: 3,
                      hoverOffset: 10
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        font: {
                          family: 'Cairo, sans-serif',
                          size: 11
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      cornerRadius: 8,
                      displayColors: false,
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.label}: ${context.parsed} وحدة (${percentage}%)`;
                        }
                      }
                    }
                  },
                  cutout: '60%'
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Brand Revenue Distribution - Pie Chart */}
        <Card>
          <CardHeader className="flex items-center gap-2 text-lg sm:text-xl">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            توزيع إيرادات العلامات التجارية
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <Pie
                data={{
                  labels: chartData.brandPerformance.map(item => item.name),
                  datasets: [
                    {
                      data: chartData.brandPerformance.map(item => item.value),
                      backgroundColor: [

                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                      ],
                      borderColor: [
                        'rgb(16, 185, 129)',
                        'rgb(59, 130, 246)',
                        'rgb(245, 158, 11)',
                        'rgb(168, 85, 247)',
                        'rgb(239, 68, 68)'
                      ],
                      borderWidth: 3,
                      hoverOffset: 15
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        font: {
                          family: 'Cairo, sans-serif',
                          size: 11
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      cornerRadius: 8,
                      displayColors: false,
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.label}: ${context.parsed.toLocaleString('ar-LY')} د.ل (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Area Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Area Performance Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              تحليل الأداء حسب المناطق
            </CardTitle>
            <CardDescription>
              توزيع الطلبات والمبيعات عبر المناطق المختلفة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                data={{
                  labels: (() => {
                    const areaStats = ordersData.reduce((acc: { [key: string]: number }, order) => {
                      const area = order.pharmacyArea || 'غير محدد';
                      acc[area] = (acc[area] || 0) + order.totalOrderValue;
                      return acc;
                    }, {});
                    return Object.keys(areaStats).slice(0, 6);
                  })(),
                  datasets: [
                    {
                      data: (() => {
                        const areaStats = ordersData.reduce((acc: { [key: string]: number }, order) => {
                          const area = order.pharmacyArea || 'غير محدد';
                          acc[area] = (acc[area] || 0) + order.totalOrderValue;
                          return acc;
                        }, {});
                        return Object.keys(areaStats).slice(0, 6).map(area => areaStats[area]);
                      })(),
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(6, 182, 212, 0.8)'
                      ],
                      borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(168, 85, 247)',
                        'rgb(239, 68, 68)',
                        'rgb(6, 182, 212)'
                      ],
                      borderWidth: 3,
                      hoverOffset: 15
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                      labels: {
                        font: {
                          family: 'Cairo, sans-serif',
                          size: 12
                        },
                        padding: 20,
                        usePointStyle: true
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      cornerRadius: 8,
                      callbacks: {
                        label: function(context) {
                          if (context.datasetIndex === 1) {
                            return `${context.dataset.label}: ${(context.parsed.y * 1000).toLocaleString('ar-LY')} د.ل`;
                          }
                          return `${context.dataset.label}: ${context.parsed.y.toLocaleString('ar-LY')}`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        font: {
                          family: 'Cairo, sans-serif',
                          size: 11
                        },
                        maxRotation: 45
                      }
                    },
                    y: {
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                      },
                      ticks: {
                        font: {
                          family: 'Cairo, sans-serif',
                          size: 11
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              أفضل المناطق أداءً
            </CardTitle>
            <CardDescription>
              المناطق الأكثر نشاطاً في المبيعات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const areaStats = ordersData.reduce((acc: { [key: string]: { value: number; orders: number; pharmacies: Set<string> } }, order) => {
                  const area = order.pharmacyArea || 'غير محدد';
                  if (!acc[area]) {
                    acc[area] = { value: 0, orders: 0, pharmacies: new Set() };
                  }
                  acc[area].value += order.totalOrderValue;
                  acc[area].orders += 1;
                  acc[area].pharmacies.add(order.pharmacyName);
                  return acc;
                }, {});
                
                const totalValue = Object.values(areaStats).reduce((sum, stat) => sum + stat.value, 0);
                
                return Object.entries(areaStats)
                  .sort(([,a], [,b]) => b.value - a.value)
                  .slice(0, 6)
                  .map(([area, stats]) => {
                    const percentage = ((stats.value / totalValue) * 100).toFixed(1);
                    return (
                      <div key={area} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 text-sm sm:text-base">{area}</div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            {stats.orders} طلب • {stats.pharmacies.size} صيدلية
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600 text-sm sm:text-base">{formatCurrency(stats.value)}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{percentage}%</div>
                        </div>
                      </div>
                    );
                  });
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Area Distribution Pie Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            توزيع المبيعات حسب المناطق
          </CardTitle>
          <CardDescription>
            النسب المئوية لتوزيع المبيعات عبر المناطق
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80">
              <Doughnut
                data={{
                  labels: (() => {
                    const areaStats = ordersData.reduce((acc: { [key: string]: number }, order) => {
                      const area = order.pharmacyArea || 'غير محدد';
                      acc[area] = (acc[area] || 0) + order.totalOrderValue;
                      return acc;
                    }, {});
                    return Object.keys(areaStats).slice(0, 6);
                  })(),
                  datasets: [
                    {
                      data: (() => {
                        const areaStats = ordersData.reduce((acc: { [key: string]: number }, order) => {
                          const area = order.pharmacyArea || 'غير محدد';
                          acc[area] = (acc[area] || 0) + order.totalOrderValue;
                          return acc;
                        }, {});
                        return Object.keys(areaStats).slice(0, 6).map(area => areaStats[area]);
                      })(),
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(6, 182, 212, 0.8)'
                      ],
                      borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(168, 85, 247)',
                        'rgb(239, 68, 68)',
                        'rgb(6, 182, 212)'
                      ],
                      borderWidth: 3,
                      hoverOffset: 15
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                      labels: {
                        font: {
                          family: 'Cairo, sans-serif',
                          size: 11
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      cornerRadius: 8,
                      displayColors: false,
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-lg mb-4">إحصائيات تفصيلية للمناطق</h4>
              {(() => {
                const areaStats = ordersData.reduce((acc: { [key: string]: { value: number; orders: number; pharmacies: Set<string> } }, order) => {
                  const area = order.pharmacyArea || 'غير محدد';
                  if (!acc[area]) {
                    acc[area] = { value: 0, orders: 0, pharmacies: new Set() };
                  }
                  acc[area].value += order.totalOrderValue;
                  acc[area].orders += 1;
                  acc[area].pharmacies.add(order.pharmacyName);
                  return acc;
                }, {});
                
                const totalValue = Object.values(areaStats).reduce((sum, stat) => sum + stat.value, 0);
                
                return Object.entries(areaStats)
                  .sort(([,a], [,b]) => b.value - a.value)
                  .slice(0, 6)
                  .map(([area, stats]) => {
                    const percentage = ((stats.value / totalValue) * 100).toFixed(1);
                    return (
                      <div key={area} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 text-sm sm:text-base">{area}</div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            {stats.orders} طلب • {stats.pharmacies.size} صيدلية
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600 text-sm sm:text-base">{formatCurrency(stats.value)}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{percentage}%</div>
                        </div>
                      </div>
                    );
                  });
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الطلبات النهائية</CardTitle>
          <CardDescription>جدول تفصيلي بجميع الطلبات النهائية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-start p-2 font-medium">تاريخ الزيارة</th>
                  <th className="text-start p-2 font-medium">الصيدلية</th>
                  <th className="text-start p-2 font-medium">المنطقة</th>
                  <th className="text-start p-2 font-medium">عدد المنتجات</th>
                  <th className="text-start p-2 font-medium">قيمة الطلب</th>
                  <th className="text-start p-2 font-medium">حالة مالي</th>
                  <th className="text-start p-2 font-medium">حالة الطلب نهائي</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p>جاري تحميل البيانات...</p>
                    </td>
                  </tr>
                ) : ordersData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      لا توجد طلبات نهائية
                    </td>
                  </tr>
                ) : (
                  ordersData.map((order, index) => (
                    <tr key={order.orderId} className="border-b hover:bg-muted/50">
                      <td className="p-2">{format(new Date(order.visitDate), 'dd/MM/yyyy', { locale: ar })}</td>
                      <td className="p-2">{order.pharmacyName}</td>
                      <td className="p-2">{order.pharmacyArea}</td>
                      <td className="p-2">{order.products.length}</td>
                      <td className="p-2 font-medium text-green-600">{formatCurrency(order.totalOrderValue)}</td>
                      <td className="p-2">
                        <Badge variant={order.orderStatus === 'approved' ? 'default' : order.orderStatus === 'pending' ? 'secondary' : 'destructive'}>
                          {order.orderStatus === 'approved' ? 'موافق عليه' : order.orderStatus === 'pending' ? 'قيد الانتظار' : 'مرفوض'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant={order.FinalOrderStatusValue === 'approved' ? 'default' : order.FinalOrderStatusValue === 'pending' ? 'secondary' : 'destructive'}>
                          {order.FinalOrderStatusValue === 'approved' ? 'موافق عليه' : order.FinalOrderStatusValue === 'pending' ? 'قيد الانتظار' : 'مرفوض'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                عرض {((pagination.currentPage - 1) * pagination.limit) + 1} إلى {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} من {pagination.totalRecords} نتيجة
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={pagination.currentPage === 1 || loading}
                  onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                >
                  السابق
                </Button>
                <span className="text-sm">
                  صفحة {pagination.currentPage} من {pagination.totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={pagination.currentPage === pagination.totalPages || loading}
                  onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacyDashboard;