import React, { useState, useMemo } from 'react';
import { PartyPopper } from 'lucide-react';
import { getTodayIST } from '../services/calendarNotesStore.js';

export const OFFICIAL_HOLIDAYS_2026 = [
  ['14-01-2026', 'Makar Sankranti'],
  ['23-01-2026', 'Netaji Subas Bose Jayanti/ Saraswati Puja'],
  ['26-01-2026', 'Republic Day'],
  ['03-03-2026', 'Dola Purnami'],
  ['04-03-2026', 'Holi'],
  ['21-03-2026', 'Eid-Ul Fitar'],
  ['27-03-2026', 'Ram Navami'],
  ['01-04-2026', 'Utkal Divas'],
  ['03-04-2026', 'Good Friday'],
  ['14-04-2026', 'Maha Vishubha Sankranti'],
  ['16-05-2026', 'Sabitri Amavasya'],
  ['28-05-2026', 'Eid-Ul Zuha'],
  ['15-06-2026', 'Raja Sankrati'],
  ['26-06-2026', 'Muharram'],
  ['16-07-2026', 'Ratha Yatra'],
  ['15-08-2026', 'Independence Day'],
  ['26-08-2026', 'Prophet Muhammad Birthday'],
  ['27-08-2026', 'Jhulana Purnami'],
  ['04-09-2026', 'Janmastami'],
  ['14-09-2026', 'Ganesh Puja'],
  ['15-09-2026', 'Nuakhai'],
  ['02-10-2026', 'Gandhi Jayanti'],
  ['18-10-2026', 'Maha Saptami (Durga Puja)'],
  ['19-10-2026', 'Maha Astami (Durga Puja)'],
  ['20-10-2026', 'Maha Nabami (Durga Puja)'],
  ['21-10-2026', 'Vijaya Dasami (Dussehra)'],
  ['22-10-2026', 'Durga Puja Additional Holiday'],
  ['23-10-2026', 'Durga Puja Additional Holiday'],
  ['24-10-2026', 'Durga Puja Additional Holiday'],
  ['25-10-2026', 'Durga Puja Additional Holiday'],
  ['08-11-2026', 'Diwali / Kali Puja'],
  ['15-11-2026', 'Bhatru Dwitiya'],
  ['24-11-2026', 'Guru Nanak Jayanti / Rasa Purnima'],
  ['24-12-2026', 'Christmas Eve (Winter Break)'],
  ['25-12-2026', 'Christmas Day'],
];

export default function HolidayListWidget({ className = '', title = 'Holiday List' }) {
  const [holidayView, setHolidayView] = useState('all');

  const today = useMemo(() => {
    try {
      const ist = getTodayIST();
      return ist?.dateObj instanceof Date ? ist.dateObj : new Date();
    } catch {
      return new Date();
    }
  }, []);

  const holidayItems = useMemo(() => {
    const todayObj = today instanceof Date ? today : new Date();
    const todayMid = new Date(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate());

    return OFFICIAL_HOLIDAYS_2026.map(([raw, name]) => {
      const [d, m, y] = raw.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const dateMid = new Date(y, m - 1, d);
      const daysLeft = Math.round((dateMid.getTime() - todayMid.getTime()) / (1000 * 60 * 60 * 24));
      return { raw, name, date, daysLeft, key: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` };
    });
  }, [today]);

  const upcomingHolidays = useMemo(() => {
    return holidayItems.filter((h) => h.daysLeft >= 0);
  }, [holidayItems]);

  const displayedHolidays = useMemo(() => {
    if (holidayView === 'upcoming') {
      return upcomingHolidays;
    }
    return holidayItems;
  }, [holidayView, upcomingHolidays, holidayItems]);

  const nextHoliday = useMemo(() => {
    return upcomingHolidays[0] || null;
  }, [upcomingHolidays]);

  return (
    <section className={`dash-card dash-holidays ${className}`} id="holidays" style={{ height: '100%', minHeight: '100%', borderRadius: '18px', overflow: 'hidden' }}>
      <header className="dash-card-head" style={{ marginBottom: '0.875rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '0.98rem', fontWeight: 750 }}>
          <span className="dash-head-icon tone-amber" style={{ display: 'grid', placeItems: 'center', color: '#d97706' }}>
            <PartyPopper size={16} />
          </span>
          {title}
        </h3>
        <div className="dash-holiday-controls">
          <div className="dash-holiday-filter-pills">
            <button
              type="button"
              className={`dash-filter-pill ${holidayView === 'all' ? 'active' : ''}`}
              onClick={() => setHolidayView('all')}
            >
              All 2026 ({holidayItems.length})
            </button>
            <button
              type="button"
              className={`dash-filter-pill ${holidayView === 'upcoming' ? 'active' : ''}`}
              onClick={() => setHolidayView('upcoming')}
            >
              Upcoming ({upcomingHolidays.length})
            </button>
          </div>
        </div>
      </header>

      <ul className="dash-holiday-list dash-holiday-scroll" aria-label="Official College Holidays 2026" style={{ flex: 1, minHeight: 0 }}>
        {displayedHolidays.map((h) => (
          <li
            className={`dash-holiday ${h.daysLeft < 0 ? 'is-past' : ''} ${nextHoliday && nextHoliday.raw === h.raw ? 'is-next' : ''}`}
            key={h.raw}
          >
            <span className="dash-holiday-date">
              <strong>{h.date.getDate()}</strong>
              <small>{h.date.toLocaleString('en-IN', { month: 'short' })}</small>
            </span>
            <span className="dash-holiday-info">
              <strong>{h.name}</strong>
              <small>{h.date.toLocaleString('en-IN', { weekday: 'long' })} · {h.raw}</small>
            </span>
            <span className="dash-holiday-badge">
              {h.daysLeft < 0
                ? 'Passed'
                : h.daysLeft === 0
                  ? 'Today'
                  : h.daysLeft === 1
                    ? 'Tomorrow'
                    : `in ${h.daysLeft}d`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

