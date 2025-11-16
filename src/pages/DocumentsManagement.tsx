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
  Shield
} from 'lucide-react';
import { importProductsFile } from '@/api/Products';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface UploadResult {
  success: boolean;
  message: string;
  data?: any;
}

const DocumentsManagement = () => {
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

      const result = await importProductsFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadResult(result);
        setIsUploading(false);
        
        if (result.success) {
          toast.success(result.message || 'تم رفع الملف بنجاح!');
        } else {
          toast.error(result.message || 'فشل في رفع الملف');
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
    ["CODE","PRODUCT","PRODUCT_TYPE", "PRICE" ,"BRAND","COMPANY","TEAM PRODUCTS"],
    ["545","Aspirin Tablets","Medicine","100","Bayer","PharmaCorp","Team Products Example"],
    ["","","","","","",""],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");

  // أنشئ الملف
  XLSX.writeFile(wb, "products_template.xlsx", { compression: true });
  toast.success('تم تحميل النموذج بنجاح!');
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Cloud className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            إدارة المستندات
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            قم برفع ملفات المنتجات بسهولة وأمان. ندعم ملفات Excel و CSV مع معالجة فورية للبيانات
          </p>
        </div>

        {/* Features Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">معالجة سريعة</h3>
              <p className="text-sm text-gray-600">رفع ومعالجة الملفات في ثوانٍ معدودة</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">آمان عالي</h3>
              <p className="text-sm text-gray-600">حماية متقدمة لبياناتك وملفاتك</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">تنسيقات متعددة</h3>
              <p className="text-sm text-gray-600">دعم Excel و CSV وتنسيقات أخرى</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Upload Card */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8" />
              رفع ملف المنتجات
            </CardTitle>
            <CardDescription className="text-blue-100">
              اسحب وأفلت الملف أو انقر للاختيار
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Upload Area */}
            <div
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
                ${isDragging 
                  ? 'border-blue-500 bg-blue-50 scale-105' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
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
                  isDragging ? 'bg-blue-100 scale-110' : 'bg-gray-100'
                }`}>
                  <Upload className={`w-12 h-12 transition-colors duration-300 ${
                    isDragging ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {isDragging ? 'أفلت الملف هنا' : 'اسحب وأفلت ملف المنتجات'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    أو انقر هنا لاختيار الملف من جهازك
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">.xlsx</Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">.xls</Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">.csv</Badge>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    الحد الأقصى لحجم الملف: 10 ميجابايت
                  </p>
                </div>
              </div>
              
              {isUploading && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-2xl">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-lg font-medium text-gray-900">جاري رفع الملف...</p>
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
              <Card className="border border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    تعليمات مهمة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>تأكد من أن الملف يحتوي على الأعمدة المطلوبة: CODE, PRODUCT, PRODUCT_TYPE, BRAND, COMPANY, TEAM PRODUCTS</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>الصف الأول يجب أن يحتوي على أسماء الأعمدة</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>تجنب الخلايا الفارغة في العمود CODE</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    نموذج الملف
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-green-800">
                    احصل على نموذج جاهز لملف المنتجات مع التنسيق الصحيح
                  </p>
                  <Button 
                    onClick={downloadTemplate}
                    variant="outline" 
                    className="w-full border-green-300 text-green-700 hover:bg-green-100"
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

export default DocumentsManagement;