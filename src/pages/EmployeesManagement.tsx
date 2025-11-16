import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
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
import { Search, Users, UserCheck, UserX, Filter, RefreshCw, Plus, Edit, Trash2, Download } from 'lucide-react';
import { getEmployeesByAdmin, deleteEmployee, exportEmployeesToExcel, Employee, GetEmployeesByAdminParams, RoleStats } from '@/api/Users';
import { useAuthStore } from '@/stores/authStore';

const EmployeesManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [roleStats, setRoleStats] = useState<RoleStats[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    teamProducts: '',
    teamArea: '',
    city: '',
    district: ''
  });

  const fetchEmployees = async (page = 1) => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const params: GetEmployeesByAdminParams = {
        adminId: user._id,
        page,
        limit: 10,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '' && value !== 'all')
        )
      };

      const response = await getEmployeesByAdmin(params);
      
      if (response.success) {
        setEmployees(response.data.users);
        setTotalEmployees(response.data.stats.totalUsers);
        setRoleStats(response.data.stats.roleDistribution);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
        setHasNextPage(response.data.pagination.hasNextPage);
        setHasPrevPage(response.data.pagination.hasPrevPage);
      } else {
        toast({
          title: 'خطأ',
          description: 'فشل في جلب بيانات الموظفين',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في جلب بيانات الموظفين',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [user?._id]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchEmployees(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      role: 'all',
      teamProducts: '',
      teamArea: '',
      city: '',
      district: ''
    });
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    try {
      const response = await deleteEmployee(employeeToDelete.id);
      
      if (response.success) {
        toast({
          title: 'تم الحذف بنجاح',
          description: response.message,
          variant: 'default'
        });
        
        // Refresh the employees list
        fetchEmployees(currentPage);
      }
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'خطأ في الحذف',
        description: error.response?.data?.message || 'حدث خطأ أثناء حذف الموظف',
        variant: 'destructive'
      });
    } finally {
      setEmployeeToDelete(null);
    }
  };

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);
      const blob = await exportEmployeesToExcel();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const today = new Date().toISOString().slice(0, 10);
      link.download = `employees_export_${today}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'تم التصدير بنجاح',
        description: 'تم تصدير ملف Excel بنجاح',
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: 'خطأ في التصدير',
        description: 'حدث خطأ أثناء تصدير الملف',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'SUPERVISOR':
        return 'default';
      case 'MEDICAL REP':
        return 'secondary';
      case 'SALES REP':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة الموظفين</h1>
          <p className="text-muted-foreground mt-1">إدارة وعرض جميع الموظفين في النظام</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportToExcel}
            disabled={isExporting}
            variant="outline"
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Download className="h-4 w-4 ml-2" />
            {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
          </Button>
          <Button 
            onClick={() => window.location.href = '/add-employee'} 
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة موظف جديد
          </Button>
          <Button onClick={() => fetchEmployees(currentPage)} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalEmployees}</div>
          </CardContent>
        </Card>

        {roleStats.slice(0, 3).map((stat, index) => (
          <Card key={stat._id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat._id}</CardTitle>
              {index === 0 ? <UserCheck className="h-4 w-4 text-muted-foreground" /> : 
               index === 1 ? <UserX className="h-4 w-4 text-muted-foreground" /> :
               <Users className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stat.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلاتر البحث
          </CardTitle>
          <CardDescription>
            استخدم الفلاتر للبحث عن الموظفين حسب المعايير المختلفة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم أو اسم المستخدم..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                <SelectItem value="ADMIN">مدير</SelectItem>
                <SelectItem value="SUPERVISOR">مشرف</SelectItem>
                <SelectItem value="MEDICAL REP">مندوب طبي</SelectItem>
                <SelectItem value="SALES REP">مندوب مبيعات</SelectItem>
                <SelectItem value="ASSITANT">مساعد</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="فريق المنتجات"
              value={filters.teamProducts}
              onChange={(e) => handleFilterChange('teamProducts', e.target.value)}
            />

            <Input
              placeholder="منطقة الفريق"
              value={filters.teamArea}
              onChange={(e) => handleFilterChange('teamArea', e.target.value)}
            />

            <Input
              placeholder="المدينة"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            />

            <Input
              placeholder="المنطقة"
              value={filters.district}
              onChange={(e) => handleFilterChange('district', e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters} disabled={loading}>
              <Search className="h-4 w-4 ml-2" />
              تطبيق الفلاتر
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              مسح الفلاتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموظفين</CardTitle>
          <CardDescription>
            عرض جميع الموظفين مع تفاصيلهم الأساسية
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
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>اسم المستخدم</TableHead>
                      <TableHead>الدور</TableHead>
                      <TableHead>فريق المنتجات</TableHead>
                      <TableHead>منطقة الفريق</TableHead>
                      <TableHead>المشرف</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>تاريخ الإنشاء</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">لا توجد موظفين</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.map((employee) => (
                        <TableRow key={employee._id}>
                          <TableCell className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </TableCell>
                          <TableCell>{employee.username}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(employee.role)}>
                              {employee.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{employee.teamProducts}</TableCell>
                          <TableCell>{employee.teamArea}</TableCell>
                          <TableCell>
                            {employee.supervisor ? (
                              <div className="text-sm">
                                <div className="font-medium">
                                  {employee.supervisor.firstName} {employee.supervisor.lastName}
                                </div>
                                <div className="text-muted-foreground">
                                  {employee.supervisor.username}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">لا يوجد مشرف</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                              {employee.isActive ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(employee.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/edit-employee/${employee._id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEmployeeToDelete({ id: employee._id, name: `${employee.firstName} ${employee.lastName}` })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    صفحة {currentPage} من {totalPages} ({totalEmployees} موظف)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchEmployees(currentPage - 1)}
                      disabled={!hasPrevPage || loading}
                    >
                      السابق
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchEmployees(currentPage + 1)}
                      disabled={!hasNextPage || loading}
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!employeeToDelete} onOpenChange={() => setEmployeeToDelete(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف الموظف <span className="font-semibold text-foreground">{employeeToDelete?.name}</span>؟
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                لا يمكن التراجع عن هذا الإجراء.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="flex-1">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeesManagement;