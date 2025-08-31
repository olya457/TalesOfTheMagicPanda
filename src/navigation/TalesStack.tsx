import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TalesStackParamList } from './types';
import TalesListScreen from '../screens/TalesListScreen';
import TaleReaderScreen from '../screens/TaleReaderScreen';

const Stack = createNativeStackNavigator<TalesStackParamList>();

export default function TalesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TalesList" component={TalesListScreen} />
      <Stack.Screen name="TaleReader" component={TaleReaderScreen} />
    </Stack.Navigator>
  );
}
