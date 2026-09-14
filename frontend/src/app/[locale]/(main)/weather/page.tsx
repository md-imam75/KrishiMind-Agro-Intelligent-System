'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { aiApi } from '@/lib/api';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Sparkles, 
  CheckCircle2,
  RefreshCw,
  Sun,
  MapPin,
  Clock,
  Compass
} from 'lucide-react';

const BD_DISTRICTS = [
  'Dhaka','Gazipur','Narayanganj','Tangail','Mymensingh','Kishoreganj','Chattogram',
  'Cox\'s Bazar','Cumilla','Brahmanbaria','Sylhet','Moulvibazar','Habiganj','Sunamganj',
  'Rajshahi','Bogura','Pabna','Sirajganj','Rangpur','Dinajpur','Kurigram','Khulna',
  'Jashore','Satkhira','Kushtia','Barishal','Bhola','Patuakhali'
].map(d => ({ value: d.toLowerCase().replace(/[' ]/g, '_'), label: d }));

export default function WeatherPage({ params: { locale } }: { params: { locale: string } }) {
  const tCommon = useTranslations('common');
  const [district, setDistrict] = useState('dhaka');
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = async (dist: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await aiApi.getWeather(dist);
      setWeatherData(res.data);
    } catch (err: any) {
      setError(locale === 'bn' ? 'আবহাওয়া তথ্য লোড করতে সমস্যা হয়েছে।' : 'Failed to load weather forecast.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(district);
  }, [district]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
          <Link href={`/${locale}/dashboard`} className="hover:text-slate-900 transition-colors">
            {locale === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
          </Link>
          <span>/</span>
          <span className="text-cyan-700 font-bold">{locale === 'bn' ? 'আবহাওয়া ও কৃষি পরামর্শ' : 'Weather & Advisory'}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <CloudSun size={28} className="text-cyan-600" />
              <span>{locale === 'bn' ? 'কৃষি আবহাওয়া ও বালাই স্প্রে পরামর্শ' : 'Agro-Meteorological Advisory Station'}</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {locale === 'bn'
                ? 'বাংলাদেশের সকল ৬৪ জেলার জন্য রিয়েল-টাইম আবহাওয়া পূর্বাভাস, সেচ পরিকল্পনা ও কীটনাশক স্প্রে করার নিরাপত্তা সূচক।'
                : 'Real-time weather parameters, 7-day forecast, and automated agricultural spray decision guidance.'}
            </p>
          </div>

          {/* District Switcher Dropdown */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <div className="w-56">
              <Select
                label=""
                value={district}
                onChange={e => setDistrict(e.target.value)}
                options={BD_DISTRICTS}
              />
            </div>
            <button
              onClick={() => fetchWeather(district)}
              className="p-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors shadow-sm"
              aria-label="Refresh forecast"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin text-emerald-600' : ''} />
            </button>
          </div>
        </div>
      </div>

      {loading && !weatherData && (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-3" />
          <p className="text-sm font-semibold">আবহাওয়া তথ্য লোড হচ্ছে...</p>
        </div>
      )}

      {weatherData && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Top Live Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-teal-800 via-emerald-800 to-slate-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black tracking-wider text-emerald-200 uppercase bg-white/10 px-2.5 py-1 rounded-md border border-white/10">
                    {weatherData.district} জেলা লাইভ রাডার
                  </span>
                  <span className="text-xs text-slate-300">
                    অক্ষাংশ: {weatherData.latitude}° • দ্রাঘিমাংশ: {weatherData.longitude}°
                  </span>
                </div>

                <div className="flex items-baseline gap-4 my-2">
                  <span className="text-5xl sm:text-6xl font-black tracking-tight">
                    {Math.round(weatherData.current.temperature)}°C
                  </span>
                  <span className="text-xl font-bold text-emerald-100">
                    {weatherData.current.weather_desc_bn}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-lg leading-relaxed">
                  বাতাসে আপেক্ষিক আর্দ্রতা {weatherData.current.relative_humidity}% এবং বাতাসের গতিবেগ প্রতি ঘণ্টায় {weatherData.current.wind_speed_kmh} কিমি।
                </p>
              </div>

              {/* 4 Micro stats */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 text-cyan-300 mb-1">
                    <Droplets size={18} />
                    <span className="text-xs text-slate-200">আর্দ্রতা</span>
                  </div>
                  <span className="text-2xl font-black">{weatherData.current.relative_humidity}%</span>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 text-slate-200 mb-1">
                    <Wind size={18} />
                    <span className="text-xs text-slate-200">বাতাস</span>
                  </div>
                  <span className="text-2xl font-black">{weatherData.current.wind_speed_kmh} <span className="text-xs">কিমি/ঘণ্টা</span></span>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 text-amber-300 mb-1">
                    <Sun size={18} />
                    <span className="text-xs text-slate-200">বৃষ্টিপাত</span>
                  </div>
                  <span className="text-2xl font-black">{weatherData.current.precipitation_mm} <span className="text-xs">মিমি</span></span>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 text-emerald-300 mb-1">
                    <ShieldCheck size={18} />
                    <span className="text-xs text-slate-200">স্প্রে অবস্থা</span>
                  </div>
                  <span className="text-base font-black text-emerald-300 uppercase">
                    {weatherData.advisory.spraying_suitability}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* 2-Column Section: Advisory Rules on Left, 7-Day Forecast on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Agricultural Advisory Decisions (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles size={20} className="text-emerald-600" />
                <span>কৃষি আবহাওয়া সিদ্ধান্ত ও বালাই স্প্রে সূচক</span>
              </h2>

              {/* Spray Suitability Card */}
              <Card className="p-6 border-slate-200 shadow-card">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    weatherData.advisory.spraying_suitability === 'SAFE'
                      ? 'bg-emerald-100 text-emerald-700'
                      : weatherData.advisory.spraying_suitability === 'CAUTION'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {weatherData.advisory.spraying_suitability === 'SAFE' ? (
                      <ShieldCheck size={26} />
                    ) : (
                      <AlertTriangle size={26} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-black text-slate-900">
                        স্প্রে করার উপযুক্ততা:
                      </span>
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        weatherData.advisory.spraying_suitability === 'SAFE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : weatherData.advisory.spraying_suitability === 'CAUTION'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {weatherData.advisory.spraying_suitability === 'SAFE' ? 'অনুকূল (Safe)' : 'সতর্কতা (Caution)'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      {locale === 'bn' ? weatherData.advisory.spraying_reason_bn : weatherData.advisory.spraying_reason_en}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Irrigation Advice */}
              <Card className="p-6 border-slate-200 shadow-card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                    <Droplets size={26} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">সেচ ব্যবস্থাপনা পরামর্শ (Irrigation Guidance):</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      {locale === 'bn' ? weatherData.advisory.irrigation_advice_bn : weatherData.advisory.irrigation_advice_en}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Disease Alert */}
              {weatherData.advisory.disease_risk_alert_bn && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
                  <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <span className="font-bold">বালাই ঝুঁকি সতর্কতা: </span>
                    {locale === 'bn' ? weatherData.advisory.disease_risk_alert_bn : weatherData.advisory.disease_risk_alert_en}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: 7-Day Forecast Grid (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Calendar size={20} className="text-emerald-600" />
                <span>আগামী ৭ দিনের আবহাওয়া পূর্বাভাস</span>
              </h2>

              <div className="space-y-2.5">
                {weatherData.daily.map((day: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card hover:border-slate-300 transition-all flex items-center justify-between text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-800 w-20">
                        {idx === 0 ? 'আজ (Today)' : idx === 1 ? 'আগামীকাল' : day.date}
                      </span>
                      <span className="text-slate-600 font-medium">
                        {day.weather_desc_bn}
                      </span>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-1.5 text-xs text-cyan-700 font-bold">
                        <Droplets size={14} />
                        <span>{day.precipitation_probability}% বৃষ্টি</span>
                      </div>
                      <div className="font-black text-slate-900 text-right w-20">
                        <span>{Math.round(day.temp_max)}° / </span>
                        <span className="text-slate-400 font-semibold">{Math.round(day.temp_min)}°C</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
