import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lookupPostcode } from '../services/postcodes';
import { SavedLocation } from '../types';

interface Props {
  onLocationSet: (loc: SavedLocation) => void;
  existingLocation: SavedLocation | null;
}

export default function SetupScreen({ onLocationSet, existingLocation }: Props) {
  const [postcode, setPostcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // On first load, check if a postcode is already saved
    if (existingLocation) return;
    AsyncStorage.getItem('savedLocation').then((raw) => {
      if (raw) {
        const loc: SavedLocation = JSON.parse(raw);
        onLocationSet(loc);
      }
    });
  }, []);

  async function handleSubmit() {
    const trimmed = postcode.trim();
    if (!trimmed) {
      setError('Please enter a UK postcode.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const loc = await lookupPostcode(trimmed);
      await AsyncStorage.setItem('savedLocation', JSON.stringify(loc));
      onLocationSet(loc);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🕌</Text>
        </View>

        <Text style={styles.title}>UK Prayer Times</Text>
        <Text style={styles.subtitle}>
          Enter your UK postcode to get accurate salah times for your area.
        </Text>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="e.g. E1 6RF or M1 1AE"
          placeholderTextColor="#556677"
          value={postcode}
          onChangeText={(t) => { setPostcode(t); setError(''); }}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          editable={!loading}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#0f1923" />
          ) : (
            <Text style={styles.buttonText}>Find Prayer Times</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          Your postcode is only used to calculate prayer times and is stored locally on your device.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f1923' },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a2a38',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: { fontSize: 38 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#c9a84c',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#8a9bb0',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#1a2a38',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#2a3a4a',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputError: { borderColor: '#e05454' },
  error: { color: '#e05454', fontSize: 14, marginBottom: 12, alignSelf: 'flex-start' },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: '#c9a84c',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 17, fontWeight: '700', color: '#0f1923' },
  hint: {
    marginTop: 24,
    fontSize: 12,
    color: '#445566',
    textAlign: 'center',
    lineHeight: 18,
  },
});
