'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { intelligenceApi } from '@/lib/api';
import { TrendingUp, TrendingDown, Minus, MapPin, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function MarketPage() {
  const t = useTranslations('Market');
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');

  const fetchPrices = async (d?: string) => {
    setLoading(true);
    try {
      const res = await intelligenceApi.getMarketPrices(d);
      setPrices(res.data);
      if (res.data.length > 0) {
        setDistrict(res.data[0].district);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchDistrict.trim()) {
      fetchPrices(searchDistrict.trim());
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} className="text-red-500" />;
      case 'down': return <TrendingDown size={16} className="text-emerald-500" />;
      default: return <Minus size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">বাজার দর (Market Prices)</h1>
          <p className="text-emerald-100/80 mb-6 max-w-lg">
            আপনার জেলার পাইকারি ও খুচরা বাজারের আজকের সর্বশেষ আপডেট।
          </p>
          
          <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
            <div className="relative flex-1">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                placeholder="জেলার নাম লিখুন..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2.5 rounded-xl font-medium transition-colors">
              <Search size={18} />
            </button>
          </form>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="text-emerald-600" /> 
          <span className="capitalize">{district || 'Loading...'}</span> জেলার বাজার দর
        </h2>
        <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
          আজকের তারিখ: {format(new Date(), 'dd MMM yyyy')}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse h-32" />
          ))}
        </div>
      ) : prices.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
          <p className="text-slate-500">কোনো ডেটা পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prices.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-slate-800">{item.commodity}</h3>
                <div className="bg-slate-50 p-1.5 rounded-full">
                  {getTrendIcon(item.trend)}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">খুচরা (Retail)</span>
                  <span className="font-bold text-slate-800">৳ {item.retail_price} / কেজি</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-medium">পাইকারি (Wholesale)</span>
                  <span className="font-bold text-slate-800">৳ {item.wholesale_price} / কেজি</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
