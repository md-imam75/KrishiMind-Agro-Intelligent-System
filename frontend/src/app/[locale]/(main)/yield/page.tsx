'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { aiApi } from '@/lib/api';
import { 
  BarChart2, 
  Sparkles, 
  TrendingUp, 
  Coins, 
  Layers, 
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Scale
} from 'lucide-react';

export default function YieldPage({ params: { locale } }: { params: { locale: string } }) {
  const tCommon = useTranslations('common');

  const [cropName, setCropName] = useState('rice');
  const [variety, setVariety] = useState('BRRI dhan 28');
  const [landUnit, setLandUnit] = useState<'decimal' | 'bigha'>('decimal');
  const [landArea, setLandArea] = useState('30');
  const [soilType, setSoilType] = useState('loam');
  const [water, setWater] = useState('irrigated_shallow_tube');
  const [district, setDistrict] = useState('dhaka');

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any | null>(null);
  const [error, setError] = useState('');

  const calculateDecimal = () => {
    const val = parseFloat(landArea) || 0;
    return landUnit === 'bigha' ? val * 33 : val;
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await aiApi.predictYield({
        crop_name: cropName,
        variety,
        land_decimal: calculateDecimal(),
        soil_type: soilType,
        water_availability: water,
        district,
      });
      setPrediction(res.data);
    } catch (err: any) {
      setError(locale === 'bn' ? 'ফলন পূর্বাভাস নির্ণয় করতে সমস্যা হয়েছে।' : 'Failed to calculate yield prediction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
          <Link href={`/${locale}/dashboard`} className="hover:text-slate-900 transition-colors">
            {locale === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
          </Link>
          <span>/</span>
          <span className="text-amber-700 font-bold">{locale === 'bn' ? 'ফলন পূর্বাভাস' : 'Yield Prediction'}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <BarChart2 size={28} className="text-amber-600" />
              <span>{locale === 'bn' ? 'ফসলের সম্ভাব্য ফলন ও আয় পূর্বাভাস' : 'Harvest Yield & Revenue Forecaster'}</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {locale === 'bn'
                ? 'জমির পরিমাণ ও মাটির উর্বরতার প্রেক্ষিতে প্রত্যাশিত মণ ফলন এবং বর্তমান পাইকারি বাজারমূল্য প্রাক্কলন।'
                : 'Project seasonal harvest outcome in maunds and kilograms with revenue range in Bangladeshi Taka.'}
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-black px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            Yield Econometric Model
          </span>
        </div>
      </div>

      {/* 2-Column Professional Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 border-slate-200 shadow-card">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Scale size={18} className="text-amber-600" />
              <span>{locale === 'bn' ? 'প্লট ও ফসলের পরিমাপ' : 'Plot & Crop Configuration'}</span>
            </h2>

            <form onSubmit={handlePredict} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Select
                  label={locale === 'bn' ? 'ফসল (Crop)' : 'Crop'}
                  value={cropName}
                  onChange={e => {
                    setCropName(e.target.value);
                    if (e.target.value === 'rice') setVariety('BRRI dhan 28');
                    else if (e.target.value === 'potato') setVariety('Diamond');
                    else if (e.target.value === 'jute') setVariety('Tosha JRO-524');
                    else setVariety('BARI Gom 33');
                  }}
                  options={[
                    { value: 'rice', label: 'ধান (Rice)' },
                    { value: 'potato', label: 'গোল আলু (Potato)' },
                    { value: 'jute', label: 'তোষা পাট (Jute)' },
                    { value: 'wheat', label: 'গম (Wheat)' },
                    { value: 'mustard', label: 'সরিষা (Mustard)' },
                    { value: 'maize', label: 'ভুট্টা (Maize)' },
                  ]}
                />

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                    {locale === 'bn' ? 'জাত (Variety)' : 'Variety'}
                  </label>
                  <input
                    type="text"
                    value={variety}
                    onChange={e => setVariety(e.target.value)}
                    className="w-full px-4 py-3 text-base rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all min-h-[50px]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    {locale === 'bn' ? 'জমির পরিমাপ ও একক' : 'Land Size & Unit'}
                  </label>
                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setLandUnit('decimal')}
                      className={`px-3 py-1 rounded-lg transition-all ${landUnit === 'decimal' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                    >
                      শতাংশ (Decimal)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLandUnit('bigha')}
                      className={`px-3 py-1 rounded-lg transition-all ${landUnit === 'bigha' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                    >
                      বিঘা (Bigha: 33 Dec)
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  value={landArea}
                  onChange={e => setLandArea(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full px-4 py-3 text-base rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all min-h-[50px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Select
                  label={locale === 'bn' ? 'মাটির শ্রেণি' : 'Soil'}
                  value={soilType}
                  onChange={e => setSoilType(e.target.value)}
                  options={[
                    { value: 'loam', label: 'দোঁআশ (Loam)' },
                    { value: 'sandy_loam', label: 'বেলে দোঁআশ (Sandy Loam)' },
                    { value: 'clay', label: 'এঁটেল (Clay)' },
                    { value: 'silty', label: 'পলি (Silty)' },
                  ]}
                />

                <Select
                  label={locale === 'bn' ? 'সেচ সুবিধা' : 'Irrigation'}
                  value={water}
                  onChange={e => setWater(e.target.value)}
                  options={[
                    { value: 'irrigated_shallow_tube', label: 'নলকূপ সেচ (Tube Well)' },
                    { value: 'rain_fed', label: 'বৃষ্টি নির্ভর (Rain-fed)' },
                    { value: 'mixed', label: 'মিশ্র ব্যবস্থা (Mixed)' },
                  ]}
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                fullWidth
                variant="gradient"
                size="lg"
                className="mt-2 text-sm font-bold bg-gradient-to-r from-amber-600 to-orange-600"
              >
                <Sparkles size={18} />
                <span>{locale === 'bn' ? 'সম্ভাব্য ফলন ও আয় গণনা করুন' : 'Forecast Yield & Revenue'}</span>
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Prediction Report (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!prediction && !loading && (
            <Card className="p-12 border-dashed border-slate-200 bg-slate-50/60 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mb-4">
                📊
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {locale === 'bn' ? 'ফলন হিসাবের তথ্য দিন' : 'Yield Forecaster Ready'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 leading-relaxed">
                {locale === 'bn'
                  ? 'বাম পাশে ফসলের নাম ও জমির পরিমাণ নির্বাচন করে বাটনে ক্লিক করলে মণ ও কেজিভিত্তিক সম্ভাব্য ফলন এবং প্রাক্কলিত রাজস্ব চার্ট প্রদর্শিত হবে।'
                  : 'Specify your crop variety and plot area to run econometric yield predictions.'}
              </p>
            </Card>
          )}

          {prediction && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
              
              {/* Main Headline Yield Card */}
              <Card className="p-6 border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 shadow-card">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-5 pb-4 border-b border-amber-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                      {prediction.productivity_rating}
                    </span>
                    <h3 className="text-xs text-slate-500 font-semibold mt-2">মোট আনুমানিক ফলন (Total Expected Harvest)</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl sm:text-5xl font-black text-slate-900">
                        {prediction.estimated_yield_maund}
                      </span>
                      <span className="text-base font-black text-slate-700">মণ (Maunds)</span>
                      <span className="text-sm font-semibold text-slate-400">
                        • {prediction.estimated_yield_kg} কেজি
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                    🌾
                  </div>
                </div>

                {/* 3-Tier Confidence Band Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>সর্বনিম্ন: {prediction.confidence_interval_kg.min} কেজি</span>
                    <span className="text-amber-700">প্রত্যাশিত: {prediction.estimated_yield_kg} কেজি</span>
                    <span>সর্বোচ্চ: {prediction.confidence_interval_kg.max} কেজি</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                    <div className="w-1/4 bg-amber-300" />
                    <div className="w-1/2 bg-amber-500" />
                    <div className="w-1/4 bg-emerald-500" />
                  </div>
                </div>

                {/* Market Value Estimate */}
                <div className="mt-5 pt-4 border-t border-amber-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Coins size={22} />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">প্রাক্কলিত বাজারমূল্য (Gross Revenue)</span>
                      <span className="text-2xl font-black text-emerald-700 block">
                        ৳ {prediction.estimated_revenue_bdt.expected.toLocaleString()} BDT
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    পরিসীমা: ৳{prediction.estimated_revenue_bdt.min.toLocaleString()} — ৳{prediction.estimated_revenue_bdt.max.toLocaleString()}
                  </span>
                </div>
              </Card>

              {/* Agronomic Boost Advice */}
              <Card className="p-6 border-slate-200 shadow-card space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <span>ফলন সর্বাধিক করার বৈজ্ঞানিক ব্যবস্থাপনা</span>
                </h4>
                <div className="space-y-2">
                  {(locale === 'bn' ? prediction.agronomic_tips_bn : prediction.agronomic_tips_en).map((tip: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </Card>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
