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
import { CalendarIcon, Search, Filter, RefreshCw, TrendingUp, Clock, CheckCircle, XCircle, Users, DollarSign, Download } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getSupervisorMarketingActivityRequests, SupervisorMarketingActivityRequest, SupervisorMarketingActivityRequestsResponse, updateSupervisorMarketingActivityRequestStatus, exportMarketingActivityRequests } from '@/api/MarketingActivities';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import toast from 'react-hot-toast';

const SupervisorMarketingRequests: React.FC = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<SupervisorMarketingActivityRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalRequests: 0,
    hasNext: false,
    hasPrev: false
  });
  const [activityTypes, setActivityTypes] = useState<Array<{_id: string, arabic: string}>>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [medicalRepsCount, setMedicalRepsCount] = useState(0);
  const [medicalReps, setMedicalReps] = useState<Array<{ _id: string; name: string; username: string }>>([]);
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    search: '',
    activityType: 'all',
    page: 1,
    limit: 10
  });

  // Modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'approve' as 'approve' | 'reject',
    requestId: '',
    requestDetails: null as SupervisorMarketingActivityRequest | null
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchRequests = async () => {
    if (!user?._id) {
      console.log('No user ID found');
      return;
    }
    
    console.log('Starting to fetch marketing requests for user:', user._id);
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.status && filters.status !== 'all' && { status: filters.status as 'pending' | 'approved' | 'rejected' }),
        ...(filters.startDate && { startDate: filters.startDate.toISOString().split('T')[0] }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString().split('T')[0] }),
        ...(filters.search && { search: filters.search }),
        ...(filters.activityType && filters.activityType !== 'all' && { activityType: filters.activityType })
      };
      
      console.log('API call params:', params);
      const response: SupervisorMarketingActivityRequestsResponse = await getSupervisorMarketingActivityRequests(user._id, params);
      
      console.log('Full API response:', response);
      if (response.success) {
        console.log('Response data:', response.data);
        console.log('Data length:', response.data?.length);
        setRequests(response.data);
        setPagination(response.pagination);
        setStats(response.stats);
        setMedicalRepsCount(response.medicalRepsCount);
        setMedicalReps(response.medicalReps);
        
        // استخراج أنواع الأنشطة الفريدة من البيانات
        const uniqueActivityTypes = response.data
          .filter(request => request.activityType && request.activityType._id)
          .reduce((acc, request) => {
            const exists = acc.find(type => type._id === request.activityType._id);
            if (!exists) {
              acc.push({
                _id: request.activityType._id,
                arabic: request.activityType.arabic || request.activityType.name || 'غير محدد'
              });
            }
            return acc;
          }, [] as Array<{_id: string, arabic: string}>);
        
        setActivityTypes(uniqueActivityTypes);
      } else {
        console.log('Response not successful:', response);
      }
    } catch (error: any) {
      console.error('Error fetching marketing requests:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.message || 'حدث خطأ في جلب طلبات الأنشطة التسويقية');
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
      activityType: 'all',
      page: 1,
      limit: 10
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />قيد الانتظار</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />موافق عليه</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Modal handlers
  const handleApproveClick = (request: SupervisorMarketingActivityRequest) => {
    setConfirmationModal({
      isOpen: true,
      type: 'approve',
      requestId: request._id,
      requestDetails: request
    });
  };

  const handleRejectClick = (request: SupervisorMarketingActivityRequest) => {
    setConfirmationModal({
      isOpen: true,
      type: 'reject',
      requestId: request._id,
      requestDetails: request
    });
  };

  const handleModalClose = () => {
    setConfirmationModal({
      isOpen: false,
      type: 'approve',
      requestId: '',
      requestDetails: null
    });
  };

  const handleStatusUpdate = async () => {
    if (!confirmationModal.requestId) return;

    setIsUpdatingStatus(true);
    try {
      const newStatus = confirmationModal.type === 'approve' ? 'approved' : 'rejected';
      const response = await updateSupervisorMarketingActivityRequestStatus(
        confirmationModal.requestId,
        newStatus
      );

      if (response.success) {
        toast.success(
          confirmationModal.type === 'approve' 
            ? 'تم قبول الطلب بنجاح' 
            : 'تم رفض الطلب بنجاح'
        );
        
        // Update the request in the local state
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req._id === confirmationModal.requestId 
              ? { ...req, status: newStatus }
              : req
          )
        );
        
        // Update stats
        setStats(prevStats => {
          const updatedStats = { ...prevStats };
          if (confirmationModal.requestDetails?.status === 'pending') {
            updatedStats.pending -= 1;
          }
          if (newStatus === 'approved') {
            updatedStats.approved += 1;
          } else if (newStatus === 'rejected') {
            updatedStats.rejected += 1;
          }
          return updatedStats;
        });
        
        handleModalClose();
      } else {
        toast.error('حدث خطأ في تحديث حالة الطلب');
      }
    } catch (error: any) {
      console.error('Error updating request status:', error);
      toast.error(error.message || 'حدث خطأ في تحديث حالة الطلب');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Export handler
  const handleExport = async () => {
    if (!user?._id) {
      toast.error('لا يمكن تصدير البيانات، المستخدم غير مسجل الدخول');
      return;
    }

    setIsExporting(true);
    try {
      const exportParams = {
        ...(filters.startDate && { startDate: filters.startDate.toISOString().split('T')[0] }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString().split('T')[0] }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status as 'pending' | 'approved' | 'rejected' | 'all' })
      };

      const blob = await exportMarketingActivityRequests(user._id, exportParams);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      link.download = `marketing-activity-requests-${currentDate}.xlsx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تصدير البيانات بنجاح');
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast.error(error.message || 'حدث خطأ أثناء تصدير البيانات');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-LY', {
      style: 'currency',
      currency: 'LYD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">طلبات الأنشطة التسويقية</h1>
          <p className="text-gray-600 mt-1">إدارة ومراجعة طلبات الأنشطة التسويقية</p>
        </div>
        <Button onClick={fetchRequests} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.totalRequests}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">قيد الانتظار</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">موافق عليها</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">مرفوضة</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
              <Input
                placeholder="البحث في الطلبات..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="approved">مقبول</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.activityType} onValueChange={(value) => setFilters(prev => ({ ...prev, activityType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع النشاط" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {activityTypes.map((type) => (
                  <SelectItem key={type._id} value={type._id}>
                    {type.arabic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(filters.startDate, 'dd/MM/yyyy', { locale: ar }) : 'اختر التاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(filters.endDate, 'dd/MM/yyyy', { locale: ar }) : 'اختر التاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              بحث
            </Button>
            <Button variant="outline" onClick={handleReset}>
              إعادة تعيين
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد طلبات أنشطة تسويقية</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-4 font-semibold">تاريخ الطلب</th>
                    <th className="text-right p-4 font-semibold">الطبيب</th>
                    <th className="text-right p-4 font-semibold">اسم المندوب</th>
                    <th className="text-right p-4 font-semibold">النشاط</th>
                    <th className="text-right p-4 font-semibold">التكلفة</th>
                    <th className="text-right p-4 font-semibold">الملاحظات</th>
                    <th className="text-right p-4 font-semibold">الحالة</th>
                    <th className="text-right p-4 font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                     <tr key={request._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{new Date(request.createdAt).toLocaleDateString('ar-EG')}</td>
                        <td className="p-4">
                          <div className="font-medium">{request.doctor?.drName || 'غير محدد'}</div>
                          <div className="text-sm text-gray-500">{request.doctor?.organizationName}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{request.createdBy?.firstName} {request.createdBy?.lastName}</div>
                          <div className="text-sm text-gray-500">{request.createdBy?.username}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{request.activityType?.arabic || request.activityType?.name || 'غير محدد'}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-green-600">
                            {request.cost ? `${request.cost.toLocaleString()} د.ل` : 'غير محدد'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs truncate" title={request.notes}>
                            {request.notes || 'لا توجد ملاحظات'}
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(request.status)}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {request.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleApproveClick(request)}
                                  disabled={isUpdatingStatus}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  قبول
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleRejectClick(request)}
                                  disabled={isUpdatingStatus}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  رفض
                                </Button>
                              </>
                            )}
                            {request.status !== 'pending' && (
                              <span className="text-sm text-gray-500 px-3 py-1">
                                {request.status === 'approved' ? 'تم القبول' : 'تم الرفض'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                   ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                عرض {((pagination.currentPage - 1) * filters.limit) + 1} إلى {Math.min(pagination.currentPage * filters.limit, pagination.totalRequests)} من {pagination.totalRequests} طلب
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  السابق
                </Button>
                <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                  {pagination.currentPage} من {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  التالي
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical Reps Info */}
  

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleModalClose}
        onConfirm={handleStatusUpdate}
        type={confirmationModal.type}
        isLoading={isUpdatingStatus}
        requestDetails={confirmationModal.requestDetails}
      />
    </div>
  );
};

export default SupervisorMarketingRequests;