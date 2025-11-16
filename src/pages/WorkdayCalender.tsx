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
  Gift
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
  isWeekend as isWeekendDate,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { ar } from 'date-fns/locale';

interface Holiday {
  id: string;
  date: string;
  name: string;
  type: 'national' | 'religious' | 'custom';
  recurring: boolean;
}

interface WorkSettings {
  weeklyHolidays: number[]; // 0 = Sunday, 1 = Monday, etc.
  workingHours: {
    start: string;
    end: string;
  };
}

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
  { value: 'national', label: 'عطلة وطنية', color: 'bg-green-100 text-green-800' },
  { value: 'religious', label: 'عطلة دينية', color: 'bg-blue-100 text-blue-800' },
  { value: 'custom', label: 'عطلة مخصصة', color: 'bg-purple-100 text-purple-800' }
];

export default function WorkCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>(() => {
    const saved = localStorage.getItem('workCalendarHolidays');
    return saved ? JSON.parse(saved) : defaultHolidays;
  });
  
  const [workSettings, setWorkSettings] = useState<WorkSettings>(() => {
    const saved = localStorage.getItem('workCalendarSettings');
    return saved ? JSON.parse(saved) : {
      weeklyHolidays: [5], // Friday by default
      workingHours: { start: '08:00', end: '17:00' }
    };
  });

  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [newHoliday, setNewHoliday] = useState<Partial<Holiday>>({
    name: '',
    type: 'custom',
    recurring: false
  });

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Check if a date is a holiday
  const isHoliday = (date: Date) => {
    const dayOfWeek = getDay(date);
    const isWeeklyHoliday = workSettings.weeklyHolidays.includes(dayOfWeek);
    const isCustomHoliday = holidays.some(holiday => 
      isSameDay(new Date(holiday.date), date)
    );
    return isWeeklyHoliday || isCustomHoliday;
  };

  // Get holiday info for a date
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

  // Save data to localStorage
  const saveData = () => {
    localStorage.setItem('workCalendarHolidays', JSON.stringify(holidays));
    localStorage.setItem('workCalendarSettings', JSON.stringify(workSettings));
  };

  // Add or edit holiday
  const handleSaveHoliday = () => {
    if (!newHoliday.name || !selectedDate) return;

    const holiday: Holiday = {
      id: editingHoliday?.id || Date.now().toString(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      name: newHoliday.name,
      type: newHoliday.type as Holiday['type'],
      recurring: newHoliday.recurring || false
    };

    if (editingHoliday) {
      setHolidays(prev => prev.map(h => h.id === holiday.id ? holiday : h));
    } else {
      setHolidays(prev => [...prev, holiday]);
    }

    setShowHolidayModal(false);
    setEditingHoliday(null);
    setNewHoliday({ name: '', type: 'custom', recurring: false });
    setSelectedDate(null);
    saveData();
  };

  // Delete holiday
  const handleDeleteHoliday = (id: string) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
    saveData();
  };

  // Edit holiday
  const handleEditHoliday = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setNewHoliday(holiday);
    setSelectedDate(new Date(holiday.date));
    setShowHolidayModal(true);
  };

  // Add holiday for selected date
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setNewHoliday({ name: '', type: 'custom', recurring: false });
    setShowHolidayModal(true);
  };

  // Update work settings
  const handleUpdateSettings = () => {
    saveData();
    setShowSettingsModal(false);
  };

  // Toggle weekly holiday
  const toggleWeeklyHoliday = (dayId: number) => {
    setWorkSettings(prev => ({
      ...prev,
      weeklyHolidays: prev.weeklyHolidays.includes(dayId)
        ? prev.weeklyHolidays.filter(d => d !== dayId)
        : [...prev.weeklyHolidays, dayId]
    }));
  };

  // Get statistics
  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const workDays = monthDays.filter(day => !isHoliday(day)).length;
    const holidayDays = monthDays.filter(day => isHoliday(day)).length;
    const totalDays = monthDays.length;

    return { workDays, holidayDays, totalDays };
  }, [currentDate, holidays, workSettings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">تقويم العمل</h1>
              <p className="text-gray-600">إدارة أيام العمل والعطلات</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                الإعدادات
              </button>
              <button
                onClick={() => handleDateClick(new Date())}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة عطلة
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <span className="text-xl">‹</span>
              </button>
              
              <h2 className="text-2xl font-bold">
                {format(currentDate, 'MMMM yyyy', { locale: ar })}
              </h2>
              
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <span className="text-xl">›</span>
              </button>
            </div>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 bg-gray-50">
            {weekDays.map(day => (
              <div key={day.id} className="p-4 text-center font-semibold text-gray-700 border-b">
                {day.name}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(day, new Date());
              const isHolidayDay = isHoliday(day);
              const holidayInfo = getHolidayInfo(day);

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`
                    min-h-[120px] p-3 border-b border-r cursor-pointer transition-all hover:bg-gray-50
                    ${!isCurrentMonth ? 'bg-gray-100 text-gray-400' : ''}
                    ${isToday ? 'bg-blue-50 border-blue-200' : ''}
                    ${isHolidayDay ? 'bg-red-50' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`
                      text-lg font-semibold
                      ${isToday ? 'bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center' : ''}
                      ${isHolidayDay && !isToday ? 'text-red-600' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>
                    
                    {isHolidayDay && (
                      <div className="flex items-center gap-1">
                        {holidayInfo?.type === 'national' && <Star className="w-4 h-4 text-green-600" />}
                        {holidayInfo?.type === 'religious' && <Gift className="w-4 h-4 text-blue-600" />}
                        {(holidayInfo?.type === 'custom' || holidayInfo?.type === 'weekly') && <XCircle className="w-4 h-4 text-red-600" />}
                      </div>
                    )}
                  </div>

                  {holidayInfo && (
                    <div className="text-xs text-gray-600 bg-white/80 rounded p-1 mt-1">
                      {holidayInfo.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Holidays List */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">العطلات المخصصة</h3>
          <div className="space-y-3">
            {holidays.map(holiday => {
              const holidayType = holidayTypes.find(t => t.value === holiday.type);
              return (
                <div key={holiday.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      {format(new Date(holiday.date), 'dd/MM/yyyy')}
                    </div>
                    <div className="font-medium text-gray-900">{holiday.name}</div>
                    <span className={`px-2 py-1 text-xs rounded-full ${holidayType?.color}`}>
                      {holidayType?.label}
                    </span>
                    {holiday.recurring && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        متكررة سنوياً
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditHoliday(holiday)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteHoliday(holiday.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingHoliday ? 'تعديل العطلة' : 'إضافة عطلة جديدة'}
                </h2>
                <button
                  onClick={() => {
                    setShowHolidayModal(false);
                    setEditingHoliday(null);
                    setNewHoliday({ name: '', type: 'custom', recurring: false });
                  }}
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
                onClick={() => {
                  setShowHolidayModal(false);
                  setEditingHoliday(null);
                  setNewHoliday({ name: '', type: 'custom', recurring: false });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveHoliday}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                حفظ
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

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}