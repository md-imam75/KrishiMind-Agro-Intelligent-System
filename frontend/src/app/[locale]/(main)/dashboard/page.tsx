'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  Sprout, 
  TrendingUp, 
  CloudSun, 
  BarChart2, 
  Bot, 
  MapPin, 
  Bell, 
  ArrowUpRight, 
  ShieldCheck, 
  Droplets, 
  Wind,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { farmerApi, aiApi } from '@/lib/api';

export default function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [plots, setPlots] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [profRes, plotsRes] = await Promise.all([
        farmerApi.getProfile(),
        farmerApi.getPlots(),
      ]);
      setProfile(profRes.data);
      setPlots(plotsRes.data || []);

      // Load weather for user's district or default to Dhaka
      const dist = profRes.data?.district || 'dhaka';
      const wRes = await aiApi.getWeather(dist);
      setWeather(wRes.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push(`/${locale}/login`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const activePlots = plots.filter(p => p.active_crop);
  const totalLand = profile?.total_land_decimal || 0;

  const services = [
    { 
      id: 'scan', 
      label: locale === 'bn' ? 'রোগ স্ক্যানার' : 'Disease Scanner', 
      desc: locale === 'bn' ? 'পাতার ছবি তুলে তাৎক্ষণিক এআই রোগ শনাক্ত ও সমাধান' : 'Instant leaf photo diagnosis with AI remedies', 
      icon: <Camera size={26} className="text-blue-600" />, 
      path: `/${locale}/scan`,
      gradient: 'from-blue-500/15 via-blue-500/5 to-transparent',
      borderColor: 'hover:border-blue-400',
      badge: 'Vision AI',
    },
    { 
      id: 'recommend', 
      label: locale === 'bn' ? 'স্মার্ট ফসল সুপারিশ' : 'Crop Recommendation', 
      desc: locale === 'bn' ? 'মাটি ও মৌসুম অনুযায়ী সর্বোচ্চ লাভজনক ফসল' : 'Top matching crops for your soil & seasonal weather', 
      icon: <Sprout size={26} className="text-emerald-600" />, 
      path: `/${locale}/recommend`,
      gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      borderColor: 'hover:border-emerald-400',
      badge: 'Agronomy Engine',
    },
    { 
      id: 'yield', 
      label: locale === 'bn' ? 'সম্ভাব্য ফলন পূর্বাভাস' : 'Harvest Yield Predictor', 
      desc: locale === 'bn' ? 'শতাংশ বা বিঘায় প্রত্যাশিত মণ ফলন ও বাজারমূল্য' : 'Forecast harvest maunds and estimated revenue in BDT', 
      icon: <BarChart2 size={26} className="text-amber-600" />, 
      path: `/${locale}/yield`,
      gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
      borderColor: 'hover:border-amber-400',
      badge: 'Forecasting',
    },
    { 
      id: 'weather', 
      label: locale === 'bn' ? 'আবহাওয়া ও স্প্রে পরামর্শ' : 'Agro Weather Advisory', 
      desc: locale === 'bn' ? '৭ দিনের পূর্বাভাস ও বালাইনাশক স্প্রে করার নিরাপত্তা' : 'Live district forecasts with pesticide spraying safety index', 
      icon: <CloudSun size={26} className="text-cyan-600" />, 
      path: `/${locale}/weather`,
      gradient: 'from-cyan-500/15 via-cyan-500/5 to-transparent',
      borderColor: 'hover:border-cyan-400',
      badge: 'Live Radar',
    },
    { 
      id: 'market', 
      label: locale === 'bn' ? 'বাজার দর মনিটরিং' : 'Market Price Intelligence', 
      desc: locale === 'bn' ? 'পাইকারি ও খুচরা বাজার দর এবং বিক্রির উপযুক্ত সময়' : 'Daily wholesale mandi commodity trends & selling advice', 
      icon: <TrendingUp size={26} className="text-purple-600" />, 
      path: `/${locale}/market`,
      gradient: 'from-purple-500/15 via-purple-500/5 to-transparent',
      borderColor: 'hover:border-purple-400',
      badge: 'Daily BD',
    },
    { 
      id: 'farm', 
      label: locale === 'bn' ? 'খামার ও প্লট ব্যবস্থাপনা' : 'My Farm Management', 
      desc: locale === 'bn' ? 'জমির প্লট, মাটির স্বাস্থ্য ও সক্রিয় ফসলের পর্যায়' : 'Manage your land plots, soil specs, and active crops', 
      icon: <Layers size={26} className="text-rose-600" />, 
      path: `/${locale}/farm`,
      gradient: 'from-rose-500/15 via-rose-500/5 to-transparent',
      borderColor: 'hover:border-rose-400',
      badge: 'Field Ops',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* ─── Hero Overview Bar ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {profile?.farmer_name 
                ? (locale === 'bn' ? `স্বাগতম, ${profile.farmer_name}` : `Welcome, ${profile.farmer_name}`)
                : (locale === 'bn' ? 'কৃষক কমান্ড সেন্টার' : 'Farmer Command Center')}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full">
              LIVE
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1 flex items-center gap-1.5">
            <MapPin size={14} className="text-emerald-600" />
            <span className="capitalize">
              {profile?.upazila ? `${profile.upazila}, ` : ''}{profile?.district || 'ঢাকা (Dhaka)'} • 
              {profile?.phone ? ` রেজিস্টার্ড ফোন: ${profile.phone}` : ''}
            </span>
          </p>
        </div>

        {/* Action quick links */}
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <Link
            href={`/${locale}/scan`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-[0.98]"
          >
            <Camera size={16} />
            <span>{locale === 'bn' ? 'পাতা স্ক্যান করুন' : 'Scan a Leaf'}</span>
          </Link>
          <Link
            href={`/${locale}/farm`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-800 font-bold text-xs shadow-sm transition-all"
          >
            <Layers size={16} className="text-emerald-600" />
            <span>{locale === 'bn' ? 'আমার খামার' : 'My Farm'}</span>
          </Link>
        </div>
      </div>

      {/* ─── Top Statistics & Weather Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Real-time Weather Banner */}
        <div className="md:col-span-2 rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold tracking-wider text-emerald-200 uppercase">
                  {weather?.district ? `${weather.district} জেলার কৃষি আবহাওয়া` : 'আজকের কৃষি আবহাওয়া'}
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight">
                    {weather ? `${Math.round(weather.current.temperature)}°C` : '২৮°C'}
                  </span>
                  <span className="text-base font-bold text-emerald-100">
                    {weather?.current.weather_desc_bn || 'রৌদ্রোজ্জ্বল (Sunny)'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20">
                <CloudSun size={36} className="text-amber-300" />
              </div>
            </div>

            <p className="text-xs text-emerald-100/90 leading-relaxed max-w-xl">
              {weather?.advisory.spraying_reason_bn || 'আবহাওয়া অনুকূল রয়েছে। ফসলের বৃদ্ধি পর্যায় পর্যবেক্ষণ করুন।'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 mt-4 border-t border-white/15 text-xs">
            <div className="flex items-center gap-2">
              <Droplets size={16} className="text-cyan-300" />
              <div>
                <span className="text-[10px] text-emerald-200 block">আর্দ্রতা</span>
                <span className="font-black text-sm">{weather?.current.relative_humidity || 65}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind size={16} className="text-slate-200" />
              <div>
                <span className="text-[10px] text-emerald-200 block">বাতাস</span>
                <span className="font-black text-sm">{weather?.current.wind_speed_kmh || 12} কিমি/ঘণ্টা</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-300" />
              <div>
                <span className="text-[10px] text-emerald-200 block">স্প্রে অবস্থা</span>
                <span className="font-black text-sm text-emerald-200">
                  {weather?.advisory.spraying_suitability || 'SAFE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Real Farm Summary Snapshot */}
        <Card className="p-6 border-slate-200 flex flex-col justify-between shadow-card">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {locale === 'bn' ? 'আমার খামার বিবরণ' : 'My Farm Summary'}
              </h3>
              <RiskBadge level="LOW" />
            </div>

            <div className="space-y-3 my-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs font-medium text-slate-500">মোট নিবন্ধিত জমি</span>
                <span className="text-sm font-black text-slate-900">
                  {totalLand > 0 ? `${totalLand} শতাংশ (${(totalLand / 33).toFixed(2)} বিঘা)` : 'নির্ধারিত নেই'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs font-medium text-slate-500">মোট প্লটের সংখ্যা</span>
                <span className="text-sm font-black text-slate-900">
                  {plots.length}টি প্লট
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-medium text-slate-500">চলমান সক্রিয় ফসল</span>
                <span className="text-sm font-black text-emerald-700">
                  {activePlots.length > 0 ? `${activePlots.length}টি ফসল` : 'কোনো ফসল নেই'}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`/${locale}/farm`}
            className="w-full text-center py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1"
          >
            <span>{locale === 'bn' ? 'খামারের প্লট ও ফসল পরিচালনা' : 'Manage Farm & Plots'}</span>
            <ChevronRight size={14} />
          </Link>
        </Card>

      </div>

      {/* ─── Core AI Feature Modules (3-Column Grid on Desktop) ──────── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles size={20} className="text-emerald-600" />
            <span>{locale === 'bn' ? 'কৃত্রিম বুদ্ধিমত্তা চালিত সেবাসমূহ' : 'AI Crop Intelligence Services'}</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {locale === 'bn'
              ? 'সঠিক তথ্য, কৃত্রিম বুদ্ধিমত্তা ও সময়োপযোগী কৃষি সিদ্ধান্তের পূর্ণাঙ্গ সমাধান'
              : 'Enterprise-grade agronomic decision intelligence tailored for Bangladeshi farmers'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((item) => (
            <Link key={item.id} href={item.path} className="group">
              <div className={`bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover ${item.borderColor} transition-all duration-200 h-full flex flex-col justify-between active:scale-[0.99] relative overflow-hidden`}>
                
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.gradient}`} />

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:scale-105 transition-transform flex items-center justify-center border border-slate-100">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {item.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>{locale === 'bn' ? 'সেবা ব্যবহার করুন' : 'Launch Feature'}</span>
                  <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Real Field Activity Section ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Real Field Activity / Plots Log */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-slate-200 h-full flex flex-col justify-between shadow-card">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck size={18} className="text-emerald-600" />
                  <span>{locale === 'bn' ? 'আমার জমির প্লট ও ফসলের বর্তমান অবস্থা' : 'My Land Plots & Active Crop Status'}</span>
                </h3>
                <Link href={`/${locale}/farm`} className="text-xs font-bold text-emerald-700 hover:underline">
                  নতুন প্লট যোগ করুন →
                </Link>
              </div>

              {plots.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-700">এখনও কোনো প্লট যোগ করা হয়নি</p>
                  <p className="text-[11px] text-slate-400 mt-1">আপনার জমির তথ্য যুক্ত করতে নিচের বাটনে চাপুন</p>
                  <Link
                    href={`/${locale}/farm`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 mt-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    <Plus size={14} />
                    <span>প্লট যুক্ত করুন</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {plots.slice(0, 3).map((plot) => (
                    <div key={plot.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base shrink-0">
                          🌱
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{plot.label}</h4>
                          <p className="text-[11px] text-slate-500">
                            {plot.active_crop ? `${plot.active_crop.crop_name} (${plot.active_crop.growth_stage || 'চলমান'})` : 'কোনো ফসল রোপণ করা নেই'} • {plot.land_decimal} শতাংশ
                          </p>
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        plot.active_crop ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {plot.active_crop ? 'সক্রিয় ফসল' : 'খালি জমি'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>সকল প্লট ও ফসল পরিচালনা করতে "আমার খামার" পাতায় যান</span>
              <Link href={`/${locale}/farm`} className="font-bold text-emerald-700 hover:underline">
                সম্পূর্ণ তালিকা দেখুন
              </Link>
            </div>
          </Card>
        </div>

        {/* Expert Hotline Card */}
        <div>
          <Card className="p-6 border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white h-full flex flex-col justify-between shadow-card">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                সরকারি কৃষি সহায়তা
              </span>
              <h3 className="text-lg font-black tracking-tight leading-snug">
                কৃষি তথ্য সেবা ও বিশেষজ্ঞ হটলাইন
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                ফসলের রোগবালাই বা আবহাওয়ার জরুরি সতর্কতায় সরাসরি উপজেলা কৃষি কর্মকর্তা বা বিশেষজ্ঞদের সাথে কথা বলুন।
              </p>

              <div className="my-5 p-4 rounded-2xl bg-white/10 border border-white/10">
                <span className="text-[10px] text-slate-300 block">কৃষি কল সেন্টার (টোল ফ্রি)</span>
                <span className="text-2xl font-black text-emerald-400 block mt-0.5">
                  📞 ১৬১২৩
                </span>
                <span className="text-[11px] text-slate-300 block mt-1">সকাল ৯:০০ টা - বিকাল ৫:০০ টা</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>কৃষি সম্প্রসারণ অধিদপ্তর (DAE)</span>
              <Link href={`/${locale}/weather`} className="text-emerald-400 font-bold hover:underline">
                পরামর্শ দেখুন →
              </Link>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
