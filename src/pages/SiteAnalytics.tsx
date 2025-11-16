import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Eye, TrendingUp, Globe, Calendar, Clock, MousePointer } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsData {
  totalVisitors: number;
  todayVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: string;
  topPages: Array<{
    page: string;
    views: number;
    percentage: number;
  }>;
  visitorsByCountry: Array<{
    country: string;
    visitors: number;
    flag: string;
  }>;
  dailyVisitors: Array<{
    date: string;
    visitors: number;
  }>;
}

const SiteAnalytics: React.FC = () => {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  // Mock data - في التطبيق الحقيقي ستأتي من API
  const [analyticsData] = useState<AnalyticsData>({
    totalVisitors: 15847,
    todayVisitors: 342,
    pageViews: 45231,
    bounceRate: 32.5,
    avgSessionDuration: '3:24',
    topPages: [
      { page: '/dashboard', views: 8945, percentage: 19.8 },
      { page: '/products', views: 7234, percentage: 16.0 },
      { page: '/doctors', views: 5678, percentage: 12.6 },
      { page: '/clients', views: 4321, percentage: 9.5 },
      { page: '/reports', views: 3456, percentage: 7.6 }
    ],
    visitorsByCountry: [
      { country: 'مصر', visitors: 8945, flag: '🇪🇬' },
      { country: 'السعودية', visitors: 3456, flag: '🇸🇦' },
      { country: 'الإمارات', visitors: 2134, flag: '🇦🇪' },
      { country: 'الكويت', visitors: 876, flag: '🇰🇼' },
      { country: 'قطر', visitors: 436, flag: '🇶🇦' }
    ],
    dailyVisitors: [
      { date: '2024-01-01', visitors: 234 },
      { date: '2024-01-02', visitors: 345 },
      { date: '2024-01-03', visitors: 456 },
      { date: '2024-01-04', visitors: 567 },
      { date: '2024-01-05', visitors: 432 },
      { date: '2024-01-06', visitors: 654 },
      { date: '2024-01-07', visitors: 342 }
    ]
  });

  useEffect(() => {
    // محاكاة تحميل البيانات
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRange]);

  // Check if user has SYSTEM_ADMIN role
  if (user?.role !== 'SYSTEM_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">غير مصرح</CardTitle>
            <CardDescription>
              ليس لديك صلاحية للوصول إلى هذه الصفحة
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            إحصائيات الموقع
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            تتبع أداء الموقع وسلوك الزوار
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">اليوم</SelectItem>
              <SelectItem value="7d">آخر 7 أيام</SelectItem>
              <SelectItem value="30d">آخر 30 يوم</SelectItem>
              <SelectItem value="90d">آخر 3 أشهر</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              إجمالي الزوار
            </CardTitle>
            <Users className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalVisitors.toLocaleString()}</div>
            <p className="text-xs opacity-90 mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12.5% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              زوار اليوم
            </CardTitle>
            <Eye className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.todayVisitors.toLocaleString()}</div>
            <p className="text-xs opacity-90 mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8.2% من أمس
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              مشاهدات الصفحات
            </CardTitle>
            <MousePointer className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.pageViews.toLocaleString()}</div>
            <p className="text-xs opacity-90 mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15.3% من الأسبوع الماضي
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              متوسط مدة الجلسة
            </CardTitle>
            <Clock className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.avgSessionDuration}</div>
            <p className="text-xs opacity-90 mt-1">
              معدل الارتداد: {analyticsData.bounceRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              الصفحات الأكثر زيارة
            </CardTitle>
            <CardDescription>
              أكثر الصفحات زيارة في الفترة المحددة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{page.page}</p>
                      <p className="text-xs text-gray-500">{page.views.toLocaleString()} مشاهدة</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {page.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Visitors by Country */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              الزوار حسب البلد
            </CardTitle>
            <CardDescription>
              توزيع الزوار جغرافياً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.visitorsByCountry.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <p className="font-medium text-sm">{country.country}</p>
                      <p className="text-xs text-gray-500">{country.visitors.toLocaleString()} زائر</p>
                    </div>
                  </div>
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(country.visitors / analyticsData.totalVisitors) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Visitors Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            الزوار اليومي
          </CardTitle>
          <CardDescription>
            عدد الزوار خلال الأيام السابقة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {analyticsData.dailyVisitors.map((day, index) => {
              const maxVisitors = Math.max(...analyticsData.dailyVisitors.map(d => d.visitors));
              const height = (day.visitors / maxVisitors) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {day.visitors}
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t transition-all duration-300 hover:from-purple-600 hover:to-purple-500"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  ></div>
                  <div className="text-xs text-gray-500 transform rotate-45 origin-left">
                    {new Date(day.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteAnalytics;