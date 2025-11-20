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
import { CalendarDays, User, Package, FileText, Users, Plus, X, Search, Clock, MapPin } from 'lucide-react';
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
  const [doctorSearch, setDoctorSearch] = useState<string>('');
  const [productSearch, setProductSearch] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(0);

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

  const filteredDoctors = doctors.filter(d => {
    const q = doctorSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      d.name?.toLowerCase().includes(q) ||
      d.specialty?.toLowerCase().includes(q) ||
      d.organizationName?.toLowerCase().includes(q)
    );
  });

  const filteredProducts = products.filter(p => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.code?.toString().toLowerCase().includes(q) ||
      (p.brand as any)?.toLowerCase?.().includes(q)
    );
  });

  // Steps for mobile view
  const steps = [
    { id: 0, title: 'التاريخ والطبيب', icon: <CalendarDays className="h-4 w-4" /> },
    { id: 1, title: 'المنتجات', icon: <Package className="h-4 w-4" /> },
    { id: 2, title: 'تفاصيل إضافية', icon: <FileText className="h-4 w-4" /> },
  ];

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header with gradient */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
            تسجيل زيارة جديدة
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            قم بتسجيل زيارة جديدة للطبيب مع تحديد المنتجات والرسائل المناسبة
          </p>
        </div>

        {/* Progress Steps for Mobile */}
        <div className="mb-6 md:hidden">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-10 transition-all duration-300"
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            ></div>
            {steps.map((step, index) => (
              <div key={step.id} className="relative z-20 flex flex-col items-center">
                <button
                  type="button"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    activeStep >= step.id 
                      ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                      : 'bg-white text-gray-400 border border-gray-300'
                  }`}
                  onClick={() => setActiveStep(step.id)}
                >
                  {step.icon}
                </button>
                <span className={`text-xs mt-1 font-medium ${activeStep >= step.id ? 'text-primary' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-blue-600 p-1"></div>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 justify-center text-2xl">
              <div className="p-2 bg-primary/10 rounded-full">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              تسجيل زيارة عادية
            </CardTitle>
            <CardDescription className="text-center">
              قم بتسجيل زيارة جديدة للطبيب مع تحديد المنتجات والرسائل المناسبة
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
              {/* Step 1: Date & Doctor - Show on all screens but control visibility on mobile */}
              <div className={`space-y-6 ${activeStep !== 0 ? 'hidden md:block' : ''}`}>
                {/* Visit Date */}
                <div className="space-y-3">
                  <Label htmlFor="visitDate" className="flex items-center gap-2 justify-end text-lg font-medium">
                    <span>تاريخ الزيارة *</span>
                    <CalendarDays className="h-5 w-5 text-primary" />
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
                      className="w-full text-right pr-12 pl-4 py-3 bg-background border-2 border-primary/20 hover:border-primary focus:border-primary transition-all duration-200 rounded-xl shadow-sm focus:shadow-md focus:ring-2 focus:ring-primary/20 outline-none"
                      calendarClassName="custom-datepicker"
                      popperClassName="z-50"
                      showPopperArrow={false}
                      locale="ar"
                    />
                    <CalendarDays className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary pointer-events-none" />
                  </div>
                </div>

                {/* Doctor Selection */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 justify-end text-lg font-medium">
                    <span>اسم الطبيب *</span>
                    <User className="h-5 w-5 text-primary" />
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      placeholder="ابحث باسم الطبيب أو التخصص أو المؤسسة"
                      className="text-right pr-3 pl-10 border-2 border-border hover:border-primary focus:border-primary transition-colors rounded-xl shadow-sm"
                    />
                  </div>
                  <Select
                    value={formData.doctorId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, doctorId: value }))}
                  >
                    <SelectTrigger className="text-right border-2 border-border hover:border-primary focus:border-primary transition-colors rounded-xl shadow-sm py-3">
                      <SelectValue placeholder="اختر الطبيب" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {filteredDoctors.map((doctor) => (
                        <SelectItem key={doctor._id} value={doctor._id} className="py-3">
                          <div className="flex flex-col text-right">
                            <span className="font-medium">{doctor.name}</span>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              {doctor.specialty && (
                                <Badge variant="outline" className="text-xs">
                                  {doctor.specialty}
                                </Badge>
                              )}
                              {doctor.organizationName && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{doctor.organizationName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Next Button for Mobile */}
                <div className="md:hidden flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setActiveStep(1)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm transition-all duration-200 hover:shadow-md px-6"
                    disabled={!formData.visitDate || !formData.doctorId}
                  >
                    التالي
                  </Button>
                </div>
              </div>

              {/* Step 2: Products - Show on all screens but control visibility on mobile */}
              <div className={`space-y-6 ${activeStep !== 1 ? 'hidden md:block' : ''}`}>
                {/* Products Section */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 justify-end text-lg font-medium">
                    <span>المنتجات والرسائل *</span>
                    <Package className="h-5 w-5 text-primary" />
                  </Label>
                  
                  {/* Add Product */}
                  <Card className="p-4 border-2 border-border hover:border-primary/50 transition-colors rounded-xl shadow-sm bg-gradient-to-br from-white to-blue-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="md:col-span-2 lg:col-span-1">
                        <Label className="text-sm text-right block mb-2 font-medium">اختر المنتج</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder="ابحث عن المنتج"
                            className="mb-2 text-right pr-3 pl-10 border-2 border-border hover:border-primary focus:border-primary transition-colors rounded-xl"
                          />
                        </div>
                        <Select value={selectedProduct} onValueChange={handleProductSelect}>
                          <SelectTrigger className="text-right border-2 border-border hover:border-primary focus:border-primary transition-colors rounded-xl py-3">
                            <SelectValue placeholder="اختر المنتج" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {filteredProducts.map((product) => (
                              <SelectItem key={product._id} value={product._id} className="text-right py-3">
                                <div className="flex flex-col">
                                  <span className="font-medium">{product.name}</span>
                                  <span className="text-xs text-muted-foreground">كود: {product.code}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-right block mb-2 font-medium">اختر الرسالة</Label>
                        <Select 
                          value={selectedMessage} 
                          onValueChange={setSelectedMessage}
                          disabled={!selectedProduct}
                        >
                          <SelectTrigger className="text-right border-2 border-border hover:border-primary focus:border-primary transition-colors rounded-xl py-3">
                            <SelectValue placeholder="اختر الرسالة" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {getProductMessages(selectedProduct).map((message: any, index: number) => (
                              <SelectItem key={index} value={index.toString()} className="text-right py-3">
                                {message.text || message.tag}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-right block mb-2 font-medium">عدد العينات</Label>
                        <Input
                          type="number"
                          min="0"
                          value={selectedSamplesCount}
                          onChange={(e) => setSelectedSamplesCount(parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="text-right border-2 border-border hover:border-primary focus:border-primary transition-colors rounded-xl py-3"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <Button 
                          type="button" 
                          onClick={addProductToVisit}
                          disabled={!selectedProduct || !selectedMessage}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm transition-all duration-200 hover:shadow-md py-3"
                        >
                          <span>إضافة المنتج</span>
                          <Plus className="h-4 w-4 mr-2" />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Selected Products */}
                  {formData.products.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-lg font-medium text-right block">المنتجات المحددة:</Label>
                      <div className="space-y-3">
                        {formData.products.map((product, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-blue-50/50 rounded-xl border-2 border-border hover:border-primary/50 transition-all duration-200 shadow-sm">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProduct(index)}
                              className="hover:bg-destructive/10 hover:text-destructive rounded-lg"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="flex-1 text-right mr-3">
                              <div className="font-medium text-lg">{getProductName(product.productId)}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                الرسالة: {getMessageTitle(product.productId, product.messageId)}
                              </div>
                              <div className="text-primary font-medium mt-1 flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                عدد العينات: {product.samplesCount}
                              </div>
                            </div>
                            <Badge variant="secondary" className="ml-2">
                              {index + 1}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation for Mobile */}
                <div className="md:hidden flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveStep(0)}
                    className="border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors rounded-xl"
                  >
                    السابق
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setActiveStep(2)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm transition-all duration-200 hover:shadow-md px-6"
                    disabled={formData.products.length === 0}
                  >
                    التالي
                  </Button>
                </div>
              </div>

              <Separator className="bg-border/50 my-2" />

              {/* Step 3: Additional Details - Show on all screens but control visibility on mobile */}
              <div className={`space-y-6 ${activeStep !== 2 ? 'hidden md:block' : ''}`}>
                {/* Notes */}
                <div className="space-y-3">
                  <Label htmlFor="notes" className="flex items-center gap-2 justify-end text-lg font-medium">
                    <span>ملاحظات</span>
                    <FileText className="h-5 w-5 text-primary" />
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="أضف أي ملاحظات حول الزيارة..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="text-right border-2 border-border hover:border-primary focus:border-primary transition-colors rounded-xl shadow-sm resize-none py-3"
                  />
                </div>

                {/* Supervisor Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-end space-x-reverse space-x-2 p-4 bg-gradient-to-r from-white to-blue-50/50 rounded-xl border-2 border-border">
                    <Label htmlFor="withSupervisor" className="flex items-center gap-2 text-lg font-medium cursor-pointer">
                      <span>هل كان بصحبة مشرف؟</span>
                      <Users className="h-5 w-5 text-primary" />
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
                      className="border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary h-5 w-5"
                    />
                  </div>
                </div>

                {/* Navigation for Mobile */}
                <div className="md:hidden flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveStep(1)}
                    className="border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors rounded-xl"
                  >
                    السابق
                  </Button>
                </div>
              </div>

              <Separator className="bg-border/50 my-4" />

              {/* Submit Button */}
              <div className="flex gap-4 flex-row-reverse">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm transition-all duration-200 hover:shadow-md py-3 text-lg font-medium"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري الحفظ...
                    </>
                  ) : (
                    'حفظ الزيارة'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  className="border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors rounded-xl py-3"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateVisit;