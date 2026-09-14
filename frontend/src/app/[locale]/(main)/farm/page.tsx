'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { farmerApi } from '@/lib/api';
import { 
  Sprout, 
  Layers, 
  History, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  X, 
  TrendingUp,
  Droplets,
  Mountain,
  AlertCircle,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

export default function FarmPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('farm');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'crops' | 'soil' | 'history'>('crops');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Real data from backend
  const [plots, setPlots] = useState<any[]>([]);
  const [histories, setHistories] = useState<any[]>([]);

  // Modals
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState<string>('');

  // Add Plot Form
  const [plotLabel, setPlotLabel] = useState('');
  const [plotDecimal, setPlotDecimal] = useState('30');
  const [plotSoil, setPlotSoil] = useState('loam');
  const [plotWater, setPlotWater] = useState('irrigated_shallow_tube');
  const [plotElevation, setPlotElevation] = useState('medium');
  const [submittingPlot, setSubmittingPlot] = useState(false);

  // Add/Assign Crop Form
  const [cropName, setCropName] = useState('ব্রি ধান ২৮ (BRRI dhan 28)');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  const [submittingCrop, setSubmittingCrop] = useState(false);

  // Load real plots and history
  const loadFarmData = async () => {
    setLoading(true);
    setError('');
    try {
      const [plotsRes, historyRes] = await Promise.all([
        farmerApi.getPlots(),
        farmerApi.getAllCropHistory(),
      ]);
      setPlots(plotsRes.data || []);
      setHistories(historyRes.data || []);
      if (plotsRes.data?.length > 0 && !selectedPlotId) {
        setSelectedPlotId(plotsRes.data[0].id);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push(`/${locale}/login`);
      } else {
        setError(locale === 'bn' ? 'খামারের তথ্য লোড করতে সমস্যা হয়েছে।' : 'Failed to load farm data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarmData();
  }, []);

  // Create new plot in DB
  const handleCreatePlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotLabel) return;
    setSubmittingPlot(true);
    try {
      await farmerApi.createPlot({
        label: plotLabel,
        land_decimal: parseFloat(plotDecimal) || 0,
        soil_type: plotSoil,
        water_availability: plotWater,
        elevation: plotElevation,
      });
      setShowPlotModal(false);
      setPlotLabel('');
      await loadFarmData();
    } catch (err) {
      setError(locale === 'bn' ? 'প্লট তৈরিতে সমস্যা হয়েছে।' : 'Failed to create plot.');
    } finally {
      setSubmittingPlot(false);
    }
  };

  // Assign active crop to plot in DB
  const handleSetCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlotId || !cropName) return;
    setSubmittingCrop(true);
    try {
      await farmerApi.setActiveCrop(selectedPlotId, {
        crop_name: cropName,
        planting_date: plantingDate,
      });
      setShowCropModal(false);
      await loadFarmData();
    } catch (err) {
      setError(locale === 'bn' ? 'ফসল যোগ করতে সমস্যা হয়েছে।' : 'Failed to assign crop.');
    } finally {
      setSubmittingCrop(false);
    }
  };

  // Harvest active crop
  const handleHarvest = async (plotId: string) => {
    if (!confirm(locale === 'bn' ? 'আপনি কি নিশ্চিত যে এই ফসলটি কাটা সম্পন্ন হয়েছে?' : 'Confirm harvest of this crop?')) return;
    try {
      await farmerApi.harvestCrop(plotId);
      await loadFarmData();
    } catch (err) {
      alert('Failed to mark harvested.');
    }
  };

  // Filter plots that have an active crop
  const activePlots = plots.filter(p => p.active_crop);

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
          <Link href={`/${locale}/dashboard`} className="hover:text-slate-900 transition-colors">
            {locale === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
          </Link>
          <span>/</span>
          <span className="text-emerald-700 font-bold">{locale === 'bn' ? 'আমার খামার' : 'My Farm'}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Layers size={28} className="text-emerald-600" />
              <span>{locale === 'bn' ? 'খামার, প্লট ও ফসল ব্যবস্থাপনা' : 'Farm & Plot Enterprise Manager'}</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {locale === 'bn'
                ? 'আপনার রেজিস্টার্ড প্লটসমূহ, জমিতে চলমান ফসলের স্বাস্থ্য ও পূর্ববর্তী মৌসুমের আর্কাইভ।'
                : 'Manage real farm plots, seedings, growth stages, and harvest logs.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => setShowPlotModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-sm transition-all"
            >
              <Plus size={16} className="text-emerald-600" />
              <span>{locale === 'bn' ? 'নতুন প্লট যোগ করুন' : 'Add Plot'}</span>
            </button>
            <button
              onClick={() => {
                if (plots.length === 0) {
                  alert(locale === 'bn' ? 'ফসল যোগ করার আগে অন্তত একটি প্লট তৈরি করুন।' : 'Please create a plot first.');
                  setShowPlotModal(true);
                  return;
                }
                setShowCropModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition-all"
            >
              <Sprout size={16} />
              <span>{locale === 'bn' ? 'ফসল রোপণ রেকর্ড' : 'Plant Crop'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2.5">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Nav Tabs */}
      <div className="flex p-1.5 bg-slate-200/70 rounded-2xl gap-1 max-w-md">
        <button
          onClick={() => setActiveTab('crops')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'crops'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sprout size={16} />
          <span>সক্রিয় ফসল ({activePlots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('soil')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'soil'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers size={16} />
          <span>প্লট ও মাটি ({plots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'history'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History size={16} />
          <span>আর্কাইভ ({histories.length})</span>
        </button>
      </div>

      {loading && (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold">খামারের তথ্য লোড হচ্ছে...</p>
        </div>
      )}

      {/* TAB 1: ACTIVE CROPS */}
      {!loading && activeTab === 'crops' && (
        <div>
          {activePlots.length === 0 ? (
            <Card className="p-12 border-dashed border-slate-200 bg-slate-50/60 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mb-4">
                🌱
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {locale === 'bn' ? 'বর্তমানে কোনো সক্রিয় ফসল নেই' : 'No Active Crops Planted'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 leading-relaxed">
                {locale === 'bn'
                  ? 'আপনার কোনো একটি প্লটে নতুন ফসল রোপণ করতে উপরের "ফসল রোপণ রেকর্ড" বোতামে চাপুন।'
                  : 'Click "Plant Crop" above to log an active planting in one of your plots.'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activePlots.map((plot) => (
                <Card key={plot.id} className="p-6 border-slate-200 shadow-card hover:border-emerald-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center text-2xl shrink-0">
                          🌾
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 text-base leading-snug">
                            {plot.active_crop.crop_name}
                          </h3>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            {plot.label} • {plot.land_decimal} শতাংশ
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        সক্রিয়
                      </span>
                    </div>

                    <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>বৃদ্ধির পর্যায়: {plot.active_crop.growth_stage || 'চলমান'}</span>
                        <span className="text-emerald-700">অনুকূল বৃদ্ধি</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar size={14} />
                          বপন: {plot.active_crop.planting_date || 'তারিখ নির্ধারিত নেই'}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Droplets size={14} className="text-cyan-600" />
                          {plot.water_availability || 'সেচযুক্ত'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex gap-3">
                    <Link
                      href={`/${locale}/scan`}
                      className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-bold transition-all"
                    >
                      রোগ স্ক্যান করুন
                    </Link>
                    <button
                      onClick={() => handleHarvest(plot.id)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                    >
                      ফসল কাটা সম্পন্ন
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PLOTS & SOIL */}
      {!loading && activeTab === 'soil' && (
        <div>
          {plots.length === 0 ? (
            <Card className="p-12 border-dashed border-slate-200 bg-slate-50/60 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mb-4">
                📐
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {locale === 'bn' ? 'কোনো প্লট তৈরি করা হয়নি' : 'No Land Plots Created'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 mb-4 leading-relaxed">
                {locale === 'bn'
                  ? 'আপনার আবাদযোগ্য জমিকে নির্দিষ্ট প্লটে ভাগ করে ফসল ব্যবস্থাপনা শুরু করুন।'
                  : 'Add your first plot with soil and irrigation attributes.'}
              </p>
              <Button onClick={() => setShowPlotModal(true)} variant="gradient" size="md">
                <Plus size={16} />
                <span>প্রথম প্লট তৈরি করুন</span>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {plots.map((plot) => (
                <Card key={plot.id} className="p-6 border-slate-200 shadow-card">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-black text-slate-900 text-base">{plot.label}</h3>
                      <p className="text-xs text-slate-500">আয়তন: {plot.land_decimal} শতাংশ ({((plot.land_decimal || 0) / 33).toFixed(2)} বিঘা)</p>
                    </div>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full capitalize">
                      {plot.soil_type || 'দোঁআশ'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[11px]">মাটির ধরন</span>
                      <span className="font-black text-slate-800 mt-1 block text-sm capitalize">{plot.soil_type || 'দোঁআশ'}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[11px]">সেচ ব্যবস্থা</span>
                      <span className="font-black text-slate-800 mt-1 block text-sm capitalize">{plot.water_availability || 'নলকূপ'}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[11px]">উচ্চতা</span>
                      <span className="font-black text-slate-800 mt-1 block text-sm capitalize">{plot.elevation || 'মাঝারি'}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[11px]">চলমান ফসল</span>
                      <span className="font-black text-emerald-700 mt-1 block text-sm">
                        {plot.active_crop?.crop_name || 'পরিত্যক্ত / খালি'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HARVEST HISTORY */}
      {!loading && activeTab === 'history' && (
        <div>
          {histories.length === 0 ? (
            <Card className="p-12 border-dashed border-slate-200 bg-slate-50/60 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mb-4">
                📜
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {locale === 'bn' ? 'কোনো পূর্ববর্তী ফসল কাটা হয়নি' : 'No Harvest Archive Yet'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 leading-relaxed">
                {locale === 'bn'
                  ? 'আপনার কোনো সক্রিয় ফসল কাটা শেষ হলে "ফসল কাটা সম্পন্ন" বাটনে চাপলে তা এখানে স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।'
                  : 'Harvested crops will automatically appear here.'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {histories.map((h) => (
                <Card key={h.id} className="p-6 border-slate-200 shadow-card">
                  <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-black text-slate-900 text-base">{h.crop_name}</h3>
                      <p className="text-xs text-slate-500">বপন: {h.planting_date || 'তারিখ নেই'}</p>
                    </div>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      কর্তন সম্পন্ন
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600 pt-1 font-semibold">
                    <span>কাটা হয়েছে: {h.harvest_date}</span>
                    <span className="text-emerald-700 font-black text-sm">আর্কাইভ রেকর্ড</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Add Plot Modal ─────────────────────────────────────────── */}
      {showPlotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-lg text-slate-900">
                নতুন জমির প্লট যুক্ত করুন
              </h3>
              <button
                onClick={() => setShowPlotModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePlot} className="space-y-4">
              <Input
                label="প্লটের নাম বা পরিচিতি (Plot Name/Label)"
                value={plotLabel}
                onChange={e => setPlotLabel(e.target.value)}
                placeholder="e.g. উত্তর পাশের চক / প্লট ১"
                required
              />

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  প্লটের জমির পরিমাণ (Land Area)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={plotDecimal}
                    onChange={e => setPlotDecimal(e.target.value)}
                    placeholder="e.g. 30"
                    className="w-full px-4 py-3 text-base rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all min-h-[50px]"
                    required
                  />
                  <div className="bg-slate-100 border border-slate-200 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 flex items-center shrink-0">
                    শতাংশ (Decimal)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="মাটির ধরন (Soil Type)"
                  value={plotSoil}
                  onChange={e => setPlotSoil(e.target.value)}
                  options={[
                    { value: 'loam', label: 'দোঁআশ (Loam)' },
                    { value: 'clay', label: 'এঁটেল (Clay)' },
                    { value: 'sandy_loam', label: 'বেলে দোঁআশ (Sandy Loam)' },
                    { value: 'silty', label: 'পলি মাটি (Silty)' },
                  ]}
                />

                <Select
                  label="সেচ সুবিধা (Water)"
                  value={plotWater}
                  onChange={e => setPlotWater(e.target.value)}
                  options={[
                    { value: 'irrigated_shallow_tube', label: 'অগভীর নলকূপ' },
                    { value: 'irrigated_deep_tube', label: 'গভীর নলকূপ' },
                    { value: 'irrigated_canal', label: 'খাল সেচ' },
                    { value: 'rain_fed', label: 'বৃষ্টি নির্ভর' },
                    { value: 'mixed', label: 'মিশ্র' },
                  ]}
                />
              </div>

              <Select
                label="জমির উচ্চতা (Elevation)"
                value={plotElevation}
                onChange={e => setPlotElevation(e.target.value)}
                options={[
                  { value: 'medium', label: 'মাঝারি জমি (Medium)' },
                  { value: 'highland', label: 'উঁচু জমি (Highland)' },
                  { value: 'low_lying', label: 'নিচু জমি (Low-lying)' },
                ]}
              />

              <div className="pt-3 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="flex-1 text-xs font-bold"
                  onClick={() => setShowPlotModal(false)}
                  disabled={submittingPlot}
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  size="md"
                  className="flex-1 text-xs font-bold"
                  loading={submittingPlot}
                >
                  প্লট সংরক্ষণ করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add/Plant Crop Modal ───────────────────────────────────── */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-lg text-slate-900">
                জমিতে ফসল রোপণ রেকর্ড করুন
              </h3>
              <button
                onClick={() => setShowCropModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSetCrop} className="space-y-4">
              <Select
                label="প্লট নির্বাচন করুন (Select Plot)"
                value={selectedPlotId}
                onChange={e => setSelectedPlotId(e.target.value)}
                options={plots.map(p => ({
                  value: p.id,
                  label: `${p.label} (${p.land_decimal} শতাংশ)`
                }))}
              />

              <Input
                label="ফসলের নাম ও জাত (Crop & Variety)"
                value={cropName}
                onChange={e => setCropName(e.target.value)}
                placeholder="e.g. ব্রি ধান ২৮ / কার্ডিনাল আলু"
                required
              />

              <Input
                label="রোপণের তারিখ (Planting Date)"
                type="date"
                value={plantingDate}
                onChange={e => setPlantingDate(e.target.value)}
                required
              />

              <div className="pt-3 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="flex-1 text-xs font-bold"
                  onClick={() => setShowCropModal(false)}
                  disabled={submittingCrop}
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  size="md"
                  className="flex-1 text-xs font-bold"
                  loading={submittingCrop}
                >
                  ফসল রোপণ নিশ্চিত করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
