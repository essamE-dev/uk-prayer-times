import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import SetupScreen from './screens/SetupScreen';
import PrayersScreen from './screens/PrayersScreen';
import { SavedLocation } from './types';

type Screen = 'setup' | 'prayers';

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [location, setLocation] = useState<SavedLocation | null>(null);

  function goToPrayers(loc: SavedLocation) {
    setLocation(loc);
    setScreen('prayers');
  }

  function goToSetup() {
    setScreen('setup');
  }

  return (
    <>
      <StatusBar style="light" />
      {screen === 'setup' ? (
        <SetupScreen onLocationSet={goToPrayers} existingLocation={location} />
      ) : (
        <PrayersScreen location={location!} onChangeLocation={goToSetup} />
      )}
    </>
  );
}
