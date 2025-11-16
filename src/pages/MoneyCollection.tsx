import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { getFinancialPharmacyData, updateCollectionStatus, exportFinancialData, FinancialData, FinancialStatistics, FinancialFilters } from '@/api/FinancialCollector';
import { DollarSign, Receipt, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Eye, Calendar, Filter, Download, RefreshCw, Search, User, Building } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

const MoneyCollection = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const ifFinancialRole = user?.role === 'FINANCIAL OFFICER';

   const getTodayDate = () => {
    return format(new Date(), 'yyyy-MM-dd');
  };

  // دالة للحصول على تاريخ قبل 7 أيام بصيغة YYYY-MM-DD
  const getSevenDaysAgoDate = () => {
    return format(subDays(new Date(), 7), 'yyyy-MM-dd');
  };
  
  const [data, setData] = useState<FinancialData[]>([]);
  const [statistics, setStatistics] = useState<FinancialStatistics>({
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    rejectedAmount: 0,
    totalRecords: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FinancialFilters>({
    page: 1,
    limit: 10,
    startDate: getSevenDaysAgoDate(), // تاريخ افتراضي: قبل 7 أيام
    endDate: getTodayDate() 
  });
  const [selectedItem, setSelectedItem] = useState<FinancialData | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{show: boolean, action: string, item: FinancialData | null}>({show: false, action: '', item: null});

  const fetchData = async () => {
    const id = user.adminId
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const response = await getFinancialPharmacyData(id, filters);
      console.log(response, 'response');
      setData(response.data);
      setStatistics(response.statistics);
      setPagination(response.pagination);
    } catch (error: any) {
      toast({
        title: "خطأ في جلب البيانات",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, user?.id]);

const handleFilterChange = (key: keyof FinancialFilters, value: any) => {
  if ((key === 'startDate' || key === 'endDate') && value) {
    // إضافة الوقت ليكون بداية اليوم (لـ startDate) أو نهاية اليوم (لـ endDate)
    if (key === 'startDate') {
      value = `${value}T00:00:00.000Z`; // بداية اليوم
    } else {
      value = `${value}T23:59:59.999Z`; // نهاية اليوم
    }
  }
  
  setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
};

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleStatusUpdate = (status: 'approved' | 'rejected') => {
    setConfirmAction({show: true, action: status});
  };

  const confirmStatusUpdate = async () => {
    if (!selectedItem || !confirmAction.action) return;
    
    setUpdatingStatus(true);
    try {
      await updateCollectionStatus(user.adminId, selectedItem.id, confirmAction.action, statusNotes);
      toast({
        title: "تم التحديث بنجاح ✅",
        description: `تم ${confirmAction.action === 'approved' ? 'قبول' : 'رفض'} التحصيل بنجاح`
      });
      setSelectedItem(null);
      setConfirmAction({show: false, action: '', item: null});
      setStatusNotes('');
      fetchData();
    } catch (error: any) {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const cancelStatusUpdate = () => {
    setConfirmAction({show: false, action: '', item: null});
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />قيد المراجعة</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />مقبول</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />مرفوض</Badge>;
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
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
  };

  const handleExportToExcel = async () => {
    const adminId = user?.adminId || user?._id;
    if (!adminId) {
      toast({
        title: "خطأ في المصادقة",
        description: "يرجى تسجيل الدخول مرة أخرى",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setExporting(true);
      
      // عرض رسالة بداية التصدير
      toast({
        title: "جاري التصدير",
        description: "يتم تحضير ملف Excel، يرجى الانتظار...",
      });
      
      const blob = await exportFinancialData(adminId, filters);
      
      // التحقق من حجم الملف
      if (blob.size === 0) {
        throw new Error('الملف المُصدر فارغ');
      }
      
      // إنشاء رابط التحميل
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // تحديد اسم الملف مع التاريخ والفلاتر
      const currentDate = new Date().toISOString().split('T')[0];
      let filename = `financial_collection_${currentDate}`;
      
      // إضافة معلومات الفلتر لاسم الملف
      if (filters.status && filters.status !== 'all') {
        filename += `_${filters.status}`;
      }
      if (filters.startDate && filters.endDate) {
        filename += `_${filters.startDate}_to_${filters.endDate}`;
      }
      
      link.download = `${filename}.xlsx`;
      
      // تحميل الملف
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // تنظيف الذاكرة
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "تم التصدير بنجاح ✅",
        description: `تم تحميل ملف Excel بنجاح: ${filename}.xlsx`,
      });
    } catch (error: any) {
      console.error('Error exporting financial data:', error);
      
      let errorMessage = "فشل في تصدير البيانات المالية";
      let errorTitle = "خطأ في التصدير";
      
      // معالجة رسائل الخطأ المختلفة
      if (error.message.includes('لا توجد بيانات')) {
        errorTitle = "لا توجد بيانات";
        errorMessage = "لا توجد بيانات مالية متاحة للتصدير بناءً على الفلاتر المحددة";
      } else if (error.message.includes('انتهت مهلة الاتصال')) {
        errorTitle = "انتهت مهلة الاتصال";
        errorMessage = "استغرق التصدير وقتاً أطول من المتوقع. يرجى المحاولة مرة أخرى";
      } else if (error.message.includes('خطأ في الخادم')) {
        errorTitle = "خطأ في الخادم";
        errorMessage = "حدث خطأ في الخادم. يرجى المحاولة لاحقاً أو الاتصال بالدعم الفني";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // دالة لمسح جميع الفلاتر
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      startDate: getSevenDaysAgoDate(),
      endDate: getTodayDate()
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">تحصيل المال</h1>
          <p className="text-muted-foreground mt-1">إدارة ومراجعة عمليات التحصيل المالي</p>
        </div>
          <div className="flex gap-2">
          <Button onClick={handleExportToExcel} disabled={exporting || loading} variant="outline" className="gap-2">
            <Download className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} />
            {exporting ? 'جاري التصدير...' : 'تصدير إلى Excel'}
          </Button>
          <Button onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبلغ</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(statistics?.totalAmount || 0)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد المراجعة</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(statistics?.pendingAmount || 0)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مقبول</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(statistics?.approvedAmount || 0)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مرفوض</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(statistics?.rejectedAmount || 0)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السجلات</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalRecords || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            الفلاتر
          </CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>استخدم الفلاتر للبحث عن البيانات المطلوبة</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="text-xs"
            >
              مسح الكل
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="repName">بحث باسم المندوب</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="repName"
                  placeholder="ابحث باسم المندوب..."
                  value={filters.repName || ''}
                  onChange={(e) => handleFilterChange('repName', e.target.value || undefined)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <Label htmlFor="pharmacyName">بحث باسم الصيدلية</Label>
              <div className="relative">
                <Building className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pharmacyName"
                  placeholder="ابحث باسم الصيدلية..."
                  value={filters.pharmacyName || ''}
                  onChange={(e) => handleFilterChange('pharmacyName', e.target.value || undefined)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="approved">مقبول</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="limit">عدد السجلات</Label>
              <Select value={filters.limit?.toString() || '10'} onValueChange={(value) => handleFilterChange('limit', parseInt(value))}>
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
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>بيانات التحصيل</CardTitle>
          <CardDescription>
            عرض جميع عمليات التحصيل المالي مع إمكانية المراجعة والموافقة
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
                    <TableHead>رقم الوصل</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(item.visitDate)}</TableCell>
                      <TableCell>
                          <div>
                            <div className="font-medium">{item.repName}</div>
                            <div className="text-sm text-muted-foreground">{item.repEmail}</div>
                          </div>
                        </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.pharmacyName}</div>
                          <div className="text-sm text-muted-foreground">{item.pharmacyCity}</div>
                        </div>
                      </TableCell>
                      <TableCell>{item.pharmacyArea}</TableCell>
                      <TableCell className="font-bold text-primary">{formatCurrency(item.amount)}</TableCell>
                      <TableCell>{item.receiptNumber}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedItem(item)}
                                className="gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                عرض
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>تفاصيل التحصيل</DialogTitle>
                              <DialogDescription>
                                مراجعة وإدارة حالة التحصيل المالي
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedItem && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>المندوب</Label>
                                    <p className="text-sm">{selectedItem.repName}</p>
                                  </div>
                                  <div>
                                    <Label>الصيدلية</Label>
                                    <p className="text-sm">{selectedItem.pharmacyName}</p>
                                  </div>
                                  <div>
                                    <Label>المبلغ</Label>
                                    <p className="text-sm font-bold text-primary">{formatCurrency(selectedItem.amount)}</p>
                                  </div>
                                  <div>
                                    <Label>رقم الوصل</Label>
                                    <p className="text-sm">{selectedItem.receiptNumber}</p>
                                  </div>
                                  <div>
                                    <Label>تاريخ الزيارة</Label>
                                    <p className="text-sm">{formatDate(selectedItem.visitDate)}</p>
                                  </div>
                                  <div>
                                    <Label>الحالة الحالية</Label>
                                    <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                                  </div>
                                </div>
                                
                                {selectedItem.receiptImage && (
                                  <div>
                                    <Label>صورة الوصل</Label>
                                    <img 
                                      src={`${import.meta.env.VITE_API_BASE}/${selectedItem.receiptImage}`} 
                                      alt="صورة الوصل" 
                                      className="mt-2 max-w-full h-auto rounded-lg border"
                                    />
                                  </div>
                                )}
                                
                                {selectedItem.status === 'pending' && ifFinancialRole && (
                                  <div className="space-y-4 pt-4 border-t">
                                    <div>
                                      <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                                      <Textarea
                                        id="notes"
                                        value={statusNotes}
                                        onChange={(e) => setStatusNotes(e.target.value)}
                                        placeholder="أضف ملاحظات حول قرار المراجعة..."
                                        rows={3}
                                      />
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleStatusUpdate('approved')}
                                        disabled={updatingStatus}
                                        className="bg-green-600 hover:bg-green-700 gap-2"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        قبول التحصيل
                                      </Button>
                                      <Button
                                        onClick={() => handleStatusUpdate('rejected')}
                                        disabled={updatingStatus}
                                        variant="destructive"
                                        className="gap-2"
                                      >
                                        <XCircle className="w-4 h-4" />
                                        رفض التحصيل
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                          </Dialog>

                          {item.status === 'pending' && ifFinancialRole && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(item);
                                  handleStatusUpdate('approved');
                                }}
                                className="bg-green-600 hover:bg-green-700 gap-1 px-2"
                                title="قبول التحصيل"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(item);
                                  handleStatusUpdate('rejected');
                                }}
                                variant="destructive"
                                className="gap-1 px-2"
                                title="رفض التحصيل"
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {data.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد بيانات للعرض
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1 || loading}
          >
            السابق
          </Button>
          
          <span className="text-sm text-muted-foreground">
            صفحة {pagination.currentPage} من {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages || loading}
          >
            التالي
          </Button>
        </div>
      )}

      {/* Modal التأكيد */}
      <Dialog open={confirmAction.show} onOpenChange={(open) => !open && cancelStatusUpdate()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmAction.action === 'approved' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              تأكيد العملية
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من {confirmAction.action === 'approved' ? 'قبول' : 'رفض'} هذا التحصيل؟
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm space-y-1">
                  <p><strong>المندوب:</strong> {selectedItem.repName}</p>
                  <p><strong>الصيدلية:</strong> {selectedItem.pharmacyName}</p>
                  <p><strong>المبلغ:</strong> {formatCurrency(selectedItem.amount)}</p>
                  <p><strong>رقم الوصل:</strong> {selectedItem.receiptNumber}</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="statusNotes">ملاحظات (اختياري)</Label>
                <Textarea
                  id="statusNotes"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="أضف ملاحظات حول قرار المراجعة..."
                  rows={3}
                  className="mt-1"
                />
              </div>

            </div>
          )}
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={cancelStatusUpdate}
              disabled={updatingStatus}
            >
              إلغاء
            </Button>
            <Button
              onClick={confirmStatusUpdate}
              disabled={updatingStatus}
              className={confirmAction.action === 'approved' ? 
                'bg-green-600 hover:bg-green-700' : 
                'bg-red-600 hover:bg-red-700'
              }
            >
              {updatingStatus ? 'جاري التحديث...' : 
                (confirmAction.action === 'approved' ? 'تأكيد القبول' : 'تأكيد الرفض')
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MoneyCollection;