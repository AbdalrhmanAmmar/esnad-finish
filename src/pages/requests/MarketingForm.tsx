import React, { useState } from 'react';
import { CalendarIcon, User, FileText, DollarSign, ClipboardList } from 'lucide-react';

const activityTypes = [
  'ACCESS TO MEDICAL JOURNALS AND PUBLICATIONS',
  'ACCESS TO ONLINE PORTALS AND RESOURCES',
  'ACCESS TO WEBINARS AND ONLINE TRAINING',
  'BOOKS',
  'CLINICAL TRIAL DATA AND RESEARCH FINDINGS',
  'CONSULTATION WITH MEDICAL SCIENCE LIAISONS (MSLS)',
  'CONTINUING MEDICAL EDUCATION (CME) OPPORTUNITIES',
  'DETAILED PRODUCT MONOGRAPHS',
  'EDUCATIONAL MATERIALS AND BROCHURES',
  'FEEDBACK CHANNELS FOR PRODUCT IMPROVEMENT',
  'GIFTS',
  'INFORMATION ON DRUG INTERACTIONS AND SIDE EFFECTS',
  'INFORMATION ON GENERIC ALTERNATIVES',
  'INFORMATION ON REIMBURSEMENT AND INSURANCE COVERAGE',
  'INVITATIONS TO MEDICAL CONFERENCES AND WORKSHOPS',
  'LUNCH AND DINNERS',
  'OPPORTUNITIES FOR COLLABORATIVE RESEARCH',
  'PATIENT ASSISTANCE PROGRAMS INFORMATION',
  'PATIENT CASE STUDIES AND SUCCESS STORIES',
  'PRODUCT SAMPLES FOR PATIENT TRIALS',
  'ROUND TABLE DISCUSSION',
  'SAFETY AND EFFICACY DATA',
  'SUPPORT FOR PATIENT ADHERENCE PROGRAMS',
  'SUPPORT TO CLINIC OR HOSPITAL',
  'UPDATES ON NEW DRUG APPROVALS AND INDICATIONS'
];

const doctors = [
  'د. أحمد محمد',
  'د. سارة خالد',
  'د. محمد عبدالله',
  'د. فاطمة علي',
  'د. عمر حسن',
  'د. ليلى أحمد',
  'د. خالد العمري',
  'د. نورة السعيد',
  'د. طارق حسين',
  'د. رنا محمود'
];

interface ActivityFormData {
  requestDate: string;
  activityDate: string;
  activityType: string;
  doctorName: string;
  cost: number;
  notes: string;
}

export default function MarketingActivity() {
  const [formData, setFormData] = useState<ActivityFormData>({
    requestDate: '',
    activityDate: '',
    activityType: '',
    doctorName: '',
    cost: 0,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('تم تسجيل النشاط التسويقي بنجاح!');
    setFormData({
      requestDate: '',
      activityDate: '',
      activityType: '',
      doctorName: '',
      cost: 0,
      notes: ''
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-3xl mx-auto bg-card rounded-xl shadow-card-medical border border-border">
        <div className="py-8 px-10">
          <h2 className="text-3xl font-bold text-center text-card-foreground mb-8">
            نموذج طلب نشاط تسويقي
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="flex items-center text-muted-foreground mb-2">
                  <CalendarIcon className="w-5 h-5 ml-2" />
                  تاريخ الطلب
                </label>
                <input
                  type="date"
                  name="requestDate"
                  value={formData.requestDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div className="relative">
                <label className="flex items-center text-muted-foreground mb-2">
                  <CalendarIcon className="w-5 h-5 ml-2" />
                  تاريخ النشاط
                </label>
                <input
                  type="date"
                  name="activityDate"
                  value={formData.activityDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="flex items-center text-muted-foreground mb-2">
                <ClipboardList className="w-5 h-5 ml-2" />
                نوع النشاط
              </label>
              <select
                name="activityType"
                value={formData.activityType}
                onChange={handleChange}
                className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                required
              >
                <option value="">اختر نوع النشاط</option>
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="flex items-center text-muted-foreground mb-2">
                <User className="w-5 h-5 ml-2" />
                اسم الطبيب
              </label>
              <select
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
                className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                required
              >
                <option value="">اختر الطبيب</option>
                {doctors.map((doctor) => (
                  <option key={doctor} value={doctor}>
                    {doctor}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="flex items-center text-muted-foreground mb-2">
                <DollarSign className="w-5 h-5 ml-2" />
                التكلفة
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                required
              />
            </div>

            <div className="relative">
              <label className="flex items-center text-muted-foreground mb-2">
                <FileText className="w-5 h-5 ml-2" />
                ملاحظات
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                placeholder="أضف أي ملاحظات إضافية هنا..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg hover:bg-primary/90 transition-colors font-semibold text-lg shadow-md"
            >
              تسجيل النشاط
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}