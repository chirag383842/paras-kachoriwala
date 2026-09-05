import type { StoreStatus } from './types';

export const BRAND = {
  name: 'Paras Kachoriwala',
  tagline: 'Fresh • Famous • Full of Taste',
  description:
    'Serving delicious Kachori (Regular, Jain & Swaminarayan) and Bhel loved by our customers for years. A trusted local food destination, famous for taste and freshness.',
  address: 'Paras Kachoriwala — tap the map pin for the exact location',
  mapsLink: 'https://maps.app.goo.gl/CToVpdk32QaesD3J7',
  mapsEmbed: 'https://maps.app.goo.gl/CToVpdk32QaesD3J7',
  phone: '',
  timezone: 'Asia/Kolkata',
  paymentNote: 'Cash Payment Only • Token System at Counter',
  orderingNote: 'Only cash payment accepted. Token system operated at the counter for fresh and orderly service.',
};

export const STORE_HOURS = [
  { day: 'Monday', open: '19:00', close: '23:30', display: '7:00 PM – 11:30 PM' },
  { day: 'Tuesday', open: '19:00', close: '23:30', display: '7:00 PM – 11:30 PM' },
  { day: 'Wednesday', open: '19:00', close: '23:30', display: '7:00 PM – 11:30 PM' },
  { day: 'Thursday', open: '19:00', close: '23:30', display: '7:00 PM – 11:30 PM' },
  { day: 'Friday', open: '19:00', close: '23:30', display: '7:00 PM – 11:30 PM' },
  { day: 'Saturday', open: '19:00', close: '23:30', display: '7:00 PM – 11:30 PM' },
  { day: 'Sunday', open: '19:00', close: '23:30', display: '7:00 PM – 11:30 PM' },
];

export type CrowdLevel = 'Low' | 'Moderate' | 'Busy' | 'Very Busy';

export const CROWD_META: Record<CrowdLevel, { label: string; color: string; dot: string }> = {
  Low: { label: 'Low Crowd', color: 'text-leaf-600', dot: 'bg-leaf-500' },
  Moderate: { label: 'Moderate Crowd', color: 'text-marigold-600', dot: 'bg-marigold-500' },
  Busy: { label: 'Busy', color: 'text-spice-600', dot: 'bg-spice-500' },
  'Very Busy': { label: 'Very Busy', color: 'text-red-600', dot: 'bg-red-500' },
};

/**
 * Returns date and time components in Indian Standard Time (Asia/Kolkata)
 */
export function getISTDate(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dayOfWeek: number; // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  dateString: string; // YYYY-MM-DD
  dayName: string;
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: BRAND.timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    weekday: 'long',
  });

  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });

  const year = parseInt(map.year, 10);
  const month = parseInt(map.month, 10);
  const day = parseInt(map.day, 10);
  const hour = parseInt(map.hour === '24' ? '0' : map.hour, 10);
  const minute = parseInt(map.minute, 10);
  const dayName = map.weekday;

  const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = daysArr.indexOf(dayName) >= 0 ? daysArr.indexOf(dayName) : 0;

  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return { year, month, day, hour, minute, dayOfWeek, dateString, dayName };
}

/**
 * Checks if current time is within normal operating schedule hours (7:00 PM - 11:30 PM IST)
 */
export function isWithinScheduleHours(now: Date = new Date()): boolean {
  const { dayOfWeek, hour, minute } = getISTDate(now);
  const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const todaySchedule = STORE_HOURS[dayIndex] ?? STORE_HOURS[0];

  const currentMinutes = hour * 60 + minute;
  const [oh, om] = todaySchedule.open.split(':').map(Number);
  const [ch, cm] = todaySchedule.close.split(':').map(Number);

  return currentMinutes >= oh * 60 + om && currentMinutes < ch * 60 + cm;
}

/**
 * Computes active store status taking into account:
 * 1. "Close Shop for Today" (auto-resets the next day in IST) — strictly maintained!
 * 2. Manual author close overrides — strictly maintained!
 * 3. Automatic Indian Timing schedule (7:00 PM to 11:30 PM IST) like an automatic trigger
 */
export function calculateStoreStatus(status?: StoreStatus | null): {
  isOpen: boolean;
  isClosedForToday: boolean;
  isAutoScheduled: boolean;
  nextOpenText: string;
  todayScheduleDisplay: string;
  statusLabel: string;
  currentISTTimeDisplay: string;
} {
  const ist = getISTDate();
  const currentMinutes = ist.hour * 60 + ist.minute;
  const dayIndex = ist.dayOfWeek === 0 ? 6 : ist.dayOfWeek - 1;
  const todaySchedule = STORE_HOURS[dayIndex] ?? STORE_HOURS[0];
  const [oh, om] = todaySchedule.open.split(':').map(Number);
  const openMinutes = oh * 60 + om;
  const [ch, cm] = todaySchedule.close.split(':').map(Number);
  const closeMinutes = ch * 60 + cm;

  const inScheduleHours = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  const nextText = currentMinutes < openMinutes ? 'Opens Today at 7:00 PM' : 'Opens Tomorrow at 7:00 PM';

  const istHour12 = ist.hour % 12 || 12;
  const istAmPm = ist.hour >= 12 ? 'PM' : 'AM';
  const istTimeStr = `${istHour12}:${String(ist.minute).padStart(2, '0')} ${istAmPm} IST`;

  // 1. Maintain "Close Shop for Today" feature (resets automatically next day in IST)
  const isClosedToday = status?.closed_for_date === ist.dateString;
  if (isClosedToday) {
    return {
      isOpen: false,
      isClosedForToday: true,
      isAutoScheduled: false,
      nextOpenText: 'Opens Tomorrow at 7:00 PM',
      todayScheduleDisplay: todaySchedule.display,
      statusLabel: 'Closed for Today',
      currentISTTimeDisplay: istTimeStr,
    };
  }

  // 2. Maintain author manual close override
  if (status && status.is_open === false && !status.closed_for_date) {
    return {
      isOpen: false,
      isClosedForToday: false,
      isAutoScheduled: false,
      nextOpenText: nextText,
      todayScheduleDisplay: todaySchedule.display,
      statusLabel: 'Temporarily Closed by Owner',
      currentISTTimeDisplay: istTimeStr,
    };
  }

  // 3. Automatic trigger per Indian Timing (7:00 PM - 11:30 PM IST)
  return {
    isOpen: inScheduleHours,
    isClosedForToday: false,
    isAutoScheduled: true,
    nextOpenText: inScheduleHours ? 'Open Now (7:00 PM – 11:30 PM)' : nextText,
    todayScheduleDisplay: todaySchedule.display,
    statusLabel: inScheduleHours ? 'Open Now' : 'Currently Closed',
    currentISTTimeDisplay: istTimeStr,
  };
}

export function isStoreOpenNow(status?: StoreStatus | null): boolean {
  return calculateStoreStatus(status).isOpen;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    timeZone: BRAND.timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTimeStr(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}
