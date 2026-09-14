'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAuthStore } from '@/store/auth';
import { authApi, farmerApi } from '@/lib/api';
import axios from 'axios';
import { 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  MapPin, 
  User, 
  Maximize2,
  AlertCircle,
  Mail,
  Lock
} from 'lucide-react';

// All 64 Bangladesh Districts
const BD_DISTRICTS = [
  'Bagerhat','Bandarban','Barguna','Barishal','Bhola','Bogura','Brahmanbaria',
  'Chandpur','Chapainawabganj','Chattogram','Chuadanga','Cox\'s Bazar','Cumilla',
  'Dhaka','Dinajpur','Faridpur','Feni','Gaibandha','Gazipur','Gopalganj',
  'Habiganj','Jamalpur','Jashore','Jhalokati','Jhenaidah','Joypurhat','Khagrachari',
  'Khulna','Kishoreganj','Kurigram','Kushtia','Lakshmipur','Lalmonirhat','Madaripur',
  'Magura','Manikganj','Meherpur','Moulvibazar','Munshiganj','Mymensingh','Naogaon',
  'Narail','Narayanganj','Narsingdi','Natore','Netrokona','Nilphamari','Noakhali',
  'Pabna','Panchagarh','Patuakhali','Pirojpur','Rajbari','Rajshahi','Rangamati',
  'Rangpur','Satkhira','Shariatpur','Sherpur','Sirajganj','Sunamganj','Sylhet',
  'Tangail','Thakurgaon',
].map(d => ({ value: d.toLowerCase().replace(/[' ]/g, '_'), label: d }));

type Step = 1 | 2 | 3;
type LoginMode = 'farmer' | 'officer';

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const [loginMode, setLoginMode] = useState<LoginMode>('farmer');
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Officer login fields
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');

  // Profile setup fields
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [upazila, setUpazila] = useState('');
  const [land, setLand] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const t = useTranslations('auth');
  const router = useRouter();
  const setTokens = useAuthStore(s => s.setTokens);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [countdown]);

  const handleOfficerLogin = async () => {
    setError('');
    if (!officerEmail || !officerPassword) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.officerLogin(officerEmail, officerPassword);
      const { access_token, refresh_token, role } = res.data;
      setTokens(access_token, refresh_token, role);
      router.push(`/${locale}/officer`);
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.detail || 'Invalid credentials' : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const normalizePhone = (p: string) => {
    const digits = p.replace(/\D/g, '');
    if (digits.startsWith('880')) return '+' + digits;
    if (digits.startsWith('0')) return '+880' + digits.slice(1);
    return '+880' + digits;
  };

  const validatePhone = (p: string) => /^01[3-9]\d{8}$/.test(p.replace(/\D/g, '').replace(/^880/, '0'));

  const handleRequestOtp = async () => {
    setError('');
    if (!validatePhone(phone)) {
      setError(locale === 'bn' ? 'সঠিক ১১ সংখ্যার মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)' : 'Enter a valid 11-digit mobile number (e.g. 017XXXXXXXX)');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.requestOtp(normalizePhone(phone));
      setStep(2);
      setCountdown(45);
      if (res.data?.dev_otp) {
        setDevOtpHint(res.data.dev_otp);
      }
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.detail || 'Failed to send OTP' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    if (val && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpValue?: string) => {
    const code = otpValue || otp.join('');
    if (code.length < 6) { 
      setError(locale === 'bn' ? '৬ সংখ্যার কোড সম্পূর্ণ লিখুন' : 'Enter all 6 digits'); 
      return; 
    }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(normalizePhone(phone), code);
      const { access_token, refresh_token, role, is_new_user } = res.data;
      setTokens(access_token, refresh_token, role);
      if (role !== 'farmer') {
        router.push(`/${locale}/officer`);
      } else if (is_new_user) {
        setStep(3);
      } else {
        router.push(`/${locale}/dashboard`);
      }
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.detail || 'Invalid OTP' : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const updates: Record<string, unknown> = {};
      if (name) updates.name = name;
      if (district) updates.district = district;
      if (upazila) updates.upazila = upazila;
      if (land) updates.total_land_decimal = parseFloat(land);
      if (Object.keys(updates).length > 0) {
        await farmerApi.updateProfile(updates);
      }
      router.push(`/${locale}/dashboard`);
    } catch {
      router.push(`/${locale}/dashboard`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Desktop Split Screen Banner */}
      <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex items-center gap-3 mt-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-2xl backdrop-blur-sm border border-white/20">
            🌾
          </div>
          <span className="font-black text-2xl text-white tracking-tight">
            Krishi<span className="text-emerald-400">Mind</span>
          </span>
        </div>
        
        <div className="relative z-10 my-auto">
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight mb-6">
            The intelligent <br />
            <span className="text-emerald-400">decision platform</span> <br />
            for modern farming.
          </h1>
          <p className="text-emerald-100/70 text-lg max-w-md font-medium leading-relaxed">
            Join thousands of farmers across Bangladesh utilizing AI-powered crop insights, accurate weather forecasting, and market intelligence.
          </p>
          
          <div className="flex gap-4 mt-12">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-black text-white">50k+</span>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Farmers</span>
            </div>
            <div className="w-px h-12 bg-white/10 mx-2" />
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-black text-white">12+</span>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Districts</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-emerald-200/50 text-xs font-bold uppercase tracking-wider">
          &copy; {new Date().getFullYear()} KrishiMind • Bangladesh
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-12 relative">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-8 md:p-10 transition-all z-10">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
              🌾
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight block">
                Krishi<span className="text-emerald-600">Mind</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium block">
                Decision Support Platform
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {loginMode === 'officer' ? 'Officer' : step === 1 ? 'Step 1/2' : step === 2 ? 'Step 2/2' : 'Profile'}
          </span>
        </div>

        {/* Login Mode Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => { setLoginMode('farmer'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${loginMode === 'farmer' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            🧑‍🌾 Farmer Login
          </button>
          <button
            onClick={() => { setLoginMode('officer'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${loginMode === 'officer' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            🛡️ Officer Login
          </button>
        </div>

        {/* ─── OFFICER LOGIN ─────────────────────────────────────────────────── */}
        {loginMode === 'officer' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                DAE Officer Portal
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Sign in with your official credentials.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-blue-600 shrink-0" />
              <p className="leading-snug">
                <span className="font-bold">Test Credentials:</span> admin@krishimind.gov.bd / admin123
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={officerEmail}
                    onChange={e => { setError(''); setOfficerEmail(e.target.value); }}
                    placeholder="admin@krishimind.gov.bd"
                    className="w-full pl-11 pr-4 py-3 text-base font-medium border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={officerPassword}
                    onChange={e => { setError(''); setOfficerPassword(e.target.value); }}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 text-base font-medium border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleOfficerLogin}
              loading={loading}
              fullWidth
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ShieldCheck size={18} />
              <span>Sign In as Officer</span>
            </Button>
          </div>
        )}

        {/* ─── STEP 1: Phone Entry ─────────────────────────────────────────────────── */}
        {loginMode === 'farmer' && step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {t('loginTitle')}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {t('loginSubtitle')}
              </p>
            </div>

            {/* Dev Mode Banner */}
            <div className="bg-amber-50/80 border border-amber-200/80 text-amber-900 px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-2.5">
              <Sparkles size={16} className="text-amber-600 shrink-0" />
              <p className="leading-snug">
                <span className="font-bold">Dev Mode:</span> SMS Gateway is bypassed. OTP code is logged in the backend container console.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">
                {t('phoneLabel')}
              </label>
              <div className="flex gap-2">
                <div className="bg-slate-100 border border-slate-200 px-3.5 py-3 rounded-xl text-base font-bold text-slate-700 min-h-[50px] flex items-center gap-1.5 shrink-0">
                  <span>🇧🇩</span>
                  <span>+880</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={e => { setError(''); setPhone(e.target.value.replace(/\D/g, '')); }}
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    className="w-full px-4 py-3 text-lg font-semibold border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all min-h-[50px]"
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium pt-1">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleRequestOtp}
              loading={loading}
              fullWidth
              variant="gradient"
              size="lg"
              disabled={phone.length < 10}
            >
              {t('sendCode')}
            </Button>

            <p className="text-center text-xs text-slate-400">
              নিরাপদ লগইন • পাসওয়ার্ড মনে রাখার প্রয়োজন নেই
            </p>
          </div>
        )}

        {/* ─── STEP 2: OTP Verification ───────────────────────────────────────────── */}
        {loginMode === 'farmer' && step === 2 && (
          <div className="space-y-6">
            <button
              onClick={() => { setStep(1); setOtp(['','','','','','']); setError(''); }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors -mt-2"
            >
              <ArrowLeft size={14} />
              <span>{t('changePhone')}</span>
            </button>

            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {t('otpTitle')}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {t('otpSent')}{' '}
                <span className="font-bold text-slate-800">
                  +880 {phone.replace(/^0/, '').replace(/^880/, '')}
                </span>
              </p>
            </div>

            {/* Dev Hint if caught */}
            {devOtpHint && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between">
                <span>Dev OTP Auto-Detected: <b>{devOtpHint}</b></span>
                <button
                  onClick={() => {
                    const digits = devOtpHint.split('');
                    setOtp(digits);
                    handleVerifyOtp(devOtpHint);
                  }}
                  className="font-bold underline text-emerald-700 hover:text-emerald-900 text-xs"
                >
                  Quick Fill
                </button>
              </div>
            )}

            {/* 6 Digit Inputs */}
            <div className="flex gap-2 sm:gap-2.5 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el; }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className="w-11 h-14 sm:w-12 sm:h-14 text-center text-2xl font-black rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 font-medium">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={() => handleVerifyOtp()}
              loading={loading}
              fullWidth
              variant="gradient"
              size="lg"
              disabled={otp.join('').length < 6}
            >
              <ShieldCheck size={18} />
              <span>{t('verify')}</span>
            </Button>

            <div className="text-center text-xs">
              {countdown > 0 ? (
                <p className="text-slate-400">
                  {t('resendIn')}{' '}
                  <span className="font-bold text-slate-700">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleRequestOtp}
                  className="text-emerald-700 hover:text-emerald-800 font-bold underline transition-colors"
                >
                  {t('resendCode')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── STEP 3: Farm Profile Setup ─────────────────────────────────────────── */}
        {loginMode === 'farmer' && step === 3 && (
          <div className="space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {t('setupTitle')}
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  {t('setupSubtitle')}
                </p>
              </div>
              <button
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors"
              >
                {t('skipForNow')} →
              </button>
            </div>

            <div className="space-y-3.5 pt-1">
              <Input
                label={t('nameLabel')}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. মোঃ রহিম উদ্দিন (Rahim Uddin)"
                leftIcon={<User size={18} />}
              />

              <Select
                label={t('districtLabel')}
                value={district}
                onChange={e => setDistrict(e.target.value)}
                options={[{ value: '', label: '— জেলা নির্বাচন করুন (Select District) —' }, ...BD_DISTRICTS]}
              />

              <Input
                label={t('upazilaLabel')}
                value={upazila}
                onChange={e => setUpazila(e.target.value)}
                placeholder="e.g. সাভার (Savar)"
                leftIcon={<MapPin size={18} />}
              />

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  {t('landLabel')}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={land}
                      onChange={e => setLand(e.target.value)}
                      placeholder="e.g. 50"
                      min="0"
                      className="w-full px-4 py-3 text-base rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all min-h-[50px]"
                    />
                  </div>
                  <div className="bg-slate-100 border border-slate-200 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 flex items-center shrink-0">
                    শতাংশ (Decimal)
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleProfileSave}
                loading={loading}
                fullWidth
                variant="gradient"
                size="lg"
              >
                <CheckCircle2 size={18} />
                <span>{t('saveContinue')}</span>
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
);
}
