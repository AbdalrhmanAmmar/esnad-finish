import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Stethoscope, Filter, Loader2, RefreshCw, Calendar, Building2, Tag, MapPin, GraduationCap, Phone, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDoctors, GetDoctorsParams, exportDoctors, deleteDoctor } from '../api/Doctors';
import toast from 'react-hot-toast';

interface Doctor {
  _id: string;
  drName: string;
  organizationName: string;
  city: string;
  specialty: string;
  brand?: string;
  phone?: string;
  experience?: string;
  createdAt: string;
  updatedAt: string;
}

function DoctorsManagement() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch doctors from API
  const fetchDoctors = async (params: GetDoctorsParams = {}) => {
    try {
      setLoading(true);
      const response = await getDoctors({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        city: filterCity !== 'all' ? filterCity : undefined,
        specialty: filterSpecialty !== 'all' ? filterSpecialty : undefined,
        brand: filterBrand !== 'all' ? filterBrand : undefined,
        ...params
      });
      
      if (response.success) {
        console.log(response);
        setDoctors(response.data);
        setTotalPages(response.meta.totalPages);
        setTotalDoctors(response.meta.total);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('حدث خطأ أثناء تحميل بيانات الأطباء. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [currentPage, searchTerm, filterCity, filterSpecialty, filterBrand]);

  // Get unique values for filters
  const uniqueCities = [...new Set(doctors.map(d => d.city))].filter(Boolean);
  const uniqueSpecialties = [...new Set(doctors.map(d => d.specialty))].filter(Boolean);
  const uniqueBrands = [...new Set(doctors.map(d => d.brand))].filter(Boolean);

  const handleRefresh = () => {
    fetchDoctors();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDeleteClick = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!doctorToDelete) return;

    setDeleteLoading(true);
    const loadingToastId = toast.loading('جاري حذف الطبيب...');

    try {
      const result = await deleteDoctor(doctorToDelete._id);
      
      if (result.success) {
        toast.success(result.message || 'تم حذف الطبيب بنجاح', { id: loadingToastId });
        setIsDeleteDialogOpen(false);
        setDoctorToDelete(null);
        fetchDoctors(); // Refresh the list
      } else {
        toast.error(result.error || 'فشل في حذف الطبيب', { id: loadingToastId });
      }
    } catch (error: any) {
      console.error('Error deleting doctor:', error);
      toast.error('حدث خطأ غير متوقع', { id: loadingToastId });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDoctorToDelete(null);
  };

  const handleExportDoctors = async () => {
    setExportLoading(true);
    const loadingToastId = toast.loading('جاري تصدير ملف الأطباء...');

    try {
      // تمرير معاملات الفلترة الحالية
      const exportParams: GetDoctorsParams = {
        search: searchTerm || undefined,
        city: filterCity !== 'all' ? filterCity : undefined,
        specialty: filterSpecialty !== 'all' ? filterSpecialty : undefined,
        brand: filterBrand !== 'all' ? filterBrand : undefined,
      };
      
      await exportDoctors(exportParams);
      toast.success('تم تصدير ملف الأطباء بنجاح', { id: loadingToastId });
    } catch (error: any) {
      console.error('Error exporting doctors:', error);
      toast.error(error.message || 'حدث خطأ أثناء تصدير ملف الأطباء', { id: loadingToastId });
    } finally {
      setExportLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSpecialtyBadge = (specialty: string) => {
    const specialtyColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      'طب باطني': 'default',
      'جراحة': 'destructive',
      'أطفال': 'secondary',
      'نساء وولادة': 'outline',
      'عظام': 'default',
      'قلب': 'destructive',
      'جلدية': 'secondary',
      'عيون': 'outline'
    };
    
    const variant = specialtyColors[specialty] || 'outline';
    return <Badge variant={variant}>{specialty}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Stethoscope className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الأطباء</h1>
            <p className="text-gray-600">إدارة وتنظيم بيانات الأطباء ({totalDoctors} طبيب)</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <RefreshCw className="h-4 w-4 ml-2" />}
            تحديث
          </Button>
          <Button variant="outline" onClick={handleExportDoctors} disabled={exportLoading}>
            {exportLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Download className="h-4 w-4 ml-2" />}
            تصدير Excel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/management/data/doctors/add')}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة طبيب جديد
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            قائمة الأطباء
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            إجمالي الأطباء: {totalDoctors} | الصفحة {currentPage} من {totalPages}
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث في الأطباء (الاسم، المنظمة، المدينة، التخصص)..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterCity} onValueChange={setFilterCity}>
                <SelectTrigger className="w-48">
                  <MapPin className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="المدينة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المدن</SelectItem>
                  {uniqueCities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                <SelectTrigger className="w-48">
                  <GraduationCap className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="التخصص" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التخصصات</SelectItem>
                  {uniqueSpecialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterBrand} onValueChange={setFilterBrand}>
                <SelectTrigger className="w-48">
                  <Tag className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="العلامة التجارية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العلامات التجارية</SelectItem>
                  {uniqueBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="mr-2">جاري تحميل بيانات الأطباء...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم الطبيب</TableHead>
                    <TableHead className="text-right">التخصص</TableHead>
                    <TableHead className="text-right">المنظمة</TableHead>
                    <TableHead className="text-right">المدينة</TableHead>
                    <TableHead className="text-right">العلامة التجارية</TableHead>
                    <TableHead className="text-right">تاريخ الإضافة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        لا توجد بيانات أطباء متاحة
                      </TableCell>
                    </TableRow>
                  ) : (
                    doctors.map((doctor) => (
                      <TableRow key={doctor._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-blue-600" />
                            {doctor.drName}
                          </div>
                        </TableCell>
                        <TableCell>{getSpecialtyBadge(doctor.specialty)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{doctor.organizationName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{doctor.city}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {doctor.brand ? (
                            <Badge variant="outline">{doctor.brand}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">غير محدد</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(doctor.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/management/data/doctors/update/${doctor._id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(doctor)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    عرض {((currentPage - 1) * 10) + 1} إلى {Math.min(currentPage * 10, totalDoctors)} من {totalDoctors} طبيب
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      السابق
                    </Button>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">تأكيد حذف الطبيب</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الطبيب "{doctorToDelete?.drName}"؟
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                التخصص: {doctorToDelete?.specialty}
              </span>
              <span className="text-sm text-muted-foreground block">
                المنظمة: {doctorToDelete?.organizationName}
              </span>
              <br />
              <span className="text-red-500 font-medium">
                هذا الإجراء لا يمكن التراجع عنه.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={handleDeleteCancel}
              disabled={deleteLoading}
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="flex items-center gap-2"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  حذف الطبيب
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DoctorsManagement;