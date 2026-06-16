'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, X } from 'lucide-react';
import { format, getDaysInMonth } from 'date-fns';
import { useTranslations } from 'next-intl';

interface DatePickerProps {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  minDate?: Date;
  disabled?: boolean;
  disabledText?: string;
}

export default function DatePicker({
  label,
  value,
  onChange,
  minDate,
  disabled,
  disabledText,
}: DatePickerProps) {
  const t = useTranslations('DatePicker');
  const [open, setOpen] = useState(false);
  
  // Fixed year logic
  const currentYear = minDate ? minDate.getFullYear() : new Date().getFullYear();
  const currentMonth = minDate ? minDate.getMonth() : new Date().getMonth();
  const currentDay = minDate ? minDate.getDate() : new Date().getDate();

  const [tempMonth, setTempMonth] = useState(value ? value.getMonth() : currentMonth);
  const [tempDay, setTempDay] = useState(value ? value.getDate() : currentDay);

  // Update temp state when value changes from outside
  useEffect(() => {
    if (value) {
      setTempMonth(value.getMonth());
      setTempDay(value.getDate());
    }
  }, [value]);

  // Lock body scroll when bottom sheet is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleApply = () => {
    const newDate = new Date(currentYear, tempMonth, tempDay);
    onChange(newDate);
    setOpen(false);
  };

  const displayValue = value ? format(value, 'dd MMM yyyy') : t('select_date');

  if (disabled) {
    return (
      <div>
        <label className="block text-xs text-[#71717a] mb-1.5 font-medium">{label}</label>
        <div className="w-full bg-[#f8f7f4]/50 border border-[#e4e4e1]/40 rounded-xl px-4 py-3 text-[#71717a]/60 text-sm flex items-center justify-between cursor-default">
          <span className="text-[#1c1c21]">{disabledText || displayValue}</span>
          <CalendarIcon className="w-4 h-4 text-[#71717a]/30 flex-shrink-0" />
        </div>
      </div>
    );
  }

  const triggerButton = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`w-full bg-[#f8f7f4] border rounded-xl px-4 py-3 text-sm flex items-center justify-between transition-all duration-200 ${
        open
          ? 'border-[#c89f55]/50 ring-1 ring-[#c89f55]/20'
          : 'border-[#e4e4e1] hover:border-[#d4d4d0]'
      } ${value ? 'text-[#1c1c21]' : 'text-[#71717a]/60'}`}
    >
      <span>{displayValue}</span>
      <CalendarIcon
        className={`w-4 h-4 flex-shrink-0 transition-colors ${open ? 'text-[#c89f55]' : 'text-[#71717a]'}`}
      />
    </button>
  );

  const daysInMonth = getDaysInMonth(new Date(currentYear, tempMonth));
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const MONTHS = [
    t('months.0'), t('months.1'), t('months.2'), t('months.3'), t('months.4'), t('months.5'),
    t('months.6'), t('months.7'), t('months.8'), t('months.9'), t('months.10'), t('months.11')
  ];

  const renderPickerContent = () => (
    <div className="p-5 flex flex-col gap-6">
      {/* Month Selector */}
      <div>
        <h4 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-3">{t('month')}</h4>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {MONTHS.map((m, idx) => {
            const isPastMonth = minDate && currentYear === minDate.getFullYear() && idx < currentMonth;
            const isSelected = tempMonth === idx;
            
            return (
              <button
                key={m}
                type="button"
                disabled={isPastMonth}
                onClick={() => {
                  setTempMonth(idx);
                  // Adjust day if selected day exceeds days in new month
                  const newDaysInMonth = getDaysInMonth(new Date(currentYear, idx));
                  if (tempDay > newDaysInMonth) setTempDay(newDaysInMonth);
                }}
                className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                  isSelected 
                    ? 'bg-[#c89f55] text-[#f8f7f4]' 
                    : isPastMonth 
                      ? 'bg-[#f8f7f4]/50 text-[#71717a]/30 cursor-not-allowed'
                      : 'bg-[#f8f7f4] text-[#71717a] hover:bg-[#f0eee9] hover:text-[#1c1c21] border border-[#e4e4e1]'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Selector */}
      <div>
        <h4 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-3">{t('day', { year: currentYear })}</h4>
        <div className="grid grid-cols-7 gap-1.5 max-h-[200px] sm:max-h-none overflow-y-auto pr-1 pb-1 custom-scrollbar">
          {daysArray.map((d) => {
            const isPastDay = minDate && currentYear === minDate.getFullYear() && tempMonth === currentMonth && d < currentDay;
            const isSelected = tempDay === d;
            
            return (
              <button
                key={d}
                type="button"
                disabled={isPastDay}
                onClick={() => setTempDay(d)}
                className={`aspect-square rounded-xl text-sm font-medium flex items-center justify-center transition-colors ${
                  isSelected 
                    ? 'bg-[#c89f55] text-[#f8f7f4]' 
                    : isPastDay
                      ? 'text-[#71717a]/20 cursor-not-allowed'
                      : 'bg-[#f8f7f4] text-[#4a4a52] hover:bg-[#f0eee9] hover:text-[#1c1c21]'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleApply}
        className="w-full mt-2 py-3.5 bg-[#c89f55] hover:bg-[#b08b49] text-[#f8f7f4] font-bold rounded-xl transition-colors"
      >
        {t('apply')}
      </button>
    </div>
  );

  return (
    <>
      <div>
        <label className="block text-xs text-[#71717a] mb-1.5 font-medium">{label}</label>

        {/* ── Desktop: inline dropdown ── */}
        <div className="hidden sm:block relative">
          {triggerButton}
          {open && (
            <>
              {/* Invisible backdrop for desktop to close on click outside */}
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute z-50 top-full mt-2 ltr:left-0 rtl:right-0 w-[360px] bg-[#ffffff] border border-[#e4e4e1] rounded-2xl shadow-2xl shadow-black/50">
                {renderPickerContent()}
              </div>
            </>
          )}
        </div>

        {/* ── Mobile: just the trigger ── */}
        <div className="sm:hidden">
          {triggerButton}
        </div>
      </div>

      {/* ── Mobile: bottom sheet ── */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-[#ffffff] rounded-t-3xl border-t border-[#e4e4e1] pb-safe max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
              <span className="text-sm font-semibold text-[#1c1c21]">{label}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f0eee9] flex items-center justify-center text-[#71717a] hover:text-[#1c1c21] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-10 h-1 rounded-full bg-[#e4e4e1] mx-auto flex-shrink-0" />
            <div className="overflow-y-auto custom-scrollbar">
              {renderPickerContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
