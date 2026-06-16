'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/routing';

export default function AdminBookingsPage() {
  const router = useRouter();
  const t = useTranslations('Admin');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (!session) {
      router.replace('/admin');
      return;
    }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('booking_requests')
      .select('*, motorcycles(brand, name)')
      .order('created_at', { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('booking_requests').update({ status }).eq('id', id);
    if (error) alert(error.message);
    else fetchBookings();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('delete_booking_confirm'))) return;
    const { error } = await supabase.from('booking_requests').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchBookings();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#c89f55] animate-spin" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-[#c89f55]/10 text-[#c89f55]',
    approved: 'bg-[#60a5fa]/10 text-[#60a5fa]',
    completed: 'bg-[#4ade80]/10 text-[#4ade80]',
    cancelled: 'bg-[#f87171]/10 text-[#f87171]',
  };

  const statusLabels: Record<string, string> = {
    pending:   t('status_pending'),
    approved:  t('status_approved'),
    completed: t('status_completed'),
    cancelled: t('status_cancelled'),
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-12 sm:py-16">
      <Link href="/admin" className="inline-flex items-center gap-2 text-[#71717a] hover:text-[#1c1c21] text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        {t('back')}
      </Link>

      <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-[#1c1c21] mb-8">{t('booking_requests')}</h1>

      <div className="space-y-3">
        {bookings.map(booking => (
          <div key={booking.id} className="bg-[#ffffff] border border-[#e4e4e1] rounded-xl p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-bold text-[#1c1c21]">{booking.customer_name}</h3>
                <p className="text-xs text-[#71717a] mt-0.5">{booking.customer_phone}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 ${statusColors[booking.status] || statusColors.pending}`}>
                {statusLabels[booking.status] || booking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3 pb-3 border-b border-[#e4e4e1]/60">
              <div>
                <p className="text-[11px] text-[#71717a] uppercase tracking-wider mb-0.5">{t('motorcycle')}</p>
                <p className="text-[#4a4a52] font-medium">{booking.motorcycles?.brand} {booking.motorcycles?.name}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#71717a] uppercase tracking-wider mb-0.5">{t('total')}</p>
                <p className="text-[#c89f55] font-bold">{booking.total_price?.toLocaleString()} EGP</p>
              </div>
              <div>
                <p className="text-[11px] text-[#71717a] uppercase tracking-wider mb-0.5">{t('dates')}</p>
                <p className="text-[#4a4a52] text-xs">{booking.start_date} → {booking.end_date}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#71717a] uppercase tracking-wider mb-0.5">{t('nationality')}</p>
                <p className="text-[#4a4a52]">{booking.customer_nationality}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={booking.status}
                onChange={(e) => handleUpdateStatus(booking.id, e.target.value)}
                className="flex-grow bg-[#f8f7f4] border border-[#e4e4e1] rounded-lg px-3 py-2 text-sm text-[#1c1c21] focus:outline-none focus:border-[#c89f55]/50"
              >
                <option value="pending">{t('status_pending')}</option>
                <option value="approved">{t('status_approved')}</option>
                <option value="completed">{t('status_completed')}</option>
                <option value="cancelled">{t('status_cancelled')}</option>
              </select>
              <button onClick={() => handleDelete(booking.id)} className="text-[#f87171] text-sm font-medium px-3 py-2 rounded-lg hover:bg-[#f87171]/10 transition-colors">{t('delete')}</button>
            </div>
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="text-center py-12 text-[#71717a]">{t('no_bookings')}</div>
        )}
      </div>
    </div>
  );
}
