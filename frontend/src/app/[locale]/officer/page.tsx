'use client';
import { useState, useEffect } from 'react';
import { officerApi } from '@/lib/api';
import { Users, Sprout, AlertTriangle, UserPlus, Map } from 'lucide-react';

export default function OfficerDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, heatmapRes] = await Promise.all([
          officerApi.getStats(),
          officerApi.getHeatmap()
        ]);
        setStats(statsRes.data);
        setHeatmap(heatmapRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4">Loading dashboard...</div>;
  }

  const kpis = [
    { label: 'Total Farmers', value: stats?.total_farmers || 0, icon: <Users size={24} />, color: 'bg-blue-500' },
    { label: 'Active Crops', value: stats?.active_crops_count || 0, icon: <Sprout size={24} />, color: 'bg-emerald-500' },
    { label: 'Critical Alerts', value: stats?.critical_alerts || 0, icon: <AlertTriangle size={24} />, color: 'bg-red-500' },
    { label: 'New Onboards', value: stats?.recent_onboardings || 0, icon: <UserPlus size={24} />, color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">District Overview</h1>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${kpi.color} text-white flex items-center justify-center shadow-inner`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Map className="text-blue-600" />
          <h2 className="text-xl font-bold text-slate-800">Risk Heatmap</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {heatmap.map((area, i) => (
              <div 
                key={i} 
                className="p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all"
                style={{
                  backgroundColor: `rgba(239, 68, 68, ${area.risk_score * 0.5})`, // Red scale based on risk
                  borderColor: `rgba(239, 68, 68, ${area.risk_score})`
                }}
              >
                <span className="font-bold text-slate-800 capitalize mb-1">{area.district}</span>
                <span className="text-xs font-semibold bg-white/80 px-2 py-1 rounded-full text-slate-700">
                  Risk: {Math.round(area.risk_score * 100)}%
                </span>
                <span className="text-xs font-medium text-slate-600 mt-2">
                  Top Issue: {area.dominant_risk}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
