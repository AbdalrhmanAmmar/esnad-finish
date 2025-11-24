import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ar } from 'date-fns/locale';

// Register Arabic locale
registerLocale('ar', ar);
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { getDetailedVisits, DetailedVisitsResponse } from '@/api/Visits';
import { Loader2, AlertCircle, Eye, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for charts and tables
const mockVisitsByDay = [
  { day: 'الأحد', label: 'ح', visits: 45, percentage: 90 },
  { day: 'الإثنين', label: 'إ', visits: 32, percentage: 64 },
  { day: 'الثلاثاء', label: 'ث', visits: 38, percentage: 76 },
  { day: 'الأربعاء', label: 'أ', visits: 42, percentage: 84 },
  { day: 'الخميس', label: 'خ', visits: 50, percentage: 100 },
  { day: 'الجمعة', label: 'ج', visits: 28, percentage: 56 },
  { day: 'السبت', label: 'س', visits: 35, percentage: 70 }
];

const mockVisitsByDoctor = [
  { name: 'د. أحمد محمد', label: 'أح', visits: 65, specialty: 'باطنية', percentage: 100 },
  { name: 'د. فاطمة علي', label: 'فا', visits: 52, specialty: 'أطفال', percentage: 80 },
  { name: 'د. محمود حسن', label: 'مح', visits: 48, specialty: 'جراحة', percentage: 74 },
  { name: 'د. سارة خالد', label: 'سا', visits: 38, specialty: 'نساء', percentage: 58 }
];

const mockVisitsByArea = [
  { name: 'الرياض', label: 'ر', visits: 120, percentage: 100 },
  { name: 'جدة', label: 'ج', visits: 95, percentage: 79 },
  { name: 'الدمام', label: 'د', visits: 78, percentage: 65 },
  { name: 'مكة', label: 'م', visits: 68, percentage: 57 }
];

const mockVisitsByProduct = [
  { name: 'أسبرين', label: 'أس', visits: 85, category: 'أدوية القلب', percentage: 100 },
  { name: 'أموكسيل', label: 'أم', visits: 72, category: 'مضادات حيوية', percentage: 85 },
  { name: 'فيتامين د', label: 'فد', visits: 68, category: 'فيتامينات', percentage: 80 },
  { name: 'بنادول', label: 'بن', visits: 45, category: 'مسكنات', percentage: 53 }
];

const mockVisitsByClinic = [
  { name: 'عيادة النور', label: 'ن', visits: 95, area: 'الرياض', percentage: 100 },
  { name: 'عيادة الشفاء', label: 'ش', visits: 78, area: 'جدة', percentage: 82 },
  { name: 'عيادة الأمل', label: 'أ', visits: 65, area: 'الدمام', percentage: 68 },
  { name: 'عيادة السلام', label: 'س', visits: 52, area: 'مكة', percentage: 55 }
];

const mockVisitsByTime = [
  { time: 'صباحاً', label: 'ص', visits: 85, percentage: 100 },
  { time: 'ظهراً', label: 'ظ', visits: 72, percentage: 85 },
  { time: 'عصراً', label: 'ع', visits: 68, percentage: 80 },
  { time: 'مساءً', label: 'م', visits: 45, percentage: 53 }
];

const mockDoctorClassifications = [
  { category: 'A', count: 45, percentage: 45, color: '#38e079' },
  { category: 'B', count: 30, percentage: 30, color: '#4ade80' },
  { category: 'C', count: 25, percentage: 25, color: '#86efac' }
];

const mockRecentVisits = [
  { id: 1, doctor: 'د. أحمد محمد', doctorId: '1', clinic: 'عيادة النور', date: '2024-01-15', time: '10:30', product: 'منتج A', status: 'مكتملة' },
  { id: 2, doctor: 'د. فاطمة علي', doctorId: '2', clinic: 'عيادة الشفاء', date: '2024-01-15', time: '11:00', product: 'منتج B', status: 'مكتملة' },
  { id: 3, doctor: 'د. محمود حسن', doctorId: '3', clinic: 'عيادة الأمل', date: '2024-01-15', time: '14:30', product: 'منتج C', status: 'قيد الانتظار' },
  { id: 4, doctor: 'د. سارة خالد', doctorId: '4', clinic: 'عيادة السلام', date: '2024-01-14', time: '09:00', product: 'منتج A', status: 'مكتملة' },
  { id: 5, doctor: 'د. أحمد محمد', doctorId: '1', clinic: 'عيادة النور', date: '2024-01-14', time: '15:30', product: 'منتج D', status: 'مكتملة' },
  { id: 6, doctor: 'د. فاطمة علي', doctorId: '2', clinic: 'عيادة الشفاء', date: '2024-01-13', time: '13:00', product: 'منتج C', status: 'مكتملة' },
  { id: 7, doctor: 'د. محمود حسن', doctorId: '3', clinic: 'عيادة الأمل', date: '2024-01-13', time: '16:00', product: 'منتج B', status: 'قيد الانتظار' },
  { id: 8, doctor: 'د. سارة خالد', doctorId: '4', clinic: 'عيادة السلام', date: '2024-01-12', time: '11:30', product: 'منتج A', status: 'مكتملة' }
];

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitsData, setVisitsData] = useState<DetailedVisitsResponse | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    doctorName: '',
    specialty: '', // Changed from 'specialization' to 'specialty'
    segment: '',
    clinic: '',
    brand: '',
    products: ''
  });

  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<string[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<string[]>([]);
  const [availableClinics, setAvailableClinics] = useState<string[]>([]);

  const fetchAnalytics = async () => {
    if (!user?._id) {
      setError('لم يتم العثور على معرف المستخدم');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching visits for user:', user._id, 'with filters:', filters);
      const response = await getDetailedVisits(user._id, filters);
      console.log('API Response:', response);

      if (response.success && response.data) {
        console.log('Visits data received:', response.data.visits?.length || 0, 'visits');
        setVisitsData(response.data);

        // Extract available options for filters from the response data
        if (response.data.visits && response.data.visits.length > 0) {
          const specialties = [...new Set(response.data.visits.map(visit => visit.doctorId.specialty))].filter(Boolean);
          const doctors = [...new Set(response.data.visits.map(visit => visit.doctorId.drName))].filter(Boolean);
          const areas = [...new Set(response.data.visits.map(visit => visit.doctorId.area || visit.doctorId.city))].filter(Boolean);
          const clinics = [...new Set(response.data.visits.map(visit => visit.doctorId.organizationName))].filter(Boolean);
          
          const products: string[] = [];
          response.data.visits.forEach(visit => {
            visit.products.forEach(product => {
              if (product.productId.PRODUCT && !products.includes(product.productId.PRODUCT)) {
                products.push(product.productId.PRODUCT);
              }
            });
          });

          setAvailableSpecialties(specialties);
          setAvailableDoctors(doctors);
          setAvailableAreas(areas);
          setAvailableClinics(clinics);
          setAvailableProducts(products);
        }

        // Show info toast if no visits found
        if (!response.data.visits || response.data.visits.length === 0) {
          toast.error('لا توجد زيارات متاحة');
        }
      } else {
        setError(response.message || 'فشل في جلب البيانات');
        toast.error(response.message || 'فشل في جلب البيانات');
      }
    } catch (err: any) {
      console.error('Error fetching visits:', err);
      setError(err.message || 'حدث خطأ أثناء جلب البيانات');
      toast.error(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user?._id]);

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value || '' }));
  };

  const handleApplyFilters = () => {
    fetchAnalytics();
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      doctorName: '',
      specialty: '',
      segment: '',
      clinic: '',
      brand: '',
      products: ''
    });
    setStartDate(null);
    setEndDate(null);
    // Don't fetch immediately, let user click apply or it will auto-fetch on next render
  };

  // Process visits data to calculate analytics
  const processAnalytics = () => {
    if (!visitsData?.visits || visitsData.visits.length === 0) {
      return {
        visitsByDay: mockVisitsByDay,
        visitsByDoctor: mockVisitsByDoctor,
        visitsByArea: mockVisitsByArea,
        visitsByProduct: mockVisitsByProduct,
        visitsByClinic: mockVisitsByClinic,
        visitsByTime: mockVisitsByTime,
        doctorClassifications: mockDoctorClassifications,
        recentVisits: mockRecentVisits,
        visitsBySpecialty: []
      };
    }

    const visits = visitsData.visits;

    // Process visits by day
    const dayMap: Record<string, number> = {};
    const dayLabels: Record<string, string> = {
      'الأحد': 'ح', 'الإثنين': 'إ', 'الثلاثاء': 'ث',
      'الأربعاء': 'أ', 'الخميس': 'خ', 'الجمعة': 'ج', 'السبت': 'س'
    };

    visits.forEach(visit => {
      const day = new Date(visit.visitDate).toLocaleDateString('ar-SA', { weekday: 'long' });
      dayMap[day] = (dayMap[day] || 0) + 1;
    });

    const maxDayVisits = Math.max(...Object.values(dayMap), 1);
    const processedDayData = Object.entries(dayMap).map(([day, count]) => ({
      day,
      label: dayLabels[day] || day.charAt(0),
      visits: count,
      percentage: (count / maxDayVisits) * 100
    }));

    // Process visits by doctor
    const doctorMap: Record<string, { visits: number; specialty: string }> = {};
    visits.forEach(visit => {
      const docName = visit.doctorId.drName;
      if (!doctorMap[docName]) {
        doctorMap[docName] = { visits: 0, specialty: visit.doctorId.specialty };
      }
      doctorMap[docName].visits++;
    });

    const maxDoctorVisits = Math.max(...Object.values(doctorMap).map(d => d.visits), 1);
    const processedDoctorData = Object.entries(doctorMap)
      .sort((a, b) => b[1].visits - a[1].visits)
      .slice(0, 4)
      .map(([name, data]) => ({
        name,
        label: name.split(' ').slice(1, 3).map(n => n[0]).join(''),
        visits: data.visits,
        specialty: data.specialty,
        percentage: (data.visits / maxDoctorVisits) * 100
      }));

    // Process visits by specialty
    const specialtyMap: Record<string, number> = {};
    visits.forEach(visit => {
      const specialty = visit.doctorId.specialty;
      specialtyMap[specialty] = (specialtyMap[specialty] || 0) + 1;
    });

    const processedSpecialtyData = Object.entries(specialtyMap).map(([name, count]) => ({
      name,
      visits: count
    }));

    // Process visits by area
    const areaMap: Record<string, number> = {};
    visits.forEach(visit => {
      const area = visit.doctorId.area || visit.doctorId.city;
      areaMap[area] = (areaMap[area] || 0) + 1;
    });

    const maxAreaVisits = Math.max(...Object.values(areaMap), 1);
    const processedAreaData = Object.entries(areaMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        label: name.charAt(0),
        visits: count,
        percentage: (count / maxAreaVisits) * 100
      }));

    // Process visits by product
    const productMap: Record<string, { visits: number; category: string }> = {};
    visits.forEach(visit => {
      visit.products.forEach(product => {
        const prodName = product.productId.PRODUCT;
        if (!productMap[prodName]) {
          productMap[prodName] = { visits: 0, category: product.productId.BRAND };
        }
        productMap[prodName].visits++;
      });
    });

    const maxProductVisits = Math.max(...Object.values(productMap).map(p => p.visits), 1);
    const processedProductData = Object.entries(productMap)
      .sort((a, b) => b[1].visits - a[1].visits)
      .slice(0, 4)
      .map(([name, data]) => ({
        name,
        label: name.substring(0, 2),
        visits: data.visits,
        category: data.category,
        percentage: (data.visits / maxProductVisits) * 100
      }));

    // Process visits by clinic
    const clinicMap: Record<string, { visits: number; area: string }> = {};
    visits.forEach(visit => {
      const clinic = visit.doctorId.organizationName;
      const area = visit.doctorId.city;
      if (!clinicMap[clinic]) {
        clinicMap[clinic] = { visits: 0, area };
      }
      clinicMap[clinic].visits++;
    });

    const maxClinicVisits = Math.max(...Object.values(clinicMap).map(c => c.visits), 1);
    const processedClinicData = Object.entries(clinicMap)
      .sort((a, b) => b[1].visits - a[1].visits)
      .slice(0, 4)
      .map(([name, data]) => ({
        name,
        label: name.charAt(0),
        visits: data.visits,
        area: data.area,
        percentage: (data.visits / maxClinicVisits) * 100
      }));

    // Process visits by time (using createdAt time)
    const timeMap = { 'صباحاً': 0, 'ظهراً': 0, 'عصراً': 0, 'مساءً': 0 };
    const timeLabels = { 'صباحاً': 'ص', 'ظهراً': 'ظ', 'عصراً': 'ع', 'مساءً': 'م' };

    visits.forEach(visit => {
      const hour = new Date(visit.createdAt).getHours();
      if (hour >= 6 && hour < 12) timeMap['صباحاً']++;
      else if (hour >= 12 && hour < 15) timeMap['ظهراً']++;
      else if (hour >= 15 && hour < 18) timeMap['عصراً']++;
      else timeMap['مساءً']++;
    });

    const maxTimeVisits = Math.max(...Object.values(timeMap), 1);
    const processedTimeData = Object.entries(timeMap).map(([time, count]) => ({
      time,
      label: timeLabels[time as keyof typeof timeLabels],
      visits: count,
      percentage: (count / maxTimeVisits) * 100
    }));

    // Process doctor classifications (using segment)
    const classificationMap: Record<string, number> = {};
    visits.forEach(visit => {
      const segment = visit.doctorId.segment || 'A';
      classificationMap[segment] = (classificationMap[segment] || 0) + 1;
    });

    const totalClassifications = Object.values(classificationMap).reduce((sum, count) => sum + count, 0);
    const processedClassifications = Object.entries(classificationMap).map(([category, count], idx) => ({
      category,
      count,
      percentage: Math.round((count / totalClassifications) * 100),
      color: idx === 0 ? '#38e079' : idx === 1 ? '#4ade80' : '#86efac'
    }));

    // Process recent visits
    const processedRecentVisits = visits.slice(0, 8).map((visit, idx) => ({
      id: idx + 1,
      doctor: visit.doctorId.drName,
      doctorId: visit.doctorId._id,
      clinic: visit.doctorId.organizationName,
      date: new Date(visit.visitDate).toLocaleDateString('ar-SA'),
      time: new Date(visit.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      product: visit.products.map(p => p.productId.PRODUCT).join(', '),
      status: visit.status === 'completed' ? 'مكتملة' : 'قيد الانتظار'
    }));

    return {
      visitsByDay: processedDayData.length > 0 ? processedDayData : mockVisitsByDay,
      visitsByDoctor: processedDoctorData.length > 0 ? processedDoctorData : mockVisitsByDoctor,
      visitsByArea: processedAreaData.length > 0 ? processedAreaData : mockVisitsByArea,
      visitsByProduct: processedProductData.length > 0 ? processedProductData : mockVisitsByProduct,
      visitsByClinic: processedClinicData.length > 0 ? processedClinicData : mockVisitsByClinic,
      visitsByTime: processedTimeData,
      doctorClassifications: processedClassifications.length > 0 ? processedClassifications : mockDoctorClassifications,
      recentVisits: processedRecentVisits.length > 0 ? processedRecentVisits : mockRecentVisits,
      visitsBySpecialty: processedSpecialtyData
    };
  };

  const analytics = processAnalytics();
  const visitsByDay = analytics.visitsByDay;
  const visitsByDoctor = analytics.visitsByDoctor;
  const visitsByArea = analytics.visitsByArea;
  const visitsByProduct = analytics.visitsByProduct;
  const visitsByClinic = analytics.visitsByClinic;
  const visitsByTime = analytics.visitsByTime;
  const visitsBySpecialty = analytics.visitsBySpecialty || [];
  const doctorClassifications = analytics.doctorClassifications;
  const recentVisits = analytics.recentVisits;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#122017] flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#38e079] mx-auto" />
          <p className="text-lg font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error && !visitsData) {
    return (
      <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#122017] flex items-center justify-center p-4" dir="rtl">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">خطأ في تحميل البيانات</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchAnalytics} className="bg-[#38e079] hover:bg-[#38e079]/90">
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#122017]" dir="rtl">
      {/* Header - Sticky on mobile, regular on desktop */}
      <header className="md:relative sticky top-0 z-10 flex items-center bg-[#f6f8f7] dark:bg-[#122017] p-4 md:p-6 pb-2 md:pb-6 justify-between border-b border-[#122017]/10 dark:border-[#f6f8f7]/10">
        <h1 className="text-lg md:text-3xl font-bold">تحليلات الزيارات</h1>
        <div className="md:flex items-center gap-2 hidden">
          <span className="text-sm text-muted-foreground">مرحباً، {user?.firstName} {user?.lastName}</span>
        </div>
        <div className="w-10 md:hidden"></div>
      </header>

      <div className="p-4 md:px-6 pb-24 md:pb-6 space-y-4 md:space-y-6">
        {/* Filters */}
        <div className="pb-4">
          <div className="flex flex-wrap items-end gap-2">
            {/* Start Date */}
            <div className="relative min-w-[180px]">
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => {
                  setStartDate(date);
                  handleFilterChange('startDate', date ? date.toISOString().split('T')[0] : '');
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="تاريخ البداية"
                className="w-full h-10 text-right pr-10 pl-4 text-sm bg-background border-2 border-[#38e079]/20 hover:border-[#38e079] focus:border-[#38e079] transition-all duration-200 rounded-full shadow-sm focus:shadow-md focus:ring-2 focus:ring-[#38e079]/20 outline-none"
                calendarClassName="custom-datepicker-green"
                popperClassName="z-[9999]"
                showPopperArrow={false}
                locale="ar"
                wrapperClassName="w-full"
              />
              <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#38e079] pointer-events-none" />
            </div>

            {/* End Date */}
            <div className="relative min-w-[180px]">
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => {
                  setEndDate(date);
                  handleFilterChange('endDate', date ? date.toISOString().split('T')[0] : '');
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="تاريخ النهاية"
                className="w-full h-10 text-right pr-10 pl-4 text-sm bg-background border-2 border-[#38e079]/20 hover:border-[#38e079] focus:border-[#38e079] transition-all duration-200 rounded-full shadow-sm focus:shadow-md focus:ring-2 focus:ring-[#38e079]/20 outline-none"
                calendarClassName="custom-datepicker-green"
                popperClassName="z-[9999]"
                showPopperArrow={false}
                locale="ar"
                minDate={startDate || undefined}
                wrapperClassName="w-full"
              />
              <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#38e079] pointer-events-none" />
            </div>

            {/* Specialties Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-full border-[#122017]/10 dark:border-[#f6f8f7]/10">
                  <span className="text-sm font-medium">
                    {filters.specialty ? filters.specialty : 'جميع التخصصات'}
                  </span>
                  <span className="mr-2">▼</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="p-2 space-y-1">
                  <div
                    className="text-sm py-1 hover:bg-muted px-2 rounded cursor-pointer"
                    onClick={() => handleFilterChange('specialty', '')}
                  >
                    الكل
                  </div>
                  {availableSpecialties.map((specialty, i) => (
                    <div
                      key={i}
                      className="text-sm py-1 hover:bg-muted px-2 rounded cursor-pointer"
                      onClick={() => handleFilterChange('specialty', specialty)}
                    >
                      {specialty}
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Doctors Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-full border-[#122017]/10 dark:border-[#f6f8f7]/10">
                  <span className="text-sm font-medium">
                    {filters.doctorName ? filters.doctorName : 'جميع الأطباء'}
                  </span>
                  <span className="mr-2">▼</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="p-2 space-y-1">
                  <div
                    className="text-sm py-1 hover:bg-muted px-2 rounded cursor-pointer"
                    onClick={() => handleFilterChange('doctorName', '')}
                  >
                    الكل
                  </div>
                  {availableDoctors.map((doctor, i) => (
                    <div
                      key={i}
                      className="text-sm py-1 hover:bg-muted px-2 rounded cursor-pointer"
                      onClick={() => handleFilterChange('doctorName', doctor)}
                    >
                      {doctor}
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Areas Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-full border-[#122017]/10 dark:border-[#f6f8f7]/10">
                  <span className="text-sm font-medium">
                    {filters.clinic ? filters.clinic : 'جميع المناطق'}
                  </span>
                  <span className="mr-2">▼</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="p-2 space-y-1">
                  <div
                    className="text-sm py-1 hover:bg-muted px-2 rounded cursor-pointer"
                    onClick={() => handleFilterChange('clinic', '')}
                  >
                    الكل
                  </div>
                  {availableAreas.map((area, i) => (
                    <div
                      key={i}
                      className="text-sm py-1 hover:bg-muted px-2 rounded cursor-pointer"
                      onClick={() => handleFilterChange('clinic', area)}
                    >
                      {area}
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Products Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-full border-[#122017]/10 dark:border-[#f6f8f7]/10">
                  <span className="text-sm font-medium">
                    {filters.products ? filters.products : 'جميع المنتجات'}
                  </span>
                  <span className="mr-2">▼</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="p-2 space-y-1">
                  <div
                    className="text-sm py-1 hover:bg-muted px-2 rounded cursor-pointer"
                    onClick={() => handleFilterChange('products', '')}
                  >
                    الكل
                  </div>
                  {availableProducts.map((product, i) => (
                    <div
                      key={i}
                      className="text-sm py-1 hover:bg-muted px-2 rounded cursor-pointer"
                      onClick={() => handleFilterChange('products', product)}
                    >
                      {product}
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Apply and Reset Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={handleApplyFilters}
                className="bg-[#38e079] hover:bg-[#38e079]/90 h-10 rounded-full"
              >
                تطبيق الفلتر
              </Button>
              <Button 
                onClick={handleResetFilters}
                variant="outline"
                className="h-10 rounded-full border-[#122017]/10 dark:border-[#f6f8f7]/10"
              >
                إعادة تعيين
              </Button>
            </div>
          </div>
        </div>

        {/* Rest of your component remains the same... */}
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {/* Visits by Day */}
          <Card className="rounded-xl border-[#122017]/10 dark:border-[#f6f8f7]/10 bg-white dark:bg-[#122017]">
            <CardContent className="p-3 md:p-6 flex flex-col gap-2">
              <p className="text-sm md:text-base font-medium">الزيارات حسب اليوم</p>
              <div className="grid min-h-[120px] md:min-h-[180px] grid-flow-col gap-2 grid-rows-[1fr_auto] items-end justify-items-center pt-2">
                {visitsByDay.map((day, i) => {
                  const maxVisits = Math.max(...visitsByDay.map(d => d.visits));
                  const isHighest = day.visits === maxVisits;
                  return (
                    <React.Fragment key={i}>
                      <div
                        className={`w-full rounded-t relative group ${isHighest ? 'bg-[#38e079]' : 'bg-[#38e079]/20'} cursor-pointer transition-all hover:opacity-80`}
                        style={{ height: `${day.percentage}%` }}
                        title={`${day.day}: ${day.visits} زيارة`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#122017] dark:bg-[#f6f8f7] text-[#f6f8f7] dark:text-[#122017] px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none z-10">
                          {day.day}: {day.visits}
                        </div>
                      </div>
                      <p className={`text-xs font-medium ${isHighest ? 'font-bold' : 'opacity-60'}`}>
                        {day.label}
                      </p>
                    </React.Fragment>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Other cards remain the same... */}
          {/* Visits by Physician */}
          <Card className="rounded-xl border-[#122017]/10 dark:border-[#f6f8f7]/10 bg-white dark:bg-[#122017]">
            <CardContent className="p-3 md:p-6 flex flex-col gap-2">
              <p className="text-sm md:text-base font-medium">الزيارات حسب الطبيب</p>
              <div className="grid min-h-[120px] md:min-h-[180px] grid-flow-col gap-2 grid-rows-[1fr_auto] items-end justify-items-center pt-2">
                {visitsByDoctor.map((doctor, i) => {
                  const maxVisits = Math.max(...visitsByDoctor.map(d => d.visits));
                  const isHighest = doctor.visits === maxVisits;
                  return (
                    <React.Fragment key={i}>
                      <div
                        className={`w-full rounded-t relative group ${isHighest ? 'bg-[#38e079]' : 'bg-[#38e079]/20'} cursor-pointer transition-all hover:opacity-80`}
                        style={{ height: `${doctor.percentage}%` }}
                        title={`${doctor.name}: ${doctor.visits} زيارة`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#122017] dark:bg-[#f6f8f7] text-[#f6f8f7] dark:text-[#122017] px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none z-10">
                          {doctor.name}: {doctor.visits}
                        </div>
                      </div>
                      <p className={`text-xs font-medium ${isHighest ? 'font-bold' : 'opacity-60'}`}>
                        {doctor.label}
                      </p>
                    </React.Fragment>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Visits by Area */}
          <Card className="rounded-xl border-[#122017]/10 dark:border-[#f6f8f7]/10 bg-white dark:bg-[#122017]">
            <CardContent className="p-3 md:p-6 flex flex-col gap-2">
              <p className="text-sm md:text-base font-medium">الزيارات حسب المنطقة</p>
              <div className="grid min-h-[120px] md:min-h-[180px] grid-flow-col gap-2 grid-rows-[1fr_auto] items-end justify-items-center pt-2">
                {visitsByArea.map((area, i) => {
                  const maxVisits = Math.max(...visitsByArea.map(a => a.visits));
                  const isHighest = area.visits === maxVisits;
                  return (
                    <React.Fragment key={i}>
                      <div
                        className={`w-full rounded-t relative group ${isHighest ? 'bg-[#38e079]' : 'bg-[#38e079]/20'} cursor-pointer transition-all hover:opacity-80`}
                        style={{ height: `${area.percentage}%` }}
                        title={`${area.name}: ${area.visits} زيارة`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#122017] dark:bg-[#f6f8f7] text-[#f6f8f7] dark:text-[#122017] px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none z-10">
                          {area.name}: {area.visits}
                        </div>
                      </div>
                      <p className={`text-xs font-medium ${isHighest ? 'font-bold' : 'opacity-60'}`}>
                        {area.label}
                      </p>
                    </React.Fragment>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Visits by Product */}
          <Card className="rounded-xl border-[#122017]/10 dark:border-[#f6f8f7]/10 bg-white dark:bg-[#122017]">
            <CardContent className="p-3 md:p-6 flex flex-col gap-2">
              <p className="text-sm md:text-base font-medium">الزيارات حسب المنتج</p>
              <div className="grid min-h-[120px] md:min-h-[180px] grid-flow-col gap-2 grid-rows-[1fr_auto] items-end justify-items-center pt-2">
                {visitsByProduct.map((product, i) => {
                  const maxVisits = Math.max(...visitsByProduct.map(p => p.visits));
                  const isHighest = product.visits === maxVisits;
                  return (
                    <React.Fragment key={i}>
                      <div
                        className={`w-full rounded-t relative group ${isHighest ? 'bg-[#38e079]' : 'bg-[#38e079]/20'} cursor-pointer transition-all hover:opacity-80`}
                        style={{ height: `${product.percentage}%` }}
                        title={`${product.name}: ${product.visits} زيارة`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#122017] dark:bg-[#f6f8f7] text-[#f6f8f7] dark:text-[#122017] px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none z-10">
                          {product.name}: {product.visits}
                        </div>
                      </div>
                      <p className={`text-xs font-medium ${isHighest ? 'font-bold' : 'opacity-60'}`}>
                        {product.label}
                      </p>
                    </React.Fragment>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Visits by Clinic */}
          <Card className="rounded-xl border-[#122017]/10 dark:border-[#f6f8f7]/10 bg-white dark:bg-[#122017]">
            <CardContent className="p-3 md:p-6 flex flex-col gap-2">
              <p className="text-sm md:text-base font-medium">الزيارات حسب العيادة</p>
              <div className="grid min-h-[120px] md:min-h-[180px] grid-flow-col gap-2 grid-rows-[1fr_auto] items-end justify-items-center pt-2">
                {visitsByClinic.map((clinic, i) => {
                  const maxVisits = Math.max(...visitsByClinic.map(c => c.visits));
                  const isHighest = clinic.visits === maxVisits;
                  return (
                    <React.Fragment key={i}>
                      <div
                        className={`w-full rounded-t relative group ${isHighest ? 'bg-[#38e079]' : 'bg-[#38e079]/20'} cursor-pointer transition-all hover:opacity-80`}
                        style={{ height: `${clinic.percentage}%` }}
                        title={`${clinic.name}: ${clinic.visits} زيارة`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#122017] dark:bg-[#f6f8f7] text-[#f6f8f7] dark:text-[#122017] px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none z-10">
                          {clinic.name}: {clinic.visits}
                        </div>
                      </div>
                      <p className={`text-xs font-medium ${isHighest ? 'font-bold' : 'opacity-60'}`}>
                        {clinic.label}
                      </p>
                    </React.Fragment>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Visits by Time - 7th Chart */}
          <Card className="rounded-xl border-[#122017]/10 dark:border-[#f6f8f7]/10 bg-white dark:bg-[#122017]">
            <CardContent className="p-3 md:p-6 flex flex-col gap-2">
              <p className="text-sm md:text-base font-medium">الزيارات حسب الوقت</p>
              <div className="grid min-h-[120px] md:min-h-[180px] grid-flow-col gap-2 grid-rows-[1fr_auto] items-end justify-items-center pt-2">
                {visitsByTime.map((time, i) => {
                  const maxVisits = Math.max(...visitsByTime.map(t => t.visits));
                  const isHighest = time.visits === maxVisits;
                  return (
                    <React.Fragment key={i}>
                      <div
                        className={`w-full rounded-t relative group ${isHighest ? 'bg-[#38e079]' : 'bg-[#38e079]/20'} cursor-pointer transition-all hover:opacity-80`}
                        style={{ height: `${time.percentage}%` }}
                        title={`${time.time}: ${time.visits} زيارة`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#122017] dark:bg-[#f6f8f7] text-[#f6f8f7] dark:text-[#122017] px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none z-10">
                          {time.time}: {time.visits}
                        </div>
                      </div>
                      <p className={`text-xs font-medium ${isHighest ? 'font-bold' : 'opacity-60'}`}>
                        {time.label}
                      </p>
                    </React.Fragment>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Physicians Classifications - Donut Chart */}
          <Card className="rounded-xl border-[#122017]/10 dark:border-[#f6f8f7]/10 bg-white dark:bg-[#122017]">
            <CardContent className="p-3 md:p-6 flex flex-col gap-2">
              <p className="text-sm md:text-base font-medium">تصنيفات الأطباء</p>
              <div className="min-h-[120px] md:min-h-[180px] flex items-center justify-center">
                <div className="relative w-28 h-28 md:w-40 md:h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      className="stroke-[#38e079]/20"
                      cx="18"
                      cy="18"
                      fill="none"
                      r="15.91549430918954"
                      strokeWidth="4"
                    />
                    {doctorClassifications.map((classification, idx) => {
                      const offset = idx === 0 ? 0 : doctorClassifications.slice(0, idx).reduce((sum, c) => sum + c.percentage, 0);
                      return (
                        <circle
                          key={idx}
                          className="cursor-pointer transition-all hover:opacity-80"
                          style={{ stroke: classification.color }}
                          cx="18"
                          cy="18"
                          fill="none"
                          r="15.91549430918954"
                          strokeDasharray={`${classification.percentage}, 100`}
                          strokeDashoffset={`-${offset}`}
                          strokeWidth="4"
                        >
                          <title>فئة {classification.category}: {classification.count} ({classification.percentage}%)</title>
                        </circle>
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs md:text-sm font-bold">
                      {doctorClassifications.reduce((sum, c) => sum + c.count, 0)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-3 flex-wrap mt-2">
                {doctorClassifications.map((classification, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: classification.color }}></div>
                    <span className="text-xs">فئة {classification.category}: {classification.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Visits - Mobile Cards (First 5) */}
        <div className="md:hidden space-y-3">
          <h3 className="text-lg font-bold px-4">الزيارات الأخيرة</h3>
          {recentVisits.slice(0, 5).map((visit) => (
            <div key={visit.id} className="bg-[#f6f8f7] dark:bg-[#122017] p-3 rounded-lg border border-[#122017]/10 dark:border-[#f6f8f7]/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold">#{visit.id}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  visit.status === 'مكتملة'
                    ? 'bg-[#38e079]/20 text-[#38e079]'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {visit.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <div>
                  <span className="text-muted-foreground">الطبيب:</span>
                  <span className="font-medium mr-1">{visit.doctor}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">العيادة:</span>
                  <span className="font-medium mr-1">{visit.clinic}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">التاريخ:</span>
                  <span className="font-medium mr-1">{visit.date}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">الوقت:</span>
                  <span className="font-medium mr-1">{visit.time}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">المنتج:</span>
                  <span className="font-medium mr-1">{visit.product}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Visits Table - Desktop */}
        <Card className="hidden md:block">
          <CardContent className="p-4 md:p-6">
            <h3 className="text-lg font-bold mb-4">الزيارات الأخيرة</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#122017]/10 dark:border-[#f6f8f7]/10">
                    <th className="text-right py-3 px-4 font-semibold">#</th>
                    <th className="text-right py-3 px-4 font-semibold">الطبيب</th>
                    <th className="text-right py-3 px-4 font-semibold">العيادة</th>
                    <th className="text-right py-3 px-4 font-semibold">التاريخ</th>
                    <th className="text-right py-3 px-4 font-semibold">الوقت</th>
                    <th className="text-right py-3 px-4 font-semibold">المنتج</th>
                    <th className="text-right py-3 px-4 font-semibold">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVisits.map((visit) => (
                    <tr key={visit.id} className="border-b border-[#122017]/10 dark:border-[#f6f8f7]/10 hover:bg-[#38e079]/5 transition-colors">
                      <td className="py-3 px-4 font-medium">{visit.id}</td>
                      <td className="py-3 px-4">{visit.doctor}</td>
                      <td className="py-3 px-4">{visit.clinic}</td>
                      <td className="py-3 px-4">{visit.date}</td>
                      <td className="py-3 px-4">{visit.time}</td>
                      <td className="py-3 px-4">{visit.product}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          visit.status === 'مكتملة'
                            ? 'bg-[#38e079]/20 text-[#38e079] dark:bg-[#38e079]/30 dark:text-[#38e079]'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {visit.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/doctor-card/${visit.doctorId}`)}
                          className="h-8 gap-2 hover:bg-[#38e079]/10 hover:text-[#38e079]"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="text-xs">عرض الطبيب</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;