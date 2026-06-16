'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Motorcycle } from '@/types';
import { supabase } from '@/lib/supabase';
import { addDays, format } from 'date-fns';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

export default function BookingForm({ motorcycle, activeBlocks = [] }: { motorcycle: Motorcycle, activeBlocks?: any[] }) {
  const t = useTranslations('Booking');
  
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [duration, setDuration] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [durationCount, setDurationCount] = useState<number>(1);
  
  const [name, setName]               = useState('');
  const [phone, setPhone]             = useState('');
  const [nationality, setNationality] = useState('');
  
  const [contactMethod, setContactMethod] = useState<'telegram' | 'whatsapp'>('telegram');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess]           = useState(false);

  const disabledRanges = useMemo(() => {
    // If the user wants to book hourly, don't block days that only have hourly bookings
    const blocksToConsider = duration === 'hourly' 
      ? activeBlocks.filter(b => b.duration_type !== 'hourly')
      : activeBlocks;

    return [
      { before: new Date() },
      ...blocksToConsider.map(b => ({
        from: new Date(b.start_date),
        to: new Date(b.end_date)
      }))
    ];
  }, [activeBlocks, duration]);

  const { endDate, endDateDisplay, totalPrice, hasOverlap } = useMemo(() => {
    let days  = 1;
    let price = 0;
    if (duration === 'hourly')  { days = 1;                  price = motorcycle.price_hourly * durationCount; }
    if (duration === 'daily')   { days = 1 * durationCount;  price = motorcycle.price_daily * durationCount; }
    if (duration === 'weekly')  { days = 7 * durationCount;  price = motorcycle.price_weekly * durationCount; }
    if (duration === 'monthly') { days = 30 * durationCount; price = motorcycle.price_monthly * durationCount; }

    if (!startDate) {
      return { endDate: '', endDateDisplay: '', totalPrice: 0, hasOverlap: false };
    }

    const start = startDate;
    const end   = addDays(start, days - 1);
    
    const blocksToConsider = duration === 'hourly' 
      ? activeBlocks.filter(b => b.duration_type !== 'hourly')
      : activeBlocks;

    // Check overlap with active blocks
    const overlap = blocksToConsider.some(block => {
      const bStart = new Date(block.start_date);
      bStart.setHours(0,0,0,0);
      const bEnd = new Date(block.end_date);
      bEnd.setHours(23,59,59,999);
      
      const s = new Date(start);
      s.setHours(0,0,0,0);
      const e = new Date(end);
      e.setHours(23,59,59,999);
      
      return s <= bEnd && e >= bStart;
    });

    return {
      endDate:        format(end, 'yyyy-MM-dd'),
      endDateDisplay: format(end, 'dd MMM yyyy'),
      totalPrice:     price,
      hasOverlap:     overlap
    };
  }, [startDate, duration, durationCount, motorcycle, activeBlocks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || hasOverlap) return;
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('booking_requests')
        .insert([{
          motorcycle_id:        motorcycle.id,
          customer_name:        name,
          customer_phone:       phone,
          customer_passport:    null,
          customer_nationality: nationality,
          start_date:           format(startDate, 'yyyy-MM-dd'),
          end_date:             endDate,
          duration_type:        duration,
          total_price:          totalPrice,
          status:               'pending',
        }]);

      if (error) throw error;
      setSuccess(true);
      
      const telegramNumber = '+201035400161';
      const message = t('whatsapp_message', {
        brand:         motorcycle.brand,
        name:          motorcycle.name,
        customer_name: name,
        phone,
        nationality,
        count:         durationCount,
        duration_type: t(duration),
        start_date:    format(startDate, 'dd MMM yyyy'),
        end_date:      endDateDisplay,
        total:         totalPrice.toLocaleString(),
      });
      if (contactMethod === 'telegram') {
        window.open(`https://t.me/${telegramNumber}?text=${encodeURIComponent(message)}`, '_blank');
      } else {
        const waNumber = telegramNumber.replace('+', '');
        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
      }
      
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + (err?.message || JSON.stringify(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#ffffff] border border-[#e4e4e1] rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[#4ade80]/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-[#4ade80]" />
        </div>
        <h3 className="text-xl font-bold text-[#1c1c21] mb-2">{t('success_title')}</h3>
        <p className="text-[#71717a] text-sm leading-relaxed">{t('success_desc')}</p>
      </div>
    );
  }

  const inputClass = "w-full bg-[#f8f7f4] border border-[#e4e4e1] rounded-xl px-4 py-3 text-[#1c1c21] text-sm placeholder-[#71717a]/60 focus:outline-none focus:border-[#c89f55]/50 focus:ring-1 focus:ring-[#c89f55]/20 transition-all";

  const durationOptions: { value: 'hourly' | 'daily' | 'weekly' | 'monthly'; label: string; price: number }[] = [
    { value: 'hourly',  label: t('hourly'),  price: motorcycle.price_hourly },
    { value: 'daily',   label: t('daily'),   price: motorcycle.price_daily },
    { value: 'weekly',  label: t('weekly'),  price: motorcycle.price_weekly },
    { value: 'monthly', label: t('monthly'), price: motorcycle.price_monthly },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-[#ffffff] border border-[#e4e4e1] shadow-sm rounded-2xl p-5 sm:p-6">
      <h3 className="text-lg font-outfit font-bold text-[#1c1c21] mb-5">
        {t('title', { motorcycle: motorcycle.name })}
      </h3>
      
      <div className="space-y-5">
        {/* Duration selector */}
        <div className="space-y-3">
          <label className="block text-xs text-[#71717a] font-medium uppercase tracking-wide">{t('duration')}</label>
          <div className="grid grid-cols-4 gap-2">
            {durationOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setDuration(opt.value); setDurationCount(1); }}
                className={`py-2.5 px-3 rounded-xl text-center border transition-all duration-200 ${
                  duration === opt.value
                    ? 'bg-[#c89f55] border-[#c89f55] text-[#f8f7f4] shadow-md shadow-[#c89f55]/20'
                    : 'bg-[#f8f7f4] border-[#e4e4e1] text-[#71717a] hover:border-[#d4d4d0] hover:text-[#1c1c21]'
                }`}
              >
                <p className="text-xs font-semibold">{opt.label}</p>
                <p className={`text-[11px] mt-0.5 ${duration === opt.value ? 'text-[#f8f7f4]/80' : 'text-[#71717a]'}`}>
                  {opt.price > 0 ? `${opt.price} ${t('currency')}` : '—'}
                </p>
              </button>
            ))}
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between bg-[#f8f7f4] border border-[#e4e4e1] rounded-xl p-2 px-4 transition-all">
            <span className="text-sm font-medium text-[#4a4a52]">
              {duration === 'hourly' && t('count_hourly')}
              {duration === 'daily' && t('count_daily')}
              {duration === 'weekly' && t('count_weekly')}
              {duration === 'monthly' && t('count_monthly')}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDurationCount(Math.max(1, durationCount - 1))}
                disabled={durationCount <= 1}
                className="w-8 h-8 rounded-lg bg-[#ffffff] border border-[#e4e4e1] text-[#1c1c21] flex items-center justify-center hover:bg-[#f0eee9] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                <span className="text-lg leading-none mb-0.5">-</span>
              </button>
              <span className="text-sm font-bold text-[#c89f55] w-4 text-center">{durationCount}</span>
              <button
                type="button"
                onClick={() => setDurationCount(durationCount + 1)}
                className="w-8 h-8 rounded-lg bg-[#ffffff] border border-[#e4e4e1] text-[#1c1c21] flex items-center justify-center hover:bg-[#f0eee9] transition-colors shadow-sm"
              >
                <span className="text-lg leading-none mb-0.5">+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Start Date Picker (Inline Calendar) */}
        <div>
          <label className="block text-xs text-[#71717a] font-medium uppercase tracking-wide mb-2">{t('start_date')}</label>
          <div className="flex justify-center bg-[#f8f7f4]/50 border border-[#e4e4e1] rounded-xl p-2">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              disabled={disabledRanges}
              className="border-none bg-transparent shadow-none"
            />
          </div>
        </div>

        {/* Date Summary */}
        {startDate && (
          <div className={`p-4 rounded-xl border ${hasOverlap ? 'bg-[#f87171]/5 border-[#f87171]/20' : 'bg-[#c89f55]/5 border-[#c89f55]/20'}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-[#71717a]">{t('start_date')}</span>
              <span className="text-sm font-semibold text-[#1c1c21]">{format(startDate, 'dd MMM yyyy')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#71717a]">{t('end_date')}</span>
              <span className="text-sm font-semibold text-[#1c1c21]">{endDateDisplay}</span>
            </div>
            
            {hasOverlap && (
              <div className="mt-3 flex items-start gap-2 text-[#f87171]">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-medium leading-relaxed">
                  These dates conflict with an existing reservation. Please choose different dates.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-[#e4e4e1]/60 !my-4"></div>

        {/* Customer info */}
        <div className="space-y-3">
          <input type="text" required placeholder={t('customer_name')} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          <input type="tel" required placeholder={t('customer_phone')} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          <input type="text" required placeholder={t('customer_nationality')} value={nationality} onChange={(e) => setNationality(e.target.value)} className={inputClass} />
        </div>

        {/* Price display */}
        <div className="bg-[#1c1c21] p-5 rounded-2xl flex justify-between items-center shadow-lg">
          <span className="text-sm font-medium text-[#f8f7f4]/80">{t('total_price')}</span>
          <span className="text-2xl font-outfit font-bold text-[#c89f55]">
            {totalPrice > 0 ? totalPrice.toLocaleString() : '—'}
            {totalPrice > 0 && <span className="text-xs text-[#f8f7f4]/60 font-normal mx-1.5">{t('currency')}</span>}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button 
            type="submit" 
            onClick={() => setContactMethod('telegram')}
            disabled={isSubmitting || totalPrice === 0 || !startDate || hasOverlap} 
            className="w-full h-12 bg-[#2ba6e1] hover:bg-[#2286b5] text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && contactMethod === 'telegram' ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Send className="w-5 h-5 rtl:-scale-x-100" />
                {t('submit_telegram')}
              </>
            )}
          </button>

          <button 
            type="submit" 
            onClick={() => setContactMethod('whatsapp')}
            disabled={isSubmitting || totalPrice === 0 || !startDate || hasOverlap} 
            className="w-full h-12 bg-[#25D366] hover:bg-[#1da851] text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && contactMethod === 'whatsapp' ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                {t('submit_whatsapp')}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
