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
  Target,
  TrendingUp,
  Activity
} from 'lucide-react';
import { importMarketingActivitiesFile } from '@/api/MarketingActivities';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface UploadResult {
  success: boolean;
  message: string;
}

const MarketingActivitiesUpload: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
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
      toast.error('يرجى اختيار ملف Excel أو CSV فقط');
      return;
    }

    // التحقق من حجم الملف (أقصى 10 ميجابايت)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت');
      return;
    }

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

      const result = await importMarketingActivitiesFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);

      if (result.success) {
        toast.success('تم رفع ملف الأنشطة التسويقية بنجاح!');
      } else {
        toast.error(result.message || 'فشل في رفع الملف');
      }
    } catch (error) {
      setUploadProgress(0);
      const errorMessage = 'حدث خطأ أثناء رفع الملف';
      setUploadResult({ success: false, message: errorMessage });
      toast.error(errorMessage);
    }
  };

const downloadTemplate = () => {
  const data = [
    ["ENGLISH","ARABIC"],
    ["english name activity","اسم النشاط باللغة العربية"],
    ["",""],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");

  // أنشئ الملف
  XLSX.writeFile(wb, "products_template.xlsx", { compression: true });
  toast.success('تم تحميل النموذج بنجاح!');
};

  const resetUpload = () => {
    setUploadProgress(0);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            رفع ملف الأنشطة التسويقية
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          قم برفع ملف Excel يحتوي على الأنشطة التسويقية لإضافتها إلى النظام بشكل مجمع
        </p>
      </div>

      {/* Features Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">رفع سريع</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">رفع مئات الأنشطة التسويقية في ثوانٍ معدودة</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">آمن ومحمي</h3>
            <p className="text-sm text-green-700 dark:text-green-300">جميع البيانات محمية ومشفرة بأعلى معايير الأمان</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">تحليل ذكي</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">فحص تلقائي للبيانات وتجنب التكرار</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-2xl">
            <Cloud className="h-6 w-6 text-blue-600" />
            <span>رفع الملف</span>
          </CardTitle>
          <CardDescription className="text-base">
            اسحب وأفلت ملف Excel هنا أو انقر للاختيار
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag & Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer group hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                isDragOver 
                  ? 'bg-blue-100 dark:bg-blue-900/50' 
                  : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50'
              }`}>
                <Upload className={`h-8 w-8 transition-colors duration-300 ${
                  isDragOver 
                    ? 'text-blue-600' 
                    : 'text-gray-500 group-hover:text-blue-600'
                }`} />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  اسحب ملف Excel هنا
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  أو انقر لاختيار ملف من جهازك
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse text-xs text-gray-400">
                <span className="flex items-center space-x-1 rtl:space-x-reverse">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Excel</span>
                </span>
                <span>•</span>
                <span>حد أقصى 10 ميجابايت</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">جاري الرفع...</span>
                <span className="text-blue-600 font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <Alert className={`border-0 ${uploadResult.success ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                {uploadResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <AlertDescription className={`text-sm font-medium ${
                    uploadResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    {uploadResult.message}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={downloadTemplate} 
              variant="outline" 
              className="flex-1 h-12 text-base font-medium border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/30"
            >
              <Download className="h-5 w-5 ml-2" />
              تحميل النموذج
            </Button>
            
            {(uploadProgress > 0 || uploadResult) && (
              <Button 
                onClick={resetUpload} 
                variant="outline" 
                className="flex-1 h-12 text-base font-medium"
              >
                <Activity className="h-5 w-5 ml-2" />
                رفع ملف جديد
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse text-amber-800 dark:text-amber-200">
            <AlertCircle className="h-5 w-5" />
            <span>تعليمات مهمة</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center space-x-2 rtl:space-x-reverse">
                <FileText className="h-4 w-4" />
                <span>تنسيق الملف</span>
              </h4>
              <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                <li className="flex items-start space-x-2 rtl:space-x-reverse">
                  <Badge variant="secondary" className="mt-0.5 text-xs px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                    1
                  </Badge>
                  <span>يجب أن يحتوي الملف على عمودين: "English Name" و "Arabic Name"</span>
                </li>
                <li className="flex items-start space-x-2 rtl:space-x-reverse">
                  <Badge variant="secondary" className="mt-0.5 text-xs px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                    2
                  </Badge>
                  <span>الصف الأول يجب أن يحتوي على عناوين الأعمدة</span>
                </li>
                <li className="flex items-start space-x-2 rtl:space-x-reverse">
                  <Badge variant="secondary" className="mt-0.5 text-xs px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                    3
                  </Badge>
                  <span>تنسيقات مدعومة: .xlsx, .xls, .csv</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center space-x-2 rtl:space-x-reverse">
                <Shield className="h-4 w-4" />
                <span>قواعد البيانات</span>
              </h4>
              <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                <li className="flex items-start space-x-2 rtl:space-x-reverse">
                  <Badge variant="secondary" className="mt-0.5 text-xs px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                    ✓
                  </Badge>
                  <span>سيتم تجاهل الأنشطة المكررة تلقائياً</span>
                </li>
                <li className="flex items-start space-x-2 rtl:space-x-reverse">
                  <Badge variant="secondary" className="mt-0.5 text-xs px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                    ✓
                  </Badge>
                  <span>يجب ملء كلا الحقلين (العربي والإنجليزي)</span>
                </li>
                <li className="flex items-start space-x-2 rtl:space-x-reverse">
                  <Badge variant="secondary" className="mt-0.5 text-xs px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                    ✓
                  </Badge>
                  <span>الحد الأقصى لحجم الملف: 10 ميجابايت</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingActivitiesUpload;