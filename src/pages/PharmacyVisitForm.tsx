import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ar } from 'date-fns/locale';

registerLocale('ar', ar);
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, FileText, Plus, Trash2, Package, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePharmacyVisitStore } from '@/stores/pharmacyVisitStore';
import { getSalesRepResources } from '@/api/salesClients';
import { useAuthStore } from '@/stores/authStore';
import { createPharmacyRequest, PharmacyRequestData } from '@/api/PharmacyRequests';



const PharmacyVisitForm = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const {
    pharmacies,
    products,
    currentVisit,
    setPharmacies,
    setProducts,
    updateVisitData,
    updateOrderProduct,
    resetVisitForm,
    setLoading,
    setError,
    clearError
  } = usePharmacyVisitStore();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        clearError();
        
        const response = await getSalesRepResources(user._id);
        if (response.success) {
          // Set pharmacies from sales clients - map to expected format
          const mappedPharmacies = response.data.pharmacies.map(pharmacy => ({
            ...pharmacy,
            customerSystemDescription: pharmacy.name
          }));
          setPharmacies(mappedPharmacies || []);
          // Set products from sales clients
          setProducts(response.data.products || []);
        }
      } catch (error) {
        console.error('Error loading sales clients data:', error);
        setError('فشل في تحميل البيانات');
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل بيانات العملاء والمنتجات',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?._id, setPharmacies, setProducts, setLoading, setError, clearError, toast]);

  const handleInputChange = (field: string, value: string | File | null) => {
    updateVisitData({ [field]: value });
    console.log(value)
  };

  const handlePharmacySelect = (pharmacyId: string) => {
    const selectedPharmacy = pharmacies.find(p => p._id === pharmacyId);
    if (selectedPharmacy) {
      updateVisitData({
        pharmacyId,
        pharmacyName: selectedPharmacy.customerSystemDescription
      });
    }
  };

  const handleOrderProductChange = (productId: string, field: 'quantity' | 'selected', value: number | boolean) => {
    const quantity = field === 'quantity' ? value as number : currentVisit.orderProducts.find(p => p._id === productId)?.quantity || 0;
    const selected = field === 'selected' ? value as boolean : currentVisit.orderProducts.find(p => p._id === productId)?.selected || false;
    updateOrderProduct(productId, quantity, selected);
  };

  const formatDateToYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleInputChange('introVisitImage', file);
  };

  const calculateTotal = () => {
  return currentVisit.orderProducts
    .filter((p) => p.selected) // ناخد المنتجات المختارة بس
    .reduce((sum, p) => sum + (p.price * p.quantity), 0);
};


  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleInputChange('receiptImage', file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!currentVisit.visitDate || !currentVisit.pharmacyId) {
        toast({
          title: "بيانات مطلوبة",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive",
        });
        return;
      }

      // Prepare data for API
      const selectedOrderProducts = currentVisit.orderProducts.filter(p => p.selected && p.quantity > 0);
      
      const requestData: PharmacyRequestData = {
        visitDate: currentVisit.visitDate,
        pharmacy: currentVisit.pharmacyId,
        draftDistribution: currentVisit.draftDistribution === 'نعم',
        introductoryVisit: currentVisit.introductoryVisit === 'نعم',
        hasOrder: currentVisit.order === 'نعم' && selectedOrderProducts.length > 0,
        hasCollection: currentVisit.collection === 'نعم',
        additionalNotes: currentVisit.notes
      };

      // Add visit details if introductory visit
      if (requestData.introductoryVisit) {
        requestData.visitDetails = {
          notes: currentVisit.introVisitData || currentVisit.introVisitNotes || '',
          visitImage: currentVisit.introVisitImage || undefined
        };
      }

      // Add order details if has order
      if (requestData.hasOrder) {
        requestData.orderDetails = selectedOrderProducts.map(product => ({
          product: product._id,
          quantity: product.quantity
        }));
      }

      // Add collection details if has collection
      if (requestData.hasCollection) {
        requestData.collectionDetails = {
          amount: parseFloat(currentVisit.amount) || 0,
          receiptNumber: currentVisit.receiptNumber || '',
          receiptImage: currentVisit.receiptImage || undefined
        };
      }

      // Submit to API
      const response = await createPharmacyRequest(requestData);
      
      if (response.success) {
        toast({
          title: "تم الحفظ بنجاح",
          description: response.message || "تم حفظ بيانات زيارة الصيدلية بنجاح",
        });
        
        // Reset form
        resetVisitForm();
      } else {
        throw new Error(response.message || 'فشل في حفظ البيانات');
      }
    } catch (error: any) {
      console.error('Error submitting visit:', error);
      toast({
        title: "خطأ في الحفظ",
        description: error.message || "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir='rtl' className="min-h-screen bg-background p-6">
      <div className="flex items-center justify-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">نموذج زيارة صيدلية</h1>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <FileText className="h-5 w-5" />
            بيانات زيارة الصيدلية
          </CardTitle>
          <CardDescription className='text-center'>
            يرجى ملء جميع البيانات المطلوبة لتسجيل زيارة الصيدلية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* تاريخ الزيارة */}
              <div className="space-y-2">
                <Label htmlFor="visitDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  تاريخ الزيارة *
                </Label>
                <div className="relative max-w-md">
           <DatePicker
  selected={selectedDate}
  onChange={(date) => {
    setSelectedDate(date);
    handleInputChange('visitDate', date ? formatDateToYYYYMMDD(date) : '');
  }}
  dateFormat="yyyy-MM-dd"
  placeholderText="اختر تاريخ الزيارة"
  className="w-full text-right pr-10 pl-4 py-2 bg-background border-2 border-primary/20 hover:border-primary focus:border-primary transition-all duration-200 rounded-lg shadow-sm focus:shadow-md focus:ring-2 focus:ring-primary/20 outline-none"
  calendarClassName="custom-datepicker"
  popperClassName="z-50"
  showPopperArrow={false}
  locale="ar"
/>
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
                </div>
              </div>

              {/* اسم الصيدلية */}
              <div className="space-y-2">
                <Label htmlFor="pharmacyName" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  اسم الصيدلية *
                </Label>
                <Select value={currentVisit.pharmacyId} onValueChange={handlePharmacySelect}>
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="اختر الصيدلية" />
                  </SelectTrigger>
                  <SelectContent>
                    {pharmacies.map((pharmacy) => (
                      <SelectItem key={pharmacy._id} value={pharmacy._id}>
                        {pharmacy.customerSystemDescription} - {pharmacy.area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* الأنشطة - أربعة خيارات جنب بعض */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">الأنشطة</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* توزيع درافت */}
                <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-center space-y-4">
                    <Label className="text-base font-semibold block text-primary cursor-pointer">توزيع درافت</Label>
                    <RadioGroup
                      value={currentVisit.draftDistribution}
                      onValueChange={(value) => handleInputChange('draftDistribution', value)}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="نعم" id="draft-yes" />
                        <Label htmlFor="draft-yes" className="cursor-pointer font-semibold text-primary">نعم</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="لا" id="draft-no" />
                        <Label htmlFor="draft-no" className="cursor-pointer font-semibold text-primary">لا</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* زيارة تعريفية */}
                <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-center space-y-4">
                    <Label className="text-base font-semibold block text-primary cursor-pointer">زيارة تعريفية</Label>
                    <RadioGroup
                      value={currentVisit.introductoryVisit}
                      onValueChange={(value) => handleInputChange('introductoryVisit', value)}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="نعم" id="intro-yes" />
                        <Label htmlFor="intro-yes" className="cursor-pointer font-semibold text-primary">نعم</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="لا" id="intro-no" />
                        <Label htmlFor="intro-no" className="cursor-pointer font-semibold text-primary">لا</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* طلب */}
                <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-center space-y-4">
                    <Label className="text-base font-semibold block text-primary cursor-pointer">طلب</Label>
                    <RadioGroup
                      value={currentVisit.order}
                      onValueChange={(value) => handleInputChange('order', value)}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="نعم" id="order-yes" />
                        <Label htmlFor="order-yes" className="cursor-pointer font-semibold text-primary">نعم</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="لا" id="order-no" />
                        <Label htmlFor="order-no" className="cursor-pointer font-semibold text-primary">لا</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* تحصيل */}
                <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-center space-y-4">
                    <Label className="text-base font-semibold block text-primary cursor-pointer">تحصيل</Label>
                    <RadioGroup
                      value={currentVisit.collection}
                      onValueChange={(value) => handleInputChange('collection', value)}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="نعم" id="collection-yes" />
                        <Label htmlFor="collection-yes" className="cursor-pointer font-semibold text-primary">نعم</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="لا" id="collection-no" />
                        <Label htmlFor="collection-no" className="cursor-pointer font-semibold text-primary">لا</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Products */}
            {currentVisit.order === 'نعم' && (
              <div className="space-y-6">
                <div className="border-t pt-6">
                  <div className='flex items-center justify-between mb-4'>
                        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    منتجات الطلبية
                  </h3>
                    <div className="text-lg font-bold">
                      
    الإجمالي الكلي:<span className='text-red-500 font-bold'>{calculateTotal()} دينار ليبي</span> 
  </div>

                  </div>
              
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border rounded-lg">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-3 text-right font-semibold">اختيار</th>
                          <th className="border border-border p-3 text-right font-semibold">الدواء</th>
                          <th className="border border-border p-3 text-right font-semibold">السعر</th>
                          <th className="border border-border p-3 text-right font-semibold">الكمية</th>
                          <th className="border border-border p-3 text-right font-semibold">المجموع</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentVisit.orderProducts.map((product) => (
                          <tr key={product._id} className="hover:bg-muted/50">
                            <td className="border border-border p-3 text-center">
                              <Checkbox
                                checked={product.selected}
                                onCheckedChange={(checked) => handleOrderProductChange(product._id, 'selected', checked as boolean)}
                              />
                            </td>
                            <td className="border border-border p-3 font-medium">{product.name}</td>
                            <td className="border border-border p-3">{product.price}دينار ليبي</td>
                            <td className="border border-border p-3">
                              <Input
                                type="number"
                                min="0"
                                value={product.quantity}
                                onChange={(e) => handleOrderProductChange(product._id, 'quantity', parseInt(e.target.value) || 0)}
                                disabled={!product.selected}
                                className="w-20 text-center"
                              />
                            </td>
                            <td className="border border-border p-3 font-semibold">
                              {product.selected ? (product.price * product.quantity) : 0}دينار ليبي
                            </td>
                          </tr>
                        ))}
                        {currentVisit.orderProducts.length === 0 && (
                          <tr>
                            <td colSpan={5} className="border border-border p-6 text-center text-muted-foreground">
                              لا توجد منتجات متاحة
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Collection Details */}
            {currentVisit.collection === 'نعم' && (
              <div className="space-y-6">
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    بيانات التحصيل
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="receiptNumber" className="text-sm font-medium text-foreground">
                        رقم الوصل
                      </Label>
                      <Input
                        id="receiptNumber"
                        type="text"
                        placeholder="أدخل رقم الوصل"
                        value={currentVisit.receiptNumber}
                        onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                        المبلغ
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="أدخل المبلغ"
                        value={currentVisit.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label htmlFor="receiptImage" className="text-sm font-medium text-foreground">
                      صورة الوصل
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="receiptImage"
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptFileChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        يرجى رفع صورة واضحة للوصل
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Introductory Visit Details */}
            {currentVisit.introductoryVisit === 'نعم' && (
              <div className="space-y-6">
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">بيانات الزيارة التعريفية</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="introVisitData" className="text-sm font-medium text-foreground">
                        بيانات الزيارة التعريفية
                      </Label>
                      <Textarea
                        id="introVisitData"
                        placeholder="أدخل بيانات الزيارة التعريفية"
                        value={currentVisit.introVisitData}
                        onChange={(e) => handleInputChange('introVisitData', e.target.value)}
                        className="mt-1 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="introVisitNotes" className="text-sm font-medium text-foreground">
                        ملاحظات الزيارة
                      </Label>
                      <Textarea
                        id="introVisitNotes"
                        placeholder="أدخل ملاحظات الزيارة التعريفية"
                        value={currentVisit.introVisitNotes}
                        onChange={(e) => handleInputChange('introVisitNotes', e.target.value)}
                        className="mt-1 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="introVisitImage" className="text-sm font-medium text-foreground">
                        صورة الزيارة
                      </Label>
                      <div className="mt-1">
                        <Input
                          id="introVisitImage"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          يرجى رفع صورة توثق الزيارة التعريفية
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ملاحظات */}
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={currentVisit.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="أدخل أي ملاحظات إضافية..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* أزرار الحفظ والإلغاء */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Button type="submit" disabled={isLoading} className="flex-1 h-12">
                {isLoading ? "جاري الحفظ..." : "حفظ البيانات"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-12"
                onClick={() => {
                  resetVisitForm();
                }}
              >
                مسح البيانات
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacyVisitForm;