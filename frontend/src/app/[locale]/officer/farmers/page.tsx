'use client';
import { useState, useEffect } from 'react';
import { officerApi } from '@/lib/api';
import { Users, Search, CheckCircle, XCircle } from 'lucide-react';

export default function FarmersDirectory() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await officerApi.getFarmers();
        setFarmers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = farmers.filter(f => 
    (f.phone || '').includes(search) || 
    (f.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Users className="text-blue-600" size={32} />
          Farmer Directory
        </h1>
        
        <div className="relative w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search phone or name..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="px-6 py-4">Name / Phone</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Land (Dec)</th>
              <th className="px-6 py-4">Active Crops</th>
              <th className="px-6 py-4">Profile Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading farmers...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No farmers found.</td></tr>
            ) : (
              filtered.map(f => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{f.name || 'Unnamed'}</div>
                    <div className="text-sm text-slate-500">{f.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {f.district ? <span className="capitalize">{f.district}{f.upazila ? `, ${f.upazila}` : ''}</span> : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {f.total_land || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                      {f.active_crops} Crops
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {f.is_complete ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                        <CheckCircle size={16} /> Complete
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-500 text-sm font-medium">
                        <XCircle size={16} /> Incomplete
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
