import { PrayerData } from '../types';

// method=1 (Karachi/Hanafi), school=1 (Hanafi Asr shadow ratio)
export async function fetchPrayerData(latitude: number, longitude: number): Promise<PrayerData> {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const dateStr = `${dd}-${mm}-${yyyy}`;

  const url =
    `https://api.aladhan.com/v1/timings/${dateStr}` +
    `?latitude=${latitude}&longitude=${longitude}&method=1&school=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch prayer times. Please check your connection.');

  const json = await res.json();
  if (json.code !== 200) throw new Error('Prayer times service unavailable. Please try again.');

  const { timings, date } = json.data;

  return {
    times: {
      Fajr: stripSeconds(timings.Fajr),
      Sunrise: stripSeconds(timings.Sunrise),
      Dhuhr: stripSeconds(timings.Dhuhr),
      Asr: stripSeconds(timings.Asr),
      Sunset: stripSeconds(timings.Sunset),
      Maghrib: stripSeconds(timings.Maghrib),
      Isha: stripSeconds(timings.Isha),
    },
    hijri: date.hijri,
    gregorian: date.gregorian,
  };
}

function stripSeconds(t: string): string {
  // Aladhan returns "HH:MM (BST)" or "HH:MM" — keep only HH:MM
  return t.replace(/\s*\(.*\)/, '').trim().substring(0, 5);
}
