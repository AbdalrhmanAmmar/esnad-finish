import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  getSalesRepProductsData, 
  exportOrdersData, 
  updateOrderStatus, 
  OrderData, 
  OrderStatistics, 
  OrderFilters 
} from '@/api/OrdersCollection';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { 
  Package, 
  Calendar, 
  User, 
  Building2, 
  RefreshCw, 
  Edit3, 
  TrendingUp, 
  Users, 
  Store, 
  Download, 
  Check, 
  X,
  Eye,
  Filter,
  Receipt,
  DollarSign,
  ShoppingCart,
  TrendingDown
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Pagination } from "@/components/ui/pagination";
import { OrdersFilter, FilterOptions } from '@/components/ui/OrdersFilter';

const OrdersCollection: React.FC = () => {
  const { user } = useAuthStore();
    const ifFinancialRole = user?.role === 'FINANCIAL OFFICER';

  const { toast } = useToast();
  
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  });
    const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);
  
  // آخر يوم من الشهر الحالي
  const endDate = new Date();

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    salesRep: 'all',
    pharmacy: 'all',
    startDate: startDate,
    endDate: endDate
  });
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    rejectedOrders: 0,
    totalValue: 0,
    totalQuantity: 0,
    uniqueProductsCount: 0
  });
  const [statusBreakdown, setStatusBreakdown] = useState({
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    rejectedAmount: 0,
    totalRecords: 0
  });
    const [salesReps, setSalesReps] = useState([]);
    const [pharmacies, setPharmacies] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    orderId: '',
    action: null as 'approve' | 'reject' | null,
    orderData: null as OrderData | null
  });

  const fetchData = async (page: number = 1, currentFilters: FilterOptions = filters) => {
    const id = user?.adminId || user?._id;
    console.log(id)
    if (!id) return;
    
    setLoading(true);
    try {
      // جلب جميع البيانات بدون فلاتر من الـ API
      const response = await getSalesRepProductsData(id, { page: 1, limit: 1000 });
      
      // تطبيق الفلاتر محلياً
      let filteredData = response.data;
      
      // فلتر البحث
      if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filteredData = filteredData.filter(order => 
          order.pharmacyName.toLowerCase().includes(searchTerm) ||
          order.salesRepName.toLowerCase().includes(searchTerm) ||
          order.orderId.toLowerCase().includes(searchTerm) ||
          order.pharmacyArea.toLowerCase().includes(searchTerm) ||
          order.pharmacyCity.toLowerCase().includes(searchTerm)
        );
      }
      
      // فلتر الحالة
      if (currentFilters.status && currentFilters.status !== 'all') {
        filteredData = filteredData.filter(order => order.orderStatus === currentFilters.status);
      }
      
      // فلتر المندوب
      if (currentFilters.salesRep && currentFilters.salesRep !== 'all') {
        filteredData = filteredData.filter(order => order.salesRepName === currentFilters.salesRep);
      }
      
      // فلتر الصيدلية
      if (currentFilters.pharmacy && currentFilters.pharmacy !== 'all') {
        filteredData = filteredData.filter(order => order.pharmacyName === currentFilters.pharmacy);
      }
      
      // فلتر التاريخ
      if (currentFilters.startDate) {
        const startDate = new Date(currentFilters.startDate.getFullYear(), currentFilters.startDate.getMonth(), currentFilters.startDate.getDate());
        filteredData = filteredData.filter(order => new Date(order.visitDate) >= startDate);
      }
      
      if (currentFilters.endDate) {
        const endDate = new Date(currentFilters.endDate.getFullYear(), currentFilters.endDate.getMonth(), currentFilters.endDate.getDate(), 23, 59, 59, 999);
        filteredData = filteredData.filter(order => new Date(order.visitDate) <= endDate);
      }
      
      // تطبيق الـ pagination محلياً
      const totalRecords = filteredData.length;
      const totalPages = Math.ceil(totalRecords / 10);
      const startIndex = (page - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      const uniqueSalesReps = Array.from(
            new Set(response.data.map((order) => order.salesRepName))
          ).map(name => ({
            label: name,
            value: name,
          }));
      
      
          setSalesReps(uniqueSalesReps);


          const uniquePharmacies = Array.from(
                new Set(response.data.map((order) => order.pharmacyName))
              ).map(name => ({
                label: name,
                value: name,
              }));
          
          
              setPharmacies(uniquePharmacies);


      console.log(paginatedData)
      
      setOrders(paginatedData);
      setPagination({
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalRecords,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: 10
      });

      // حساب الإحصائيات من البيانات المفلترة
      const stats = {
        totalOrders: filteredData.length,
        pendingOrders: 0,
        approvedOrders: 0,
        rejectedOrders: 0,
        totalValue: filteredData.reduce((sum, order) => sum + order.totalOrderValue, 0),
        totalQuantity: filteredData.reduce((sum, order) => sum + order.products.reduce((pSum, product) => pSum + product.quantity, 0), 0),
        uniqueProductsCount: new Set(filteredData.flatMap(order => order.products.map(p => p.productId))).size
      };

      // حساب الطلبات حسب الحالة من البيانات المفلترة
      filteredData.forEach(order => {
        switch (order.orderStatus) {
          case 'pending':
            stats.pendingOrders++;
            break;
          case 'approved':
            stats.approvedOrders++;
            break;
          case 'rejected':
            stats.rejectedOrders++;
            break;
        }
      });

      setStatistics(stats);
      
      // حساب تفصيل المبالغ حسب الحالة من البيانات المفلترة
      const statusBreakdown = {
        totalAmount: filteredData.reduce((sum, order) => sum + order.totalOrderValue, 0),
        pendingAmount: filteredData.filter(o => o.orderStatus === 'pending').reduce((sum, order) => sum + order.totalOrderValue, 0),
        approvedAmount: filteredData.filter(o => o.orderStatus === 'approved').reduce((sum, order) => sum + order.totalOrderValue, 0),
        rejectedAmount: filteredData.filter(o => o.orderStatus === 'rejected').reduce((sum, order) => sum + order.totalOrderValue, 0),
        totalRecords: filteredData.length
      };
      
      setStatusBreakdown(statusBreakdown);
      
      if (page === 1) {
        toast({
          title: 'تم تحميل الطلبات بنجاح',
          description: `تم العثور على ${totalRecords} طلب`,
        });
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'خطأ في تحميل الطلبات',
        description: 'حدث خطأ أثناء تحميل الطلبات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?._id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData(1, filters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    fetchData(page, filters);
  };

  const handleRefresh = () => {
    fetchData(pagination.currentPage, filters);
  };

  const handleExport = async () => {
    const id = user?.adminId || user?._id;
    if (!id) return;
    
    setExportLoading(true);
    try {
      // استخدام نفس الفلاتر المطبقة محلياً
      const params: any = {
        ...(filters.search && { search: filters.search }),
        ...(filters.status && filters.status !== 'all' && { orderStatus: filters.status as 'pending' | 'approved' | 'rejected' }),
        ...(filters.salesRep && filters.salesRep !== 'all' && { SalesRepName: filters.salesRep }),
        ...(filters.pharmacy && filters.pharmacy !== 'all' && { pharmacy: filters.pharmacy }),
        ...(filters.startDate && { startDate: filters.startDate.toISOString().split('T')[0] }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString().split('T')[0] })
      };

      const blob = await exportOrdersData(id, params);
      
      // إنشاء رابط التحميل
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // تحديد اسم الملف
      const fileName = `الطلبات_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.download = fileName;
      
      // تحميل الملف
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: '✅ تم التصدير بنجاح',
        description: 'تم تصدير الطلبيات إلى ملف Excel بنجاح',
      });
      
    } catch (error: any) {
      console.error('Error exporting orders:', error);
      toast({
        title: '❌ خطأ في التصدير',
        description: 'حدث خطأ أثناء تصدير الطلبيات',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LYD',
      currencyDisplay: 'code'
    }).format(amount).replace('LYD', 'د.ل');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'قيد الانتظار', variant: 'secondary' as const },
      approved: { label: 'مقبول', variant: 'default' as const },
      rejected: { label: 'مرفوض', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'outline' as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleEditOrder = (order: OrderData) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = (orderId: string, action: 'approve' | 'reject', orderData: OrderData) => {
    setStatusModal({
      isOpen: true,
      orderId,
      action,
      orderData
    });
  };

  const confirmStatusUpdate = async () => {
    if (!statusModal.action || !statusModal.orderId || !user?.adminId) {
      toast({
        title: 'بيانات غير مكتملة',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(statusModal.orderId);
    try {
      const newStatus = statusModal.action === 'approve' ? 'approved' : 'rejected';
      await updateOrderStatus(user.adminId, statusModal.orderId, newStatus);
      
      toast({
        title: 'تم التحديث بنجاح',
        description: `تم ${statusModal.action === 'approve' ? 'قبول' : 'رفض'} الطلب بنجاح`,
      });
      
      // إعادة تحميل البيانات
      await fetchData();
      
      // إغلاق الـ modal
      setStatusModal({
        isOpen: false,
        orderId: '',
        action: null,
        orderData: null
      });
    } catch (error: any) {
      toast({
        title: 'خطأ في تحديث حالة الطلب',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const cancelStatusUpdate = () => {
    setStatusModal({
      isOpen: false,
      orderId: '',
      action: null,
      orderData: null
    });
  };

const totalRefuse = () => {
  return statistics.totalOrders - (statistics.approvedOrders + statistics.pendingOrders);
};


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>جاري تحميل الطلبات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            تحصيل الطلبيات
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة ومتابعة طلبيات المندوبين والصيدليات
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleExport} 
            variant="default" 
            disabled={exportLoading}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Download className={`h-4 w-4 mr-2 ${exportLoading ? 'animate-bounce' : ''}`} />
            {exportLoading ? 'جاري التصدير...' : 'تصدير Excel'}
          </Button>
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{statistics.totalOrders}</p>
              </div>
              <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">مقبولة</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{statistics.approvedOrders}</p>
              </div>
              <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">في الانتظار</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{statistics.pendingOrders}</p>
              </div>
              <div className="p-2 bg-yellow-200 dark:bg-yellow-800 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">المرفوضة</p>
                <p className="text-xl font-bold text-red-900 dark:text-red-100">
                  {totalRefuse()} 
                  
                </p>
              </div>
              <div className="p-2 bg-red-200 dark:bg-red-800 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">إجمالي المبلغ</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {formatCurrency(statusBreakdown.totalAmount)}
                </p>
              </div>
              <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">قيد المراجعة</p>
                <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                  {formatCurrency(statusBreakdown.pendingAmount)}
                </p>
              </div>
              <div className="p-2 bg-yellow-200 dark:bg-yellow-800 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">مقبول</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(statusBreakdown.approvedAmount)}
                </p>
              </div>
              <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">مرفوض</p>
                <p className="text-xl font-bold text-red-900 dark:text-red-100">
                  {formatCurrency(statusBreakdown.rejectedAmount)}
                </p>
              </div>
              <div className="p-2 bg-red-200 dark:bg-red-800 rounded-lg">
                <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">إجمالي السجلات</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {statusBreakdown.totalRecords}
                </p>
              </div>
              <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <OrdersFilter
      

        filters={filters}
            salesReps={salesReps}
        pharmacies={pharmacies}
        onFiltersChange={handleFiltersChange}
        isLoading={loading}
      />

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            بيانات الطلبيات ({orders.length} من {pagination.totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="mr-2">جاري تحميل البيانات...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-muted/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">لا توجد طلبيات</h3>
              <p className="text-muted-foreground mb-4">لم يتم العثور على طلبيات تطابق معايير البحث</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                إعادة تحميل
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>تاريخ الزيارة</TableHead>
                    <TableHead>المندوب</TableHead>
                    <TableHead>الصيدلية</TableHead>
                    <TableHead>المنطقة</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{formatDate(order.visitDate)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.salesRepName}</div>
                          <div className="text-sm text-muted-foreground">{order.salesRepEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.pharmacyName}</div>
                          <div className="text-sm text-muted-foreground">{order.pharmacyCity}</div>
                        </div>
                      </TableCell>
                      <TableCell>{order.pharmacyArea}</TableCell>
                      <TableCell className="font-bold text-primary">{formatCurrency(order.totalOrderValue)}</TableCell>
                      <TableCell>#{order.orderId.slice(-8)}</TableCell>
                      <TableCell>{getStatusBadge(order.orderStatus || 'pending')}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOrder(order)}
                            className="gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            عرض
                          </Button>
                          {(!order.orderStatus || order.orderStatus === 'pending') && ifFinancialRole && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, 'approve', order)}
                                disabled={updating === order.id}
                                className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <Check className="w-3 h-3" />
                                قبول
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, 'reject', order)}
                                disabled={updating === order.id}
                                className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <X className="w-3 h-3" />
                                رفض
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && orders.length > 0 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            showInfo={true}
            totalItems={pagination.totalCount}
            itemsPerPage={pagination.limit}
          />
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
            <DialogDescription>
              عرض تفاصيل الطلب رقم {selectedOrder?.orderId.slice(-8)}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">رقم الطلب</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrder.orderId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">تاريخ الزيارة</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedOrder.visitDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">مندوب المبيعات</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrder.salesRepName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrder.salesRepEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">الصيدلية</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrder.pharmacyName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">المنطقة</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrder.pharmacyArea} - {selectedOrder.pharmacyCity}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-3">تفاصيل المنتجات:</h4>
                <div className="space-y-2">
                  {selectedOrder.products.map((product) => (
                    <div key={product.productId} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{product.productName}</span>
                          <Badge variant="outline" className="text-xs">
                            {product.productCode}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {product.productBrand}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>السعر: {formatCurrency(product.productPrice)}</span>
                          <span>الكمية: <span className="font-medium">{product.quantity}</span></span>
                          <span>المجموع: {formatCurrency(product.totalValue)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-sm font-medium">القيمة الإجمالية</Label>
                  <p className="text-lg font-medium text-primary">{formatCurrency(selectedOrder.totalOrderValue)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">الحالة</Label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.orderStatus || 'pending')}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Confirmation Modal */}
      <Dialog open={statusModal.isOpen} onOpenChange={cancelStatusUpdate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {statusModal.action === 'approve' ? 'تأكيد قبول الطلب' : 'تأكيد رفض الطلب'}
            </DialogTitle>
            <DialogDescription>
              {statusModal.action === 'approve' 
                ? 'هل أنت متأكد من قبول هذا الطلب؟ لن تتمكن من التراجع عن هذا الإجراء.'
                : 'هل أنت متأكد من رفض هذا الطلب؟ لن تتمكن من التراجع عن هذا الإجراء.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {statusModal.orderData && (
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">الصيدلية:</span>
                  <p className="font-medium">{statusModal.orderData.pharmacyName}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">المنتج:</span>
                  <p className="font-medium">{statusModal.orderData.products[0]?.productName}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">الكمية:</span>
                  <p className="font-medium">{statusModal.orderData.products[0]?.quantity}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">القيمة:</span>
                  <p className="font-medium">{formatCurrency(statusModal.orderData.totalOrderValue)}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={cancelStatusUpdate}
              disabled={updating !== null}
            >
              إلغاء
            </Button>
            <Button
              onClick={confirmStatusUpdate}
              disabled={updating !== null}
              className={statusModal.action === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {updating !== null ? 'جاري التحديث...' : 
                (statusModal.action === 'approve' ? 'تأكيد القبول' : 'تأكيد الرفض')
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersCollection;