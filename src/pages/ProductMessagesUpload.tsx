import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Cloud,
  Zap,
  Shield,
  MessageSquare
} from 'lucide-react';
import { importProductMessages } from '@/api/Products';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    groups: number;
    updated: number;
    notFoundCount: number;
  };
}

const ProductMessagesUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // التحقق من نوع الملف
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('يرجى رفع ملف Excel (.xlsx, .xls) أو CSV فقط');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      // محاكاة تقدم الرفع
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await importProductMessages(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadResult(result);
        setIsUploading(false);
        
        if (result.success) {
          toast.success(result.message || 'تم رفع ملف رسائل المنتجات بنجاح!');
        } else {
          toast.error(result.error || 'فشل في رفع الملف');
        }
      }, 500);
      
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      setUploadResult({
        success: false,
        message: errorMessage
      });
      toast.error(errorMessage);
    }
  };

  const downloadTemplate = () => {
    const data = [
      ["PRODUCT", "MESSAGES"],
      ["Aspirin Tablets", "رسالة المنتج1"],
      ["Aspirin Tablets", "تحذير: لا يستخدم للأطفال أقل من 12 سنة"],
      ["Vitamin D3", "رسالة المنتج2"],
      ["", ""]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // أنشئ الملف
    XLSX.writeFile(wb, "product_messages_template.xlsx", { compression: true });
    toast.success('تم تحميل نموذج رسائل المنتجات بنجاح!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-teal-600 rounded-full mb-4">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            رفع ملف رسائل المنتجات
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            قم برفع ملفات رسائل المنتجات بسهولة وأمان. ندعم ملفات Excel و CSV مع معالجة فورية للبيانات
          </p>
        </div>

        {/* Features Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">معالجة سريعة</h3>
              <p className="text-sm text-gray-600">رفع ومعالجة ملفات الرسائل في ثوانٍ معدودة</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">آمان عالي</h3>
              <p className="text-sm text-gray-600">حماية متقدمة لبيانات رسائل المنتجات</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">رسائل متعددة</h3>
              <p className="text-sm text-gray-600">دعم رسائل متعددة لكل منتج</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Upload Card */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-3">
              <MessageSquare className="w-8 h-8" />
              رفع ملف رسائل المنتجات
            </CardTitle>
            <CardDescription className="text-green-100">
              اسحب وأفلت الملف أو انقر للاختيار
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Upload Area */}
            <div
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
                ${isDragging 
                  ? 'border-green-500 bg-green-50 scale-105' 
                  : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                }
                ${isUploading ? 'pointer-events-none opacity-75' : ''}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="space-y-6">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDragging ? 'bg-green-100 scale-110' : 'bg-gray-100'
                }`}>
                  <Upload className={`w-12 h-12 transition-colors duration-300 ${
                    isDragging ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {isDragging ? 'أفلت الملف هنا' : 'اسحب وأفلت ملف رسائل المنتجات'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    أو انقر هنا لاختيار الملف من جهازك
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">.xlsx</Badge>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">.xls</Badge>
                    <Badge variant="secondary" className="bg-teal-100 text-teal-800">.csv</Badge>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    الحد الأقصى لحجم الملف: 10 ميجابايت
                  </p>
                </div>
              </div>
              
              {isUploading && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-2xl">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-lg font-medium text-gray-900">جاري رفع ملف الرسائل...</p>
                    <div className="w-64 mx-auto">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-sm text-gray-600 mt-2">{uploadProgress}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <Card className="border border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    تعليمات مهمة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-green-800">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>تأكد من أن الملف يحتوي على العمودين المطلوبين: PRODUCT, MESSAGES</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>الصف الأول يجب أن يحتوي على أسماء الأعمدة</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>يمكن إضافة رسائل متعددة لنفس المنتج في صفوف منفصلة</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>تجنب الخلايا الفارغة في عمودي PRODUCT و MESSAGES</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-emerald-200 bg-emerald-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-emerald-900 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    نموذج الملف
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-emerald-800">
                    احصل على نموذج جاهز لملف رسائل المنتجات مع التنسيق الصحيح
                  </p>
                  <Button 
                    onClick={downloadTemplate}
                    variant="outline" 
                    className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تحميل النموذج
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Upload Result */}
            {uploadResult && (
              <div className="mt-8">
                <Separator className="mb-6" />
                <Alert className={`border-2 ${
                  uploadResult.success 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center gap-3">
                    {uploadResult.success ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        uploadResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {uploadResult.success ? 'تم الرفع بنجاح!' : 'فشل في الرفع'}
                      </h4>
                      <AlertDescription className={`mt-1 ${
                        uploadResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {uploadResult.message}
                        {uploadResult.success && uploadResult.data && (
                          <div className="mt-2 space-y-1">
                            <p>• عدد المنتجات في الملف: {uploadResult.data.groups}</p>
                            <p>• عدد المنتجات المحدثة: {uploadResult.data.updated}</p>
                            {uploadResult.data.notFoundCount > 0 && (
                              <p className="text-amber-700">• عدد المنتجات غير الموجودة: {uploadResult.data.notFoundCount}</p>
                            )}
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductMessagesUpload;

