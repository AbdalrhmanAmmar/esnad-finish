import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Badge } from './badge';
import { Search, Filter, X, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../../lib/utils';

export interface FilterOptions {
  search: string;
  status: string;
  salesRep: string;
  pharmacy: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface OrdersFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  salesReps?: Array<{ value: string; label: string}>;
  pharmacies?: Array<{ value: string; label: string}>;
  isLoading?: boolean;
  className?: string;
}

export const OrdersFilter: React.FC<OrdersFilterProps> = ({
  filters,
  onFiltersChange,
  salesReps = [],
  pharmacies = [],
  isLoading = false,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      salesRep: 'all',
      pharmacy: 'all',
      startDate: null,
      endDate: null
    });
  };

  const hasActiveFilters = () => {
    return (
      !!filters.search ||
      (!!filters.status && filters.status !== 'all') ||
      !!filters.salesRep ||
      !!filters.pharmacy ||
      !!filters.startDate ||
      !!filters.endDate
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.salesRep) count++;
    if (filters.pharmacy) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  };

  return (
    <Card className={cn("mb-6 shadow-lg border-0 bg-gradient-to-r from-background to-muted/20", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">فلترة الطلبيات</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                استخدم الفلاتر للبحث عن الطلبيات المطلوبة
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Badge variant="secondary" className="animate-pulse">
                {getActiveFiltersCount()} فلتر نشط
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover:bg-primary/10 transition-all duration-200"
            >
              {isExpanded ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* شريط البحث السريع */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في الطلبيات (اسم المندوب، الصيدلية...)" 
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pr-10 h-11 bg-background/50 border-2 focus:border-primary/50 transition-all duration-200"
          />
        </div>

        {/* الفلاتر المتقدمة */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border/50">
            {/* فلتر الحالة */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                حالة الطلبية
              </Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="h-11 bg-background/50 border-2 hover:border-primary/30 transition-all duration-200">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="approved">مقبولة</SelectItem>
                  <SelectItem value="rejected">مرفوضة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* فلتر المندوب */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                المندوب
              </Label>
              <Select value={filters.salesRep} onValueChange={(value) => handleFilterChange('salesRep', value)}>
                <SelectTrigger className="h-11 bg-background/50 border-2 hover:border-primary/30 transition-all duration-200">
                  <SelectValue placeholder="اختر المندوب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المندوبين</SelectItem>
                {salesReps.map(rep => (
      <SelectItem key={rep.value} value={rep.value}>
        {rep.label}
      </SelectItem>
    ))}
                </SelectContent>
              </Select>
            </div>

            {/* فلتر الصيدلية */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                الصيدلية
              </Label>
              <Select value={filters.pharmacy} onValueChange={(value) => handleFilterChange('pharmacy', value)}>
                <SelectTrigger className="h-11 bg-background/50 border-2 hover:border-primary/30 transition-all duration-200">
                  <SelectValue placeholder="اختر الصيدلية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الصيدليات</SelectItem>
               {pharmacies.map(pharmacy => (
      <SelectItem key={pharmacy.value} value={pharmacy.value}>
        {pharmacy.label}
      </SelectItem>
    ))}
                </SelectContent>
              </Select>
            </div>

            {/* فلتر تاريخ البداية */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                من تاريخ
              </Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-11 w-full justify-start text-right font-normal bg-background/50 border-2 hover:border-primary/30 transition-all duration-200",
                      !filters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {filters.startDate ? (
                      format(filters.startDate, "PPP", { locale: ar })
                    ) : (
                      "اختر تاريخ البداية"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate || undefined}
                    onSelect={(date) => {
                      handleFilterChange('startDate', date || null);
                      setStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* فلتر تاريخ النهاية */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                إلى تاريخ
              </Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-11 w-full justify-start text-right font-normal bg-background/50 border-2 hover:border-primary/30 transition-all duration-200",
                      !filters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {filters.endDate ? (
                      format(filters.endDate, "PPP", { locale: ar })
                    ) : (
                      "اختر تاريخ النهاية"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate || undefined}
                    onSelect={(date) => {
                      handleFilterChange('endDate', date || null);
                      setEndDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* زر مسح الفلاتر */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold opacity-0">إجراءات</Label>
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!hasActiveFilters() || isLoading}
                className="h-11 w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
              >
                <RotateCcw className="ml-2 h-4 w-4" />
                مسح جميع الفلاتر
              </Button>
            </div>
          </div>
        )}

        {/* عرض الفلاتر النشطة */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
            <Label className="text-sm font-semibold mb-2 w-full">الفلاتر النشطة:</Label>
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                البحث: {filters.search}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleFilterChange('search', '')}
                />
              </Badge>
            )}
            {filters.status && filters.status !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                الحالة: {filters.status === 'pending' ? 'في الانتظار' : 
                        filters.status === 'approved' ? 'مقبولة' : 'مرفوضة'}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleFilterChange('status', 'all')}
                />
              </Badge>
            )}
            {filters.startDate && (
              <Badge variant="secondary" className="gap-1">
                من: {format(filters.startDate, "dd/MM/yyyy")}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleFilterChange('startDate', null)}
                />
              </Badge>
            )}
            {filters.endDate && (
              <Badge variant="secondary" className="gap-1">
                إلى: {format(filters.endDate, "dd/MM/yyyy")}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleFilterChange('endDate', null)}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersFilter;