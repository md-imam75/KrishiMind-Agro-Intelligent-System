'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ArrowRight, Check, Sparkles, Sprout, ScanLine, LineChart, Globe } from 'lucide-react';

export default function OnboardingPage({ params: { locale } }: { params: { locale: string } }) {
  const [step, setStep] = useState(0);
  const t = useTranslations('onboarding');
  const tCommon = useTranslations('common');
  const router = useRouter();

  useEffect(() => {
    // If language is already chosen, default step to 1
    const saved = localStorage.getItem('km_locale');
    if (saved && step === 0) {
      setStep(1);
    }
  }, [step]);

  const handleLanguageSelect = (lang: string) => {
    localStorage.setItem('km_locale', lang);
    setStep(1);
    if (lang !== locale) router.push(`/${lang}`);
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else router.push(`/${locale}/login`);
  };

  // Step 0: Language Selection
  if (step === 0) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
        {/* Left Side: Modern Banner */}
        <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-emerald-900 to-teal-950 p-12 flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 text-center">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md mb-8 border border-white/20">
              <span className="text-5xl">🌾</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4">
              Welcome to <br/> Krishi<span className="text-emerald-400">Mind</span>
            </h1>
            <p className="text-emerald-100/80 text-lg font-medium">
              Choose your language to get started with the smart agricultural assistant.
            </p>
          </div>
        </div>

        {/* Right Side: Selection */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white relative">
          <div className="w-full max-w-md">
          {/* Brand Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/25 rotate-3">
              <span className="text-5xl -rotate-3">🌾</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md">
              <Sparkles size={18} className="text-emerald-600" />
            </div>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
            Krishi<span className="text-emerald-600">Mind</span>
          </h1>
          <p className="text-slate-600 text-sm max-w-xs font-medium mb-10 leading-relaxed">
            কৃষি বুদ্ধিমত্তা ও সিদ্ধান্ত সহায়ক প্ল্যাটফর্ম
            <br />
            <span className="text-xs text-slate-400 font-normal">
              AI-Powered Crop Intelligence for Bangladesh
            </span>
          </p>

          <div className="w-full space-y-3.5">
            <button
              onClick={() => handleLanguageSelect('bn')}
              className="w-full p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-950 font-bold text-lg flex items-center justify-between shadow-sm transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇧🇩</span>
                <span className="text-left font-bold">বাংলা (Bangla)</span>
              </div>
              <span className="text-xs font-semibold bg-emerald-600 text-white px-2.5 py-1 rounded-full">
                ডিফল্ট
              </span>
            </button>

            <button
              onClick={() => handleLanguageSelect('en')}
              className="w-full p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-base flex items-center justify-between shadow-sm transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇬🇧</span>
                <span className="text-left">English</span>
              </div>
              <ArrowRight size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        </div>

        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <p className="text-xs text-slate-400 font-medium">
            Designed for Bangladeshi Farmers & Officers
          </p>
        </div>
      </div>
    );
  }

  // Slides configuration
  const slides = [
    {
      title: t('title1'),
      desc: t('desc1'),
      icon: <Sprout size={56} className="text-emerald-600" />,
      tag: 'AI Recommendation',
      gradient: 'from-emerald-500/10 to-teal-500/5',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      title: t('title2'),
      desc: t('desc2'),
      icon: <ScanLine size={56} className="text-blue-600" />,
      tag: 'Vision Diagnosis',
      gradient: 'from-blue-500/10 to-cyan-500/5',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      title: t('title3'),
      desc: t('desc3'),
      icon: <LineChart size={56} className="text-amber-600" />,
      tag: 'Yield Forecasting',
      gradient: 'from-amber-500/10 to-orange-500/5',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
  ];

  const currentSlide = slides[step - 1] || slides[0];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left Side: Modern Banner */}
      <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-emerald-900 to-teal-950 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md mb-8 border border-white/20">
            <span className="text-5xl">🌾</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4">
            Welcome to <br/> Krishi<span className="text-emerald-400">Mind</span>
          </h1>
          <p className="text-emerald-100/80 text-lg font-medium">
            Choose your language to get started with the smart agricultural assistant.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white relative">
        <div className="w-full max-w-md flex flex-col min-h-[600px] justify-between">
      {/* Top bar */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🌾</span>
          <span className="font-extrabold text-sm text-slate-900 tracking-tight">
            Krishi<span className="text-emerald-600">Mind</span>
          </span>
        </div>
        <button
          onClick={() => router.push(`/${locale}/login`)}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {tCommon('skip')}
        </button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-8">
        <div className="relative mb-8">
          <div
            className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${currentSlide.gradient} border border-slate-100 flex items-center justify-center shadow-lg shadow-slate-200/50 transition-all duration-300 transform hover:scale-105`}
          >
            {currentSlide.icon}
          </div>
          <span
            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-0.5 rounded-full border shadow-sm ${currentSlide.badgeColor} whitespace-nowrap`}
          >
            {currentSlide.tag}
          </span>
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight max-w-xs">
          {currentSlide.title}
        </h2>
        <p className="text-sm text-slate-600 max-w-xs leading-relaxed font-normal">
          {currentSlide.desc}
        </p>
      </div>

      {/* Footer Navigation */}
      <div className="space-y-5 pb-4">
        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-2">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              aria-label={`Go to slide ${s}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-emerald-600'
                  : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {step > 1 && (
            <Button
              onClick={() => setStep(step - 1)}
              variant="secondary"
              size="lg"
              className="flex-1"
            >
              {tCommon('back')}
            </Button>
          )}
          <Button
            onClick={nextStep}
            variant="gradient"
            size="lg"
            className="flex-[2] text-base"
          >
            {step === 3 ? tCommon('done') : tCommon('next')}
            <ArrowRight size={18} />
          </Button>
        </div>
        </div>
      </div>
    </div>
  </div>
  );
}
