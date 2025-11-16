import React, { useState, useMemo } from 'react';
import { Star, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { updateCoaching, UpdateCoachingPayload } from '@/api/Coaching';

interface EvaluationCriteria {
  id: string;
  title: string;
  category: string;
  maxScore: number;
  categoryArabic: string;
}

const evaluationCriteria: EvaluationCriteria[] = [
  { id: 'previous_followup', title: 'مراجعة الزيارة السابقة ومتابعة ما تم فيها', category: 'PLANNING', maxScore: 5, categoryArabic: 'التخطيط' },
  { id: 'organize_call', title: 'تنظيم الزيارة: الأهداف، المواد الترويجية، تسلسل العرض', category: 'PLANNING', maxScore: 5, categoryArabic: 'التخطيط' },
  { id: 'targeting', title: 'استهداف العملاء: عادات الوصف، العلامة التجارية المستهدفة', category: 'PLANNING', maxScore: 5, categoryArabic: 'التخطيط' },
  { id: 'presentation', title: 'الاهتمام بالمظهر والعرض', category: 'PERSONAL TRAIT', maxScore: 5, categoryArabic: 'السمات الشخصية' },
  { id: 'area_knowledge', title: 'معرفة توزيع العملاء والوعي بإدارة المنطقة', category: 'KNOWLEDGE', maxScore: 5, categoryArabic: 'المعرفة' },
  { id: 'opening_subject', title: 'الافتتاحية: واضحة ومباشرة للموضوع', category: 'SELLING SKILLS', maxScore: 5, categoryArabic: 'مهارات البيع' },
  { id: 'opening_products', title: 'الافتتاحية: متعلقة بالمنتجات', category: 'SELLING SKILLS', maxScore: 5, categoryArabic: 'مهارات البيع' },
  { id: 'customer_accept', title: 'قبول العميل للافتتاحية', category: 'SELLING SKILLS', maxScore: 5, categoryArabic: 'مهارات البيع' },
  { id: 'probe_use', title: 'استخدام أسلوب التحقيق', category: 'SELLING SKILLS', maxScore: 5, categoryArabic: 'مهارات البيع' },
  { id: 'listening', title: 'مهارات الإصغاء', category: 'SELLING SKILLS', maxScore: 5, categoryArabic: 'مهارات البيع' },
  { id: 'product_knowledge', title: 'المعرفة بالمنتج ورسائله خلال الزيارة', category: 'KNOWLEDGE', maxScore: 5, categoryArabic: 'المعرفة' },
  { id: 'customer_need', title: 'دعم احتياجات العميل الصحيحة', category: 'SELLING SKILLS', maxScore: 5, categoryArabic: 'مهارات البيع' },
  { id: 'confident_voice', title: 'الثقة، نبرة الصوت، استخدام الأقلام، تدفق الزيارة ونغمتها', category: 'PERSONAL TRAIT', maxScore: 5, categoryArabic: 'السمات الشخصية' },
  { id: 'detailing_aids', title: 'استخدام وسائل العرض بشكل صحيح', category: 'SELLING SKILLS', maxScore: 5, categoryArabic: 'مهارات البيع' },
  { id: 'closing_business', title: 'طلب الأعمال عند الإغلاق', category: 'SELLING SKILLS', maxScore: 5, categoryArabic: 'مهارات البيع' },
  { id: 'closing_feedback', title: 'الحصول على تغذية راجعة إيجابية عند الإغلاق', category: 'SELLING SKILLS', maxScore: 10, categoryArabic: 'مهارات البيع' },
  { id: 'resolving_objection', title: 'معالجة الاعتراضات والمخاوف', category: 'SELLING SKILLS', maxScore: 5, categoryArabic: 'مهارات البيع' },
  { id: 'reporting_punctuality', title: 'الالتزام بمواعيد التقارير قبل وبعد الموعد النهائي', category: 'PERSONAL TRAIT', maxScore: 5, categoryArabic: 'السمات الشخصية' },
  { id: 'total_visits', title: 'إجمالي عدد الزيارات والمكالمات (6 زيارات، 3 صيدليات)', category: 'PERSONAL TRAIT', maxScore: 5, categoryArabic: 'السمات الشخصية' }
];

interface ScoreBreakdown {
  planning: number;
  personalTraits: number;
  knowledge: number;
  sellingSkills: number;
  total: number;
}

const getEvaluationResult = (totalScore: number): { text: string; color: string; recommendations: string[] } => {
  const result = {
    text: '',
    color: '',
    recommendations: [] as string[]
  };

  if (totalScore > 85) {
    result.text = 'ممتاز';
    result.color = 'text-green-600';
  } else if (totalScore > 75) {
    result.text = 'يحتاج إلى تطوير';
    result.color = 'text-blue-600';
  } else if (totalScore > 65) {
    result.text = 'يحتاج إلى تدريب';
    result.color = 'text-yellow-600';
  } else if (totalScore > 55) {
    result.text = 'خطة عمل';
    result.color = 'text-orange-600';
  } else {
    result.text = 'تدريب مبيعات / منتجات';
    result.color = 'text-red-600';
  }

  return result;
};

const getRecommendations = (scores: ScoreBreakdown): string[] => {
  const recommendations: string[] = [];
  const { total, sellingSkills, planning, knowledge } = scores;

  if (total <= 55) {
    recommendations.push('تدريب مبيعات / منتجات');
    return recommendations;
  }

  if (total > 85) { // Excellent
    if (sellingSkills < 45) recommendations.push('تحسين دقيق لمهارات البيع');
    if (planning < 12) recommendations.push('تحسين دقيق للتخطيط');
    if (knowledge < 8) recommendations.push('تحسين دقيق للمعرفة');
  } else if (total > 75) { // Need Development
    if (sellingSkills < 40) recommendations.push('تدريب مهارات البيع');
    if (planning < 12) recommendations.push('تدريب التخطيط');
    if (knowledge < 11) recommendations.push('تدريب المنتجات وإدارة العملاء');
  } else if (total > 65) { // Need Training
    if (sellingSkills < 40) recommendations.push('تدريب مهارات البيع');
    if (planning < 11) recommendations.push('تدريب التخطيط');
    if (knowledge < 10) recommendations.push('تدريب المنتجات وإدارة العملاء');
  } else if (total > 55) { // Action Plan
    if (sellingSkills < 35) recommendations.push('تدريب مهارات البيع');
    if (planning < 11) recommendations.push('تدريب التخطيط');
    if (knowledge < 8) recommendations.push('تدريب المنتجات وإدارة العملاء');
  }

  return recommendations;
};

export default function CoachingReport() {
  const { id } = useParams();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleRatingChange = (criteriaId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [criteriaId]: rating
    }));
  };

  const renderStars = (criteriaId: string, maxScore: number) => {
    const rating = ratings[criteriaId] || 0;
    const stars = [];
    const maxStars = maxScore === 10 ? 10 : maxScore;

    for (let i = 0; i < maxStars; i++) {
      const isHalfStar = rating === i + 0.5;
      const isFullStar = rating >= i + 1;
      const value = maxScore === 10 ? (i + 1) : (i + 1) * (maxScore / maxStars);

      stars.push(
        <div key={`${i}-full`} className="relative">
          <button
            type="button"
            onClick={() => handleRatingChange(criteriaId, value)}
            className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              isFullStar ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
          
          <button
            type="button"
            onClick={() => handleRatingChange(criteriaId, value - 0.5)}
            className={`absolute inset-0 w-1/2 h-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors overflow-hidden ${
              isHalfStar ? 'text-yellow-400' : 'text-transparent'
            }`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex gap-2 justify-end">
        {stars}
      </div>
    );
  };

  const scores = useMemo(() => {
    let planning = 0;
    let personalTraits = 0;
    let knowledge = 0;
    let sellingSkills = 0;

    evaluationCriteria.forEach(criteria => {
      const score = ratings[criteria.id] || 0;
      const actualScore = score;

      switch (criteria.category) {
        case 'PLANNING':
          planning += actualScore;
          break;
        case 'PERSONAL TRAIT':
          personalTraits += actualScore;
          break;
        case 'KNOWLEDGE':
          knowledge += actualScore;
          break;
        case 'SELLING SKILLS':
          sellingSkills += actualScore;
          break;
      }
    });

    const total = planning + personalTraits + knowledge + sellingSkills;

    return {
      planning,
      personalTraits,
      knowledge,
      sellingSkills,
      total
    };
  }, [ratings]);

  const evaluation = useMemo(() => getEvaluationResult(scores.total), [scores.total]);
  const recommendations = useMemo(() => getRecommendations(scores), [scores]);

  const buildPayload = (): UpdateCoachingPayload => {
    const get = (key: string) => ratings[key];
    const payload: UpdateCoachingPayload = {
      title: reportTitle || undefined,
      Recommendations: recommendation || undefined,
      note: comments || undefined,
      // التخطيط
      previousCalls: get('previous_followup'),
      callOrganization: get('organize_call'),
      TargetingCustomer: get('targeting'),
      // المهارات الشخصية
      Appearance: get('presentation'),
      Confidence: get('confident_voice'),
      AdherenceToReporting: get('reporting_punctuality'),
      TotalVisits: get('total_visits'),
      // المعرفة
      CustomerDistribution: get('area_knowledge'),
      ProductKnowledge: get('product_knowledge'),
      // مهارات البيع
      ClearAndDirect: get('opening_subject'),
      ProductRelated: get('opening_products'),
      CustomerAcceptance: get('customer_accept'),
      InquiryApproach: get('probe_use'),
      ListeningSkills: get('listening'),
      SupportingCustomer: get('customer_need'),
      UsingPresentationTools: get('detailing_aids'),
      SolicitationAtClosing: get('closing_business'),
      GettingPositiveFeedback: get('closing_feedback'),
      HandlingObjections: get('resolving_objection'),
      isCompleted: true
    };

    // إزالة الحقول غير المحددة لتجنب الكتابة بقيم undefined
    Object.keys(payload).forEach((k) => {
      const key = k as keyof UpdateCoachingPayload;
      if (payload[key] === undefined) {
        delete (payload as any)[key];
      }
    });

    return payload;
  };
      const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error('معرّف التقييم غير موجود. الرجاء الوصول من صفحة Medical-coah.');
      return;
    }

    const loadingId = toast.loading('جاري حفظ التقييم...');
    setIsSaving(true);
    try {
      const payload = buildPayload();
      const res = await updateCoaching(id, payload);
      if (res?.success) {
        toast.success('تم حفظ التقييم وتحديثه بنجاح', { id: loadingId });
        setTimeout(() => {
                      navigate(-1);

          
        }, 2000);
      } else {
        toast.error(res?.message || 'لم يتم حفظ التقييم', { id: loadingId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'فشل في حفظ التقييم', { id: loadingId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">تقرير تقييم المندوب الطبي</h1>
          <p className="text-center text-gray-500 mb-8">نموذج احترافي ومتناسق مع تصميم الموقع، يدعم العرض على مختلف الأجهزة</p>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">عنوان التقرير</label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل عنوان التقرير"
            />
          </div>

          <div className="space-y-8">
            {Object.entries(
              evaluationCriteria.reduce<Record<string, EvaluationCriteria[]>>((acc, criteria) => {
                if (!acc[criteria.category]) {
                  acc[criteria.category] = [];
                }
                acc[criteria.category].push(criteria);
                return acc;
              }, {})
            ).map(([category, criteriaList]) => {
              // استخدام categoryArabic بدلاً من category الإنجليزية
              const categoryName = criteriaList[0]?.categoryArabic || category;
              
              return (
                <div key={category} className="border-b pb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">{categoryName}</h2>
                  <div className="space-y-4">
                    {criteriaList.map(criteria => (
                      <div key={criteria.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700">{criteria.title}</span>
                          <span className="text-sm text-gray-500">({criteria.maxScore} نقاط)</span>
                        </div>
                        {renderStars(criteria.id, criteria.maxScore)}
                        <div className="mt-1 text-sm text-gray-500 text-left">
                          {ratings[criteria.id] ? `${ratings[criteria.id]} / ${criteria.maxScore}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <label className="block text-gray-700 font-medium mb-2">التوصية</label>
            <textarea
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل التوصية هنا..."
            />
          </div>

          <div className="mt-8">
            <label className="block text-gray-700 font-medium mb-2">ملاحظات إضافية</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أضف أي ملاحظات أو تعليقات هنا..."
            />
          </div>

          <div className="mt-8 space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">التخطيط (15%)</h3>
                  <p className="text-2xl font-bold text-blue-600">{scores.planning}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">السمات الشخصية (20%)</h3>
                  <p className="text-2xl font-bold text-green-600">{scores.personalTraits}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">المعرفة (10%)</h3>
                  <p className="text-2xl font-bold text-purple-600">{scores.knowledge}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">مهارات البيع (55%)</h3>
                  <p className="text-2xl font-bold text-orange-600">{scores.sellingSkills}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">النتيجة الإجمالية</h3>
                    <p className={`text-lg font-semibold ${evaluation.color}`}>
                      التصنيف: {evaluation.text}
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {scores.total}/100
                  </div>
                </div>
              </div>

              {recommendations.length > 0 && (
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">التوصيات:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-600">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              className={`w-full flex items-center justify-center gap-2 ${isSaving ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-3 rounded-lg transition duration-200`}
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'جارٍ الحفظ...' : 'حفظ التقييم'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}