import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TrendingUp, Users, Activity, DollarSign, Download, Calendar, Building2, Stethoscope, Filter, RefreshCw, Tag, Package, User, Menu, Home, Settings, ChevronDown, BarChart3, PieChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getDetailedVisits, DetailedVisit, DetailedVisitsResponse, DetailedVisitsParams, exportVisitsToExcel } from '@/api/Visits';
import { useAuthStore } from '@/stores/authStore';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
);

// Interface for processed visit data for display
interface ProcessedVisit {
  _id: string;
  visitDate: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  classification: string;
  brand: string;
  products: string[];
  samplesCount: number;
  notes?: string;
  medicalRepName: string;
  teamArea: string;
  teamProducts: string;
  doctorId: string;
}

const NewClinicalReps: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore();
  const id = user.user?._id;
  
  // Data states
  const [visits, setVisits] = useState<ProcessedVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<ProcessedVisit[]>([]);
  const [analyticsData, setAnalyticsData] = useState<DetailedVisitsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [medicalRepId, setMedicalRepId] = useState(id);
  
  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(50);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Process raw API data to display format
  const processVisitsData = (rawVisits: DetailedVisit[]): ProcessedVisit[] => {
    return rawVisits.map(visit => ({
      _id: visit._id,
      visitDate: new Date(visit.visitDate).toLocaleDateString('ar-SA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        calendar: 'gregory' 
      }),
      doctorName: visit.doctorId.drName,
      specialty: visit.doctorId.specialty,
      clinicName: visit.doctorId.organizationName,
      classification: visit.doctorId.segment,
      brand: visit.doctorId.brand,
      products: visit.products.map(p => p.productId?.PRODUCT || 'غير محدد'),
      samplesCount: visit.products.reduce((sum, p) => sum + p.samplesCount, 0),
      notes: visit.notes,
      medicalRepName: `${visit.medicalRepId.firstName} ${visit.medicalRepId.lastName}`,
      teamArea: visit.medicalRepId.teamArea,
      teamProducts: visit.medicalRepId.teamProducts,
      doctorId: visit.doctorId._id
    }));
  };

  // Get unique values for filters
  const [allVisits, setAllVisits] = useState<ProcessedVisit[]>([]);
  
  useEffect(() => {
    if (visits.length > 0 && allVisits.length === 0) {
      setAllVisits(visits);
    }
  }, [visits]);

  const uniqueDoctors = [...new Set(allVisits.map(visit => visit.doctorName))];
  const uniqueSpecialties = [...new Set(allVisits.map(visit => visit.specialty))];
  const uniqueSegments = [...new Set(allVisits.map(visit => visit.classification))];
  const uniqueBrands = [...new Set(allVisits.map(visit => visit.brand))];
  const uniqueClinics = [...new Set(allVisits.map(visit => visit.clinicName))];
  const uniqueProducts = [...new Set(allVisits.flatMap(visit => visit.products))];

  // Fetch data from API
  const fetchVisitsData = async () => {
    setLoading(true);
    try {
      const params: DetailedVisitsParams = {
        page: currentPage,
        limit: pageLimit,
        startDate: fromDate || undefined,
        endDate: toDate || undefined,
        doctorName: selectedDoctor !== 'all' ? selectedDoctor : undefined,
        specialization: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
        segment: selectedSegment !== 'all' ? selectedSegment : undefined,
        clinic: selectedClinic !== 'all' ? selectedClinic : undefined,
        brand: selectedBrand !== 'all' ? selectedBrand : undefined,
        products: selectedProducts.length > 0 ? selectedProducts : undefined
      };

      const response = await getDetailedVisits(medicalRepId, params);
      if (response.success && response.data) {
        setAnalyticsData(response.data);
        const processedVisits = processVisitsData(response.data.visits);
        setVisits(processedVisits);
        setFilteredVisits(processedVisits);
      }
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchVisitsData();
  }, [medicalRepId, currentPage, fromDate, toDate, selectedDoctor, selectedSpecialty, selectedSegment, selectedBrand, selectedClinic, selectedProducts]);

  // Calculate analytics from real data
  const calculateAnalytics = () => {
    const totalVisits = filteredVisits.length;
    const totalSamples = filteredVisits.reduce((sum, visit) => sum + visit.samplesCount, 0);
    const uniqueDoctorsCount = [...new Set(filteredVisits.map(v => v.doctorName))].length;
    const uniqueClinicsCount = [...new Set(filteredVisits.map(v => v.clinicName))].length;
    
    // Calculate visits by day of week
    const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const visitsByDay = daysOfWeek.map(() => 0);
    
    filteredVisits.forEach(visit => {
      const date = new Date(visit.visitDate);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      visitsByDay[dayOfWeek]++;
    });
    
    // Calculate visits by doctor (top 4)
    const doctorVisits = uniqueDoctors.map(doctor => ({
      doctor,
      visits: filteredVisits.filter(v => v.doctorName === doctor).length
    })).sort((a, b) => b.visits - a.visits).slice(0, 4);
    
    // Calculate visits by area (using teamArea)
    const areaVisits = [...new Set(filteredVisits.map(v => v.teamArea))].map(area => ({
      area,
      visits: filteredVisits.filter(v => v.teamArea === area).length
    }));
    
    // Calculate visits by product (top 4)
    const productVisits = uniqueProducts.map(product => ({
      product,
      visits: filteredVisits.filter(v => v.products.includes(product)).length
    })).sort((a, b) => b.visits - a.visits).slice(0, 4);
    
    // Calculate visits by clinic (top 4)
    const clinicVisits = uniqueClinics.map(clinic => ({
      clinic,
      visits: filteredVisits.filter(v => v.clinicName === clinic).length
    })).sort((a, b) => b.visits - a.visits).slice(0, 4);
    
    // Calculate classification distribution
    const classificationData = uniqueSegments.map(segment => ({
      segment,
      visits: filteredVisits.filter(v => v.classification === segment).length
    }));
    
    return {
      totalVisits,
      totalSamples,
      uniqueDoctorsCount,
      uniqueClinicsCount,
      visitsByDay,
      doctorVisits,
      areaVisits,
      productVisits,
      clinicVisits,
      classificationData
    };
  };

  const analytics = calculateAnalytics();

  // Chart data functions
  const getVisitsByDayData = () => {
    const maxVisits = Math.max(...analytics.visitsByDay);
    return analytics.visitsByDay.map((count, index) => ({
      count,
      percentage: maxVisits > 0 ? (count / maxVisits) * 100 : 0,
      day: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][index]
    }));
  };

  const handleRefresh = () => {
    fetchVisitsData();
    toast.success('تم تحديث البيانات بنجاح');
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setSelectedDoctor('all');
    setSelectedSpecialty('all');
    setSelectedSegment('all');
    setSelectedBrand('all');
    setSelectedClinic('all');
    setSelectedProducts([]);
    setCurrentPage(1);
    toast.success('تم مسح جميع الفلاتر');
  };

  // Main KPI Cards
  const KPICards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي الزيارات</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{analytics.totalVisits}</p>
          </div>
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-400">
          <TrendingUp className="h-3 w-3 ml-1" />
          <span>+12% عن الشهر الماضي</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي العينات</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{analytics.totalSamples}</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
          <TrendingUp className="h-3 w-3 ml-1" />
          <span>+8% عن الشهر الماضي</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">عدد الأطباء</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{analytics.uniqueDoctorsCount}</p>
          </div>
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>زيارة نشطة</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">عدد العيادات</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{analytics.uniqueClinicsCount}</p>
          </div>
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>عيادة نشطة</span>
        </div>
      </div>
    </div>
  );

  // Analytics Charts Grid
  const AnalyticsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Visits by Day */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">الزيارات حسب اليوم</h3>
          <BarChart3 className="h-4 w-4 text-gray-400" />
        </div>
        <div className="grid grid-cols-7 gap-1 items-end h-32">
          {getVisitsByDayData().map((dayData, index) => (
            <div key={dayData.day} className="flex flex-col items-center">
              <div 
                className={`w-full rounded-t-lg transition-all duration-300 ${
                  dayData.percentage > 80 ? 'bg-green-500' : 
                  dayData.percentage > 60 ? 'bg-green-400' : 
                  dayData.percentage > 40 ? 'bg-green-300' : 'bg-green-200'
                }`}
                style={{ height: `${dayData.percentage}%` }}
              ></div>
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                {dayData.day.charAt(0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Visits by Physician */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">الزيارات حسب الطبيب</h3>
          <User className="h-4 w-4 text-gray-400" />
        </div>
        <div className="space-y-3">
          {analytics.doctorVisits.map((doctor, index) => (
            <div key={doctor.doctor} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className={`w-2 h-2 rounded-full ${
                  index === 0 ? 'bg-green-500' : 
                  index === 1 ? 'bg-blue-500' : 
                  index === 2 ? 'bg-purple-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[100px]">
                  د. {doctor.doctor.split(' ')[0]}
                </span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {doctor.visits}
                </span>
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      index === 0 ? 'bg-green-500' : 
                      index === 1 ? 'bg-blue-500' : 
                      index === 2 ? 'bg-purple-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${(doctor.visits / Math.max(...analytics.doctorVisits.map(d => d.visits))) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visits by Area */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">الزيارات حسب المنطقة</h3>
          <MapPin className="h-4 w-4 text-gray-400" />
        </div>
        <div className="space-y-3">
          {analytics.areaVisits.slice(0, 4).map((area, index) => (
            <div key={area.area} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{area.area}</span>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{area.visits}</span>
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${(area.visits / Math.max(...analytics.areaVisits.map(a => a.visits))) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visits by Product */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">الزيارات حسب المنتج</h3>
          <Package className="h-4 w-4 text-gray-400" />
        </div>
        <div className="space-y-3">
          {analytics.productVisits.map((product, index) => (
            <div key={product.product} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[100px]">
                {product.product}
              </span>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{product.visits}</span>
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${(product.visits / Math.max(...analytics.productVisits.map(p => p.visits))) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visits by Clinic */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">الزيارات حسب العيادة</h3>
          <Building2 className="h-4 w-4 text-gray-400" />
        </div>
        <div className="space-y-3">
          {analytics.clinicVisits.map((clinic, index) => (
            <div key={clinic.clinic} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[100px]">
                {clinic.clinic}
              </span>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{clinic.visits}</span>
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-purple-500"
                    style={{ width: `${(clinic.visits / Math.max(...analytics.clinicVisits.map(c => c.visits))) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Physicians Classifications */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">تصنيفات الأطباء</h3>
          <PieChart className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              {analytics.classificationData.map((item, index) => {
                const colors = ['#38e079', '#10b981', '#059669', '#047857'];
                const total = analytics.classificationData.reduce((sum, d) => sum + d.visits, 0);
                const percentage = total > 0 ? (item.visits / total) * 100 : 0;
                const strokeDasharray = `${percentage} ${100 - percentage}`;
                const strokeDashoffset = analytics.classificationData.slice(0, index).reduce((offset, d) => {
                  return offset - (total > 0 ? (d.visits / total) * 100 : 0);
                }, 100);
                
                return (
                  <circle
                    key={item.segment}
                    className={`stroke-${colors[index] || colors[0]}`}
                    cx="18"
                    cy="18"
                    fill="none"
                    r="15.91549430918954"
                    strokeWidth="3"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              })}
            </svg>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {analytics.classificationData.map((item, index) => (
            <div key={item.segment} className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className={`w-2 h-2 rounded-full bg-${['green', 'emerald', 'green', 'emerald'][index]}-500`}></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">{item.segment}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Quick Stats
  const QuickStats = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">إحصائيات سريعة</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.totalVisits}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">زيارة إجمالية</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analytics.totalSamples}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">عينة موزعة</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {analytics.uniqueDoctorsCount}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">طبيب متفاعل</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {analytics.uniqueClinicsCount}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">عيادة نشطة</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">تحليلات الزيارات</h1>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button 
                onClick={handleRefresh} 
                disabled={loading}
                variant="outline" 
                size="sm"
                className="rounded-lg"
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32 rounded-lg">
                  <SelectValue placeholder="الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">يومي</SelectItem>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="yearly">سنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">فلاتر البحث</h2>
            <Button onClick={clearFilters} variant="outline" size="sm" className="rounded-lg">
              <Filter className="h-4 w-4 ml-2" />
              مسح الكل
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">من تاريخ</label>
              <div className="relative">
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rounded-lg pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">إلى تاريخ</label>
              <div className="relative">
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rounded-lg pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Doctor Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الطبيب</label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="اختر الطبيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأطباء</SelectItem>
                  {uniqueDoctors.map(doctor => (
                    <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Specialty Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">التخصص</label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="اختر التخصص" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التخصصات</SelectItem>
                  {uniqueSpecialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <KPICards />

        {/* Analytics Grid */}
        <AnalyticsGrid />

        {/* Quick Stats */}
        <QuickStats />

        {/* Recent Visits Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">آخر الزيارات</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right p-4 text-sm font-medium text-gray-500 dark:text-gray-400">التاريخ</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500 dark:text-gray-400">الطبيب</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500 dark:text-gray-400">العيادة</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500 dark:text-gray-400">التخصص</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500 dark:text-gray-400">المنتجات</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500 dark:text-gray-400">العمليات</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.slice(0, 5).map((visit) => (
                  <tr key={visit._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{visit.visitDate}</td>
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{visit.doctorName}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{visit.clinicName}</td>
                    <td className="p-4">
                      <Badge variant="secondary" className="text-xs">{visit.specialty}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {visit.products.slice(0, 2).map((product, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                        {visit.products.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{visit.products.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/doctor-card/${visit.doctorId}`)}
                        className="rounded-lg"
                      >
                        عرض الطبيب
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 fixed bottom-0 left-0 right-0">
        <div className="flex justify-around px-2 py-3">
          {[
            { icon: Home, label: 'الرئيسية', active: true },
            { icon: Calendar, label: 'الزيارات', active: false },
            { icon: Package, label: 'المنتجات', active: false },
            { icon: User, label: 'الأطباء', active: false },
            { icon: Settings, label: 'الإعدادات', active: false }
          ].map((item, index) => (
            <button
              key={item.label}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                item.active 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};

// MapPin icon component
const MapPin = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default NewClinicalReps;