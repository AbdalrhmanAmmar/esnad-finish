import React, { useState, useMemo, useEffect } from 'react';
import { Star, Save, User, Calendar, Stethoscope, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCoachingById, CoachingEntry } from '@/api/Coaching';

interface EvaluationCriteria {
  id: string;
  title: string;
  category: string;
  maxScore: number;
  apiField: string;
  categoryArabic: string;
}

const evaluationCriteria: EvaluationCriteria[] = [
  { id: 'previous_followup', title: 'مراجعة الزيارة السابقة ومتابعة ما تم فيها', category: 'PLANNING', maxScore: 5, apiField: 'previousCalls', categoryArabic: 'التخطيط' },
  { id: 'organize_call', title: 'تنظيم الزيارة: الأهداف، المواد الترويجية، تسلسل العرض', category: 'PLANNING', maxScore: 5, apiField: 'callOrganization', categoryArabic: 'التخطيط' },
  { id: 'targeting', title: 'استهداف العملاء: عادات الوصف، العلامة التجارية المستهدفة', category: 'PLANNING', maxScore: 5, apiField: 'TargetingCustomer', categoryArabic: 'التخطيط' },
  { id: 'presentation', title: 'الاهتمام بالمظهر والعرض', category: 'PERSONAL TRAIT', maxScore: 5, apiField: 'Appearance', categoryArabic: 'السمات الشخصية' },
  { id: 'area_knowledge', title: 'معرفة توزيع العملاء والوعي بإدارة المنطقة', category: 'KNOWLEDGE', maxScore: 5, apiField: 'CustomerDistribution', categoryArabic: 'المعرفة' },
  { id: 'opening_subject', title: 'الافتتاحية: واضحة ومباشرة للموضوع', category: 'SELLING SKILLS', maxScore: 5, apiField: 'ClearAndDirect', categoryArabic: 'مهارات البيع' },
  { id: 'opening_products', title: 'الافتتاحية: متعلقة بالمنتجات', category: 'SELLING SKILLS', maxScore: 5, apiField: 'ProductRelated', categoryArabic: 'مهارات البيع' },
  { id: 'customer_accept', title: 'قبول العميل للافتتاحية', category: 'SELLING SKILLS', maxScore: 5, apiField: 'CustomerAcceptance', categoryArabic: 'مهارات البيع' },
  { id: 'probe_use', title: 'استخدام أسلوب التحقيق', category: 'SELLING SKILLS', maxScore: 5, apiField: 'InquiryApproach', categoryArabic: 'مهارات البيع' },
  { id: 'listening', title: 'مهارات الإصغاء', category: 'SELLING SKILLS', maxScore: 5, apiField: 'ListeningSkills', categoryArabic: 'مهارات البيع' },
  { id: 'product_knowledge', title: 'المعرفة بالمنتج ورسائله خلال الزيارة', category: 'KNOWLEDGE', maxScore: 5, apiField: 'ProductKnowledge', categoryArabic: 'المعرفة' },
  { id: 'customer_need', title: 'دعم احتياجات العميل الصحيحة', category: 'SELLING SKILLS', maxScore: 5, apiField: 'SupportingCustomer', categoryArabic: 'مهارات البيع' },
  { id: 'confident_voice', title: 'الثقة، نبرة الصوت، استخدام الأقلام، تدفق الزيارة ونغمتها', category: 'PERSONAL TRAIT', maxScore: 5, apiField: 'Confidence', categoryArabic: 'السمات الشخصية' },
  { id: 'detailing_aids', title: 'استخدام وسائل العرض بشكل صحيح', category: 'SELLING SKILLS', maxScore: 5, apiField: 'UsingPresentationTools', categoryArabic: 'مهارات البيع' },
  { id: 'closing_business', title: 'طلب الأعمال عند الإغلاق', category: 'SELLING SKILLS', maxScore: 5, apiField: 'SolicitationAtClosing', categoryArabic: 'مهارات البيع' },
  { id: 'closing_feedback', title: 'الحصول على تغذية راجعة إيجابية عند الإغلاق', category: 'SELLING SKILLS', maxScore: 10, apiField: 'GettingPositiveFeedback', categoryArabic: 'مهارات البيع' },
  { id: 'resolving_objection', title: 'معالجة الاعتراضات والمخاوف', category: 'SELLING SKILLS', maxScore: 5, apiField: 'HandlingObjections', categoryArabic: 'مهارات البيع' },
  { id: 'reporting_punctuality', title: 'الالتزام بمواعيد التقارير قبل وبعد الموعد النهائي', category: 'PERSONAL TRAIT', maxScore: 5, apiField: 'AdherenceToReporting', categoryArabic: 'السمات الشخصية' },
  { id: 'total_visits', title: 'إجمالي عدد الزيارات والمكالمات (6 زيارات، 3 صيدليات)', category: 'PERSONAL TRAIT', maxScore: 5, apiField: 'TotalVisits', categoryArabic: 'السمات الشخصية' }
];

interface ScoreBreakdown {
  planning: number;
  personalTraits: number;
  knowledge: number;
  sellingSkills: number;
  total: number;
}

const getEvaluationResult = (totalScore: number): { text: string; color: string; bgColor: string; recommendations: string[] } => {
  if (totalScore > 85) {
    return {
      text: 'ممتاز',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50 border-emerald-200',
      recommendations: ['مستوى متميز، الاستمرار في التطوير الدقيق للمهارات']
    };
  } else if (totalScore > 75) {
    return {
      text: 'جيد جداً',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 border-blue-200',
      recommendations: ['تحسين بعض الجوانب الدقيقة في الأداء']
    };
  } else if (totalScore > 65) {
    return {
      text: 'جيد',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50 border-amber-200',
      recommendations: ['الحاجة لتدريب في بعض المجالات']
    };
  } else if (totalScore > 55) {
    return {
      text: 'مقبول',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50 border-orange-200',
      recommendations: ['خطة عمل تطويرية مكثفة']
    };
  } else {
    return {
      text: 'يحتاج تحسين',
      color: 'text-red-700',
      bgColor: 'bg-red-50 border-red-200',
      recommendations: ['تدريب مكثف في المبيعات والمنتجات']
    };
  }
};

const getRecommendations = (scores: ScoreBreakdown): string[] => {
  const recommendations: string[] = [];
  const { total, sellingSkills, planning, knowledge, personalTraits } = scores;

  if (total <= 55) {
    recommendations.push('تدريب مبيعات مكثف');
    recommendations.push('تدريب منتجات شامل');
    recommendations.push('متابعة أسبوعية من المشرف');
    return recommendations;
  }

  if (total > 85) {
    if (sellingSkills < 45) recommendations.push('تحسين دقيق في مهارات الإغلاق والتفاوض');
    if (planning < 12) recommendations.push('تطوير استراتيجيات التخطيط المتقدمة');
    if (knowledge < 8) recommendations.push('تعميق المعرفة بالمنتجات المنافسة');
  } else if (total > 75) {
    if (sellingSkills < 40) recommendations.push('تدريب متقدم في مهارات البيع');
    if (planning < 12) recommendations.push('تحسين كفاءة التخطيط للزيارات');
    if (knowledge < 11) recommendations.push('تعزيز المعرفة بمنتجات الشركة');
  } else if (total > 65) {
    if (sellingSkills < 40) recommendations.push('تدريب أساسيات البيع الاحترافي');
    if (planning < 11) recommendations.push('تحسين تنظيم وقت الزيارات');
    if (knowledge < 10) recommendations.push('دراسة متعمقة للمنتجات');
  } else if (total > 55) {
    if (sellingSkills < 35) recommendations.push('تدريب مكثف على مهارات البيع');
    if (planning < 11) recommendations.push('إعداد خطط زيارات مفصلة');
    if (knowledge < 8) recommendations.push('مراجعة شاملة للمنتجات');
  }

  if (personalTraits < 15) {
    recommendations.push('تطوير المهارات الشخصية والثقة');
  }

  return recommendations;
};

const ScoreProgressBar = ({ score, maxScore, color }: { score: number; maxScore: number; color: string }) => {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 min-w-12">
        {score}/{maxScore}
      </span>
    </div>
  );
};

const StarRating = ({ criteriaId, maxScore, value, onChange }: {
  criteriaId: string;
  maxScore: number;
  value: number;
  onChange: (criteriaId: string, rating: number) => void;
}) => {
  const stars = [];
  const maxStars = maxScore === 10 ? 10 : maxScore;

  for (let i = 0; i < maxStars; i++) {
    const isHalfStar = value === i + 0.5;
    const isFullStar = value >= i + 1;
    const starValue = maxScore === 10 ? (i + 1) : (i + 1) * (maxScore / maxStars);

    stars.push(
      <div key={`${i}-full`} className="relative group">
        <button
          type="button"
          onClick={() => onChange(criteriaId, starValue)}
          className={`p-1 rounded-full transition-all duration-200 hover:scale-110 ${
            isFullStar 
              ? 'text-yellow-400 transform scale-110' 
              : 'text-gray-300 hover:text-yellow-300'
          }`}
        >
          <Star className="w-6 h-6 fill-current" />
        </button>
        
        <button
          type="button"
          onClick={() => onChange(criteriaId, starValue - 0.5)}
          className={`absolute inset-0 w-1/2 h-full overflow-hidden ${
            isHalfStar 
              ? 'text-yellow-400' 
              : 'text-transparent group-hover:text-yellow-300'
          }`}
        >
          <Star className="w-6 h-6 fill-current" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-1 justify-end">
      {stars}
    </div>
  );
};

export default function CoachingView() {
  const { id } = useParams();
  const [coachingData, setCoachingData] = useState<CoachingEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [recommendation, setRecommendation] = useState('');

  useEffect(() => {
    loadCoachingData();
  }, [id]);

  const loadCoachingData = async () => {
    if (!id) {
      toast.error('معرّف التقييم غير موجود');
      setIsLoading(false);
      return;
    }

    try {
      const response = await getCoachingById(id);
      if (response.success && response.data) {
        const data = response.data;
        setCoachingData(data);
        setReportTitle(data.title || '');
        setRecommendation(data.Recommendations || '');
        setComments(data.note || '');

        // تحميل التقييمات من البيانات
        const initialRatings: Record<string, number> = {};
        evaluationCriteria.forEach(criteria => {
          const value = data[criteria.apiField as keyof CoachingEntry];
          if (typeof value === 'number') {
            initialRatings[criteria.id] = value;
          }
        });
        setRatings(initialRatings);
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل في تحميل بيانات التقييم');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingChange = (criteriaId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [criteriaId]: rating
    }));
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل بيانات التقييم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-l from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            تقرير تقييم الأداء
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            تقييم شامل ومفصل لأداء المندوب الطبي وفق معايير الجودة والكفاءة المهنية
          </p>
        </div>

        {/* Visit Information Card */}
        {coachingData?.visit && (
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                  <User className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">المندوب الطبي</p>
                    <p className="font-semibold text-gray-900">
                      {coachingData.visit.medicalRep?.name || 'غير محدد'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <Stethoscope className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">الطبيب</p>
                    <p className="font-semibold text-gray-900">
                      {coachingData.visit.doctor?.name || 'غير محدد'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                  <Calendar className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الزيارة</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(coachingData.visit.visitDate).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                  <Target className="w-8 h-8 text-amber-600" />
                  <div>
                    <p className="text-sm text-gray-600">حالة التقرير</p>
                    <p className={`font-semibold ${coachingData.isCompleted ? 'text-green-600' : 'text-amber-600'}`}>
                      {coachingData.isCompleted ? 'مكتمل' : 'قيد المراجعة'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-3">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                  نموذج التقييم التفصيلي
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Report Title */}
                <div className="mb-8">
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    عنوان التقرير
                  </label>
                  <input
                    type="text"
                    value={reportTitle}
                    disabled
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                    placeholder="أدخل عنواناً واضحاً للتقرير..."
                  />
                </div>

                {/* Evaluation Sections */}
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
                      <div key={category} className="border-2 border-gray-100 rounded-2xl p-6 bg-white/50">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                          <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                          <h2 className="text-xl font-bold text-gray-800">{categoryName}</h2>
                        </div>
                        <div className="space-y-6">
                          {criteriaList.map(criteria => (
                            <div key={criteria.id} className="bg-gradient-to-l from-gray-50 to-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-800 font-medium text-lg leading-relaxed">
                                      {criteria.title}
                                    </span>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                      {criteria.maxScore} نقاط
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600 text-left mt-1">
                                    {ratings[criteria.id] ? (
                                      <span className="font-semibold text-blue-600">
                                        {ratings[criteria.id]} / {criteria.maxScore}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">لم يتم التقييم بعد</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  <StarRating
                                    criteriaId={criteria.id}
                                    maxScore={criteria.maxScore}
                                    value={ratings[criteria.id] || 0}
                                    onChange={handleRatingChange}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recommendations and Notes */}
                <div className="mt-8 space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      التوصيات الرئيسية
                    </label>
                    <textarea
                      value={recommendation}
                      disabled
                      
                      className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 resize-none"
                      placeholder="اكتب التوصيات والتوجيهات المهمة للمندوب..."
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      ملاحظات إضافية
                    </label>
                    <textarea
                      value={comments}
                      disabled
                      className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 resize-none"
                      placeholder="أضف أي ملاحظات أو تعليقات إضافية هنا..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Results Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Total Score Card */}
              <Card className={`shadow-xl border-0 ${evaluation.bgColor} transition-all duration-300 hover:shadow-2xl`}>
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {scores.total}
                    </div>
                    <div className="text-sm text-gray-600">من 100</div>
                  </div>
                  <div className={`text-xl font-bold ${evaluation.color} mb-3`}>
                    {evaluation.text}
                  </div>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
                </CardContent>
              </Card>

              {/* Category Scores */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900">
                    نتائج المحاور
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-blue-700">التخطيط</span>
                      <span className="text-sm font-bold text-gray-900">{scores.planning}/15</span>
                    </div>
                    <ScoreProgressBar 
                      score={scores.planning} 
                      maxScore={15} 
                      color="bg-gradient-to-r from-blue-500 to-cyan-500" 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-green-700">المهارات الشخصية</span>
                      <span className="text-sm font-bold text-gray-900">{scores.personalTraits}/20</span>
                    </div>
                    <ScoreProgressBar 
                      score={scores.personalTraits} 
                      maxScore={20} 
                      color="bg-gradient-to-r from-green-500 to-emerald-500" 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-purple-700">المعرفة</span>
                      <span className="text-sm font-bold text-gray-900">{scores.knowledge}/10</span>
                    </div>
                    <ScoreProgressBar 
                      score={scores.knowledge} 
                      maxScore={10} 
                      color="bg-gradient-to-r from-purple-500 to-violet-500" 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-orange-700">مهارات البيع</span>
                      <span className="text-sm font-bold text-gray-900">{scores.sellingSkills}/55</span>
                    </div>
                    <ScoreProgressBar 
                      score={scores.sellingSkills} 
                      maxScore={55} 
                      color="bg-gradient-to-r from-orange-500 to-amber-500" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <Card className="shadow-xl border-0 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Target className="w-5 h-5 text-amber-600" />
                      خطط التحسين
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
      
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}