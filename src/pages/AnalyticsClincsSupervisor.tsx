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
  RadialLinearScale,
} from 'chart.js';
import { Line, Doughnut, Bar, Radar } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TrendingUp, Users, Activity, DollarSign, Download, Calendar, Building2, Stethoscope, Filter, RefreshCw, Tag, Package, User, Trophy, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getVisitsBySupervisor, SupervisorVisit, SupervisorVisitsResponse, GetVisitsBySupervisorParams } from '@/api/Visits';
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
  Filler,
  RadialLinearScale
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

// Mock data for analytics


const AnalyticsClincsSupervisor: React.FC = () => {
  const navigate = useNavigate();
    const user = useAuthStore();
    const id = user.user?._id;
  
  // Data states
  const [visits, setVisits] = useState<ProcessedVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<ProcessedVisit[]>([]);
  const [analyticsData, setAnalyticsData] = useState<SupervisorVisitsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [supervisorId, setSupervisorId] = useState(id); // Default supervisor ID
  
  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedMedicalRep, setSelectedMedicalRep] = useState('all'); // New filter for medical rep
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(50);
  const [exportLoading, setExportLoading] = useState(false);

  // Process raw API data to display format
  const processVisitsData = (rawVisits: SupervisorVisit[]): ProcessedVisit[] => {
    return rawVisits.map(visit => ({
      _id: visit._id,
      visitDate: new Date(visit.visitDate).toLocaleDateString('ar-SA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        calendar: 'gregory' 
      }),
      doctorName: visit.doctor.name,
      specialty: 'غير محدد', // Default value since specialty is not in new structure
      clinicName: visit.doctor.organizationName,
      classification: 'غير محدد', // Default value since classification is not in new structure
      brand: visit.products.length > 0 ? visit.products[0].brand : 'غير محدد',
      products: visit.products.map(p => p.productName),
      samplesCount: visit.products.reduce((sum, p) => sum + p.samplesCount, 0),
      notes: visit.notes,
      medicalRepName: visit.medicalRep.name,
      teamArea: visit.doctor.city, // Using city as team area
      teamProducts: visit.products.map(p => p.brand).join(', '),
      doctorId: visit.doctor._id
    }));
  };

  // Get unique values for filters
  const uniqueDoctors = [...new Set(visits.map(visit => visit.doctorName))];
  const uniqueMedicalReps = [...new Set(visits.map(visit => visit.medicalRepName))];
  const uniqueSpecialties = [...new Set(visits.map(visit => visit.specialty))];
  const uniqueSegments = [...new Set(visits.map(visit => visit.classification))];
  const uniqueBrands = [...new Set(visits.map(visit => visit.brand))];
  const uniqueClinics = [...new Set(visits.map(visit => visit.clinicName))];
  const uniqueProducts = [...new Set(visits.flatMap(visit => visit.products))];

  // Fetch data from API
  const fetchVisitsData = async () => {
    setLoading(true);
    try {
      const params: GetVisitsBySupervisorParams = {
        page: currentPage,
        limit: pageLimit,
        startDate: fromDate || undefined,
        endDate: toDate || undefined,
        doctorName: selectedDoctor !== 'all' ? selectedDoctor : undefined,
        medicalRepName: selectedMedicalRep !== 'all' ? selectedMedicalRep : undefined,
        specialization: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
        segment: selectedSegment !== 'all' ? selectedSegment : undefined,
        clinic: selectedClinic !== 'all' ? selectedClinic : undefined,
        brand: selectedBrand !== 'all' ? selectedBrand : undefined,
        products: selectedProducts.length > 0 ? selectedProducts : undefined
      };

      const response = await getVisitsBySupervisor(supervisorId, params);
      console.log(response.data, "response")
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
  }, [supervisorId, currentPage, fromDate, toDate, selectedDoctor, selectedMedicalRep, selectedSpecialty, selectedSegment, selectedBrand, selectedClinic, selectedProducts]);

  // Apply local filters (for immediate UI response)
  useEffect(() => {
    let filtered = visits;

    // Apply local filters for immediate UI response
    if (selectedDoctor !== 'all') {
      filtered = filtered.filter(visit => visit.doctorName === selectedDoctor);
    }
    
    if (selectedMedicalRep !== 'all') {
      filtered = filtered.filter(visit => visit.medicalRepName === selectedMedicalRep);
    }
    
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(visit => visit.specialty === selectedSpecialty);
    }
    
    if (selectedSegment !== 'all') {
      filtered = filtered.filter(visit => visit.classification === selectedSegment);
    }
    
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(visit => visit.brand === selectedBrand);
    }
    
    if (selectedClinic !== 'all') {
      filtered = filtered.filter(visit => visit.clinicName === selectedClinic);
    }
    
    if (selectedProducts.length > 0) {
      filtered = filtered.filter(visit => 
        visit.products.some(product => selectedProducts.includes(product))
      );
    }
    
    if (fromDate) {
      filtered = filtered.filter(visit => {
        const visitDate = new Date(visit.visitDate);
        const filterDate = new Date(fromDate);
        return visitDate >= filterDate;
      });
    }
    
    if (toDate) {
      filtered = filtered.filter(visit => {
        const visitDate = new Date(visit.visitDate);
        const filterDate = new Date(toDate);
        return visitDate <= filterDate;
      });
    }

    setFilteredVisits(filtered);
  }, [visits, selectedDoctor, selectedMedicalRep, selectedSpecialty, selectedSegment, selectedBrand, selectedClinic, selectedProducts, fromDate, toDate]);

  const handleRefresh = () => {
    fetchVisitsData();
    toast.success('تم تحديث البيانات بنجاح');
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setSelectedDoctor('all');
    setSelectedMedicalRep('all');
    setSelectedSpecialty('all');
    setSelectedSegment('all');
    setSelectedBrand('all');
    setSelectedClinic('all');
    setSelectedProducts([]);
    setSelectedPeriod('daily');
    setCurrentPage(1);
    toast.success('تم مسح جميع الفلاتر');
  };

  // Export visits to Excel
  const handleExportToExcel = async () => {
    try {
      setExportLoading(true);
      
      // Create CSV content from filtered visits
      const csvContent = [
        // Header row
        ['التاريخ', 'الطبيب', 'العيادة', 'الشريحة', 'التخصص', 'المنتجات', 'عدد العينات', 'المندوب'].join(','),
        // Data rows
        ...filteredVisits.map(visit => [
          visit.visitDate,
          visit.doctorName,
          visit.clinicName,
          visit.classification,
          visit.specialty,
          visit.products.join('; '),
          visit.samplesCount,
          visit.medicalRepName
        ].join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const dateRange = fromDate && toDate ? `_${fromDate}_to_${toDate}` : `_${currentDate}`;
      link.download = `visits_report${dateRange}.csv`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تصدير التقرير بنجاح');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('حدث خطأ أثناء تصدير التقرير');
    } finally {
      setExportLoading(false);
    }
  };

  // Calculate product performance from real data
  const productPerformanceData = () => {
    const productStats = uniqueProducts.map(product => {
      const productVisits = visits.filter(visit => visit.products.includes(product));
      const totalSamples = productVisits.reduce((sum, visit) => sum + visit.samplesCount, 0);
      const avgSamples = productVisits.length > 0 ? Math.round(totalSamples / productVisits.length) : 0;
      const satisfaction = Math.min(95, Math.max(70, 75 + Math.random() * 20)); // تقدير رضا العملاء
      
      return {
        product,
        visits: productVisits.length,
        samples: totalSamples,
        avgSamples,
        satisfaction: Math.round(satisfaction)
      };
    }).sort((a, b) => b.samples - a.samples);
    
    return {
      labels: productStats.map(p => p.product),
      sales: productStats.map(p => p.avgSamples),
      satisfaction: productStats.map(p => p.satisfaction)
    };
  };

  // Calculate analytics data from real visits data
  const calculateAnalyticsData = () => {
    if (!visits || !visits.length) {
      return {
        kpis: {
          totalVisits: 0,
          totalRevenue: 0,
          activeClinic: 0,
          avgVisitsPerDay: 0,
          growthRate: 0,
          satisfactionRate: 0
        },
        monthlyTrends: {
          labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
          visits: Array(12).fill(0),
          revenue: Array(12).fill(0)
        },
        specialtyDistribution: {
          labels: [],
          data: []
        },
        clinicComparison: {
          labels: [],
          visits: [],
          revenue: []
        },
        productPerformance: {
          labels: [],
          sales: [],
          satisfaction: []
        },
        timeAnalysis: {
          labels: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
          visits: Array(10).fill(0)
        }
      };
    }

    const totalVisits = visits.length;
    const totalSamples = visits.reduce((sum, visit) => sum + visit.samplesCount, 0);
    const totalRevenue = totalSamples * 50; // تقدير الإيرادات
    const activeClinic = uniqueClinics.length;
    const avgVisitsPerDay = totalVisits > 0 ? Math.round((totalVisits / 30) * 10) / 10 : 0;

    // Calculate monthly trends
    const monthlyData = Array(12).fill(0).map(() => ({ visits: 0, revenue: 0 }));
    visits.forEach(visit => {
      const date = new Date(visit.visitDate);
      const month = date.getMonth();
      monthlyData[month].visits += 1;
      monthlyData[month].revenue += visit.samplesCount * 50;
    });

    // Calculate specialty distribution
    const specialtyCount: { [key: string]: number } = {};
    visits.forEach(visit => {
      const specialty = visit.specialty || 'غير محدد';
      specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
    });

    return {
      kpis: {
        totalVisits,
        totalRevenue,
        activeClinic,
        avgVisitsPerDay,
        growthRate: 12.5, // Default value
        satisfactionRate: 94.2 // Default value
      },
      monthlyTrends: {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        visits: monthlyData.map(m => m.visits),
        revenue: monthlyData.map(m => m.revenue)
      },
      specialtyDistribution: {
        labels: Object.keys(specialtyCount),
        data: Object.values(specialtyCount)
      },
      clinicComparison: {
        labels: uniqueClinics.slice(0, 5),
        visits: uniqueClinics.slice(0, 5).map(clinic => 
          visits.filter(v => v.clinicName === clinic).length
        ),
        revenue: uniqueClinics.slice(0, 5).map(clinic => 
          visits.filter(v => v.clinicName === clinic).reduce((sum, v) => sum + v.samplesCount, 0) * 50
        )
      },
      productPerformance: productPerformanceData(),
      timeAnalysis: {
        labels: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
        visits: Array(10).fill(0) // Default empty data
      }
    };
  };

  // Get calculated analytics data with error handling
  const calculatedAnalyticsData = React.useMemo(() => {
    try {
      return calculateAnalyticsData();
    } catch (error) {
      console.error('Error calculating analytics data:', error);
      // Return default empty data structure
      return {
        kpis: {
          totalVisits: 0,
          totalRevenue: 0,
          activeClinic: 0,
          avgVisitsPerDay: 0,
          growthRate: 0,
          satisfactionRate: 0
        },
        monthlyTrends: {
          labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
          visits: Array(12).fill(0),
          revenue: Array(12).fill(0)
        },
        specialtyDistribution: {
          labels: [],
          data: []
        },
        clinicComparison: {
          labels: [],
          visits: [],
          revenue: []
        },
        productPerformance: {
          labels: [],
          sales: [],
          satisfaction: []
        },
        timeAnalysis: {
          labels: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
          visits: Array(10).fill(0)
        }
      };
    }
  }, [visits, filteredVisits]);

  // Chart options with RTL support and professional styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          font: {
            family: 'Cairo, sans-serif',
            size: 12
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: 'Cairo, sans-serif',
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Cairo, sans-serif',
          size: 12
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            family: 'Cairo, sans-serif',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            family: 'Cairo, sans-serif',
            size: 11
          }
        }
      }
    }
  };

  // Monthly trends chart data
  const monthlyTrendsData = {
    labels: calculatedAnalyticsData.monthlyTrends.labels,
    datasets: [
      {
        label: 'عدد الزيارات',
        data: calculatedAnalyticsData.monthlyTrends.visits,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      },
      {
        label: 'الإيرادات (بالآلاف)',
        data: calculatedAnalyticsData.monthlyTrends.revenue.map(r => r / 1000),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  };

  // Specialty distribution chart data
  const specialtyData = {
    labels: calculatedAnalyticsData.specialtyDistribution.labels,
    datasets: [
      {
        data: calculatedAnalyticsData.specialtyDistribution.data,
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#06b6d4',
          '#84cc16'
        ],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4
      }
    ]
  };

  // Clinic comparison chart data
  const clinicComparisonData = {
    labels: calculatedAnalyticsData.clinicComparison.labels,
    datasets: [
      {
        label: 'عدد الزيارات',
        data: calculatedAnalyticsData.clinicComparison.visits,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      },
      {
          label: 'الإيرادات المقدرة (بالآلاف)',
          data: calculatedAnalyticsData.clinicComparison.revenue.map(r => r / 1000),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };



  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تحليلات العيادات المتقدمة</h1>
          <p className="text-gray-600">لوحة تحكم شاملة لمراقبة أداء العيادات والإحصائيات التفصيلية</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
          <Button onClick={clearFilters} variant="outline" size="sm">
            <Filter className="h-4 w-4 ml-2" />
            مسح الفلاتر
          </Button>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">يومي</SelectItem>
              <SelectItem value="weekly">أسبوعي</SelectItem>
              <SelectItem value="monthly">شهري</SelectItem>
              <SelectItem value="yearly">سنوي</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleExportToExcel} 
            disabled={exportLoading}
            variant="outline" 
            className="gap-2"
          >
            <Download className={`h-4 w-4 ${exportLoading ? 'animate-spin' : ''}`} />
            {exportLoading ? 'جاري التصدير...' : 'تصدير إلى CSV'}
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="p-6 shadow-lg border-0">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">فلاتر البحث المتقدمة</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4" />
              من تاريخ
            </label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4" />
              إلى تاريخ
            </label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Doctor Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <User className="h-4 w-4" />
              الطبيب
            </label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
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

          {/* Medical Rep Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <User className="h-4 w-4" />
              المندوب الطبي
            </label>
            <Select value={selectedMedicalRep} onValueChange={setSelectedMedicalRep}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المندوب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المندوبين</SelectItem>
                {uniqueMedicalReps.map(rep => (
                  <SelectItem key={rep} value={rep}>{rep}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specialty Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Stethoscope className="h-4 w-4" />
              التخصص
            </label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
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



          {/* Segment Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Tag className="h-4 w-4" />
              الشريحة
            </label>
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الشريحة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الشرائح</SelectItem>
                {uniqueSegments.map(segment => (
                  <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clinic Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Building2 className="h-4 w-4" />
              العيادة
            </label>
            <Select value={selectedClinic} onValueChange={setSelectedClinic}>
              <SelectTrigger>
                <SelectValue placeholder="اختر العيادة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع العيادات</SelectItem>
                {uniqueClinics.map(clinic => (
                  <SelectItem key={clinic} value={clinic}>{clinic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Tag className="h-4 w-4" />
              العلامة التجارية
            </label>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger>
                <SelectValue placeholder="اختر العلامة التجارية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع العلامات التجارية</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Package className="h-4 w-4" />
              المنتجات
            </label>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id="all-products"
                    checked={selectedProducts.length === 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedProducts([]);
                      }
                    }}
                  />
                  <label htmlFor="all-products" className="text-sm font-medium">
                    جميع المنتجات
                  </label>
                </div>
                {uniqueProducts.map(product => (
                  <div key={product} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id={`product-${product}`}
                      checked={selectedProducts.includes(product)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProducts(prev => [...prev, product]);
                        } else {
                          setSelectedProducts(prev => prev.filter(p => p !== product));
                        }
                      }}
                    />
                    <label htmlFor={`product-${product}`} className="text-sm">
                      {product}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Filter Summary */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">
            عرض <span className="font-semibold text-blue-600">{filteredVisits.length}</span> من أصل <span className="font-semibold text-blue-600">{visits.length}</span> زيارة
          </p>
        </div>
      </Card>

      {/* New Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctors Performance Chart */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              أداء الأطباء
            </CardTitle>
            <CardDescription>
              عدد الزيارات لكل طبيب - {uniqueDoctors.length} طبيب نشط
            </CardDescription>
          </CardHeader>
          <CardContent>
           <div className="h-80">
            <Bar 
              data={{
                  labels: uniqueDoctors,
                  datasets: [
                  {
                      label: 'عدد الزيارات',
                      data: uniqueDoctors.map(doctor => 
                        filteredVisits.filter(v => v.doctorName === doctor).length
                      ),
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 101, 101, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(6, 182, 212, 0.8)'
                      ],
                      borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 101, 101)',
                        'rgb(251, 191, 36)',
                        'rgb(139, 92, 246)',
                        'rgb(236, 72, 153)',
                        'rgb(6, 182, 212)'
                      ],
                      borderWidth: 2,
                      borderRadius: 8
                    }
                  ]
                }} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    ...chartOptions.scales,
                    x: {
                      ...chartOptions.scales.x,
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Brands Performance Chart */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-500" />
              أداء العلامات التجارية
            </CardTitle>
            <CardDescription>
              توزيع الزيارات حسب العلامة التجارية - {uniqueBrands.length} علامة تجارية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut 
                data={{
                  labels: uniqueBrands,
                  datasets: [
                    {
                      data: uniqueBrands.map(brand => 
                        filteredVisits.filter(v => v.brand === brand).length
                      ),
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 101, 101, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                      ],
                      borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 101, 101)',
                        'rgb(251, 191, 36)',
                        'rgb(139, 92, 246)'
                      ],
                      borderWidth: 3
                    }
                  ]
                }} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                          size: 12
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Representatives Performance Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Medical Reps Performance Overview */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              أداء المندوبين الطبيين
            </CardTitle>
            <CardDescription className="text-lg">
              تحليل شامل لأداء المندوبين الطبيين وإنجازاتهم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Performers */}
              <div className="lg:col-span-2">
                <div className="h-96">
                  <Bar 
                    data={{
                      labels: uniqueMedicalReps.slice(0, 10),
                      datasets: [
                        {
                          label: 'عدد الزيارات',
                          data: uniqueMedicalReps.slice(0, 10).map(rep => 
                            filteredVisits.filter(v => v.medicalRepName === rep).length
                          ),
                          backgroundColor: (ctx) => {
                            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
                            gradient.addColorStop(1, 'rgba(147, 197, 253, 0.6)');
                            return gradient;
                          },
                          borderColor: 'rgb(59, 130, 246)',
                          borderWidth: 3,
                          borderRadius: 12,
                          borderSkipped: false,
                          hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
                          hoverBorderColor: 'rgb(37, 99, 235)',
                          hoverBorderWidth: 4
                        },
                        {
                          label: 'عدد العينات الموزعة',
                          data: uniqueMedicalReps.slice(0, 10).map(rep => 
                            filteredVisits
                              .filter(v => v.medicalRepName === rep)
                              .reduce((sum, v) => sum + v.samplesCount, 0)
                          ),
                          backgroundColor: (ctx) => {
                            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.9)');
                            gradient.addColorStop(1, 'rgba(110, 231, 183, 0.6)');
                            return gradient;
                          },
                          borderColor: 'rgb(16, 185, 129)',
                          borderWidth: 3,
                          borderRadius: 12,
                          borderSkipped: false,
                          hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
                          hoverBorderColor: 'rgb(5, 150, 105)',
                          hoverBorderWidth: 4
                        }
                      ]
                    }} 
                    options={{
                      ...chartOptions,
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: true,
                          position: 'top',
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                              size: 14,
                              weight: 'bold'
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.9)',
                          titleColor: 'white',
                          bodyColor: 'white',
                          borderColor: 'rgba(59, 130, 246, 0.8)',
                          borderWidth: 2,
                          cornerRadius: 12,
                          displayColors: true,
                          callbacks: {
                            title: function(context) {
                              return `المندوب: ${context[0].label}`;
                            },
                            label: function(context) {
                              return `${context.dataset.label}: ${context.parsed.y}`;
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                              size: 12,
                              weight: 'bold'
                            }
                          }
                        },
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                          },
                          ticks: {
                            font: {
                              size: 12,
                              weight: 'bold'
                            }
                          }
                        }
                      },
                      animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart'
                      }
                    }} 
                  />
                </div>
              </div>

              {/* Performance Stats */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800">أفضل مندوب</h3>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {uniqueMedicalReps.length > 0 ? 
                      uniqueMedicalReps.reduce((best, rep) => {
                        const repVisits = filteredVisits.filter(v => v.medicalRepName === rep).length;
                        const bestVisits = filteredVisits.filter(v => v.medicalRepName === best).length;
                        return repVisits > bestVisits ? rep : best;
                      }, uniqueMedicalReps[0]) : 'لا يوجد'
                    }
                  </div>
                  <div className="text-sm text-gray-600">
                    {uniqueMedicalReps.length > 0 ? 
                      Math.max(...uniqueMedicalReps.map(rep => 
                        filteredVisits.filter(v => v.medicalRepName === rep).length
                      )) : 0
                    } زيارة
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800">متوسط الزيارات</h3>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {uniqueMedicalReps.length > 0 ? 
                      Math.round(filteredVisits.length / uniqueMedicalReps.length) : 0
                    }
                  </div>
                  <div className="text-sm text-gray-600">زيارة لكل مندوب</div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800">إجمالي العينات</h3>
                  </div>
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {filteredVisits.reduce((sum, v) => sum + v.samplesCount, 0)}
                  </div>
                  <div className="text-sm text-gray-600">عينة موزعة</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinics Performance Chart */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              أداء العيادات
            </CardTitle>
            <CardDescription>
              عدد الزيارات لكل عيادة - {uniqueClinics.length} عيادة نشطة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar 
                data={{
                  labels: uniqueClinics.slice(0, 8).map(clinic => clinic.length > 15 ? clinic.substring(0, 15) + '...' : clinic),
                  datasets: [
                    {
                      label: 'عدد الزيارات',
                      data: uniqueClinics.slice(0, 8).map(clinic => 
                        filteredVisits.filter(v => v.clinicName === clinic).length
                      ),
                      backgroundColor: (ctx) => {
                        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 400, 0);
                        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
                        gradient.addColorStop(1, 'rgba(236, 72, 153, 0.7)');
                        return gradient;
                      },
                      borderColor: 'rgb(139, 92, 246)',
                      borderWidth: 3,
                      borderRadius: 10,
                      borderSkipped: false,
                      hoverBackgroundColor: 'rgba(139, 92, 246, 1)',
                      hoverBorderColor: 'rgb(124, 58, 237)',
                      hoverBorderWidth: 4
                    }
                  ]
                }} 
                options={{
                  ...chartOptions,
                  indexAxis: 'y',
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      titleColor: 'white',
                      bodyColor: 'white',
                      borderColor: 'rgba(139, 92, 246, 0.8)',
                      borderWidth: 2,
                      cornerRadius: 12
                    }
                  },
                  animation: {
                    duration: 1500,
                    easing: 'easeInOutCubic'
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Performance Chart */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              أداء المنتجات
            </CardTitle>
            <CardDescription>
              توزيع المنتجات الأكثر طلباً - {uniqueProducts.length} منتج متاح
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut 
                data={{
                  labels: uniqueProducts.slice(0, 8),
                  datasets: [
                    {
                      data: uniqueProducts.slice(0, 8).map(product => 
                        filteredVisits.filter(v => v.products.includes(product)).length
                      ),
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.9)',
                        'rgba(16, 185, 129, 0.9)',
                        'rgba(245, 101, 101, 0.9)',
                        'rgba(251, 191, 36, 0.9)',
                        'rgba(139, 92, 246, 0.9)',
                        'rgba(236, 72, 153, 0.9)',
                        'rgba(6, 182, 212, 0.9)',
                        'rgba(34, 197, 94, 0.9)'
                      ],
                      borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 101, 101)',
                        'rgb(251, 191, 36)',
                        'rgb(139, 92, 246)',
                        'rgb(236, 72, 153)',
                        'rgb(6, 182, 212)',
                        'rgb(34, 197, 94)'
                      ],
                      borderWidth: 4,
                      hoverBorderWidth: 6,
                      hoverOffset: 15
                    }
                  ]
                }} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                          size: 12,
                          weight: 'bold'
                        },
                        generateLabels: function(chart) {
                          const data = chart.data;
                          if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label, i) => {
                              const dataset = data.datasets[0];
                              const value = dataset.data[i];
                              return {
                                text: `${label}: ${value}`,
                                fillStyle: dataset.backgroundColor[i],
                                strokeStyle: dataset.borderColor[i],
                                lineWidth: dataset.borderWidth,
                                hidden: false,
                                index: i
                              };
                            });
                          }
                          return [];
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      titleColor: 'white',
                      bodyColor: 'white',
                      borderColor: 'rgba(16, 185, 129, 0.8)',
                      borderWidth: 2,
                      cornerRadius: 12,
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} زيارة (${percentage}%)`;
                        }
                      }
                    }
                  },
                  animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 2000,
                    easing: 'easeInOutQuart'
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Representatives Comparison Chart */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-amber-50 to-orange-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            مقارنة شاملة بين المندوبين الطبيين
          </CardTitle>
          <CardDescription className="text-base">
            تحليل مفصل لأداء كل مندوب طبي مع مؤشرات الأداء الرئيسية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <Line 
              data={{
                labels: uniqueMedicalReps.slice(0, 8),
                datasets: [
                  {
                    label: 'عدد الزيارات الشهرية',
                    data: uniqueMedicalReps.slice(0, 8).map(rep => 
                      filteredVisits.filter(v => v.medicalRepName === rep).length
                    ),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 4,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 3,
                    pointRadius: 8,
                    pointHoverRadius: 12,
                    pointHoverBackgroundColor: 'rgb(37, 99, 235)',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 4
                  },
                  {
                    label: 'معدل توزيع العينات',
                    data: uniqueMedicalReps.slice(0, 8).map(rep => {
                      const repVisits = filteredVisits.filter(v => v.medicalRepName === rep);
                      const totalSamples = repVisits.reduce((sum, v) => sum + v.samplesCount, 0);
                      return repVisits.length > 0 ? Math.round(totalSamples / repVisits.length) : 0;
                    }),
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 4,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(16, 185, 129)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 3,
                    pointRadius: 8,
                    pointHoverRadius: 12,
                    pointHoverBackgroundColor: 'rgb(5, 150, 105)',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 4
                  },
                  {
                    label: 'تنوع العيادات المزارة',
                    data: uniqueMedicalReps.slice(0, 8).map(rep => {
                      const repVisits = filteredVisits.filter(v => v.medicalRepName === rep);
                      const uniqueClinicsByRep = [...new Set(repVisits.map(v => v.clinicName))];
                      return uniqueClinicsByRep.length;
                    }),
                    borderColor: 'rgb(245, 101, 101)',
                    backgroundColor: 'rgba(245, 101, 101, 0.1)',
                    borderWidth: 4,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(245, 101, 101)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 3,
                    pointRadius: 8,
                    pointHoverRadius: 12,
                    pointHoverBackgroundColor: 'rgb(220, 38, 38)',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 4
                  }
                ]
              }} 
              options={{
                ...chartOptions,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    display: true,
                    position: 'top',
                    labels: {
                      usePointStyle: true,
                      padding: 25,
                      font: {
                        size: 14,
                        weight: 'bold'
                      }
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(59, 130, 246, 0.8)',
                    borderWidth: 2,
                    cornerRadius: 15,
                    displayColors: true,
                    callbacks: {
                      title: function(context) {
                        return `المندوب الطبي: ${context[0].label}`;
                      },
                      label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y}`;
                      },
                      afterBody: function(context) {
                        const repName = context[0].label;
                        const repVisits = filteredVisits.filter(v => v.medicalRepName === repName);
                        const totalSamples = repVisits.reduce((sum, v) => sum + v.samplesCount, 0);
                        return [
                          `إجمالي العينات الموزعة: ${totalSamples}`,
                          `متوسط العينات لكل زيارة: ${repVisits.length > 0 ? (totalSamples / repVisits.length).toFixed(1) : 0}`
                        ];
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45,
                      font: {
                        size: 12,
                        weight: 'bold'
                      }
                    }
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)',
                      drawBorder: false
                    },
                    ticks: {
                      font: {
                        size: 12,
                        weight: 'bold'
                      }
                    }
                  }
                },
                animation: {
                  duration: 2500,
                  easing: 'easeInOutQuart'
                },
                interaction: {
                  intersect: false,
                  mode: 'index'
                }
              }} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Performance Chart */}

     
     

    
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
    

        {/* Specialty Distribution */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              توزيع الزيارات حسب التخصص (البيانات المفلترة)
            </CardTitle>
            <CardDescription>
              نسبة الزيارات لكل تخصص طبي - إجمالي {filteredVisits.length} زيارة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut 
                data={{
                  ...specialtyData,
                  labels: [...new Set(filteredVisits.map(v => v.specialty))],
                  datasets: [{
                    ...specialtyData.datasets[0],
                    data: [...new Set(filteredVisits.map(v => v.specialty))].map(specialty => 
                      filteredVisits.filter(v => v.specialty === specialty).length
                    )
                  }]
                }} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: 'right' as const
                    }
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Clinic Comparison */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              مقارنة أداء العيادات (البيانات المفلترة)
            </CardTitle>
            <CardDescription>
              مقارنة الزيارات والإيرادات بين العيادات المختلفة - {uniqueClinics.length} عيادة نشطة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar 
                data={{
                  labels: [...new Set(filteredVisits.map(v => v.clinicName))],
                  datasets: [
                    {
                      ...clinicComparisonData.datasets[0],
                      label: `عدد الزيارات (${filteredVisits.length} إجمالي)`,
                      data: [...new Set(filteredVisits.map(v => v.clinicName))].map(clinic => 
                        filteredVisits.filter(v => v.clinicName === clinic).length
                      )
                    },
                    {
                      ...clinicComparisonData.datasets[1],
                      label: 'الإيرادات المقدرة (بالآلاف)',
                      data: [...new Set(filteredVisits.map(v => v.clinicName))].map(clinic => 
                        Math.round(filteredVisits.filter(v => v.clinicName === clinic).length * 500 / 1000)
                      )
                    }
                  ]
                }} 
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    x: {
                      ...chartOptions.scales.x,
                      stacked: false
                    },
                    y: {
                      ...chartOptions.scales.y,
                      stacked: false
                    }
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Performance Area Chart */}

      </div>

      {/* Summary Statistics */}
 

      {/* Visits Table */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            جدول الزيارات
          </CardTitle>
          <CardDescription>
            عرض تفصيلي لجميع الزيارات المسجلة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table dir="rtl" className="w-full border-collapse border border-gray-300" >
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-right">التاريخ</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">الطبيب</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">العيادة</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">الشريحة</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">التخصص</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">المنتجات</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">عدد العينات</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">المندوب</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      لا توجد زيارات متاحة
                    </td>
                  </tr>
                ) : (
                  filteredVisits.map((visit, index) => (
                    <tr key={visit._id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {visit.visitDate}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{visit.doctorName}</td>
                      <td className="border border-gray-300 px-4 py-2">{visit.clinicName}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Badge variant="outline">{visit.classification}</Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Badge variant="secondary">{visit.specialty}</Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {visit.products.map((product, idx) => (
                            <Badge key={idx} variant="default" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <Badge variant="destructive">{visit.samplesCount}</Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{visit.medicalRepName}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex gap-2 justify-center">
                 
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/doctor-card/${visit.doctorId}`)}
                          >
                            عرض الطبيب
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsClincsSupervisor;