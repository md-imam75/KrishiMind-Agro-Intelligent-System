'use client';
import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { aiApi } from '@/lib/api';
import { 
  Camera, 
  UploadCloud, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Pill, 
  Leaf, 
  Bot,
  RefreshCw,
  Clock,
  Info,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function ScanPage({ params: { locale } }: { params: { locale: string } }) {
  const tCommon = useTranslations('common');
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const crops = [
    { id: 'rice', name_bn: 'ধান (Rice)', icon: '🌾' },
    { id: 'potato', name_bn: 'আলু (Potato)', icon: '🥔' },
    { id: 'jute', name_bn: 'পাট (Jute)', icon: '🌿' },
    { id: 'wheat', name_bn: 'গম (Wheat)', icon: '🌾' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleDiagnose = async () => {
    if (!selectedFile) {
      setError(locale === 'bn' ? 'অনুগ্রহ করে পাতার একটি ছবি আপলোড করুন।' : 'Please upload a photo of a leaf.');
      return;
    }

    setScanning(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('crop_hint', selectedCrop);

      const res = await aiApi.scanDisease(formData);
      setResult(res.data);
    } catch (err: any) {
      setError(locale === 'bn' ? 'রোগ নির্ণয় করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to diagnose leaf image.');
    } finally {
      setScanning(false);
    }
  };

  const resetScan = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setResult(null);
    setError('');
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
          <span className="text-blue-700 font-bold">{locale === 'bn' ? 'রোগ স্ক্যানার' : 'Disease Scanner'}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Camera size={28} className="text-blue-600" />
              <span>{locale === 'bn' ? 'ফসলের রোগ নির্ণয় ও সমাধান স্ক্যানার' : 'Leaf Disease Diagnostic Scanner'}</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {locale === 'bn'
                ? 'আক্রান্ত পাতার স্পষ্ট ছবি আপলোড করুন। এআই কয়েক সেকেন্ডের মধ্যে লক্ষণ বিশ্লেষণ করে অনুমোদিত বালাইনাশক ও জৈব সমাধান প্রদান করবে।'
                : 'Upload leaf imagery for AI-powered multi-pathogen diagnosis and targeted pest treatment guidelines.'}
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-black px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            Vision Diagnostic AI
          </span>
        </div>
      </div>

      {/* 2-Column Professional Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload & Camera Viewfinder (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Crop Selector Card */}
          <Card className="p-5 border-slate-200 shadow-card">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
              ১. ফসলের ধরন নির্বাচন করুন (Select Crop Type):
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {crops.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCrop(c.id)}
                  className={`px-3.5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    selectedCrop === c.id
                      ? 'bg-blue-600 text-white shadow-sm scale-[1.01]'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{c.icon}</span>
                  <span>{c.name_bn}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Upload Viewfinder Box */}
          <Card className="p-6 border-slate-200 shadow-card text-center relative overflow-hidden">
            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video max-h-72 flex items-center justify-center border border-slate-200 shadow-inner">
                  <img 
                    src={previewUrl} 
                    alt="Selected leaf preview" 
                    className="w-full h-full object-contain bg-slate-900"
                  />
                  {scanning && (
                    <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                      <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-blue-400 animate-spin mb-3" />
                      <span className="text-sm font-bold tracking-wide animate-pulse">
                        পাতার রোগ নির্ণয় বিশ্লেষণ চলছে...
                      </span>
                      <span className="text-xs text-blue-200 mt-1">Analyzing necrotic and chlorotic lesions</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    className="flex-1 text-xs font-bold"
                    onClick={resetScan}
                    disabled={scanning}
                  >
                    <RefreshCw size={14} />
                    <span>নতুন ছবি আপলোড</span>
                  </Button>

                  {!result && (
                    <Button
                      variant="gradient"
                      size="md"
                      className="flex-[2] text-xs font-bold bg-gradient-to-r from-blue-600 to-teal-600"
                      onClick={handleDiagnose}
                      loading={scanning}
                    >
                      <Sparkles size={16} />
                      <span>রোগ নির্ণয় শুরু করুন</span>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10 px-4 flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-3xl bg-blue-50 border-2 border-dashed border-blue-300 flex items-center justify-center text-blue-600 mb-4 shadow-inner">
                  <UploadCloud size={38} />
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1">
                  {locale === 'bn' ? 'পাতার ছবি আপলোড করুন' : 'Upload or Drag Leaf Photo'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
                  {locale === 'bn'
                    ? 'আক্রান্ত পাতার স্পষ্ট অংশ ফ্রেমে রাখুন। পর্যাপ্ত আলোতে তোলা ছবি নির্ভুল ফলাফল নিশ্চিত করে।'
                    : 'Supported formats: JPG, PNG, WEBP up to 10MB.'}
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="gradient"
                  size="lg"
                  fullWidth
                  className="max-w-sm text-sm font-bold bg-gradient-to-r from-blue-600 to-teal-600"
                >
                  <Camera size={18} />
                  <span>ছবি নির্বাচন বা আপলোড করুন</span>
                </Button>
              </div>
            )}
          </Card>

          {/* Diagnostic Guidelines Card */}
          <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200/70 text-xs text-slate-700 space-y-2">
            <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
              <Info size={16} className="text-blue-700" />
              <span>সঠিক রোগ শনাক্তের নিয়মাবলী</span>
            </h4>
            <ul className="space-y-1 text-slate-600 pl-1">
              <li>• সরাসরি রোদে ছায়া ফেলে পাতার স্পষ্ট দাগের ক্লোজ-আপ ছবি তুলুন।</li>
              <li>• একটি একক পাতায় ফোকাস করুন যাতে ব্যাকগ্রাউন্ডের ঘাস বিভ্রান্তি না ঘটায়।</li>
            </ul>
          </div>

        </div>

        {/* Right Column: Diagnostic Report (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-5">
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2.5">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!result && !scanning && (
            <Card className="p-12 border-dashed border-slate-200 bg-slate-50/60 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center text-3xl mb-4">
                🔬
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {locale === 'bn' ? 'রোগ নির্ণয় ফলাফল অপেক্ষমাণ' : 'Diagnostic Report Area'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 leading-relaxed">
                {locale === 'bn'
                  ? 'বাম পাশ থেকে আক্রান্ত পাতার একটি ছবি আপলোড করে "রোগ নির্ণয় শুরু করুন" চাপলে এখানে বিস্তারিত লক্ষণ ও সমাধান প্রদর্শিত হবে।'
                  : 'Diagnostic results and chemical/organic treatments will appear here after upload.'}
              </p>
            </Card>
          )}

          {/* ─── RESULT REPORT SECTION ────────────────────────────────── */}
          {result && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
              
              {/* Diagnosis Headline */}
              <Card className="p-6 border-slate-200 shadow-card">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      শনাক্তকৃত রোগ (Diagnosed Pathogen)
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">
                      {locale === 'bn' ? result.disease_name_bn : result.disease_name_en}
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      {result.disease_name_en}
                    </p>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-0 shrink-0">
                    <span className={`text-xs font-black px-3 py-1 rounded-full uppercase ${
                      result.severity === 'critical'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : result.severity === 'high'
                        ? 'bg-orange-100 text-orange-800 border border-orange-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {result.severity === 'critical' ? 'মারাত্মক (Critical)' : result.severity === 'high' ? 'উচ্চ ঝুঁকি (High)' : 'মাঝারি (Moderate)'}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 font-bold">
                      নির্ভুলতা: {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                    লক্ষণ ও বিস্তার (Field Symptoms):
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {locale === 'bn' ? result.symptoms_bn : result.symptoms_en}
                  </p>
                </div>
              </Card>

              {/* Chemical Remedies */}
              <Card className="p-6 border-slate-200 shadow-card">
                <div className="flex items-center gap-2.5 mb-3.5 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    <Pill size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      অনুমোদিত রাসায়নিক বালাইনাশক ও প্রয়োগমাত্রা (Chemical Treatment)
                    </h3>
                    <span className="text-[10px] text-slate-400">DAE Bangladesh Approved Formulations</span>
                  </div>
                </div>
                <div className="space-y-2 pl-1">
                  {(locale === 'bn' ? result.treatment.chemical_bn : result.treatment.chemical_en).map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Organic & Cultural Controls */}
              <Card className="p-6 border-slate-200 shadow-card">
                <div className="flex items-center gap-2.5 mb-3.5 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Leaf size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      জৈব ও সমন্বিত বালাই দমন ব্যবস্থা (Organic & Cultural IPM)
                    </h3>
                    <span className="text-[10px] text-slate-400">Environmentally friendly management</span>
                  </div>
                </div>
                <div className="space-y-2 pl-1">
                  {(locale === 'bn' ? result.treatment.organic_bn : result.treatment.organic_en).map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* AI Assistant Callout */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">আরো বিস্তারিত পরামর্শ চান?</h4>
                    <p className="text-xs text-slate-500">আমাদের বাংলা এআই কৃষি সহকারীকে সরাসরি যেকোনো প্রশ্ন করুন</p>
                  </div>
                </div>
                <Link
                  href={`/${locale}/assistant`}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition-all shrink-0"
                >
                  সহকারী খুলুন →
                </Link>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
