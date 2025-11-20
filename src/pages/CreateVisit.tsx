import React, { useState, useEffect, useRef } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, User, Package, FileText, Users, Plus, X, Search, MapPin, MessageSquare, ChevronDown } from 'lucide-react';
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

// Custom Select with Search Component
interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<{
    value: string;
    label: string;
    subtitle?: string;
    badge?: string;
  }>;
  disabled?: boolean;
  searchPlaceholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onValueChange,
  placeholder,
  options,
  disabled = false,
  searchPlaceholder = "ابحث..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase()) ||
    option.subtitle?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full text-right pr-4 pl-12 py-3 bg-background border-2 border-border hover:border-primary transition-all duration-200 rounded-xl shadow-sm flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isOpen ? 'border-primary ring-2 ring-primary/20' : ''}`}
      >
        <span className={`${!selectedOption ? 'text-muted-foreground' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-background border-2 border-primary rounded-xl shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-border sticky top-0 bg-background">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="text-right pr-10 pl-3 border-border focus:border-primary"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-60">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                لا توجد نتائج
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-right p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 ${
                    value === option.value ? 'bg-primary/10 border-r-2 border-primary' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-base">{option.label}</span>
                    {option.subtitle && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 justify-end">
                        {option.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {option.badge}
                          </Badge>
                        )}
                        <span>{option.subtitle}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [activeStep, setActiveStep] = useState<number>(0);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (storeDoctors.length > 0 && storeProducts.length > 0) {
        setDoctors(storeDoctors);
        setProducts(storeProducts);
        setLoadingData(false);
      } else {
        if (!user?._id) return;
        
        try {
          setLoadingData(true);
          const { getMedicalRepData } = await import('@/api/MedicalRep');
          const response = await getMedicalRepData(user._id);
          
          if (response.success) {
            setDoctors(response.data.doctors);
            setProducts(response.data.products);
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

  // Prepare options for custom selects
  const doctorOptions = doctors.map(doctor => ({
    value: doctor._id,
    label: doctor.name,
    subtitle: `${doctor.specialty} - ${doctor.organizationName}`,
    badge: doctor.specialty
  }));

  const productOptions = products.map(product => ({
    value: product._id,
    label: product.name,
    subtitle: `كود: ${product.code}`,
    badge: product.brand as string
  }));

  const messageOptions = getProductMessages(selectedProduct).map((message: any, index: number) => ({
    value: index.toString(),
    label: message.text || message.tag,
    subtitle: message.tag || 'رسالة'
  }));

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4">
      <div className="w-full px-4 sm:container sm:mx-auto sm:max-w-4xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
            تسجيل زيارة جديدة
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
            قم بتسجيل زيارة جديدة للطبيب مع تحديد المنتجات والرسائل المناسبة
          </p>
        </div>

        {/* Progress Steps for Mobile */}
        <div className="mb-6 sm:hidden">
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
            <CardTitle className="flex items-center gap-3 justify-center text-xl sm:text-2xl">
              <div className="p-2 bg-primary/10 rounded-full">
                <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              تسجيل زيارة عادية
            </CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              قم بتسجيل زيارة جديدة للطبيب مع تحديد المنتجات والرسائل المناسبة
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
              {/* Step 1: Date & Doctor */}
              <div className={`space-y-6 ${activeStep !== 0 ? 'hidden sm:block' : ''}`}>
                {/* Visit Date */}
                <div className="space-y-3">
                  <Label htmlFor="visitDate" className="flex items-center gap-2 justify-end text-base sm:text-lg font-medium">
                    <span>تاريخ الزيارة *</span>
                    <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
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
                    <CalendarDays className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-primary pointer-events-none" />
                  </div>
                </div>

                {/* Doctor Selection */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 justify-end text-base sm:text-lg font-medium">
                    <span>اسم الطبيب *</span>
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </Label>
                  <CustomSelect
                    value={formData.doctorId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, doctorId: value }))}
                    placeholder="اختر الطبيب"
                    options={doctorOptions}
                    searchPlaceholder="ابحث عن طبيب بالاسم أو التخصص..."
                  />
                </div>

                {/* Next Button for Mobile */}
                <div className="sm:hidden flex justify-end pt-4">
                  <Button 
                    type="button" 
                    onClick={() => setActiveStep(1)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm transition-all duration-200 hover:shadow-md px-8 py-2"
                    disabled={!formData.visitDate || !formData.doctorId}
                  >
                    التالي
                  </Button>
                </div>
              </div>

              {/* Step 2: Products */}
              <div className={`space-y-6 ${activeStep !== 1 ? 'hidden sm:block' : ''}`}>
                {/* Products Section */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 justify-end text-base sm:text-lg font-medium">
                    <span>المنتجات والرسائل *</span>
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </Label>
                  
                  {/* Add Product */}
                  <Card className="p-4 border-2 border-border hover:border-primary/50 transition-colors rounded-xl shadow-sm bg-gradient-to-br from-white to-blue-50/50">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-3">
                        <Label className="text-sm text-right block font-medium">اختر المنتج</Label>
                        <CustomSelect
                          value={selectedProduct}
                          onValueChange={handleProductSelect}
                          placeholder="اختر المنتج"
                          options={productOptions}
                          searchPlaceholder="ابحث عن منتج بالاسم أو الكود..."
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm text-right block font-medium">اختر الرسالة</Label>
                        <CustomSelect
                          value={selectedMessage}
                          onValueChange={setSelectedMessage}
                          placeholder="اختر الرسالة"
                          options={messageOptions}
                          disabled={!selectedProduct}
                          searchPlaceholder="ابحث في الرسائل..."
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm text-right block font-medium">عدد العينات</Label>
                        <Input
                          type="number"
                          min="0"
                          value={selectedSamplesCount}
                          onChange={(e) => setSelectedSamplesCount(parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="text-right border-2 border-border hover:border-primary focus:border-primary transition-colors rounded-xl py-3"
                        />
                      </div>
                      
                      <div className="flex items-end pt-2">
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
                      <Label className="text-base sm:text-lg font-medium text-right block">المنتجات المحددة:</Label>
                      <div className="space-y-3">
                        {formData.products.map((product, index) => (
                          <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-white to-blue-50/50 rounded-xl border-2 border-border hover:border-primary/50 transition-all duration-200 shadow-sm">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProduct(index)}
                              className="hover:bg-destructive/10 hover:text-destructive rounded-lg flex-shrink-0 ml-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="flex-1 text-right">
                              <div className="font-medium text-sm sm:text-base">{getProductName(product.productId)}</div>
                              <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                                <MessageSquare className="h-3 w-3 inline ml-1" />
                                الرسالة: {getMessageTitle(product.productId, product.messageId)}
                              </div>
                              <div className="text-primary font-medium mt-1 flex items-center gap-1 text-xs sm:text-sm">
                                <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                                عدد العينات: {product.samplesCount}
                              </div>
                            </div>
                            <Badge variant="secondary" className="flex-shrink-0 mr-2">
                              {index + 1}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation for Mobile */}
                <div className="sm:hidden flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveStep(0)}
                    className="border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors rounded-xl py-2 px-6"
                  >
                    السابق
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setActiveStep(2)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm transition-all duration-200 hover:shadow-md px-8 py-2"
                    disabled={formData.products.length === 0}
                  >
                    التالي
                  </Button>
                </div>
              </div>

              <Separator className="bg-border/50 my-2" />

              {/* Step 3: Additional Details */}
              <div className={`space-y-6 ${activeStep !== 2 ? 'hidden sm:block' : ''}`}>
                {/* Notes */}
                <div className="space-y-3">
                  <Label htmlFor="notes" className="flex items-center gap-2 justify-end text-base sm:text-lg font-medium">
                    <span>ملاحظات</span>
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
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
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-white to-blue-50/50 rounded-xl border-2 border-border">
                    <Label htmlFor="withSupervisor" className="flex items-center gap-2 text-base sm:text-lg font-medium cursor-pointer flex-1">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span>هل كان بصحبة مشرف؟</span>
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
                <div className="sm:hidden flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveStep(1)}
                    className="border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors rounded-xl py-2 px-6"
                  >
                    السابق
                  </Button>
                </div>
              </div>

              <Separator className="bg-border/50 my-4" />

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm transition-all duration-200 hover:shadow-md py-3 text-base sm:text-lg font-medium order-2 sm:order-1"
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
                  className="border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors rounded-xl py-3 order-1 sm:order-2 sm:flex-1"
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