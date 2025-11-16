import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Textarea 
} from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Pagination } from '@/components/ui/pagination';
import { 
  Loader2, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff, 
  BookOpen, 
  Users, 
  FileText, 
  Activity,
  X,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ReceiptBook,
  CreateReceiptBookData,
  UpdateReceiptBookData,
  getAllReceiptBooks,
  createReceiptBook,
  updateReceiptBook,
  deleteReceiptBook,
  toggleReceiptBookStatus,
  getReceiptBooksStats,
  getAllSalesReps,
  SalesRep
} from '@/api/ReceiptBooks';

interface Stats {
  totalBooks: number;
  activeBooks: number;
  inactiveBooks: number;
  totalReceipts: number;
  usedReceipts: number;
  availableReceipts: number;
}

const ReceiptBooksManager: React.FC = () => {
  // State Management
  const [receiptBooks, setReceiptBooks] = useState<ReceiptBook[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    activeBooks: 0,
    inactiveBooks: 0,
    totalReceipts: 0,
    usedReceipts: 0,
    availableReceipts: 0
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [salesRepFilter, setSalesRepFilter] = useState<string>('all');

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<ReceiptBook | null>(null);

  // Form Data
  const [formData, setFormData] = useState<CreateReceiptBookData>({
    bookName: '',
    startNumber: 1,
    endNumber: 100,
    salesRep: '',
    notes: ''
  });

  // Load Data
  useEffect(() => {
    loadData();
    loadSalesReps();
    loadStats();
  }, [currentPage, searchTerm, statusFilter, salesRepFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { isActive: statusFilter === 'active' }),
        ...(salesRepFilter !== 'all' && { salesRep: salesRepFilter })
      };

      const response = await getAllReceiptBooks(params);
      if (response.success) {
        setReceiptBooks(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      }
    } catch (error: any) {
      toast.error('خطأ في تحميل البيانات: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadSalesReps = async () => {
    try {
      const response = await getAllSalesReps();
      if (response.success) {
        setSalesReps(response.data);
      }
    } catch (error: any) {
      console.error('خطأ في تحميل المندوبين:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getReceiptBooksStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('خطأ في تحميل الإحصائيات:', error);
    }
  };

  // Form Handlers
  const handleInputChange = (field: keyof CreateReceiptBookData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.bookName.trim()) {
      toast.error('يرجى إدخال اسم الدفتر');
      return false;
    }
    if (!formData.salesRep) {
      toast.error('يرجى اختيار المندوب');
      return false;
    }
    if (formData.startNumber >= formData.endNumber) {
      toast.error('رقم البداية يجب أن يكون أقل من رقم النهاية');
      return false;
    }
    if (formData.startNumber < 1) {
      toast.error('رقم البداية يجب أن يكون أكبر من صفر');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      bookName: '',
      startNumber: 1,
      endNumber: 100,
      salesRep: '',
      notes: ''
    });
  };

  // CRUD Operations
  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setCreating(true);
      const response = await createReceiptBook(formData);
      if (response.success) {
        toast.success('تم إنشاء دفتر الوصولات بنجاح');
        setCreateDialogOpen(false);
        resetForm();
        loadData();
        loadStats();
      }
    } catch (error: any) {
      toast.error('خطأ في إنشاء دفتر الوصولات: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedBook || !validateForm()) return;

    try {
      setUpdating(true);
      const updateData: UpdateReceiptBookData = {
        bookName: formData.bookName,
        startNumber: formData.startNumber,
        endNumber: formData.endNumber,
        salesRep: formData.salesRep,
        notes: formData.notes
      };

      const response = await updateReceiptBook(selectedBook._id, updateData);
      if (response.success) {
        toast.success('تم تحديث دفتر الوصولات بنجاح');
        setEditDialogOpen(false);
        setSelectedBook(null);
        resetForm();
        loadData();
        loadStats();
      }
    } catch (error: any) {
      toast.error('خطأ في تحديث دفتر الوصولات: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      const response = await deleteReceiptBook(id);
      if (response.success) {
        toast.success('تم حذف دفتر الوصولات بنجاح');
        loadData();
        loadStats();
      }
    } catch (error: any) {
      toast.error('خطأ في حذف دفتر الوصولات: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      setToggling(id);
      const response = await toggleReceiptBookStatus(id);
      if (response.success) {
        toast.success('تم تغيير حالة دفتر الوصولات بنجاح');
        loadData();
        loadStats();
      }
    } catch (error: any) {
      toast.error('خطأ في تغيير حالة دفتر الوصولات: ' + (error.response?.data?.message || error.message));
    } finally {
      setToggling(null);
    }
  };

  // Dialog Handlers
  const openEditDialog = (book: ReceiptBook) => {
    setSelectedBook(book);
    setFormData({
      bookName: book.bookName,
      startNumber: book.startNumber,
      endNumber: book.endNumber,
      salesRep: book.salesRep._id,
      notes: book.notes || ''
    });
    setEditDialogOpen(true);
  };

  const openViewDialog = (book: ReceiptBook) => {
    setSelectedBook(book);
    setViewDialogOpen(true);
  };

  // Utility Functions
  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500" : "bg-gray-500"}>
        {isActive ? 'نشط' : 'غير نشط'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUsagePercentage = (current: number, start: number, end: number) => {
    const total = end - start + 1;
    const used = current - start;
    return Math.round((used / total) * 100);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSalesRepFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة دفاتر الوصولات</h1>
          <p className="text-gray-600 mt-1">إدارة وتتبع دفاتر الوصولات للمندوبين</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                إنشاء دفتر جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إنشاء دفتر وصولات جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bookName">اسم الدفتر *</Label>
                  <Input
                    id="bookName"
                    value={formData.bookName}
                    onChange={(e) => handleInputChange('bookName', e.target.value)}
                    placeholder="أدخل اسم الدفتر"
                  />
                </div>

                <div>
                  <Label htmlFor="salesRep">المندوب *</Label>
                  <Select
                    value={formData.salesRep}
                    onValueChange={(value) => handleInputChange('salesRep', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المندوب" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesReps.map((rep) => (
                        <SelectItem key={rep._id} value={rep._id}>
                          {rep.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startNumber">رقم البداية *</Label>
                    <Input
                      id="startNumber"
                      type="number"
                      value={formData.startNumber}
                      onChange={(e) => handleInputChange('startNumber', parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endNumber">رقم النهاية *</Label>
                    <Input
                      id="endNumber"
                      type="number"
                      value={formData.endNumber}
                      onChange={(e) => handleInputChange('endNumber', parseInt(e.target.value) || 100)}
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="أدخل أي ملاحظات إضافية"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    disabled={creating}
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={creating || !formData.bookName || !formData.salesRep}
                  >
                    {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    إنشاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدفاتر</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalBooks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الدفاتر النشطة</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeBooks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المندوبين</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{salesReps.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الوصولات</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalReceipts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="البحث في أسماء الدفاتر..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="salesRep">المندوب</Label>
              <Select value={salesRepFilter} onValueChange={setSalesRepFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المندوب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المندوبين</SelectItem>
                  {salesReps.map((rep) => (
                    <SelectItem key={rep._id} value={rep._id}>
                      {rep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                مسح الفلاتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة دفاتر الوصولات ({totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="mr-2">جاري التحميل...</span>
            </div>
          ) : receiptBooks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد دفاتر وصولات
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الدفتر</TableHead>
                    <TableHead>المندوب</TableHead>
                    <TableHead>النطاق</TableHead>
                    <TableHead>الرقم الحالي</TableHead>
                    <TableHead>نسبة الاستخدام</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receiptBooks.map((book) => (
                    <TableRow key={book._id}>
                      <TableCell className="font-medium">{book.bookName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {book.salesRep.username}
                        </div>
                      </TableCell>
                      <TableCell>
                        {book.startNumber} - {book.endNumber}
                      </TableCell>
                      <TableCell>{book.currentNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${getUsagePercentage(book.currentNumber, book.startNumber, book.endNumber)}%`
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {getUsagePercentage(book.currentNumber, book.startNumber, book.endNumber)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(book.isActive)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(book.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openViewDialog(book)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(book)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(book._id)}
                            disabled={toggling === book._id}
                          >
                            {toggling === book._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : book.isActive ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف دفتر الوصولات "{book.bookName}"؟ 
                                  هذا الإجراء لا يمكن التراجع عنه.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(book._id)}
                                  disabled={deleting === book._id}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {deleting === book._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : null}
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>



      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل دفتر الوصولات</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editBookName">اسم الدفتر *</Label>
              <Input
                id="editBookName"
                value={formData.bookName}
                onChange={(e) => handleInputChange('bookName', e.target.value)}
                placeholder="أدخل اسم الدفتر"
              />
            </div>

            <div>
              <Label htmlFor="editSalesRep">المندوب *</Label>
              <Select
                value={formData.salesRep}
                onValueChange={(value) => handleInputChange('salesRep', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المندوب" />
                </SelectTrigger>
                <SelectContent>
                  {salesReps.map((rep) => (
                    <SelectItem key={rep._id} value={rep._id}>
                      {rep.name} ({rep.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editStartNumber">رقم البداية *</Label>
                <Input
                  id="editStartNumber"
                  type="number"
                  value={formData.startNumber}
                  onChange={(e) => handleInputChange('startNumber', parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="editEndNumber">رقم النهاية *</Label>
                <Input
                  id="editEndNumber"
                  type="number"
                  value={formData.endNumber}
                  onChange={(e) => handleInputChange('endNumber', parseInt(e.target.value) || 100)}
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editNotes">ملاحظات</Label>
              <Textarea
                id="editNotes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="أدخل أي ملاحظات إضافية"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setSelectedBook(null);
                  resetForm();
                }}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري التحديث...
                  </>
                ) : (
                  'تحديث'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل دفتر الوصولات</DialogTitle>
          </DialogHeader>
          {selectedBook && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">اسم الدفتر</Label>
                  <p className="text-sm font-medium">{selectedBook.bookName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">الحالة</Label>
                  <div className="mt-1">{getStatusBadge(selectedBook.isActive)}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">المندوب</Label>
                <p className="text-sm font-medium">{selectedBook.salesRep.username}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">رقم البداية</Label>
                  <p className="text-sm font-medium">{selectedBook.startNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">رقم النهاية</Label>
                  <p className="text-sm font-medium">{selectedBook.endNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">الرقم الحالي</Label>
                  <p className="text-sm font-medium">{selectedBook.currentNumber}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">نسبة الاستخدام</Label>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full flex items-center justify-center"
                      style={{
                        width: `${getUsagePercentage(selectedBook.currentNumber, selectedBook.startNumber, selectedBook.endNumber)}%`
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        {getUsagePercentage(selectedBook.currentNumber, selectedBook.startNumber, selectedBook.endNumber)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBook.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">ملاحظات</Label>
                  <p className="text-sm">{selectedBook.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">تاريخ الإنشاء</Label>
                  <p className="text-sm">{formatDate(selectedBook.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">آخر تحديث</Label>
                  <p className="text-sm">{formatDate(selectedBook.updatedAt)}</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewDialogOpen(false);
                    setSelectedBook(null);
                  }}
                >
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptBooksManager;