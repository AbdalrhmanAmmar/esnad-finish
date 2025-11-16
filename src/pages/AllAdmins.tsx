import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Crown, Shield, User as UserIcon, Eye, EyeOff, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { getAllAdmins, AdminListItem, GetAllAdminsParams, exportAdminsToExcel, ExportAdminsParams, updateAdminStatus, UpdateAdminStatusData } from '@/api/Users';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

const AllAdmins: React.FC = () => {
  const { user } = useAuthStore();
  const [admins, setAdmins] = useState<AdminListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statistics, setStatistics] = useState<any>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Export function
  const handleExport = async () => {
    try {
      setExportLoading(true);
      const params: ExportAdminsParams = {};
      
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isActive = statusFilter === 'active';
      
      const blob = await exportAdminsToExcel(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `المسجلين_${timestamp}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تصدير البيانات بنجاح');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'فشل في تصدير البيانات');
    } finally {
      setExportLoading(false);
    }
  };

  // Update admin status function
  const handleStatusUpdate = async (adminId: string, newStatus: boolean) => {
    try {
      setUpdatingStatus(adminId);
      
      const data: UpdateAdminStatusData = {
        adminId,
        isActive: newStatus
      };
      
      const response = await updateAdminStatus(data);
      
      if (response.success) {
        // Update the admin in the local state
        setAdmins(prevAdmins => 
          prevAdmins.map(admin => 
            admin.id === adminId 
              ? { ...admin, isActive: newStatus, status: newStatus ? 'نشط' : 'غير نشط' }
              : admin
          )
        );
        
        toast.success(response.message || 'تم تحديث حالة المدير بنجاح');
        
        // Refresh data to get updated statistics
        fetchAdmins();
      } else {
        toast.error(response.message || 'فشل في تحديث حالة المدير');
      }
    } catch (error: any) {
      console.error('Status update error:', error);
      toast.error(error.message || 'فشل في تحديث حالة المدير');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Check if user has SYSTEM_ADMIN role
  if (user?.role !== 'SYSTEM_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-red-600 mb-2">غير مصرح</h2>
              <p className="text-muted-foreground">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const params: GetAllAdminsParams = {
        page: currentPage,
        limit: 10,
      };

      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isActive = statusFilter === 'true';

      const response = await getAllAdmins(params);
      
      if (response.success) {
        setAdmins(response.data.admins);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.totalCount);
        setStatistics(response.data.statistics);
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return <Crown className="h-4 w-4" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            جميع عملائي (الادمن)
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة ومراقبة جميع المديرين في النظام
          </p>
        </div>
        <Button 
          onClick={handleExport}
          disabled={exportLoading}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Download className="h-4 w-4" />
          {exportLoading ? 'جاري التصدير...' : 'تصدير Excel'}
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">إجمالي المديرين</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">مديري النظام</p>
                  <p className="text-2xl font-bold">{statistics.byRole?.SYSTEM_ADMIN?.total || 0}</p>
                </div>
                <Crown className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">المديرين</p>
                  <p className="text-2xl font-bold">{statistics.byRole?.ADMIN?.total || 0}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">النشطين</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Object.values(statistics.byRole).reduce((acc: number, role: any) => acc + role.active, 0)}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والفلترة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم أو اسم المستخدم..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={roleFilter || 'all'} onValueChange={handleRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="فلترة حسب الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                <SelectItem value="SYSTEM_ADMIN">👑 مدير النظام</SelectItem>
                <SelectItem value="ADMIN">🛡️ مدير</SelectItem>
                <SelectItem value="USER">👤 مستخدم</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter || 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="فلترة حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="true">🟢 نشط</SelectItem>
                <SelectItem value="false">🔴 غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المديرين</CardTitle>
          <CardDescription>
            عرض {admins.length} من أصل {totalCount} مدير
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم الكامل</TableHead>
                    <TableHead className="text-right">اسم المستخدم</TableHead>
                    <TableHead className="text-right">الدور</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">لا توجد بيانات للعرض</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.fullName}</TableCell>
                        <TableCell>{admin.username}</TableCell>
                        <TableCell>
                          <Badge className={`${getRoleColor(admin.role)} flex items-center gap-1 w-fit`}>
                            {getRoleIcon(admin.role)}
                            {admin.roleDisplay}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={admin.isActive}
                              onCheckedChange={(checked) => handleStatusUpdate(admin.id, checked)}
                              disabled={updatingStatus === admin.id}
                              className="data-[state=checked]:bg-green-500"
                            />
                            <span className={`text-sm font-medium ${
                              admin.isActive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {updatingStatus === admin.id ? 'جاري التحديث...' : admin.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(admin.createdAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            عرض الصفحة {currentPage} من {totalPages} ({totalCount} إجمالي)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>
            <span className="text-sm font-medium px-3 py-1 bg-primary/10 rounded">
              {currentPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAdmins;