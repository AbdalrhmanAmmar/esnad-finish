import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Calendar as CalendarIcon,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  getMarketingActivityRequestsByUserId,
  createMarketingActivityRequest,
  updateMarketingActivityRequestStatus,
  deleteMarketingActivityRequest,
  exportMarketingActivityRequestsToExcel,
  MarketingActivityRequest,
  MarketingActivityRequestParams
} from '@/api/MarketingActivityRequest';

const MedicalRepMarketing: React.FC = () => {
  const [requests, setRequests] = useState<MarketingActivityRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MarketingActivityRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MarketingActivityRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    totalCost: 0
  });

  // Mock user data - في التطبيق الحقيقي، ستأتي من context أو localStorage
  const currentUser = {
    _id: "68bdfd39b86e0e8507b2a66b",
    firstName: "IBTIHAL",
    lastName: "TOBRUK",
    username: "ibtihal tobruk",
    role: "MEDICAL REP",
    teamProducts: "TEAM C",
    teamArea: "EAST TEAM",
    area: ["طبرق"],
    city: "طبرقق",
    district: "المنطقة الشرقية"
  };

  // Form state for creating new request
  const [newRequest, setNewRequest] = useState({
    activityType: '',
    doctor: '',
    requestDate: new Date(),
    notes: '',
    cost: 0
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter, dateRange]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: MarketingActivityRequestParams = {
        page: 1,
        limit: 100
      };
      
      const response = await getMarketingActivityRequestsByUserId(currentUser._id, params);
      setRequests(response.data.requests);
      setStats(response.data.stats);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.doctor.drName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.activityType.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Filter by date range
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.requestDate);
        return requestDate >= dateRange.from! && requestDate <= dateRange.to!;
      });
    }

    setFilteredRequests(filtered);
  };

  const handleCreateRequest = async () => {
    try {
      await createMarketingActivityRequest({
        activityType: newRequest.activityType,
        doctor: newRequest.doctor,
        requestDate: newRequest.requestDate.toISOString(),
        notes: newRequest.notes,
        cost: newRequest.cost
      });
      
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء طلب النشاط التسويقي بنجاح"
      });
      
      setIsCreateDialogOpen(false);
      setNewRequest({
        activityType: '',
        doctor: '',
        requestDate: new Date(),
        notes: '',
        cost: 0
      });
      
      fetchRequests();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الطلب",
        variant: "destructive"
      });
    }
  };

  const handleExport = async () => {
    try {
      const params: MarketingActivityRequestParams = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
        search: searchTerm || undefined
      };
      
      const blob = await exportMarketingActivityRequestsToExcel(currentUser._id, params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marketing-requests-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "تم بنجاح",
        description: "تم تصدير البيانات بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive"
      });
    }
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

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: any; color: string }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">طلبات الأنشطة التسويقية</h1>
          <p className="text-gray-600 mt-1">مرحباً {currentUser.firstName} {currentUser.lastName} - {currentUser.teamProducts}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            تصدير
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                طلب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إنشاء طلب نشاط تسويقي جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="activityType">نوع النشاط</Label>
                  <Select value={newRequest.activityType} onValueChange={(value) => setNewRequest({...newRequest, activityType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع النشاط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conference">مؤتمر طبي</SelectItem>
                      <SelectItem value="workshop">ورشة عمل</SelectItem>
                      <SelectItem value="presentation">عرض تقديمي</SelectItem>
                      <SelectItem value="meeting">اجتماع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="doctor">الطبيب</Label>
                  <Input
                    id="doctor"
                    value={newRequest.doctor}
                    onChange={(e) => setNewRequest({...newRequest, doctor: e.target.value})}
                    placeholder="اسم الطبيب"
                  />
                </div>
                <div>
                  <Label>تاريخ الطلب</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(newRequest.requestDate, 'PPP', { locale: ar })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newRequest.requestDate}
                        onSelect={(date) => date && setNewRequest({...newRequest, requestDate: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="cost">التكلفة المتوقعة</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={newRequest.cost}
                    onChange={(e) => setNewRequest({...newRequest, cost: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest({...newRequest, notes: e.target.value})}
                    placeholder="أضف ملاحظات إضافية..."
                  />
                </div>
                <Button onClick={handleCreateRequest} className="w-full">
                  إنشاء الطلب
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="إجمالي الطلبات" value={stats.total} icon={Activity} color="text-blue-600" />
        <StatCard title="قيد الانتظار" value={stats.pending} icon={Clock} color="text-yellow-600" />
        <StatCard title="موافق عليها" value={stats.approved} icon={CheckCircle} color="text-green-600" />
        <StatCard title="مرفوضة" value={stats.rejected} icon={XCircle} color="text-red-600" />
        <StatCard title="إجمالي التكلفة" value={`${stats.totalCost.toLocaleString()} د.ل`} icon={DollarSign} color="text-purple-600" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث في الطلبات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="فلترة حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="approved">موافق عليها</SelectItem>
                <SelectItem value="rejected">مرفوضة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
              <p className="text-gray-600">لم يتم العثور على أي طلبات تطابق المعايير المحددة</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{request.activityType.nameAr}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>الطبيب:</strong> {request.doctor.drName} - {request.doctor.specialty}</p>
                      <p><strong>المؤسسة:</strong> {request.doctor.organizationName}</p>
                      <p><strong>التاريخ:</strong> {new Date(request.requestDate).toLocaleDateString('ar-SA', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric', 
                        calendar: 'gregory' 
                      })}</p>
                      {request.cost && <p><strong>التكلفة:</strong> {request.cost.toLocaleString()} د.ل</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>نوع النشاط</Label>
                  <p className="text-sm font-medium">{selectedRequest.activityType.nameAr}</p>
                </div>
                <div>
                  <Label>الحالة</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <Label>اسم الطبيب</Label>
                  <p className="text-sm font-medium">{selectedRequest.doctor.drName}</p>
                </div>
                <div>
                  <Label>التخصص</Label>
                  <p className="text-sm font-medium">{selectedRequest.doctor.specialty}</p>
                </div>
                <div>
                  <Label>المؤسسة</Label>
                  <p className="text-sm font-medium">{selectedRequest.doctor.organizationName}</p>
                </div>
                <div>
                  <Label>المدينة</Label>
                  <p className="text-sm font-medium">{selectedRequest.doctor.city}</p>
                </div>
                <div>
                  <Label>تاريخ الطلب</Label>
                  <p className="text-sm font-medium">
                    {new Date(selectedRequest.requestDate).toLocaleDateString('ar-SA', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric', 
                      calendar: 'gregory' 
                    })}
                  </p>
                </div>
                {selectedRequest.cost && (
                  <div>
                    <Label>التكلفة</Label>
                    <p className="text-sm font-medium">{selectedRequest.cost.toLocaleString()} د.ل</p>
                  </div>
                )}
              </div>
              {selectedRequest.notes && (
                <div>
                  <Label>الملاحظات</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedRequest.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicalRepMarketing;