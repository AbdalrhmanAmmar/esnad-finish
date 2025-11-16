import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarIcon, Search, Filter, RefreshCw, Package, Users, TrendingUp, Clock, CheckCircle, XCircle, MoreVertical, Check, X, AlertTriangle, Download } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getSupervisorSampleRequests, SupervisorSampleRequest, SupervisorSampleRequestsResponse, updateSampleRequestBySupervisor, exportSupervisorSampleRequestsToExcel } from '@/api/SampleRequests';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import toast from 'react-hot-toast';

const SupervisorSampleRequests: React.FC = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<SupervisorSampleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalRequests: 0,
    hasNext: false,
    hasPrev: false
  });
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    cancelled: 0
  });
  const [medicalRepsCount, setMedicalRepsCount] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    search: '',
    page: 1,
    limit: 10
  });

  // Action states
  const [selectedRequest, setSelectedRequest] = useState<SupervisorSampleRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchRequests = async () => {
    if (!user?._id) {
      console.log('No user ID found');
      return;
    }
    
    console.log('Starting to fetch requests for user:', user._id);
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.status && filters.status !== 'all' && { status: filters.status as 'pending' | 'approved' | 'cancelled' }),
        ...(filters.startDate && { startDate: filters.startDate.toISOString().split('T')[0] }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString().split('T')[0] }),
        ...(filters.search && { search: filters.search })
      };
      
      console.log('API call params:', params);
      const response: SupervisorSampleRequestsResponse = await getSupervisorSampleRequests(user._id, params);
      
      console.log('Full API response:', response);
      if (response.success) {
        console.log('Response data:', response.data);
        console.log('Data length:', response.data?.length);
        setRequests(response.data);
        setPagination(response.pagination);
        setStats(response.stats);
        setMedicalRepsCount(response.medicalRepsCount);
      } else {
        console.log('Response not successful:', response);
      }
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.message || 'حدث خطأ في جلب الطلبات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters.page, filters.limit, filters.status]);

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchRequests();
  };

  const handleReset = () => {
    setFilters({
      status: 'all',
      startDate: undefined,
      endDate: undefined,
      search: '',
      page: 1,
      limit: 10
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />قيد الانتظار</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />موافق عليه</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'تاريخ غير صحيح';
    return format(date, 'dd/MM/yyyy', { locale: ar });
  };

  const handleActionRequest = (request: SupervisorSampleRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
  };

  const confirmAction = async () => {
    if (!selectedRequest || !actionType || !user?._id) return;

    setActionLoading(true);
    try {
      const status = actionType === 'approve' ? 'approved' : 'cancelled';
      
      console.log('Calling updateSampleRequestBySupervisor with:', {
        supervisorId: user._id,
        requestId: selectedRequest._id,
        status: status
      });
      
      const result = await updateSampleRequestBySupervisor(user._id, selectedRequest._id, status);
      console.log('Update result:', result);
      
      toast.success(`تم ${actionType === 'approve' ? 'الموافقة على' : 'رفض'} الطلب بنجاح`);
      
      // Refresh the requests list
      await fetchRequests();
      
      // Reset selection
      setSelectedRequest(null);
      setActionType(null);
    } catch (error: any) {
      console.error('Error updating request:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.message || 'حدث خطأ في تحديث الطلب');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    if (!user?._id) return;

    setExportLoading(true);
    try {
      const params = {
        status: filters.status !== 'all' ? filters.status : undefined,
        startDate: filters.startDate?.toISOString().split('T')[0],
        endDate: filters.endDate?.toISOString().split('T')[0],
        search: filters.search || undefined
      };

      const blob = await exportSupervisorSampleRequestsToExcel(user._id, params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const currentDate = new Date().toISOString().split('T')[0];
      link.download = `sample-requests-${currentDate}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تصدير البيانات بنجاح');
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast.error('حدث خطأ في تصدير البيانات');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">طلبات العينات</h1>
        <div className="flex gap-2">
          <Button onClick={handleExport} disabled={exportLoading} className="gap-2">
            <Download className={`w-4 h-4 ${exportLoading ? 'animate-spin' : ''}`} />
            تصدير
          </Button>
          <Button onClick={fetchRequests} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-blue-700">{pagination.totalRequests}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">قيد الانتظار</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">موافق عليها</p>
                <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ملغية</p>
                <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
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
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="البحث..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="w-full"
              />
            </div>

            <div>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="approved">موافق عليه</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? formatDate(filters.startDate.toISOString()) : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date, page: 1 }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? formatDate(filters.endDate.toISOString()) : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date, page: 1 }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSearch} className="gap-2">
                <Search className="w-4 h-4" />
                بحث
              </Button>
              <Button variant="outline" onClick={handleReset}>
                إعادة تعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>طلبات العينات</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="mr-2">جاري التحميل...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">لا توجد طلبات</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request._id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{request.medicalRep?.username || 'غير محدد'}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          التاريخ: {formatDate(request.requestDate)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          الطبيب: {request.doctor?.drName || 'غير محدد'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          المنتج: {request.product?.PRODUCT || 'غير محدد'} - الكمية: {request.quantity}
                        </p>
                      </div>
                      
                      {request.status === 'pending' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleActionRequest(request, 'approve')}
                              className="text-green-600"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              موافقة
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleActionRequest(request, 'reject')}
                              className="text-red-600"
                            >
                              <X className="w-4 h-4 mr-2" />
                              رفض
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    
                    {request.notes && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-muted-foreground mb-1">الملاحظات:</p>
                        <p className="text-sm bg-muted p-2 rounded">{request.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            عرض {((pagination.currentPage - 1) * filters.limit) + 1} إلى {Math.min(pagination.currentPage * filters.limit, pagination.totalRequests)} من {pagination.totalRequests} طلب
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!pagination.hasPrev}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              التالي
            </Button>
          </div>
        </div>
      )}

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!selectedRequest && !!actionType} onOpenChange={() => {
        setSelectedRequest(null);
        setActionType(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              تأكيد العملية
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من {actionType === 'approve' ? 'الموافقة على' : 'رفض'} طلب العينة من {selectedRequest?.medicalRepName}؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={actionLoading}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : actionType === 'approve' ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              {actionType === 'approve' ? 'موافقة' : 'رفض'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SupervisorSampleRequests;