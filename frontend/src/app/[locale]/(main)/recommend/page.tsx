'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { aiApi } from '@/lib/api';
import { 
  Sprout, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Droplets, 
  TrendingUp, 
  ArrowLeft, 
  MapPin, 
  Layers,
  Calendar,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Coins
} from 'lucide-react';

const BD_DISTRICTS = [
  'Dhaka','Gazipur','Narayanganj','Tangail','Mymensingh','Kishoreganj','Chattogram',
  'Cox\'s Bazar','Cumilla','Brahmanbaria','Sylhet','Moulvibazar','Habiganj','Sunamganj',
  'Rajshahi','Bogura','Pabna','Sirajganj','Rangpur','Dinajpur','Kurigram','Khulna',
  'Jashore','Satkhira','Kushtia','Barishal','Bhola','Patuakhali'
].map(d => ({ value: d.toLowerCase().replace(/[' ]/g, '_'), label: d }));

export default function RecommendPage({ params: { locale } }: { params: { locale: string } }) {
  const tCommon = useTranslations('common');

  const [district, setDistrict] = useState('dhaka');
  const [soilType, setSoilType] = useState('loam');
  const [season, setSeason] = useState('rabi');
  const [water, setWater] = useState('irrigated_shallow_tube');
  const [elevation, setElevation] = useState('medium');
  const [landDecimal, setLandDecimal] = useState('30');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState('');

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await aiApi.recommendCrops({
        district,
        soil_type: soilType,
        season,
        water_availability: water,
        elevation,
        land_decimal: parseFloat(landDecimal) || 30,
      });
      setResults(res.data.recommendations || []);
    } catch (err: any) {
      setError(locale === 'bn' ? 'সুপারিশ তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to generate recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
          <Link href={`/${locale}/dashboard`} className="hover:text-slate-900 transition-colors">
            {locale === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
          </Link>
          <span>/</span>
          <span className="text-emerald-700 font-bold">{locale === 'bn' ? 'স্মার্ট ফসল সুপারিশ' : 'Crop Recommendation'}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Sprout size={28} className="text-emerald-600" />
              <span>{locale === 'bn' ? 'স্মার্ট ফসল সুপারিশ ইঞ্জিন' : 'AI Crop Recommendation Engine'}</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {locale === 'bn'
                ? 'আপনার এলাকার মাটির গঠন, ঋতু ও সেচ সুবিধার সাথে শতভাগ সামঞ্জস্যপূর্ণ সেরা ফসল নির্বাচন করুন।'
                : 'Scientific agronomic matching tailored to Bangladesh AEZ and BRRI/BARI yield standards.'}
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-black px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            BRRI & BARI Calibrated
          </span>
        </div>
      </div>

      {/* 2-Column Professional Desktop Layout: Form on Left (or Top on mobile), Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Parameter Form (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 border-slate-200 shadow-card">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Layers size={18} className="text-emerald-600" />
              <span>{locale === 'bn' ? 'জমির বৈশিষ্ট্য ও মৌসুম নির্বাচন' : 'Field & Soil Parameters'}</span>
            </h2>

            <form onSubmit={handleRecommend} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Select
                  label={locale === 'bn' ? 'জেলা (District)' : 'District'}
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  options={BD_DISTRICTS}
                />

                <Select
                  label={locale === 'bn' ? 'মৌসুম (Crop Season)' : 'Season'}
                  value={season}
                  onChange={e => setSeason(e.target.value)}
                  options={[
                    { value: 'rabi', label: 'রবি (Rabi: Nov-Feb)' },
                    { value: 'kharif_1', label: 'খরিফ-১ (Kharif-1: Mar-Jun)' },
                    { value: 'kharif_2', label: 'খরিফ-২ (Kharif-2: Jul-Oct)' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Select
                  label={locale === 'bn' ? 'মাটির শ্রেণি (Soil Type)' : 'Soil Type'}
                  value={soilType}
                  onChange={e => setSoilType(e.target.value)}
                  options={[
                    { value: 'loam', label: 'দোঁআশ (Loam)' },
                    { value: 'clay', label: 'এঁটেল (Clay)' },
                    { value: 'sandy_loam', label: 'বেলে দোঁআশ (Sandy Loam)' },
                    { value: 'silty', label: 'পলি মাটি (Silty)' },
                  ]}
                />

                <Select
                  label={locale === 'bn' ? 'সেচ ব্যবস্থা (Water Source)' : 'Water Access'}
                  value={water}
                  onChange={e => setWater(e.target.value)}
                  options={[
                    { value: 'irrigated_shallow_tube', label: 'অগভীর নলকূপ (Shallow Tube)' },
                    { value: 'irrigated_deep_tube', label: 'গভীর নলকূপ (Deep Tube)' },
                    { value: 'irrigated_canal', label: 'খাল সেচ (Canal)' },
                    { value: 'rain_fed', label: 'বৃষ্টি নির্ভর (Rain-fed)' },
                    { value: 'mixed', label: 'মিশ্র সুবিধা (Mixed)' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Select
                  label={locale === 'bn' ? 'জমির অবস্থান (Elevation)' : 'Elevation'}
                  value={elevation}
                  onChange={e => setElevation(e.target.value)}
                  options={[
                    { value: 'medium', label: 'মাঝারি জমি (Medium)' },
                    { value: 'highland', label: 'উঁচু জমি (Highland)' },
                    { value: 'low_lying', label: 'নিচু জমি (Low-lying)' },
                  ]}
                />

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                    {locale === 'bn' ? 'জমির পরিমাণ (Decimal)' : 'Land Area (Decimal)'}
                  </label>
                  <input
                    type="number"
                    value={landDecimal}
                    onChange={e => setLandDecimal(e.target.value)}
                    className="w-full px-4 py-3 text-base rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all min-h-[50px]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                fullWidth
                variant="gradient"
                size="lg"
                className="mt-2 text-sm font-black"
              >
                <Sparkles size={18} />
                <span>{locale === 'bn' ? 'সেরা ফসল সুপারিশ তৈরি করুন' : 'Run Agronomic Recommendation'}</span>
              </Button>
            </form>
          </Card>

          {/* Side Guidance Tip */}
          <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-slate-700 space-y-2">
            <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-700" />
              <span>কৃষি অ্যালগরিদম তথ্য</span>
            </h4>
            <p className="leading-relaxed">
              সুপারিশ ইঞ্জিনটি বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI) এবং ধান গবেষণা ইনস্টিটিউট (BRRI) এর জলবায়ু উপযোগিতা ম্যাট্রিক্সের উপর ভিত্তি করে হিসাব পরিচালনা করে।
            </p>
          </div>
        </div>

        {/* Right Column: Recommendations Results Grid (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!results && !loading && (
            <Card className="p-12 border-dashed border-slate-200 bg-slate-50/60 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mb-4">
                🌱
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {locale === 'bn' ? 'সুপারিশ দেখার জন্য প্রস্তুত' : 'Ready for Analysis'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 leading-relaxed">
                {locale === 'bn'
                  ? 'বাম পাশের ফর্ম থেকে আপনার জেলার নাম, মাটির ধরন এবং মৌসুম নির্বাচন করে "সুপারিশ তৈরি করুন" বাটনে ক্লিক করুন।'
                  : 'Select your field parameters on the left to see ranked optimal crops.'}
              </p>
            </Card>
          )}

          {results && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {locale === 'bn' ? 'সেরা উপযুক্ত ফসলের তালিকা' : 'Top Ranked Recommended Crops'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {results.length}টি ফসল নির্বাচিত হয়েছে আপনার মাটির জন্য
                  </p>
                </div>
              </div>

              {results.map((crop, idx) => (
                <Card key={idx} className="p-6 border-slate-200 hover:border-emerald-300 hover:shadow-card-hover transition-all duration-200">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-2xl shrink-0">
                        🌾
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg leading-snug">
                          {locale === 'bn' ? crop.crop_name_bn : crop.crop_name_en}
                        </h3>
                        <p className="text-xs font-semibold text-emerald-700">
                          {locale === 'bn' ? crop.variety_bn : crop.variety_en}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-0">
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {crop.suitability_score}% ম্যাচ স্কোর
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1 font-bold">র‍্যাংক #{idx + 1}</span>
                    </div>
                  </div>

                  {/* 4-Stat Specs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3.5 my-3 border-y border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">শতাংশ প্রতি ফলন</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">{crop.expected_yield_per_decimal_kg} কেজি</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">মেয়াদকাল (Duration)</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">{crop.duration_days} দিন</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">জলের প্রয়োজনীয়তা</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">{crop.water_requirement}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">লাভের সম্ভাবনা</span>
                      <span className="font-bold text-emerald-700 mt-0.5 block">{crop.profit_potential}</span>
                    </div>
                  </div>

                  {/* Agronomic Reasons */}
                  <div className="space-y-1.5 my-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      {locale === 'bn' ? 'সুপারিশের বৈজ্ঞানিক কারণ:' : 'Key Agronomic Advantages:'}
                    </span>
                    {(locale === 'bn' ? crop.reasons_bn : crop.reasons_en).map((reason: string, rIdx: number) => (
                      <div key={rIdx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{reason}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
                    <Link 
                      href={`/${locale}/yield`}
                      className="flex-1 text-center py-2.5 rounded-xl border border-emerald-600 text-emerald-700 text-xs font-bold hover:bg-emerald-50 transition-colors"
                    >
                      ফলন পূর্বাভাস হিসাব করুন
                    </Link>
                    <Link 
                      href={`/${locale}/farm`}
                      className="flex-1 text-center py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      খামারে এই ফসল যুক্ত করুন
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
