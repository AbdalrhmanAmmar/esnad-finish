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
  UserCheck,
  Building2
} from 'lucide-react';
import { importPharmaciesFile } from '../api/Pharmacies';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface UploadResult {
  success: boolean;
  message: string;
}

const PharmaciesUpload: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
    // Check file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error('يرجى اختيار ملف Excel أو CSV صالح');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const result = await importPharmaciesFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadResult(result);
        setIsUploading(false);
        setUploadProgress(0);
        
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      }, 500);
      
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      const errorMessage = 'حدث خطأ أثناء رفع الملف';
      setUploadResult({ success: false, message: errorMessage });
      toast.error(errorMessage);
    }
  };

  const downloadTemplate = () => {
    const data = [
      ["CUSTOMER SYSTEM DESCREPTION", "AREA", "CITY", "DISTRICT"],
      ["صيدلية النهضة", "الرياض", "الرياض", "العليا"],
      ["صيدلية الشفاء", "جدة", "جدة", "الحمراء"],
      ["صيدلية الأمل", "الدمام", "الدمام", "الفيصلية"],
      ["", "", "", ""]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    XLSX.writeFile(wb, "pharmacies_template.xlsx", { compression: true });
    toast.success('تم تحميل نموذج الصيدليات بنجاح!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            رفع ملف الصيدليات
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            قم برفع ملفات الصيدليات بسهولة وأمان. ندعم ملفات Excel و CSV مع معالجة فورية للبيانات
          </p>
        </div>

        {/* Features Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cloud className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">رفع سريع وآمن</h3>
              <p className="text-sm text-gray-600">رفع الملفات بشكل آمن مع التحقق من صحة البيانات</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">معالجة فورية</h3>
              <p className="text-sm text-gray-600">معالجة البيانات وإدراجها في قاعدة البيانات فوراً بجودة عالية</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">حماية البيانات</h3>
              <p className="text-sm text-gray-600">حماية عالية لبيانات الصيدليات والمعلومات الحساسة</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Upload Card */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={downloadTemplate}
              >
                <Download className="w-4 h-4 ml-2" />
                تحميل النموذج
              </Button>
              <div></div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <UserCheck className="w-6 h-6 text-green-600" />
              رفع ملف الصيدليات
            </CardTitle>
            <CardDescription className="text-gray-600">
              اسحب وأفلت ملف Excel أو CSV هنا، أو انقر للاختيار
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDragOver
                  ? 'border-green-400 bg-green-50 scale-105'
                  : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
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
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                
                <div>
                  <p className="text-xl font-medium text-gray-900 mb-2">
                    اسحب ملف الصيدليات هنا
                  </p>
                  <p className="text-gray-600 mb-4">
                    أو انقر لاختيار ملف من جهازك
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>يدعم ملفات: Excel (.xlsx, .xls) و CSV حتى 10 ميجابايت</span>
                  </div>
                </div>
              </div>
              
              {/* Upload Progress */}
              {isUploading && (
                <div className="absolute inset-0 bg-white/90 rounded-xl flex items-center justify-center">
                  <div className="text-center space-y-4 w-full max-w-xs">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-green-600 animate-pulse" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-2">جاري رفع ملف الصيدليات...</p>
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
                    <p>تأكد من أن الملف يحتوي على الأعمدة المطلوبة: وصف النظام، المنطقة، المدينة، الحي</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>الصف الأول يجب أن يحتوي على أسماء الأعمدة</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>تأكد من صحة أسماء المناطق والمدن والأحياء</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>الحد الأقصى لحجم الملف هو 10 ميجابايت</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>استخدم النموذج المتوفر لضمان التوافق</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>تأكد من صحة البيانات قبل الرفع</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-emerald-200 bg-emerald-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-emerald-900 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    الأعمدة المطلوبة (بالإنجليزية)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-emerald-800">
                  <div className="grid grid-cols-1 gap-2">
                    <Badge variant="outline" className="justify-start text-emerald-700 border-emerald-300">
                      CUSTOMER SYSTEM DESCREPTION
                    </Badge>
                    <Badge variant="outline" className="justify-start text-emerald-700 border-emerald-300">
                      AREA
                    </Badge>
                    <Badge variant="outline" className="justify-start text-emerald-700 border-emerald-300">
                      CITY
                    </Badge>
                    <Badge variant="outline" className="justify-start text-emerald-700 border-emerald-300">
                      DISTRICT
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upload Result */}
            {uploadResult && (
              <div className="mt-6">
                <div className={`bg-white rounded-2xl shadow-xl border overflow-hidden ${
                  uploadResult.success 
                    ? 'border-green-200' 
                    : 'border-red-200'
                }`}>
                  <div className={`p-4 ${
                    uploadResult.success 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                      : 'bg-gradient-to-r from-red-600 to-rose-600'
                  }`}>
                    <div className="flex items-center text-white">
                      {uploadResult.success ? (
                        <CheckCircle className="w-6 h-6 ml-2" />
                      ) : (
                        <XCircle className="w-6 h-6 ml-2" />
                      )}
                      <span className="text-xl font-bold">
                        {uploadResult.success ? 'تم الرفع بنجاح!' : 'فشل في الرفع'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className={`text-lg ${
                      uploadResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {uploadResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PharmaciesUpload;