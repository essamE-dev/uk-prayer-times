export interface SavedLocation {
  postcode: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
}

export interface HijriDate {
  day: string;
  month: { en: string; ar: string };
  year: string;
}

export interface PrayerData {
  times: PrayerTimes;
  hijri: HijriDate;
  gregorian: { weekday: { en: string }; day: string; month: { en: string }; year: string };
}
