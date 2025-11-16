import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Bot, User, Calendar, MapPin, Stethoscope, Package, Clock, Phone, Mail } from 'lucide-react';
import { getDoctorDetails, DoctorSearchResponse } from '../api/automation';
import { useToast } from '../hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  data?: DoctorSearchResponse['data'];
}

const DoctorChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'مرحباً! أنا مساعدك الذكي للبحث عن تفاصيل الأطباء. اكتب اسم الدكتور الذي تريد البحث عنه.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await getDoctorDetails(inputValue);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.success ? 
          `تم العثور على ${response.data.foundDoctors} دكتور بالاسم "${response.data.searchQuery}"` :
          response.message,
        timestamp: new Date(),
        data: response.success ? response.data : undefined
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (response.success) {
        toast({
          title: 'تم البحث بنجاح',
          description: `تم العثور على ${response.data.statistics.totalVisits} زيارة للدكتور`
        });
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: error.message || 'حدث خطأ في البحث. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'خطأ في البحث',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderDoctorData = (data: DoctorSearchResponse['data']) => {
    return (
      <div className="mt-4 space-y-6">
        {/* Statistics Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            إحصائيات عامة
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.statistics.totalVisits}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي الزيارات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{data.statistics.totalSamplesDistributed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">العينات الموزعة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.statistics.uniqueMedicalReps}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">المندوبين</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{data.statistics.uniqueProducts}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">المنتجات</div>
            </div>
          </div>
        </div>

        {/* Visits */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            تفاصيل الزيارات
          </h3>
          {data.visits.map((visit, index) => (
            <div key={visit.visitId} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Doctor Info Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      {visit.doctorInfo.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">{visit.doctorInfo.specialty}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {visit.doctorInfo.city} - {visit.doctorInfo.area}
                      </span>
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                        {visit.doctorInfo.brand}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(visit.visitDetails.visitDate)}
                    </div>
                    <span className="inline-block mt-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">
                      {visit.visitDetails.visitStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Medical Rep Info */}
                {visit.medicalRepInfo.name !== 'غير محدد' && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">معلومات المندوب</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{visit.medicalRepInfo.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{visit.medicalRepInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{visit.medicalRepInfo.phone}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Samples Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    العينات الموزعة ({visit.samplesInfo.totalSamples} عينة)
                  </h5>
                  <div className="space-y-2">
                    {visit.samplesInfo.samplesDetails.map((sample, sampleIndex) => (
                      <div key={sampleIndex} className="flex justify-between items-center bg-white dark:bg-gray-800 rounded p-2 text-sm">
                        <div>
                          <span className="font-medium">{sample.productName}</span>
                          {sample.category !== 'غير محدد' && (
                            <span className="text-gray-500 dark:text-gray-400 ml-2">({sample.category})</span>
                          )}
                        </div>
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                          {sample.samplesCount} عينة
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                {(visit.additionalInfo.notes || visit.additionalInfo.feedback) && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                    <h5 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">معلومات إضافية</h5>
                    {visit.additionalInfo.notes && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                        <strong>ملاحظات:</strong> {visit.additionalInfo.notes}
                      </p>
                    )}
                    {visit.additionalInfo.feedback && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>التقييم:</strong> {visit.additionalInfo.feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            مساعد البحث عن الأطباء
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ابحث عن تفاصيل أي دكتور واحصل على معلومات شاملة عن زياراته والعينات الموزعة
          </p>
        </div>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    }`}>
                      {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`flex-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-3 rounded-2xl max-w-full ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-md'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        {message.data && renderDoctorData(message.data)}
                      </div>
                      <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                        message.type === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {message.timestamp.toLocaleTimeString('ar-EG', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-bl-md p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">جاري البحث...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب اسم الدكتور هنا..."
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorChatbot;