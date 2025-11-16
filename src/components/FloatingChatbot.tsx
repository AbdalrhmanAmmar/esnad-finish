import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { getDoctorDetails, DoctorDetailsResponse } from '@/api/DoctorDetails';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  doctorData?: DoctorDetailsResponse;
}

const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'مرحباً! أنا مساعدك للبحث عن بيانات الأطباء. اكتب اسم الطبيب الذي تريد البحث عنه.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const doctorData = await getDoctorDetails(inputMessage.trim());
      
      if (doctorData && doctorData.success && doctorData.data && doctorData.data.foundDoctors > 0) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `تم العثور على ${doctorData.data.foundDoctors} طبيب للبحث: "${doctorData.data.searchQuery}"`,
          sender: 'bot',
          timestamp: new Date(),
          doctorData
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'عذراً، لم أتمكن من العثور على بيانات لهذا الطبيب. تأكد من كتابة الاسم بشكل صحيح.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'حدث خطأ أثناء البحث عن بيانات الطبيب. يرجى المحاولة مرة أخرى.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      toast.error('حدث خطأ أثناء البحث');
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

  const renderDoctorData = (doctorData: DoctorDetailsResponse) => {
    return (
      <div className="mt-3 p-4 bg-card border border-border rounded-lg space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-foreground">نتائج البحث: {doctorData.data.searchQuery}</h4>
        </div>
        
        {doctorData.data.statistics && (
          <div className="border-t border-border pt-3">
            <h5 className="font-medium text-foreground mb-2">الإحصائيات العامة:</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-bold text-primary">{doctorData.data.statistics.totalVisits}</div>
                <div className="text-muted-foreground">إجمالي الزيارات</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-bold text-green-600">{doctorData.data.statistics.totalSamplesDistributed}</div>
                <div className="text-muted-foreground">العينات الموزعة</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-bold text-blue-600">{doctorData.data.statistics.uniqueMedicalReps}</div>
                <div className="text-muted-foreground">المندوبين</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-bold text-purple-600">{doctorData.data.statistics.uniqueProducts}</div>
                <div className="text-muted-foreground">المنتجات</div>
              </div>
            </div>
          </div>
        )}

        {doctorData.data.visits && doctorData.data.visits.length > 0 && (
          <div className="border-t border-border pt-3">
            <h5 className="font-medium text-foreground mb-2">آخر الزيارات ({doctorData.data.visits.length}):</h5>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {doctorData.data.visits.slice(0, 5).map((visit, index) => (
                <div key={visit.visitId} className="text-xs p-3 bg-muted rounded space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-primary">{visit.doctorInfo.name}</span>
                    <span className="text-muted-foreground">{visit.visitDetails.visitDate}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span><strong>التخصص:</strong> {visit.doctorInfo.specialty}</span>
                    <span><strong>المدينة:</strong> {visit.doctorInfo.city}</span>
                    <span><strong>المنطقة:</strong> {visit.doctorInfo.area}</span>
                    <span><strong>الحالة:</strong> {visit.visitDetails.visitStatus}</span>
                  </div>
                  <div className="text-muted-foreground">
                    <strong>المندوب:</strong> {visit.medicalRepInfo.name}
                  </div>
                  {visit.samplesInfo.totalSamples > 0 && (
                    <div className="text-green-600">
                      <strong>العينات:</strong> {visit.samplesInfo.totalSamples} عينة من {visit.samplesInfo.totalProducts} منتج
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 w-96 h-96 bg-background border border-border rounded-lg shadow-xl z-40 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">مساعد البحث عن الأطباء</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.doctorData && renderDoctorData(message.doctorData)}
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">جاري البحث...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب اسم الطبيب..."
                className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;