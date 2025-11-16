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
  Users,
  Key
} from 'lucide-react';
import { importUsersFile } from '@/api/Products';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface UploadResult {
  success: boolean;
  message: string;
}

const UsersUpload: React.FC = () => {
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
    // Reset previous results
    setUploadResult(null);
    setUploadProgress(0);

    // Validate file type
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      setUploadResult({
        success: false,
        message: 'نوع الملف غير مدعوم. يرجى رفع ملف Excel (.xlsx, .xls) أو CSV (.csv)'
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadResult({
        success: false,
        message: 'حجم الملف كبير جداً. الحد الأقصى المسموح هو 10 ميجابايت'
      });
      return;
    }

    try {
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

      const result = await importUsersFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadResult(result);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      setUploadProgress(0);
      setUploadResult({
        success: false,
        message: 'حدث خطأ أثناء رفع الملف. يرجى المحاولة مرة أخرى'
      });
    }
  };

  const downloadTemplate = () => {
    const data = [
      ["FIRST NAME", "LAST NAME", "USER NAME", "ROLE", "TEAM PRODUCTS", "TEAM AREA"],
      ["Ahmed", "Mohamed", "ahmed.mohamed", "ADMIN", "Product A, Product B", "Riyadh"],
      ["Fatima", "Ali", "fatima.ali", "USER", "Product C", "Jeddah"],
      ["Omar", "Hassan", "omar.hassan", "MANAGER", "Product A", "Dammam"],
      ["", "", "", "", "", ""]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    XLSX.writeFile(wb, "users_template.xlsx", { compression: true });
    toast.success('تم تحميل نموذج المستخدمين بنجاح!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            رفع ملف المستخدمين
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            قم برفع ملفات المستخدمين بسهولة وأمان. ندعم ملفات Excel و CSV مع معالجة فورية للبيانات
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">رفع سريع وآمن</h3>
            <p className="text-gray-600">رفع الملفات بسرعة وأمان مع معالجة فورية للبيانات</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-indigo-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">دعم متعدد الصيغ</h3>
            <p className="text-gray-600">ندعم ملفات Excel (.xlsx) و CSV (.csv) بجودة عالية</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">تحقق تلقائي</h3>
            <p className="text-gray-600">فحص تلقائي للبيانات والتأكد من صحة المعلومات</p>
          </div>
        </div>

        {/* Main Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4 ml-2" />
                تحميل النموذج
              </button>
              <h2 className="text-2xl font-bold text-gray-800">رفع ملف المستخدمين</h2>
            </div>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50 scale-105'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    اسحب وأفلت الملف هنا أو انقر للاختيار
                  </h3>
                  <p className="text-gray-600">
                    ندعم ملفات Excel (.xlsx) و CSV (.csv) حتى 10 ميجابايت
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <FileSpreadsheet className="w-4 h-4 ml-2" />
                  اختيار ملف
                </button>
              </div>
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">جاري الرفع...</span>
                  <span className="text-sm text-gray-500">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Important Instructions Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <AlertCircle className="w-6 h-6 ml-2" />
              تعليمات مهمة
            </h3>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 ml-2 text-green-600" />
                  متطلبات الملف
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 ml-2 flex-shrink-0"></span>
                    يجب أن يحتوي الملف على جميع الأعمدة المطلوبة
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 ml-2 flex-shrink-0"></span>
                    استخدم النموذج المتوفر لضمان التوافق
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 ml-2 flex-shrink-0"></span>
                    الحد الأقصى لحجم الملف 10 ميجابايت
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 ml-2 flex-shrink-0"></span>
                    تأكد من صحة البيانات قبل الرفع
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FileSpreadsheet className="w-5 h-5 ml-2 text-indigo-600" />
                  الأعمدة المطلوبة
                </h4>
                <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
                  <span className="flex items-center"><span className="w-1.5 h-1.5 bg-indigo-600 rounded-full ml-2"></span>FIRST NAME</span>
                  <span className="flex items-center"><span className="w-1.5 h-1.5 bg-indigo-600 rounded-full ml-2"></span>LAST NAME</span>
                  <span className="flex items-center"><span className="w-1.5 h-1.5 bg-indigo-600 rounded-full ml-2"></span>USER NAME</span>
                  <span className="flex items-center"><span className="w-1.5 h-1.5 bg-indigo-600 rounded-full ml-2"></span>ROLE</span>
                  <span className="flex items-center"><span className="w-1.5 h-1.5 bg-indigo-600 rounded-full ml-2"></span>TEAM PRODUCTS</span>
                  <span className="flex items-center"><span className="w-1.5 h-1.5 bg-indigo-600 rounded-full ml-2"></span>TEAM AREA</span>
                </div>
              </div>
            </div>
            
            {/* Password Notice */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <Key className="w-5 h-5 text-amber-600 mt-0.5 ml-2 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-amber-800 mb-1">كلمة المرور الافتراضية</h5>
                  <p className="text-amber-700 text-sm">
                    جميع المستخدمين الجدد سيحصلون على كلمة المرور الافتراضية: <code className="bg-amber-100 px-2 py-1 rounded text-amber-800 font-mono">Esnad123456789</code>
                  </p>
                  <p className="text-amber-600 text-xs mt-1">
                    يمكن للمستخدمين تغيير كلمة المرور بعد تسجيل الدخول لأول مرة
                  </p>
                </div>
              </div>
            </div>
            
            {/* Team Area Notice */}
            <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 ml-2 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-red-800 mb-1">ملاحظة مهمة حول حقل TEAM AREA</h5>
                  <p className="text-red-700 text-sm mb-2">
                    حقل <code className="bg-red-100 px-2 py-1 rounded text-red-800 font-mono">TEAM AREA</code> هو الحقل الذي من خلاله يتم ربط المستخدم بالمسؤول الخاص به
                  </p>
                  <p className="text-red-600 text-xs">
                    إذا أردت آلية أخرى للربط الرجاء الرجوع لصاحب النظام
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Result */}
        {uploadResult && (
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
        )}
      </div>
    </div>
  );
};

export default UsersUpload;