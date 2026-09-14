'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAuthStore } from '@/store/auth';
import { farmerApi } from '@/lib/api';
import { 
  User, 
  Phone, 
  MapPin, 
  Globe, 
  LogOut, 
  ShieldCheck, 
  Layers,
  CheckCircle2,
  Edit2,
  Save,
  AlertCircle
} from 'lucide-react';

const BD_DISTRICTS = [
  'Dhaka','Gazipur','Narayanganj','Tangail','Mymensingh','Kishoreganj','Chattogram',
  'Cox\'s Bazar','Cumilla','Brahmanbaria','Sylhet','Moulvibazar','Habiganj','Sunamganj',
  'Rajshahi','Bogura','Pabna','Sirajganj','Rangpur','Dinajpur','Kurigram','Khulna',
  'Jashore','Satkhira','Kushtia','Barishal','Bhola','Patuakhali'
].map(d => ({ value: d.toLowerCase().replace(/[' ]/g, '_'), label: d }));

export default function ProfilePage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const [currentLang, setCurrentLang] = useState(locale);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [upazila, setUpazila] = useState('');
  const [land, setLand] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await farmerApi.getProfile();
      const p = res.data;
      setProfile(p);
      setName(p.farmer_name || '');
      setDistrict(p.district || '');
      setUpazila(p.upazila || '');
      setLand(p.total_land_decimal ? String(p.total_land_decimal) : '');
    } catch (err: any) {
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        router.push(`/${locale}/login`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const toggleLanguage = (newLang: string) => {
    localStorage.setItem('km_locale', newLang);
    setCurrentLang(newLang);
    router.push(`/${newLang}/profile`);
  };

  const handleLogout = () => {
    clearAuth();
    router.push(`/${locale}/login`);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await farmerApi.updateProfile({
        name,
        district,
        upazila,
        total_land_decimal: parseFloat(land) || 0,
      });
      setProfile(res.data);
      setEditing(false);
    } catch (err: any) {
      setError(locale === 'bn' ? 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।' : 'Failed to update profile.');
    } finally {
      setSaving(false);
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
          <span className="text-emerald-700 font-bold">{locale === 'bn' ? 'প্রোফাইল ও সেটিংস' : 'Profile & Settings'}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <User size={28} className="text-emerald-600" />
              <span>{locale === 'bn' ? 'কৃষক প্রোফাইল ও খামার সেটিংস' : 'Farmer Profile & Farm Settings'}</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {locale === 'bn'
                ? 'আপনার রেজিস্টার্ড মোবাইল নম্বর, ব্যক্তিগত তথ্য ও জমির রেকর্ড আপডেট করুন।'
                : 'Manage your authenticated account, verified farmer identity, and registered land.'}
            </p>
          </div>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-sm transition-all"
            >
              <Edit2 size={15} />
              <span>{locale === 'bn' ? 'তথ্য সম্পাদনা করুন' : 'Edit Profile'}</span>
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold">প্রোফাইল তথ্য লোড হচ্ছে...</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Farmer ID Card (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-5">
            
            <Card className="p-6 border-slate-200 bg-gradient-to-br from-emerald-800 to-teal-800 text-white shadow-card relative overflow-hidden">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-inner shrink-0">
                  👨‍🌾
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black tracking-tight">
                      {profile?.farmer_name || (locale === 'bn' ? 'নামহীন কৃষক' : 'Farmer User')}
                    </h2>
                    <CheckCircle2 size={18} className="text-emerald-300" />
                  </div>
                  <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-1 font-medium">
                    <Phone size={13} /> {profile?.phone || 'ফোন অনুপস্থিত'}
                  </p>
                  <p className="text-xs text-emerald-200/90 flex items-center gap-1.5 mt-0.5">
                    <MapPin size={13} /> 
                    {profile?.upazila ? `${profile.upazila}, ` : ''}{profile?.district || (locale === 'bn' ? 'জেলা নির্ধারিত নয়' : 'District Unset')}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15 flex justify-between items-center text-xs">
                <span className="text-emerald-100">প্রোফাইল স্ট্যাটাস</span>
                <span className="font-bold bg-white/20 px-3 py-1 rounded-full text-white border border-white/20">
                  {profile?.is_complete ? '✓ শতভাগ সম্পন্ন' : 'অসম্পূর্ণ'}
                </span>
              </div>
            </Card>

            {/* Language Selector */}
            <Card className="p-6 border-slate-200 shadow-card space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Globe size={18} className="text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">ওয়েবসাইটের ভাষা (Language)</h3>
                  <p className="text-[11px] text-slate-400">বাংলা অথবা ইংরেজি নির্বাচন করুন</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => toggleLanguage('bn')}
                  className={`p-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    currentLang === 'bn'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">🇧🇩</span>
                  <span>বাংলা</span>
                </button>
                <button
                  onClick={() => toggleLanguage('en')}
                  className={`p-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    currentLang === 'en'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">🇬🇧</span>
                  <span>English</span>
                </button>
              </div>
            </Card>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full p-3.5 rounded-2xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <LogOut size={16} />
              <span>লগআউট করুন (Log Out)</span>
            </button>
          </div>

          {/* Right Column: Edit Profile Form OR Display (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-5">
            
            {editing ? (
              <Card className="p-6 border-slate-200 shadow-card">
                <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
                  <Edit2 size={18} className="text-emerald-600" />
                  <span>ব্যক্তিগত ও খামার তথ্য সম্পাদনা</span>
                </h3>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <Input
                    label="কৃষকের পূর্ণ নাম (Farmer Full Name)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. মোঃ রহিম উদ্দিন (Md. Rahim Uddin)"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Select
                      label="জেলা (District)"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      options={[{ value: '', label: '— জেলা নির্বাচন করুন —' }, ...BD_DISTRICTS]}
                      required
                    />

                    <Input
                      label="উপজেলা (Upazila)"
                      value={upazila}
                      onChange={e => setUpazila(e.target.value)}
                      placeholder="e.g. সাভার (Savar)"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                      মোট আবাদযোগ্য জমির পরিমাণ (Total Land)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={land}
                        onChange={e => setLand(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full px-4 py-3 text-base rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all min-h-[50px]"
                        required
                      />
                      <div className="bg-slate-100 border border-slate-200 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 flex items-center shrink-0">
                        শতাংশ (Decimal)
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="pt-3 flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      className="flex-1 text-xs font-bold"
                      onClick={() => setEditing(false)}
                      disabled={saving}
                    >
                      বাতিল
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      size="md"
                      className="flex-1 text-xs font-bold"
                      loading={saving}
                    >
                      <Save size={16} />
                      <span>সংরক্ষণ করুন</span>
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="p-6 border-slate-200 shadow-card space-y-5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Layers size={18} className="text-emerald-600" />
                  <span>নিবন্ধিত খামার ও ভূমির পরিসংখ্যান</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-xs">মোট জমি (Registered Land)</span>
                    <span className="font-black text-slate-900 text-lg mt-1 block">
                      {profile?.total_land_decimal ? `${profile.total_land_decimal} শতাংশ` : 'নির্ধারিত নয়'}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-xs">নিবন্ধিত প্লটের সংখ্যা</span>
                    <span className="font-black text-slate-900 text-lg mt-1 block">
                      {profile?.plots?.length || 0}টি সক্রিয় প্লট
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-xs">উপজেলা</span>
                    <span className="font-black text-slate-900 text-lg mt-1 block">
                      {profile?.upazila || 'নির্ধারিত নয়'}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-xs">জেলা (District)</span>
                    <span className="font-black text-emerald-700 text-lg mt-1 block capitalize">
                      {profile?.district || 'নির্ধারিত নয়'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                  <span>খামারের প্লট ও ফসল পরিচালনা করতে "আমার খামার" পাতায় যান</span>
                  <Link href={`/${locale}/farm`} className="font-bold text-emerald-700 hover:underline">
                    খামার পরিচালনা →
                  </Link>
                </div>
              </Card>
            )}

            {/* Hotline banner */}
            <Card className="p-5 border-slate-200 bg-emerald-50/70 border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                  📞
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">জাতীয় কৃষি কল সেন্টার</h4>
                  <p className="text-[11px] text-slate-500">টোল-ফ্রি সরাসরি কথা বলুন কৃষি কর্মকর্তাদের সাথে</p>
                </div>
              </div>
              <span className="text-emerald-700 font-black text-base">১৬১২৩</span>
            </Card>

          </div>

        </div>
      )}

    </div>
  );
}
