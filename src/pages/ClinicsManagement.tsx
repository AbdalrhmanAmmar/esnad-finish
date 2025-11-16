import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Building2, Stethoscope, Filter, Loader2, RefreshCw, MapPin, Tag, Package, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Mock data interfaces
interface ClinicVisit {
  _id: string;
  visitDate: string;
  doctorName: string;
  specialty: string;
  classification: string;
  brand: string;
  clinicName: string;
  product1: string;
  product2: string;
  product3: string;
  notes?: string;
}

// Mock data
const mockClinicVisits: ClinicVisit[] = [
  {
    _id: '1',
    visitDate: '2024-01-15',
    doctorName: 'د. أحمد محمد',
    specialty: 'قلب',
    classification: 'A',
    brand: 'Brand A',
    clinicName: 'عيادة القلب المتخصصة',
    product1: 'منتج القلب 1',
    product2: 'منتج القلب 2',
    product3: 'منتج القلب 3',
    notes: 'زيارة ناجحة'
  },
  {
    _id: '2',
    visitDate: '2024-01-16',
    doctorName: 'د. فاطمة علي',
    specialty: 'أطفال',
    classification: 'B',
    brand: 'Brand B',
    clinicName: 'عيادة الأطفال الحديثة',
    product1: 'منتج الأطفال 1',
    product2: 'منتج الأطفال 2',
    product3: 'منتج الأطفال 3',
    notes: 'متابعة دورية'
  },
  {
    _id: '3',
    visitDate: '2024-01-17',
    doctorName: 'د. محمد حسن',
    specialty: 'جراحة',
    classification: 'A',
    brand: 'Brand C',
    clinicName: 'مركز الجراحة المتقدمة',
    product1: 'منتج الجراحة 1',
    product2: 'منتج الجراحة 2',
    product3: 'منتج الجراحة 3',
    notes: 'عرض منتجات جديدة'
  },
  {
    _id: '4',
    visitDate: '2024-01-18',
    doctorName: 'د. سارة أحمد',
    specialty: 'نساء وولادة',
    classification: 'B',
    brand: 'Brand A',
    clinicName: 'عيادة النساء والولادة',
    product1: 'منتج النساء 1',
    product2: 'منتج النساء 2',
    product3: 'منتج النساء 3',
    notes: 'تدريب على المنتجات'
  },
  {
    _id: '5',
    visitDate: '2024-01-19',
    doctorName: 'د. خالد محمود',
    specialty: 'عظام',
    classification: 'A',
    brand: 'Brand B',
    clinicName: 'مركز العظام الطبي',
    product1: 'منتج العظام 1',
    product2: 'منتج العظام 2',
    product3: 'منتج العظام 3',
    notes: 'اجتماع تقييم'
  }
];

function ClinicsManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState<ClinicVisit[]>(mockClinicVisits);
  const [filteredVisits, setFilteredVisits] = useState<ClinicVisit[]>(mockClinicVisits);
  
  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedClassification, setSelectedClassification] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [selectedProduct1, setSelectedProduct1] = useState('all');
  const [selectedProduct2, setSelectedProduct2] = useState('all');
  const [selectedProduct3, setSelectedProduct3] = useState('all');

  // Get unique values for filters
  const uniqueDoctors = [...new Set(visits.map(visit => visit.doctorName))];
  const uniqueSpecialties = [...new Set(visits.map(visit => visit.specialty))];
  const uniqueClassifications = [...new Set(visits.map(visit => visit.classification))];
  const uniqueBrands = [...new Set(visits.map(visit => visit.brand))];
  const uniqueClinics = [...new Set(visits.map(visit => visit.clinicName))];
  const uniqueProducts1 = [...new Set(visits.map(visit => visit.product1))];
  const uniqueProducts2 = [...new Set(visits.map(visit => visit.product2))];
  const uniqueProducts3 = [...new Set(visits.map(visit => visit.product3))];

  // Apply filters
  useEffect(() => {
    let filtered = visits;

    // Date filter
    if (fromDate) {
      filtered = filtered.filter(visit => new Date(visit.visitDate) >= new Date(fromDate));
    }
    if (toDate) {
      filtered = filtered.filter(visit => new Date(visit.visitDate) <= new Date(toDate));
    }

    // Other filters
    if (selectedDoctor !== 'all') {
      filtered = filtered.filter(visit => visit.doctorName === selectedDoctor);
    }
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(visit => visit.specialty === selectedSpecialty);
    }
    if (selectedClassification !== 'all') {
      filtered = filtered.filter(visit => visit.classification === selectedClassification);
    }
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(visit => visit.brand === selectedBrand);
    }
    if (selectedClinic !== 'all') {
      filtered = filtered.filter(visit => visit.clinicName === selectedClinic);
    }
    if (selectedProduct1 !== 'all') {
      filtered = filtered.filter(visit => visit.product1 === selectedProduct1);
    }
    if (selectedProduct2 !== 'all') {
      filtered = filtered.filter(visit => visit.product2 === selectedProduct2);
    }
    if (selectedProduct3 !== 'all') {
      filtered = filtered.filter(visit => visit.product3 === selectedProduct3);
    }

    setFilteredVisits(filtered);
  }, [visits, fromDate, toDate, selectedDoctor, selectedSpecialty, selectedClassification, selectedBrand, selectedClinic, selectedProduct1, selectedProduct2, selectedProduct3]);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setVisits(mockClinicVisits);
      setLoading(false);
      toast.success('تم تحديث البيانات بنجاح');
    }, 1000);
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setSelectedDoctor('all');
    setSelectedSpecialty('all');
    setSelectedClassification('all');
    setSelectedBrand('all');
    setSelectedClinic('all');
    setSelectedProduct1('all');
    setSelectedProduct2('all');
    setSelectedProduct3('all');
    toast.success('تم مسح جميع الفلاتر');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSpecialtyBadgeVariant = (specialty: string) => {
    const specialtyColors: { [key: string]: any } = {
      'قلب': 'destructive',
      'أطفال': 'secondary',
      'نساء وولادة': 'outline',
      'عظام': 'default',
      'جراحة': 'destructive',
      'جلدية': 'secondary',
      'عيون': 'outline'
    };
    
    const variant = specialtyColors[specialty] || 'outline';
    return <Badge variant={variant}>{specialty}</Badge>;
  };

  const getClassificationBadgeVariant = (classification: string) => {
    const classificationColors: { [key: string]: any } = {
      'A': 'default',
      'B': 'secondary',
      'C': 'outline'
    };
    
    const variant = classificationColors[classification] || 'outline';
    return <Badge variant={variant}>{classification}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم العيادات</h1>
            <p className="text-gray-600">إدارة ومتابعة زيارات العيادات ({filteredVisits.length} زيارة)</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <RefreshCw className="h-4 w-4 ml-2" />}
            تحديث
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            <Filter className="h-4 w-4 ml-2" />
            مسح الفلاتر
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلاتر البحث
          </CardTitle>
          <CardDescription>
            استخدم الفلاتر أدناه لتصفية زيارات العيادات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Date Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
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
              <label className="text-sm font-medium flex items-center gap-2">
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
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                اختر الطبيب
              </label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأطباء" />
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
              <label className="text-sm font-medium flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                اختر التخصص
              </label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع التخصصات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التخصصات</SelectItem>
                  {uniqueSpecialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Classification Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                التصنيف
              </label>
              <Select value={selectedClassification} onValueChange={setSelectedClassification}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع التصنيفات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  {uniqueClassifications.map(classification => (
                    <SelectItem key={classification} value={classification}>{classification}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                العلامة التجارية
              </label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع العلامات التجارية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العلامات التجارية</SelectItem>
                  {uniqueBrands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clinic Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                اختر العيادة
              </label>
              <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع العيادات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العيادات</SelectItem>
                  {uniqueClinics.map(clinic => (
                    <SelectItem key={clinic} value={clinic}>{clinic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product 1 Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                المنتج الأول
              </label>
              <Select value={selectedProduct1} onValueChange={setSelectedProduct1}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المنتجات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المنتجات</SelectItem>
                  {uniqueProducts1.map(product => (
                    <SelectItem key={product} value={product}>{product}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product 2 Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                المنتج الثاني
              </label>
              <Select value={selectedProduct2} onValueChange={setSelectedProduct2}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المنتجات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المنتجات</SelectItem>
                  {uniqueProducts2.map(product => (
                    <SelectItem key={product} value={product}>{product}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product 3 Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                المنتج الثالث
              </label>
              <Select value={selectedProduct3} onValueChange={setSelectedProduct3}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المنتجات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المنتجات</SelectItem>
                  {uniqueProducts3.map(product => (
                    <SelectItem key={product} value={product}>{product}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            زيارات العيادات
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            إجمالي الزيارات المفلترة: {filteredVisits.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">تاريخ الزيارة</TableHead>
                  <TableHead className="text-right">اسم الطبيب</TableHead>
                  <TableHead className="text-right">التخصص</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-right">العلامة التجارية</TableHead>
                  <TableHead className="text-right">العيادة</TableHead>
                  <TableHead className="text-right">المنتج الأول</TableHead>
                  <TableHead className="text-right">المنتج الثاني</TableHead>
                  <TableHead className="text-right">المنتج الثالث</TableHead>
                  <TableHead className="text-right">ملاحظات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Building2 className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-500">لا توجد زيارات تطابق الفلاتر المحددة</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVisits.map((visit) => (
                    <TableRow key={visit._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(visit.visitDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{visit.doctorName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getSpecialtyBadgeVariant(visit.specialty)}</TableCell>
                      <TableCell>{getClassificationBadgeVariant(visit.classification)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{visit.brand}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{visit.clinicName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{visit.product1}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{visit.product2}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{visit.product3}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {visit.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ClinicsManagement;