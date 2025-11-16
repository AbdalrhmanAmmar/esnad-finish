import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Activity, Plus, Download } from 'lucide-react';
import { getAllMarketingActivities, exportMarketingActivitiesToExcel } from '@/api/MarketingActivities';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface MarketingActivity {
  _id: string;
  english: string;
  arabic: string;
  isActive: boolean;
  adminId: {
    _id: string;
    username: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const MarketingActivitiesManagement: React.FC = () => {
  const [activities, setActivities] = useState<MarketingActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchActivities = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const isActiveValue = isActiveFilter === 'all' ? undefined : isActiveFilter === 'true';
      const response = await getAllMarketingActivities(page, limit, search, isActiveValue);
      
      if (response.success) {
        console.log(`response.data` ,response.data)
        setActivities(response.data.activities);
        setPagination(response.data.pagination);
      } else {
        toast({
          title: 'خطأ',
          description: response.message || 'حدث خطأ أثناء جلب البيانات',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء جلب البيانات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(1, pagination.itemsPerPage);
  }, [search, isActiveFilter]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleFilterChange = (value: string) => {
    setIsActiveFilter(value);
  };

  const handlePageChange = (page: number) => {
    fetchActivities(page, pagination.itemsPerPage);
  };

  const handleRefresh = () => {
    fetchActivities(pagination.currentPage, pagination.itemsPerPage);
  };

  const handleAddNew = () => {
    navigate('/management/marketing-activities/add');
  };

  const handleExport = async () => {
    try {
      const response = await exportMarketingActivitiesToExcel();
      
      if (response.success) {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `marketing-activities-${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'نجح التصدير',
          description: 'تم تصدير البيانات بنجاح',
          variant: 'default'
        });
      } else {
        toast({
          title: 'خطأ في التصدير',
          description: response.message || 'حدث خطأ أثناء تصدير البيانات',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'خطأ في التصدير',
        description: error.message || 'حدث خطأ أثناء تصدير البيانات',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">إدارة الأنشطة التسويقية</h1>
            <p className="text-muted-foreground">عرض وإدارة جميع الأنشطة التسويقية</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 ml-2" />
            تصدير البيانات
          </Button>
          <Button onClick={handleAddNew} size="sm">
            <Plus className="h-4 w-4 ml-2" />
            إضافة نشاط جديد
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>البحث والفلترة</CardTitle>
          <CardDescription>
            ابحث في الأنشطة التسويقية أو قم بفلترتها حسب الحالة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="ابحث في الأنشطة التسويقية..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={isActiveFilter} onValueChange={handleFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="فلترة حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنشطة</SelectItem>
                  <SelectItem value="true">نشط</SelectItem>
                  <SelectItem value="false">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الأنشطة التسويقية</CardTitle>
          <CardDescription>
            إجمالي {pagination.totalItems} نشاط تسويقي
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الاسم الإنجليزي</TableHead>
                      <TableHead className="text-right">الاسم العربي</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">المسؤول</TableHead>
                      <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <Activity className="h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">لا توجد أنشطة تسويقية</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      activities.map((activity) => (
                        <TableRow key={activity._id}>
                          <TableCell className="font-medium">
                            {activity.english}
                          </TableCell>
                          <TableCell>{activity.arabic}</TableCell>
                          <TableCell>
                            <Badge variant={activity.isActive ? 'default' : 'secondary'}>
                              {activity.isActive ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{activity.adminId.username}</span>
                              <span className="text-sm text-muted-foreground">
                                {activity.adminId.role}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(activity.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    عرض {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} إلى{' '}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} من{' '}
                    {pagination.totalItems} نتيجة
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                      السابق
                    </Button>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === pagination.totalPages || 
                          Math.abs(page - pagination.currentPage) <= 1
                        )
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={page === pagination.currentPage ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        ))
                      }
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      التالي
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingActivitiesManagement;