'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Link } from '@/i18n/routing';
import { Bike, ClipboardList, LogOut, Loader2, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

const SESSION_KEY = 'admin_session';

export default function AdminPage() {
  const t = useTranslations('Admin');
  const [session, setSession] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage to survive locale changes
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      setSession(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password === 'parol') {
      const sess = { user: { email: 'admin' } };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
      setSession(sess);
      setLoading(false);
      return;
    }

    alert(t('wrong_password'));
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#c89f55] animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-5">
        <form onSubmit={handleLogin} className="bg-[#ffffff] border border-[#e4e4e1] p-8 rounded-2xl w-full max-w-sm space-y-5">
          <div className="text-center mb-2">
            <h2 className="text-xl font-outfit font-bold text-[#1c1c21]">{t('login_title')}</h2>
            <p className="text-sm text-[#71717a] mt-1">{t('login_desc')}</p>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('password')} required
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#f8f7f4] border border-[#e4e4e1] rounded-xl px-4 py-3 ltr:pr-11 rtl:pl-11 text-[#1c1c21] text-sm placeholder-[#71717a]/60 focus:outline-none focus:border-[#c89f55]/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-[#71717a] hover:text-[#1c1c21] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#c89f55] hover:bg-[#b08b49] text-[#f8f7f4] font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-50">
            {loading ? t('signing_in') : t('sign_in')}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-12 sm:py-16">
      <div className="flex justify-between items-center mb-10">
        <div>
          <span className="text-[#c89f55] text-xs font-bold tracking-[0.15em] uppercase mb-2 block">{t('dashboard')}</span>
          <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-[#1c1c21]">{t('panel_title')}</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-[#71717a] hover:text-[#f87171] transition-colors text-sm">
          <LogOut className="w-4 h-4" />
          {t('sign_out')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Link href="/admin/fleet" className="group block p-6 bg-[#ffffff] border border-[#e4e4e1] rounded-2xl hover:border-[#c89f55]/30 transition-all">
          <div className="w-11 h-11 rounded-xl bg-[#c89f55]/10 flex items-center justify-center mb-4 group-hover:bg-[#c89f55]/15 transition-colors">
            <Bike className="w-5 h-5 text-[#c89f55]" />
          </div>
          <h2 className="text-lg font-bold text-[#1c1c21] mb-1">{t('manage_fleet')}</h2>
          <p className="text-sm text-[#71717a] leading-relaxed">{t('manage_fleet_desc')}</p>
        </Link>
        <Link href="/admin/bookings" className="group block p-6 bg-[#ffffff] border border-[#e4e4e1] rounded-2xl hover:border-[#c89f55]/30 transition-all">
          <div className="w-11 h-11 rounded-xl bg-[#c89f55]/10 flex items-center justify-center mb-4 group-hover:bg-[#c89f55]/15 transition-colors">
            <ClipboardList className="w-5 h-5 text-[#c89f55]" />
          </div>
          <h2 className="text-lg font-bold text-[#1c1c21] mb-1">{t('view_bookings')}</h2>
          <p className="text-sm text-[#71717a] leading-relaxed">{t('view_bookings_desc')}</p>
        </Link>
      </div>
    </div>
  );
}
