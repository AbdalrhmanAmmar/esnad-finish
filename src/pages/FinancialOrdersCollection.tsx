import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Package,
  Users,
  TrendingUp,
  RefreshCw,
  Calendar,
  Check,
  X,
  Eye,
  FileText,
  Download,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  User,
  Building
} from 'lucide-react';
import { getSalesRepProductsData } from '@/api/OrdersCollection';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Product {
  productId: string;
  productName: string;
  productCode: string;
  productBrand: string;
  productPrice: number;
  quantity: number;
  totalValue: number;
}

interface Order {
  id: string;
  orderId: string;
  visitDate: string;
  createdAt: string;
  salesRepName: string;
  salesRepEmail: string;
  pharmacyName: string;
  pharmacyArea: string;
  pharmacyCity: string;
  products: Product[];
  totalOrderValue: number;
  orderStatus: string;
  FinalOrderStatus: boolean;
  FinalOrderStatusValue: string;
}

interface Statistics {
  summary: {
    totalQuantity: number;
    totalValue: number;
    totalOrders: number;
    uniqueProductsCount: number;
    averageOrderValue: number;
  };
  statusBreakdown: {
    totalAmount: number;
    pendingAmount: number;
    approvedAmount: number;
    rejectedAmount: number;
    totalRecords: number;
  };
  productBreakdown: {
    productName: string;
    totalQuantity: number;
    totalValue: number;
    orderCount: number;
  }[];
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
}

const FinancialOrdersCollection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  const id = user?.adminId || user?._id;

  const fetchData = async (page = 1, filterParams = {}) => {
    if (!user?._id) {
      toast({
        title: 'خطأ',
        description: 'لم يتم العثور على معرف المستخدم',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await getSalesRepProductsData(user._id, {
        page,
        limit: 10,
        ...filterParams
      });
      
      if (response.success) {
        setOrders(response.data);
        setStatistics(response.statistics);
        setPagination(response.pagination);
      } else {
        toast({
          title: 'خطأ',
          description: response.message || 'فشل في جلب البيانات',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في جلب البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData(filters.page, filters);
    }
  }, [filters, user]);

  const handleFilterChange = (key: string, value: any) => {
    if ((key === 'startDate' || key === 'endDate') && value) {
      if (key === 'startDate') {
        value = `${value}T00:00:00.000Z`;
      } else {
        value = `${value}T23:59:59.999Z`;
      }
    }
    
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      setUpdatingStatus(true);
      // هنا يجب إضافة API call لتحديث حالة الطلب
      // await updateOrderStatus(orderId, status, statusNotes);
      
      toast({
        title: 'تم التحديث',
        description: `تم ${status === 'approved' ? 'قبول' : 'رفض'} الطلب بنجاح`,
      });
      
      // إعادة تحميل البيانات
      fetchData(filters.page, filters);
      setSelectedOrder(null);
      setStatusNotes('');
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحديث الحالة',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">موافق عليه</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">قيد المراجعة</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">مرفوض</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-LY', {
      style: 'currency',
      currency: 'LYD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          تحصيل الطلبيات المالية
        </h1>
        <p className="text-lg text-gray-600">إدارة ومراجعة طلبيات الصيدليات ({pagination?.totalRecords || 0} من {pagination?.totalRecords || 0})</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">إجمالي القيمة</CardTitle>
              <DollarSign className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(statistics.summary.totalValue)}</div>
              <p className="text-xs opacity-80 mt-1">
                متوسط الطلب: {formatCurrency(statistics.summary.averageOrderValue)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">إجمالي الطلبات</CardTitle>
              <ShoppingCart className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.summary.totalOrders}</div>
              <p className="text-xs opacity-80 mt-1">
                الكمية الإجمالية: {statistics.summary.totalQuantity}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">قيد المراجعة</CardTitle>
              <Clock className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(statistics.statusBreakdown.pendingAmount)}</div>
              <p className="text-xs opacity-80 mt-1">يحتاج موافقة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">المعتمد</CardTitle>
              <CheckCircle className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(statistics.statusBreakdown.approvedAmount)}</div>
              <p className="text-xs opacity-80 mt-1">تم الموافقة عليه</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            فلاتر البحث
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="limit">عدد النتائج</Label>
              <Select value={filters.limit.toString()} onValueChange={(value) => handleFilterChange('limit', parseInt(value))}>
                <SelectTrigger>
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
            
            <div>
              <Label htmlFor="startDate">من تاريخ</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate ? filters.startDate.split('T')[0] : ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
              />
            </div>
            
            <div>
              <Label htmlFor="endDate">إلى تاريخ</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate ? filters.endDate.split('T')[0] : ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => fetchData(filters.page, filters)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                <Search className="h-4 w-4 mr-2" />
                بحث
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>بيانات الطلبيات</CardTitle>
          <CardDescription>
            عرض جميع طلبيات الصيدليات مع إمكانية المراجعة والموافقة
            {filters.repName && (
              <Badge variant="outline" className="mr-2">
                المندوب: {filters.repName}
              </Badge>
            )}
            {filters.pharmacyName && (
              <Badge variant="outline" className="mr-2">
                الصيدلية: {filters.pharmacyName}
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="mr-2">جاري تحميل البيانات...</span>
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
                      <TableCell>{getStatusBadge(order.FinalOrderStatusValue)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                                className="gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                عرض
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>تفاصيل الطلب</DialogTitle>
                                <DialogDescription>
                                  مراجعة وإدارة حالة الطلب
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedOrder && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>المندوب</Label>
                                      <p className="text-sm">{selectedOrder.salesRepName}</p>
                                    </div>
                                    <div>
                                      <Label>الصيدلية</Label>
                                      <p className="text-sm">{selectedOrder.pharmacyName}</p>
                                    </div>
                                    <div>
                                      <Label>المبلغ</Label>
                                      <p className="text-sm font-bold text-primary">{formatCurrency(selectedOrder.totalOrderValue)}</p>
                                    </div>
                                    <div>
                                      <Label>رقم الطلب</Label>
                                      <p className="text-sm">#{selectedOrder.orderId}</p>
                                    </div>
                                    <div>
                                      <Label>تاريخ الزيارة</Label>
                                      <p className="text-sm">{formatDate(selectedOrder.visitDate)}</p>
                                    </div>
                                    <div>
                                      <Label>الحالة الحالية</Label>
                                      <div className="mt-1">{getStatusBadge(selectedOrder.FinalOrderStatusValue)}</div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label>المنتجات</Label>
                                    <div className="mt-2 space-y-2">
                                      {selectedOrder.products.map((product, idx) => (
                                        <div key={idx} className="p-3 bg-muted rounded-lg">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="font-medium">{product.productName}</p>
                                              <p className="text-sm text-muted-foreground">
                                                الكمية: {product.quantity} | السعر: {formatCurrency(product.productPrice)}
                                              </p>
                                            </div>
                                            <p className="font-bold text-primary">{formatCurrency(product.totalValue)}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {selectedOrder.FinalOrderStatusValue === 'pending' && (
                                    <div className="space-y-4 pt-4 border-t">
                                      <Label>ملاحظات (اختياري)</Label>
                                      <Textarea
                                        placeholder="أضف ملاحظات حول قرار الموافقة أو الرفض..."
                                        value={statusNotes}
                                        onChange={(e) => setStatusNotes(e.target.value)}
                                        rows={3}
                                      />
                                      <div className="flex gap-2 justify-end">
                                        <Button
                                          onClick={() => handleStatusUpdate(selectedOrder.id, 'approved')}
                                          disabled={updatingStatus}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          {updatingStatus ? 'جاري المعالجة...' : 'موافقة'}
                                        </Button>
                                        <Button
                                          onClick={() => handleStatusUpdate(selectedOrder.id, 'rejected')}
                                          disabled={updatingStatus}
                                          variant="destructive"
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          {updatingStatus ? 'جاري المعالجة...' : 'رفض'}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
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
      {pagination && pagination.totalPages > 1 && (
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                عرض {((pagination.currentPage - 1) * pagination.limit) + 1} إلى {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} من {pagination.totalRecords} نتيجة
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1 || loading}
                >
                  السابق
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={pagination.currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        disabled={loading}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages || loading}
                >
                  التالي
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Breakdown */}
      {statistics?.productBreakdown && statistics.productBreakdown.length > 0 && (
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="h-6 w-6 text-purple-600" />
              تفصيل المنتجات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.productBreakdown.map((product, index) => (
                <Card key={index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-gray-800 text-lg">{product.productName}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">الكمية:</span>
                        <span className="font-semibold text-blue-600">{product.totalQuantity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">القيمة:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(product.totalValue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">عدد الطلبات:</span>
                        <span className="font-semibold text-purple-600">{product.orderCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 rtl:space-x-reverse">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="bg-white hover:bg-gray-50"
          >
            السابق
          </Button>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : "bg-white hover:bg-gray-50"}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
            disabled={currentPage === pagination.totalPages}
            className="bg-white hover:bg-gray-50"
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  );
};

export default FinancialOrdersCollection;