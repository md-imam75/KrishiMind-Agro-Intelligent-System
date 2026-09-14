'use client';
import { useState } from 'react';
import { officerApi } from '@/lib/api';
import { Bell, Send, AlertTriangle, CheckCircle } from 'lucide-react';

export default function BroadcastAlerts() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    district: '',
    upazila: '',
    title: '',
    message: '',
    severity: 'warning',
    type: 'alert'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      await officerApi.broadcastAlert(formData);
      setSuccess('Alert successfully broadcasted to all farmers in the specified area.');
      setFormData(prev => ({ ...prev, title: '', message: '' })); // reset text
    } catch (err) {
      console.error(err);
      alert('Failed to send alert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
          <Bell size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Broadcast Alert</h1>
          <p className="text-slate-500">Send push notifications and warnings to farmers in your jurisdiction.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Target District *</label>
              <input 
                type="text" 
                required
                value={formData.district}
                onChange={e => setFormData({...formData, district: e.target.value.toLowerCase()})}
                placeholder="e.g. dhaka"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Target Upazila (Optional)</label>
              <input 
                type="text" 
                value={formData.upazila}
                onChange={e => setFormData({...formData, upazila: e.target.value.toLowerCase()})}
                placeholder="e.g. savar"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Severity</label>
              <select 
                value={formData.severity}
                onChange={e => setFormData({...formData, severity: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Alert Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="alert">General Alert</option>
                <option value="weather">Weather Warning</option>
                <option value="market">Market Update</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Alert Title *</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Heavy Rainfall Expected"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Detailed Message *</label>
            <textarea 
              required
              rows={4}
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              placeholder="Describe the warning and actions farmers should take..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Broadcasting...' : (
              <>
                <Send size={18} /> Broadcast to Farmers
              </>
            )}
          </button>

          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 font-medium flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-500" />
              {success}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
