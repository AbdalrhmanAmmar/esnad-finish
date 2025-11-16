import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Gift,
  Users,
  Building,
  MapPin,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
  isToday,
  isWeekend
} from 'date-fns';
import { ar } from 'date-fns/locale';

// أنواع البيانات
interface Holiday {
  id: string;
  date: string;
  name: string;
  type: 'national' | 'religious' | 'custom';
  recurring: boolean;
}

interface WorkItem {
  id: string;
  projectId: string;
  projectName: string;
  taskName: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  location?: string;
  notes?: string;
}

interface WorkSettings {
  weeklyHolidays: number[];
}

// البيانات الافتراضية
const defaultHolidays: Holiday[] = [
  {
    id: '1',
    date: '2024-09-23',
    name: 'اليوم الوطني السعودي',
    type: 'national',
    recurring: true
  },
  {
    id: '2',
    date: '2024-04-10',
    name: 'عيد الفطر',
    type: 'religious',
    recurring: false
  },
  {
    id: '3',
    date: '2024-06-16',
    name: 'عيد الأضحى',
    type: 'religious',
    recurring: false
  },
  {
    id: '4',
    date: '2024-01-01',
    name: 'رأس السنة الميلادية',
    type: 'custom',
    recurring: true
  }
];

const defaultWorkSettings: WorkSettings = {
  weeklyHolidays: [5] // الجمعة
};

const mockWorkItems: WorkItem[] = [
  {
    id: '1',
    projectId: '1',
    projectName: 'برج الرياض',
    taskName: 'صب الأساسات',
    assignedTo: 'أحمد محمد',
    startDate: '2024-03-01',
    endDate: '2024-03-15',
    status: 'completed',
    priority: 'high',
    progress: 100,
    location: 'الرياض - حي الملك فهد'
  },
  {
    id: '2',
    projectId: '1',
    projectName: 'برج الرياض',
    taskName: 'هيكل خرساني',
    assignedTo: 'سارة عبدالله',
    startDate: '2024-03-10',
    endDate: '2024-04-05',
    status: 'in-progress',
    priority: 'high',
    progress: 65,
    location: 'الرياض - حي الملك فهد'
  },
  {
    id: '3',
    projectId: '2',
    projectName: 'مجمع جدة',
    taskName: 'التصميم المعماري',
    assignedTo: 'فاطمة ناصر',
    startDate: '2024-03-05',
    endDate: '2024-03-25',
    status: 'in-progress',
    priority: 'medium',
    progress: 80
  },
  {
    id: '4',
    projectId: '3',
    projectName: 'فيلا القصيم',
    taskName: 'تشطيب داخلي',
    assignedTo: 'خالد إبراهيم',
    startDate: '2024-03-20',
    endDate: '2024-04-10',
    status: 'planned',
    priority: 'medium',
    progress: 0
  }
];

const weekDays = [
  { id: 0, name: 'الأحد', short: 'أح' },
  { id: 1, name: 'الاثنين', short: 'إث' },
  { id: 2, name: 'الثلاثاء', short: 'ثل' },
  { id: 3, name: 'الأربعاء', short: 'أر' },
  { id: 4, name: 'الخميس', short: 'خم' },
  { id: 5, name: 'الجمعة', short: 'جم' },
  { id: 6, name: 'السبت', short: 'سب' }
];

const holidayTypes = [
  { value: 'national', label: 'عطلة وطنية', color: 'bg-green-100 text-green-800', icon: Star },
  { value: 'religious', label: 'عطلة دينية', color: 'bg-blue-100 text-blue-800', icon: Gift },
  { value: 'custom', label: 'عطلة مخصصة', color: 'bg-purple-100 text-purple-800', icon: CalendarIcon }
];

const statusColors = {
  planned: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  delayed: 'bg-red-100 text-red-800'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

function WorkItemCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>(defaultHolidays);
  const [workSettings, setWorkSettings] = useState<WorkSettings>(defaultWorkSettings);
  const [workItems, setWorkItems] = useState<WorkItem[]>(mockWorkItems);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newHoliday, setNewHoliday] = useState<Partial<Holiday>>({
    name: '',
    type: 'custom',
    recurring: false
  });

  // حساب أيام التقويم للشهر الحالي
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // التحقق إذا كان اليوم عطلة
  const isHoliday = (date: Date) => {
    const dayOfWeek = getDay(date);
    const isWeeklyHoliday = workSettings.weeklyHolidays.includes(dayOfWeek);
    const isCustomHoliday = holidays.some(holiday => 
      isSameDay(new Date(holiday.date), date)
    );
    return isWeeklyHoliday || isCustomHoliday;
  };

  // الحصول على معلومات العطلة ليوم معين
  const getHolidayInfo = (date: Date) => {
    const dayOfWeek = getDay(date);
    const isWeeklyHoliday = workSettings.weeklyHolidays.includes(dayOfWeek);
    const customHoliday = holidays.find(holiday => 
      isSameDay(new Date(holiday.date), date)
    );

    if (customHoliday) return customHoliday;
    if (isWeeklyHoliday) {
      return {
        name: `عطلة ${weekDays[dayOfWeek].name}`,
        type: 'weekly' as const
      };
    }
    return null;
  };

  // الحصول على مهام العمل ليوم معين
  const getWorkItemsForDate = (date: Date) => {
    return workItems.filter(item => 
      isSameDay(new Date(item.startDate), date) || 
      isSameDay(new Date(item.endDate), date) ||
      (new Date(item.startDate) <= date && new Date(item.endDate) >= date)
    );
  };

  // إحصائيات الشهر
  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const workDays = monthDays.filter(day => !isHoliday(day)).length;
    const holidayDays = monthDays.filter(day => isHoliday(day)).length;
    const totalWorkItems = workItems.filter(item => {
      const itemStart = new Date(item.startDate);
      const itemEnd = new Date(item.endDate);
      return itemStart <= monthEnd && itemEnd >= monthStart;
    }).length;

    return { workDays, holidayDays, totalDays: monthDays.length, totalWorkItems };
  }, [currentDate, holidays, workSettings, workItems]);

  // إضافة عطلة جديدة
  const handleAddHoliday = () => {
    if (!newHoliday.name || !selectedDate) return;

    const holiday: Holiday = {
      id: Date.now().toString(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      name: newHoliday.name,
      type: newHoliday.type as Holiday['type'],
      recurring: newHoliday.recurring || false
    };

    setHolidays(prev => [...prev, holiday]);
    setShowHolidayModal(false);
    setNewHoliday({ name: '', type: 'custom', recurring: false });
    setSelectedDate(null);
  };

  // تبديل العطلة الأسبوعية
  const toggleWeeklyHoliday = (dayId: number) => {
    setWorkSettings(prev => ({
      ...prev,
      weeklyHolidays: prev.weeklyHolidays.includes(dayId)
        ? prev.weeklyHolidays.filter(d => d !== dayId)
        : [...prev.weeklyHolidays, dayId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">تقويم العمل والمشاريع</h1>
              <p className="text-gray-600">إدارة مهام العمل والعطلات في مكان واحد</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                إعدادات العمل
              </button>
              <button
                onClick={() => {
                  setSelectedDate(new Date());
                  setShowHolidayModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة عطلة
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">أيام العمل</h3>
                  <p className="text-2xl font-bold text-green-600">{monthStats.workDays}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">أيام العطل</h3>
                  <p className="text-2xl font-bold text-red-600">{monthStats.holidayDays}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">إجمالي الأيام</h3>
                  <p className="text-2xl font-bold text-blue-600">{monthStats.totalDays}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">المهام النشطة</h3>
                  <p className="text-2xl font-bold text-purple-600">{monthStats.totalWorkItems}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold">
                {format(currentDate, 'MMMM yyyy', { locale: ar })}
              </h2>
              
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {weekDays.map(day => (
              <div key={day.id} className="p-4 text-center font-semibold text-gray-700">
                {day.name}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isTodayDate = isToday(day);
              const isHolidayDay = isHoliday(day);
              const holidayInfo = getHolidayInfo(day);
              const dayWorkItems = getWorkItemsForDate(day);

              return (
                <div
                  key={index}
                  className={`
                    min-h-[140px] p-2 border-b border-r cursor-pointer transition-all hover:bg-gray-50
                    ${!isCurrentMonth ? 'bg-gray-100 text-gray-400' : ''}
                    ${isTodayDate ? 'bg-blue-50 border-blue-200' : ''}
                    ${isHolidayDay ? 'bg-red-50' : ''}
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`
                      text-sm font-semibold
                      ${isTodayDate ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs' : ''}
                      ${isHolidayDay && !isTodayDate ? 'text-red-600' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>
                    
                    {isHolidayDay && holidayInfo && (
                      <div className="flex">
                        {holidayInfo.type === 'national' && <Star className="w-3 h-3 text-green-600" />}
                        {holidayInfo.type === 'religious' && <Gift className="w-3 h-3 text-blue-600" />}
                        {holidayInfo.type === 'custom' && <CalendarIcon className="w-3 h-3 text-purple-600" />}
                        {holidayInfo.type === 'weekly' && <XCircle className="w-3 h-3 text-red-600" />}
                      </div>
                    )}
                  </div>

                  {/* Holiday Info */}
                  {holidayInfo && (
                    <div className="text-xs text-gray-600 bg-white/80 rounded px-1 py-0.5 mb-1 truncate">
                      {holidayInfo.name}
                    </div>
                  )}

                  {/* Work Items */}
                  <div className="space-y-1">
                    {dayWorkItems.slice(0, 2).map(item => (
                      <div
                        key={item.id}
                        className={`text-xs p-1 rounded ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'delayed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                        title={item.taskName}
                      >
                        <div className="truncate font-medium">{item.taskName}</div>
                        <div className="flex justify-between text-[10px]">
                          <span>{item.projectName}</span>
                          <span>{item.progress}%</span>
                        </div>
                      </div>
                    ))}
                    {dayWorkItems.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayWorkItems.length - 2} مهمة أخرى
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Work Items List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* العطلات القادمة */}

        </div>
      </div>

      {/* Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">إضافة عطلة جديدة</h2>
                <button
                  onClick={() => setShowHolidayModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
                <input
                  type="date"
                  value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم العطلة</label>
                <input
                  type="text"
                  value={newHoliday.name || ''}
                  onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل اسم العطلة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع العطلة</label>
                <select
                  value={newHoliday.type || 'custom'}
                  onChange={(e) => setNewHoliday(prev => ({ ...prev, type: e.target.value as Holiday['type'] }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {holidayTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newHoliday.recurring || false}
                  onChange={(e) => setNewHoliday(prev => ({ ...prev, recurring: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="recurring" className="text-sm text-gray-700">
                  عطلة متكررة سنوياً
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowHolidayModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddHoliday}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                حفظ العطلة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">إعدادات العمل</h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">أيام العطل الأسبوعية</label>
                <div className="grid grid-cols-2 gap-3">
                  {weekDays.map(day => (
                    <label key={day.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={workSettings.weeklyHolidays.includes(day.id)}
                        onChange={() => toggleWeeklyHoliday(day.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{day.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkItemCalendar;