import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { MusicProvider } from './src/providers/MusicProvider';

export default function App() {
  return (
    <MusicProvider>
      <RootNavigator />
    </MusicProvider>
  );
}
