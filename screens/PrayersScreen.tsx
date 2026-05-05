import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPrayerData } from '../services/aladhan';
import { SavedLocation, PrayerData } from '../types';

interface Props {
  location: SavedLocation;
  onChangeLocation: () => void;
}

const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

const PRAYER_ARABIC: Record<string, string> = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

function getNextPrayer(times: PrayerData['times']): string | null {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  for (const name of PRAYER_ORDER) {
    const [h, m] = times[name].split(':').map(Number);
    if (h * 60 + m > nowMins) return name;
  }
  return null;
}

function minsUntil(t: string): string {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const [h, m] = t.split(':').map(Number);
  const diff = h * 60 + m - nowMins;
  if (diff <= 0) return '';
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  return hrs > 0 ? `in ${hrs}h ${mins}m` : `in ${mins}m`;
}

export default function PrayersScreen({ location, onChangeLocation }: Props) {
  const [data, setData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const prayerData = await fetchPrayerData(location.latitude, location.longitude);
      setData(prayerData);
    } catch (e: any) {
      setError(e.message || 'Could not load prayer times.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [location]);

  useEffect(() => { load(); }, [load]);

  async function handleChange() {
    await AsyncStorage.removeItem('savedLocation');
    onChangeLocation();
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#c9a84c" />
        <Text style={styles.loadingText}>Loading prayer times…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) return null;

  const nextPrayer = getNextPrayer(data.times);
  const { hijri, gregorian } = data;
  const englishDate = `${gregorian.weekday.en}, ${gregorian.day} ${gregorian.month.en} ${gregorian.year}`;
  const hijriDate = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.locationName}>{location.displayName}</Text>
          <Text style={styles.postcode}>{location.postcode}</Text>
        </View>
        <TouchableOpacity onPress={handleChange} style={styles.changeBtn}>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#c9a84c" />
        }
      >
        {/* Dates */}
        <View style={styles.dateBlock}>
          <Text style={styles.englishDate}>{englishDate}</Text>
          <Text style={styles.hijriDate}>{hijriDate}</Text>
        </View>

        {/* Sun strip */}
        <View style={styles.sunStrip}>
          <View style={styles.sunItem}>
            <Text style={styles.sunIcon}>🌅</Text>
            <Text style={styles.sunLabel}>Sunrise</Text>
            <Text style={styles.sunTime}>{data.times.Sunrise}</Text>
          </View>
          <View style={styles.sunDivider} />
          <View style={styles.sunItem}>
            <Text style={styles.sunIcon}>🌇</Text>
            <Text style={styles.sunLabel}>Sunset</Text>
            <Text style={styles.sunTime}>{data.times.Sunset}</Text>
          </View>
        </View>

        {/* Prayer rows */}
        <View style={styles.prayerList}>
          {PRAYER_ORDER.map((name) => {
            const isNext = name === nextPrayer;
            const until = isNext ? minsUntil(data.times[name]) : '';
            return (
              <View key={name} style={[styles.prayerRow, isNext && styles.prayerRowNext]}>
                <View style={styles.prayerLeft}>
                  {isNext && <View style={styles.nextDot} />}
                  <View>
                    <Text style={[styles.prayerName, isNext && styles.prayerNameNext]}>{name}</Text>
                    <Text style={styles.prayerArabic}>{PRAYER_ARABIC[name]}</Text>
                  </View>
                </View>
                <View style={styles.prayerRight}>
                  <Text style={[styles.prayerTime, isNext && styles.prayerTimeNext]}>
                    {data.times[name]}
                  </Text>
                  {until ? <Text style={styles.prayerUntil}>{until}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.attribution}>
          Prayer times via AlAdhan.com · Karachi method · Hanafi Asr
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f1923' },
  centered: {
    flex: 1,
    backgroundColor: '#0f1923',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: { color: '#8a9bb0', marginTop: 16, fontSize: 15 },
  errorIcon: { fontSize: 40, marginBottom: 16 },
  errorText: { color: '#e05454', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  retryBtn: {
    backgroundColor: '#c9a84c',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: { color: '#0f1923', fontWeight: '700', fontSize: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2a38',
  },
  locationName: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  postcode: { fontSize: 13, color: '#556677', marginTop: 2 },
  changeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c9a84c44',
    backgroundColor: '#1a2a38',
  },
  changeText: { color: '#c9a84c', fontSize: 13, fontWeight: '600' },
  dateBlock: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  englishDate: { fontSize: 15, color: '#aabbcc', fontWeight: '500' },
  hijriDate: { fontSize: 14, color: '#c9a84c', marginTop: 4 },
  sunStrip: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1a2a38',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a3a4a',
  },
  sunItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  sunDivider: { width: 1, backgroundColor: '#2a3a4a', marginVertical: 10 },
  sunIcon: { fontSize: 22, marginBottom: 4 },
  sunLabel: { fontSize: 12, color: '#8a9bb0', marginBottom: 3 },
  sunTime: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  prayerList: { paddingHorizontal: 20, gap: 10 },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a2a38',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#2a3a4a',
  },
  prayerRowNext: {
    backgroundColor: '#1e3048',
    borderColor: '#c9a84c',
    borderWidth: 1.5,
  },
  prayerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nextDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#c9a84c' },
  prayerName: { fontSize: 17, fontWeight: '600', color: '#ccd8e4' },
  prayerNameNext: { color: '#ffffff' },
  prayerArabic: { fontSize: 13, color: '#445566', marginTop: 2 },
  prayerRight: { alignItems: 'flex-end' },
  prayerTime: { fontSize: 22, fontWeight: '700', color: '#ccd8e4' },
  prayerTimeNext: { color: '#c9a84c' },
  prayerUntil: { fontSize: 12, color: '#8a9bb0', marginTop: 3 },
  attribution: {
    textAlign: 'center',
    fontSize: 11,
    color: '#334455',
    marginTop: 28,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
});
