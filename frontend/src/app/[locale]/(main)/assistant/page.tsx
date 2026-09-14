'use client';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Bot, Send, User, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { intelligenceApi } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export default function AssistantPage() {
  const t = useTranslations('Assistant');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      { role: 'model', content: 'আসসালামু আলাইকুম! আমি **কৃষি বন্ধু**। আপনার ফসল, আবহাওয়া, বা চাষাবাদ সংক্রান্ত যেকোনো প্রশ্ন আমাকে করতে পারেন।' }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Pass the history up to the current point (excluding the initial welcome message from the backend request to save tokens, or include it)
      const res = await intelligenceApi.chatAssistant(userMessage, messages.slice(1));
      
      if (res.data && res.data.response) {
        setMessages(prev => [...prev, { role: 'model', content: res.data.response }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: 'দুঃখিত, কোনো একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-emerald-600 p-4 sm:p-6 text-white flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <Bot size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            কৃষি বন্ধু 
            <span className="bg-emerald-500 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Sparkles size={12}/> AI
            </span>
          </h1>
          <p className="text-emerald-100 text-sm">আপনার স্মার্ট এগ্রিকালচার অ্যাসিস্ট্যান্ট</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-sm prose prose-emerald max-w-none'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                ) : (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%] flex-row">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
                <Bot size={16} />
              </div>
              <div className="p-4 bg-white border border-slate-200 text-slate-500 shadow-sm rounded-2xl rounded-tl-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm font-medium">টাইপ করছে...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="আপনার প্রশ্ন লিখুন (যেমন: ধানের পাতায় বাদামী দাগ হলে কী করব?)"
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl transition-colors flex items-center justify-center"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
