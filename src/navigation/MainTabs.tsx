import React from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  View,
  StyleSheet,
} from 'react-native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabParamList } from './types';

import MenuScreen from '../screens/MenuScreen';
import TalesStack from './TalesStack';
import AchievementsScreen from '../screens/AchievementsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const TAB_BG = require('../assets/tabbar_bg.png');

const ICONS = {
  Menu: {
    active: require('../assets/tab_menu_active.png'),
    inactive: require('../assets/tab_menu.png'),
  },
  Tales: {
    active: require('../assets/tab_tales_active.png'),
    inactive: require('../assets/tab_tales.png'),
  },
  Achievements: {
    active: require('../assets/tab_ach_active.png'),
    inactive: require('../assets/tab_ach.png'),
  },
  Settings: {
    active: require('../assets/tab_settings_active.png'),
    inactive: require('../assets/tab_settings.png'),
  },
} as const;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <ImageBackground
        source={TAB_BG}
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <View style={styles.row}>
          {state.routes.map((route, idx) => {
            const focused = state.index === idx;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
              }
            };

            const pack = ICONS[route.name as keyof typeof ICONS];

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.item}
                android_ripple={{ color: 'rgba(255,255,255,0.12)', borderless: true }}
              >
                <Image
                  source={focused ? pack.active : pack.inactive}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </Pressable>
            );
          })}
        </View>
      </ImageBackground>
    </View>
  );
}

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Menu"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Tales" component={TalesStack} />
      <Tab.Screen name="Achievements" component={AchievementsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  bg: {
    width: 263,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgImage: {
    resizeMode: 'contain', 
  },

  row: {
    width: '86%',              
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
 
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
 
  icon: { width: 28, height: 28 },
});