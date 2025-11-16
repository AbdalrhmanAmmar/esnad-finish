import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Package, Filter, Loader2, RefreshCw, Calendar, Building2, Tag, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts, GetProductsParams, deleteProductById, exportProducts } from '@/api/Products';
import toast from 'react-hot-toast';


interface Product {
  _id: string;
  CODE: string;
  PRODUCT: string;
  PRODUCT_TYPE: string;
  BRAND: string;
  TEAM: string;
  teamProducts: string;
  COMPANY: string;
  messages?: Array<{text: string} | string>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

function ProductsManagement() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch products from API
  const fetchProducts = async (params: GetProductsParams = {}) => {
    try {
      setLoading(true);
      const response = await getProducts({
        page: currentPage,
        limit: 10,
        sortField: 'createdAt',
        sortOrder: 'desc',
        q: searchTerm, // إرسال البحث إلى الخادم
        brand: filterBrand !== 'all' ? filterBrand : undefined,
        company: filterCompany !== 'all' ? filterCompany : undefined,
        type: filterType !== 'all' ? filterType : undefined,
        ...params
      });
      
      if (response.success) {
        console.log(response)
        setProducts(response.data);
        setTotalPages(response.meta.totalPages);
        setTotalProducts(response.meta.total);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'خطأ في تحميل البيانات',
        description: 'حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, filterBrand, filterCompany, filterType]);

  // إزالة الفلترة المحلية لأن الخادم يتولى الفلترة الآن
  const filteredProducts = products;

  // Get unique values for filters - نحتاج لجلب جميع البيانات للفلاتر
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const fetchAllProductsForFilters = async () => {
      try {
        const response = await getProducts({ limit: 10000 }); // جلب جميع المنتجات للفلاتر
        if (response.success) {
          setAllProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching all products for filters:', error);
      }
    };
    fetchAllProductsForFilters();
  }, []);

  const uniqueBrands = [...new Set(allProducts.map(p => p.BRAND))].filter(Boolean);
  const uniqueCompanies = [...new Set(allProducts.map(p => p.COMPANY))].filter(Boolean);
  const uniqueTypes = [...new Set(allProducts.map(p => p.PRODUCT_TYPE))].filter(Boolean);

  const handleRefresh = () => {
    setCurrentPage(1); // إعادة تعيين الصفحة للأولى
    fetchProducts();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // إعادة تعيين الصفحة للأولى عند البحث
  };

  // تحديث الفلاتر لإعادة تعيين الصفحة
  const handleBrandFilter = (value: string) => {
    setFilterBrand(value);
    setCurrentPage(1);
  };

  const handleCompanyFilter = (value: string) => {
    setFilterCompany(value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  // تصدير المنتجات كملف Excel
  const handleExport = async () => {
    try {
      setExportLoading(true);
      await exportProducts({
        brand: filterBrand !== 'all' ? filterBrand : undefined,
        company: filterCompany !== 'all' ? filterCompany : undefined,
        type: filterType !== 'all' ? filterType : undefined,
      });
      toast.success('تم تصدير المنتجات بنجاح');
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error('حدث خطأ أثناء تصدير المنتجات');
    } finally {
      setExportLoading(false);
    }
  };



  const handleEditProduct = (product: Product) => {
    navigate(`/management/data/products/update/${product.CODE}`);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setDeleteLoading(true);
    const loadingToastId = toast.loading('جاري حذف المنتج...');

    try {
      const result = await deleteProductById(productToDelete._id);
      
      if (result.success) {
        toast.success('تم حذف المنتج بنجاح', { id: loadingToastId });
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
        fetchProducts(); // Refresh the list
      } else {
        toast.error(result.error || 'فشل في حذف المنتج', { id: loadingToastId });
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع', { id: loadingToastId });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProductTypeBadge = (type: string) => {
    const typeMap: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
      'P': { label: 'P', variant: 'default' },
      'M': { label: 'دواء', variant: 'secondary' },
      'S': { label: 'مكمل', variant: 'outline' }
    };
    
    const typeInfo = typeMap[type] || { label: type, variant: 'outline' as const };
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };



  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة المنتجات</h1>
            <p className="text-gray-600">إدارة وتنظيم المنتجات الطبية ({totalProducts} منتج)</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <RefreshCw className="h-4 w-4 ml-2" />}
            تحديث
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={exportLoading}>
            {exportLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Download className="h-4 w-4 ml-2" />}
            تصدير Excel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/management/data/products/add')}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة منتج جديد
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            قائمة المنتجات
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            إجمالي المنتجات: {totalProducts} | الصفحة {currentPage} من {totalPages}
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث في المنتجات (الاسم، الكود، العلامة التجارية)..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterBrand} onValueChange={handleBrandFilter}>
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
              <Select value={filterCompany} onValueChange={handleCompanyFilter}>
                <SelectTrigger className="w-48">
                  <Building2 className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="الشركة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الشركات</SelectItem>
                  {uniqueCompanies.map((company) => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={handleTypeFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="نوع المنتج" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>{getProductTypeBadge(type)}</SelectItem>
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
              <span className="mr-2">جاري تحميل المنتجات...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">كود المنتج</TableHead>
                    <TableHead className="text-right">اسم المنتج</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">العلامة التجارية</TableHead>
                    <TableHead className="text-right">الشركة</TableHead>
                    <TableHead className="text-right">الفريق</TableHead>
                    <TableHead className="text-right">تاريخ الإضافة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        لا توجد منتجات متاحة
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-mono text-sm">{product.CODE}</TableCell>
                        <TableCell className="font-medium">{product.PRODUCT}</TableCell>
                        <TableCell>{getProductTypeBadge(product.PRODUCT_TYPE)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.BRAND}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{product.COMPANY}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.teamProducts}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(product.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(product)}
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
                    عرض {((currentPage - 1) * 10) + 1} إلى {Math.min(currentPage * 10, totalProducts)} من {totalProducts} منتج
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
            <DialogTitle className="text-red-600">تأكيد حذف المنتج</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف المنتج "{productToDelete?.PRODUCT}"؟
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                كود المنتج: {productToDelete?.CODE}
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
                  حذف المنتج
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProductsManagement;