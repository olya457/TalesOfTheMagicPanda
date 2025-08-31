import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import LoaderScreen from '../screens/LoaderScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MainTabs from './MainTabs';

const Root = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        <Root.Screen name="Loader" component={LoaderScreen} />
        <Root.Screen name="Onboarding" component={OnboardingScreen} />
        <Root.Screen name="MainTabs" component={MainTabs} />
      </Root.Navigator>
    </NavigationContainer>
  );
}
