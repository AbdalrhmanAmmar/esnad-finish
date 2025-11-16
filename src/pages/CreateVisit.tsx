import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ar } from 'date-fns/locale';

// Register Arabic locale
registerLocale('ar', ar);
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, User, Package, FileText, Users, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createVisit, CreateVisitRequest, VisitProduct } from '@/api/Visits';
import { getSupervisors, MedicalRepDoctor, MedicalRepProduct } from '@/api/MedicalRep';
import { useAuthStore } from '@/stores/authStore';
import { useMedicalRepStore } from '@/stores/medicalRepStore';

interface Supervisor {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
}

const CreateVisit: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { doctors: storeDoctors, products: storeProducts, isLoaded } = useMedicalRepStore();
  
  // Form state
  const [formData, setFormData] = useState<CreateVisitRequest>({
    visitDate: new Date().toISOString(),
    doctorId: '',
    products: [],
    notes: '',
    withSupervisor: false,
  });
  
  // Data state
  const [doctors, setDoctors] = useState<MedicalRepDoctor[]>([]);
  const [products, setProducts] = useState<MedicalRepProduct[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<string>('');
  const [selectedSamplesCount, setSelectedSamplesCount] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Load initial data - fetch directly if not in store
  useEffect(() => {
    const loadData = async () => {
      if (storeDoctors.length > 0 && storeProducts.length > 0) {
        // Use data from store
        setDoctors(storeDoctors);
        setProducts(storeProducts);
        setLoadingData(false);
      } else {
        // Fetch data directly if not in store
        if (!user?._id) return;
        
        try {
          setLoadingData(true);
          const { getMedicalRepData } = await import('@/api/MedicalRep');
          const response = await getMedicalRepData(user._id);
          
          if (response.success) {
            setDoctors(response.data.doctors);
            setProducts(response.data.products);
            // Also save to store for future use
            const { useMedicalRepStore } = await import('@/stores/medicalRepStore');
            useMedicalRepStore.getState().setData(response.data.doctors, response.data.products);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          toast({
            title: 'خطأ',
            description: 'حدث خطأ في تحميل البيانات',
            variant: 'destructive',
          });
        } finally {
          setLoadingData(false);
        }
      }
    };

    loadData();
  }, [storeDoctors, storeProducts, user?._id, toast]);

  // Load supervisors when needed


  // Get product messages from store data
  const getProductMessages = (productId: string) => {
    const product = products.find(p => p._id === productId);
    return product?.messages || [];
  };

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    setSelectedMessage('');
  };

  // Add product to visit
  const addProductToVisit = () => {
    if (!selectedProduct || !selectedMessage) {
      toast({
        title: 'تنبيه',
        description: 'يرجى اختيار المنتج والرسالة',
        variant: 'destructive'
      });
      return;
    }

    if (selectedSamplesCount < 0) {
      toast({
        title: 'تنبيه',
        description: 'عدد العينات يجب أن يكون أكبر من أو يساوي صفر',
        variant: 'destructive'
      });
      return;
    }

    // Check if product already added
    const existingProduct = formData.products.find(p => p.productId === selectedProduct && p.messageId === selectedMessage);
    if (existingProduct) {
      toast({
        title: 'تنبيه',
        description: 'تم إضافة هذا المنتج والرسالة مسبقاً',
        variant: 'destructive'
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { 
        productId: selectedProduct, 
        messageId: selectedMessage,
        samplesCount: selectedSamplesCount
      }]
    }));
    
    setSelectedProduct('');
    setSelectedMessage('');
    setSelectedSamplesCount(0);
  };

  // Remove product from visit
  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?._id) return;
    
    // Validation
    if (!formData.visitDate || !formData.doctorId || formData.products.length === 0) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }
    

    
    try {
      setLoading(true);
      const response = await createVisit(user._id, formData);
      
      if (response.success) {
        toast({
          title: 'نجح',
          description: 'تم إنشاء الزيارة بنجاح',
        });
        setFormData({
          visitDate: new Date().toISOString(),
          doctorId: '',
          products: [],
          notes: '',
          withSupervisor: false,
          
        });
      
      }
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء إنشاء الزيارة',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p._id === productId);
    return product ? `${product.code} - ${product.name}` : 'منتج غير معروف';
  };

  const getMessageTitle = (productId: string, messageId: string) => {
    const messages = getProductMessages(productId);
    const message = messages.find((m: any, index: number) => index.toString() === messageId);
    return message ? message.text || message.tag : 'رسالة غير معروفة';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d._id === doctorId);
    return doctor ? doctor.name : 'طبيب غير معروف';
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            تسجيل زيارة عادية
          </CardTitle>
          <CardDescription>
            قم بتسجيل زيارة جديدة للطبيب مع تحديد المنتجات والرسائل المناسبة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
            {/* Visit Date */}
            <div className="space-y-2">
              <Label htmlFor="visitDate" className="flex items-center gap-2 justify-end">
                <span>تاريخ الزيارة *</span>
                <CalendarDays className="h-4 w-4" />
              </Label>
              <div className="relative">
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date);
                      setFormData(prev => ({
                        ...prev,
                        visitDate: date ? date.toISOString() : ''
                      }));
                    }}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="اختر تاريخ الزيارة"
                    className="w-full text-right pr-10 pl-4 py-2 bg-background border-2 border-primary/20 hover:border-primary focus:border-primary transition-all duration-200 rounded-lg shadow-sm focus:shadow-md focus:ring-2 focus:ring-primary/20 outline-none"
                    calendarClassName="custom-datepicker"
                    popperClassName="z-50"
                    showPopperArrow={false}
                    locale="ar"
                  />
                <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
              </div>
            </div>

            {/* Doctor Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 justify-end">
                <span>اسم الطبيب *</span>
                <User className="h-4 w-4" />
              </Label>
              <Select
                value={formData.doctorId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, doctorId: value }))}
              >
                <SelectTrigger className="text-right border-2 border-border hover:border-primary focus:border-primary transition-colors rounded-lg shadow-sm">
                  <SelectValue placeholder="اختر الطبيب" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor._id} value={doctor._id}>
                      <div className="flex flex-col text-right">
                        <span className="font-medium">{doctor.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {doctor.specialty} - {doctor.organizationName}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products Section */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 justify-end">
                <span>المنتجات والرسائل *</span>
                <Package className="h-4 w-4" />
              </Label>
              
              {/* Add Product */}
              <Card className="p-4 border-2 border-border hover:border-primary/50 transition-colors rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm text-right block mb-2">اختر المنتج</Label>
                    <Select value={selectedProduct} onValueChange={handleProductSelect}>
                      <SelectTrigger className="text-right border-2 border-border hover:border-primary focus:border-primary transition-colors rounded-lg">
                        <SelectValue placeholder="اختر المنتج" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product._id} value={product._id} className="text-right">
                            {product.code} - {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-right block mb-2">اختر الرسالة</Label>
                    <Select 
                      value={selectedMessage} 
                      onValueChange={setSelectedMessage}
                      disabled={!selectedProduct}
                    >
                      <SelectTrigger className="text-right border-2 border-border hover:border-primary focus:border-primary transition-colors rounded-lg">
                        <SelectValue placeholder="اختر الرسالة" />
                      </SelectTrigger>
                      <SelectContent>
                        {getProductMessages(selectedProduct).map((message: any, index: number) => (
                          <SelectItem key={index} value={index.toString()} className="text-right">
                            {message.text || message.tag}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-right block mb-2">عدد العينات</Label>
                    <Input
                      type="number"
                      min="0"
                      value={selectedSamplesCount}
                      onChange={(e) => setSelectedSamplesCount(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="text-right border-2 border-border hover:border-primary focus:border-primary transition-colors rounded-lg"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      onClick={addProductToVisit}
                      disabled={!selectedProduct || !selectedMessage}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <span>إضافة</span>
                      <Plus className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Selected Products */}
              {formData.products.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-right block">المنتجات المحددة:</Label>
                  <div className="space-y-2">
                    {formData.products.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(index)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 text-right">
                          <div className="font-medium">{getProductName(product.productId)}</div>
                          <div className="text-sm text-muted-foreground">
                            الرسالة: {getMessageTitle(product.productId, product.messageId)}
                          </div>
                          <div className="text-sm text-primary font-medium">
                            عدد العينات: {product.samplesCount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2 justify-end">
                <span>ملاحظات</span>
                <FileText className="h-4 w-4" />
              </Label>
              <Textarea
                id="notes"
                placeholder="أضف أي ملاحظات حول الزيارة..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="text-right border-2 border-border hover:border-primary focus:border-primary transition-colors rounded-lg shadow-sm resize-none"
              />
            </div>

            {/* Supervisor Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-end space-x-reverse space-x-2">
                <Label htmlFor="withSupervisor" className="flex items-center gap-2">
                  <span>هل كان بصحبة مشرف؟</span>
                  <Users className="h-4 w-4" />
                </Label>
                <Checkbox
                  id="withSupervisor"
                  checked={formData.withSupervisor}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({
                      ...prev,
                      withSupervisor: checked as boolean,
                    }));
                  }}
                  className="border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>

              {/* Supervisor Selection - Show only when withSupervisor is true */}
              
            </div>

            <Separator className="bg-border" />

            {/* Submit Button */}
            <div className="flex gap-4 flex-row-reverse">
              <Button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ الزيارة'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                disabled={loading}
                className="border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors rounded-lg"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateVisit;