import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { testApiConnection, logApiDebugInfo, testUserEndpoints } from '@/utils/apiDebug';
import api from '@/api/api';

interface ApiTroubleshootProps {
  employeeId?: string;
}

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const ApiTroubleshoot: React.FC<ApiTroubleshootProps> = ({ employeeId }) => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runDiagnostics = async () => {
    setTesting(true);
    setResults([]);
    
    const testResults: TestResult[] = [];

    // Test 1: API Configuration
    testResults.push({
      name: 'إعدادات API',
      status: 'success',
      message: `Base URL: ${api.defaults.baseURL}`,
      details: {
        baseURL: api.defaults.baseURL,
        timeout: api.defaults.timeout,
        withCredentials: api.defaults.withCredentials
      }
    });
    setResults([...testResults]);

    // Test 2: Authentication Token
    const token = localStorage.getItem('token');
    testResults.push({
      name: 'رمز المصادقة',
      status: token ? 'success' : 'error',
      message: token ? 'الرمز موجود' : 'الرمز مفقود - يرجى تسجيل الدخول مرة أخرى',
      details: { hasToken: !!token }
    });
    setResults([...testResults]);

    // Test 3: Network Connection
    try {
      const connectionTest = await testApiConnection();
      testResults.push({
        name: 'اتصال الشبكة',
        status: connectionTest.isConnected ? 'success' : 'error',
        message: connectionTest.isConnected 
          ? `متصل (${connectionTest.responseTime}ms)` 
          : `فشل الاتصال: ${connectionTest.error}`,
        details: connectionTest
      });
    } catch (error) {
      testResults.push({
        name: 'اتصال الشبكة',
        status: 'error',
        message: 'فشل في اختبار الاتصال',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
    setResults([...testResults]);

    // Test 4: Employee Endpoint (if ID provided)
    if (employeeId) {
      try {
        const response = await api.get(`/users/${employeeId}`);
        testResults.push({
          name: 'نقطة نهاية الموظف',
          status: 'success',
          message: 'الموظف موجود',
          details: { employeeId, found: true }
        });
      } catch (error: any) {
        testResults.push({
          name: 'نقطة نهاية الموظف',
          status: 'error',
          message: `خطأ ${error.response?.status || 'غير معروف'}: ${error.response?.data?.message || error.message}`,
          details: {
            employeeId,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url
          }
        });
      }
      setResults([...testResults]);
    }

    // Test 5: Server Status
    try {
      const serverTest = await api.get('/health', { timeout: 10000 });
      testResults.push({
        name: 'حالة الخادم',
        status: 'success',
        message: 'الخادم يعمل بشكل طبيعي',
        details: serverTest.data
      });
    } catch (error: any) {
      let status: 'error' | 'warning' = 'error';
      let message = 'الخادم لا يستجيب';
      
      if (error.response?.status === 404) {
        status = 'warning';
        message = 'نقطة نهاية /health غير موجودة (هذا طبيعي)';
      } else if (error.code === 'ECONNABORTED') {
        message = 'انتهت مهلة الاتصال - الخادم بطيء أو لا يستجيب';
      }
      
      testResults.push({
        name: 'حالة الخادم',
        status,
        message,
        details: {
          status: error.response?.status,
          code: error.code,
          message: error.message
        }
      });
    }
    setResults([...testResults]);

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          تشخيص مشاكل API
        </CardTitle>
        <CardDescription>
          اختبار الاتصال بالخادم وتشخيص المشاكل المحتملة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={testing}
            className="flex items-center gap-2"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {testing ? 'جاري الاختبار...' : 'تشغيل التشخيص'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              logApiDebugInfo();
              testUserEndpoints();
            }}
          >
            عرض معلومات التصحيح
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">نتائج التشخيص:</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.name}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-blue-600 hover:text-blue-800">
                        عرض التفاصيل
                      </summary>
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {results.some(r => r.status === 'error') && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>الحلول المقترحة:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• تحقق من اتصال الإنترنت</li>
                <li>• تأكد من أن الخادم يعمل: <code>https://esnad-serevr.onrender.com</code></li>
                <li>• قم بتسجيل الدخول مرة أخرى إذا كان الرمز مفقود</li>
                <li>• تحقق من أن معرف الموظف صحيح</li>
                <li>• اتصل بفريق الدعم الفني إذا استمرت المشكلة</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiTroubleshoot;