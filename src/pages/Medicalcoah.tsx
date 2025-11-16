import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  CalendarIcon, 
  Search, 
  Filter, 
  RefreshCw, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  UserCheck,
  Star,
  Award,
  Target,
  User,
  Stethoscope
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { getCoachingBySupervisor, CoachingEntry } from '@/api/Coaching';
import { useNavigate } from 'react-router-dom';

interface MedicalRepEvaluation {
  _id: string;
  medicalRepId: string;
  medicalRepName: string;
  evaluationPeriod: string;
  performanceScore: number;
  status: 'pending' | 'completed' | 'in_progress';
  lastEvaluationDate: string;
  nextEvaluationDate: string;
  department: string;
  region: string;
}

const Medicalcoah: React.FC = () => {
  const { user } = useAuthStore();
  const [coachings, setCoachings] = useState<CoachingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalReps: 0,
    pendingEvaluations: 0,
    completedEvaluations: 0,
    inProgressEvaluations: 0
  });

  const [filters, setFilters] = useState({
    status: 'all',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    search: '',
    department: 'all',
    region: 'all'
  });

  useEffect(() => {
    const loadCoachings = async () => {
      try {
        setLoading(true);
        const response = await getCoachingBySupervisor();
        if (response.success) {
          let data = response.data || [];
          // Apply simple client-side filters (search by doctor/rep/supervisor name)
          if (filters.search) {
            const q = filters.search.toLowerCase();
            data = data.filter(c => {
              const doc = c.visit?.doctor?.name?.toLowerCase() || '';
              const rep = c.visit?.medicalRep?.name?.toLowerCase() || c.visit?.medicalRep?.username?.toLowerCase() || '';
              const sup = c.visit?.supervisor?.name?.toLowerCase() || c.visit?.supervisor?.username?.toLowerCase() || '';
              return doc.includes(q) || rep.includes(q) || sup.includes(q);
            });
          }
          setCoachings(data);
          const completed = data.filter(c => c.isCompleted).length;
          const pending = data.length - completed;
          setStats({
            totalReps: data.length,
            pendingEvaluations: pending,
            completedEvaluations: completed,
            inProgressEvaluations: 0,
          });
        } else {
          toast.error(response.message || 'فشل في جلب بيانات الكوتشينغ');
        }
      } catch (error: any) {
        console.error('Error loading coachings:', error);
        toast.error(error.message || 'حدث خطأ أثناء تحميل بيانات الكوتشينغ');
      } finally {
        setLoading(false);
      }
    };

    loadCoachings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const handleReset = () => {
    setFilters({
      status: 'all',
      startDate: undefined,
      endDate: undefined,
      search: '',
      department: 'all',
      region: 'all'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }


  const handleNavigate=(iscomplete:boolean, id:string)=>{
    if(iscomplete){
      navigate(`/coaching-view/${id}`);
    }else{
       navigate(`/CoachingReport/${id}`);
    }


  }
  
  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">جلسات التقييم للمشرف</h1>
          <p className="text-gray-600 mt-1">عرض ومتابعة جلسات التقييم المرتبطة بزيارات المندوبين</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            إعادة تعيين
          </Button>
          <Button size="sm" disabled>
            <Target className="w-4 h-4 mr-2" />
            إضافة جلسة
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">إجمالي الجلسات</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{stats.totalReps}</div>
            <p className="text-xs text-blue-600 mt-1">جميع الجلسات</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">قيد الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{stats.pendingEvaluations}</div>
            <p className="text-xs text-yellow-600 mt-1">جلسات غير مكتملة</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">مكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{stats.completedEvaluations}</div>
            <p className="text-xs text-green-600 mt-1">جلسات مكتملة</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            الفلاتر والبحث
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في أسماء الطبيب/المندوب/المشرف..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="حالة الجلسة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">غير مكتملة</SelectItem>
                <SelectItem value="completed">مكتملة</SelectItem>
              </SelectContent>
            </Select>

            {/* Start Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal w-full">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, 'dd/MM/yyyy', { locale: ar }) : 'من تاريخ'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* End Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal w-full">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, 'dd/MM/yyyy', { locale: ar }) : 'إلى تاريخ'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Coaching Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            قائمة جلسات التقييم
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coachings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <UserCheck className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد جلسات كوتشينغ حالياً</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">ستظهر هنا جلسات الكوتشينغ المرتبطة بزيارات المندوبين الطبيين عند توفرها.</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 justify-center">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>تطوير الأداء</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>تحسين الجودة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>تحقيق الأهداف</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coachings.map((c) => {
                const visitDate = c.visit?.visitDate ? format(new Date(c.visit.visitDate), 'dd/MM/yyyy', { locale: ar }) : '-';
                return (
                  <Card
                    key={c.coachingId}
                    className="border hover:shadow-md cursor-pointer"
                    onClick={() => {
                     handleNavigate(c.isCompleted , c.coachingId);
                    }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" /> {visitDate}
                        </span>
                        <Badge className={c.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {c.isCompleted ? 'مكتملة' : 'غير مكتملة'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Stethoscope className="w-4 h-4" />
                          <span className="text-muted-foreground">الطبيب:</span>
                          <span className="font-medium">{c.visit?.doctor?.name || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4" />
                          <span className="text-muted-foreground">المندوب الطبي:</span>
                          <span className="font-medium">{c.visit?.medicalRep?.name || c.visit?.medicalRep?.username || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4" />
                          <span className="text-muted-foreground">المشرف:</span>
                          <span className="font-medium">{c.visit?.supervisor?.name || c.visit?.supervisor?.username || '-'}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">الملاحظات:</span>
                          <span className="font-medium ms-2">{c.visit?.notes || '-'}</span>
                        </div>
                      </div>

                      <div className="border rounded-md p-3">
                        <p className="text-sm font-semibold mb-2">التقييم الإجمالي</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">التخطيط</span>
                            <Badge variant="outline">{c.totals.TotalPlanning}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">المهارات الشخصية</span>
                            <Badge variant="outline">{c.totals.TotalPersonalSkills}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">المعرفة</span>
                            <Badge variant="outline">{c.totals.TotalKnowledge}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">مهارات البيع</span>
                            <Badge variant="outline">{c.totals.TotalSellingSkills}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-muted-foreground">المجموع</span>
                          <Badge>{c.totals.TotalScore}</Badge>
                        </div>
                      </div>

                      {c.title || c.Recommendations || c.note ? (
                        <div className="space-y-2">
                          {c.title && (
                            <p className="text-sm"><span className="text-muted-foreground">العنوان:</span> <span className="font-medium">{c.title}</span></p>
                          )}
                          {c.Recommendations && (
                            <p className="text-sm"><span className="text-muted-foreground">التوصيات:</span> <span className="font-medium">{c.Recommendations}</span></p>
                          )}
                          {c.note && (
                            <p className="text-sm"><span className="text-muted-foreground">ملاحظة:</span> <span className="font-medium">{c.note}</span></p>
                          )}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions (optional) */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">تقارير الأداء</h3>
                <p className="text-sm text-gray-600">عرض تقارير أداء المندوبين</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">معايير التقييم</h3>
                <p className="text-sm text-gray-600">إدارة معايير ومقاييس التقييم</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">إدارة المندوبين</h3>
                <p className="text-sm text-gray-600">عرض وإدارة بيانات المندوبين</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
};

export default Medicalcoah;