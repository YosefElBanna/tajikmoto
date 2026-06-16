'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css'; // v10 standard import

import { useLocale } from 'next-intl';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  ...props
}: CalendarProps) {
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className={`p-4 bg-white rounded-2xl shadow-sm border border-[#e4e4e1] w-max ${className || ''}`}>
      <style>{`
        .rdp-root {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #c89f55;
          --rdp-background-color: #f0eee9;
          --rdp-accent-color-dark: #b08b49;
          --rdp-background-color-dark: #e4e4e1;
          --rdp-outline: 2px solid #c89f55;
          --rdp-outline-selected: 2px solid #c89f55;
          margin: 0;
        }
        .rdp-day_selected {
          background-color: #c89f55 !important;
          color: #ffffff !important;
          font-weight: bold;
        }
        .rdp-day_selected:hover {
          background-color: #b08b49 !important;
        }
        .rdp-day_today:not(.rdp-day_selected) {
          font-weight: bold;
          color: #1c1c21;
          background-color: #f8f7f4;
          border: 1px solid #e4e4e1;
        }
        .rdp-day_disabled {
          opacity: 0.25;
          text-decoration: line-through;
        }
        .rdp-nav_button {
          color: #71717a;
        }
        .rdp-nav_button:hover {
          background-color: #f0eee9;
          color: #1c1c21;
        }
        .rdp-caption_label {
          font-family: var(--font-outfit), sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          color: #1c1c21;
        }
        .rdp-head_cell {
          color: #71717a;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        /* Fix table alignment */
        .rdp-table {
          max-width: calc(var(--rdp-cell-size) * 7);
        }
      `}</style>
      <DayPicker
        dir={dir}
        showOutsideDays={true}
        {...props}
      />
    </div>
  );
}
