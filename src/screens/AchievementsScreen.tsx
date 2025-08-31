
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  ImageBackground,
  View,
  Text,
  Dimensions,
  FlatList,
  Pressable,
  Animated,
  Image,
  Platform,
  StatusBar,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG_IMG = require('../assets/background.png');


const TILE_EMPTY   = require('../assets/background_achevki.png');
const ICON_LOCK    = require('../assets/lock.png');
const ICON_BOOK    = require('../assets/book.png');
const ICON_CAL     = require('../assets/calendar_1.png');
const ICON_LOTUS_S = require('../assets/lotus_1.png');
const ICON_STARS3  = require('../assets/three_stars.png');
const ICON_MANY    = require('../assets/many_stars.png');
const ICON_PANDA   = require('../assets/panda.png');
const ICON_LOTUS_B = require('../assets/roskrit_lotus.png');

type AchievementId =
  | 'first_read'
  | 'first_rating'
  | 'rating_2'
  | 'rating_3'
  | 'streak_3'
  | 'streak_5'
  | 'logins_20'
  | 'all_read';

type Stats = {
  readDays: number;
  readStories: number;
  ratedCount: number;
  streakDays: number;
  loginDays: number;
  allStoriesRead: boolean;
};

type Ach = {
  id: AchievementId;
  icon: any;
  hint: string;
  unlocked: (s: Stats) => boolean;
};

const { width: W, height: H } = Dimensions.get('window');
const isSmall = W < 360 || H < 700;

const NUM_COLS = 2;
const GUTTER = isSmall ? 12 : 16;
const TILE_AR = 168 / 110;
const TILE_W = Math.round((W - GUTTER * (NUM_COLS + 1)) / NUM_COLS);
const TILE_H = Math.round(TILE_W / TILE_AR);
const TAB_BAR_H = 58;


const ymToday = () => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth()+1, d: d.getDate() }; };
const keyForDay = (y:number, m:number, d:number) => `activities:${y}-${m}-${d}`;
function dayHasActivity(val: string | null): boolean {
  if (!val) return false;
  try {
    const obj = JSON.parse(val);
    return !!(obj.calm || obj.energy || obj.focus || obj.read || obj.done || obj.story);
  } catch {
    return val === '1' || val === 'true';
  }
}

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setBarStyle('light-content');
    }
  }, []);

  const [stats, setStats] = useState<Stats>({
    readDays: 0,
    readStories: 0,
    ratedCount: 0,
    streakDays: 1, 
    loginDays: 0,
    allStoriesRead: false,
  });

  const ACHS: Ach[] = useMemo(() => [
    { id: 'first_read',   icon: ICON_BOOK,    hint: 'Read your first story (or complete any daily practice).',               unlocked: s => s.readDays >= 1 || s.readStories >= 1 },
    { id: 'first_rating', icon: ICON_MANY,    hint: 'Rate your first story to help others find the best ones.',             unlocked: s => s.ratedCount >= 1 },
    { id: 'rating_2',     icon: ICON_STARS3,  hint: 'Rate two stories — your opinion matters!',                             unlocked: s => s.ratedCount >= 2 },
    { id: 'rating_3',     icon: ICON_STARS3,  hint: 'Rate three stories — keep exploring the Panda’s magical world.',       unlocked: s => s.ratedCount >= 3 },
    { id: 'streak_3',     icon: ICON_CAL,     hint: 'Read on several days in a row (3+). Small daily steps are powerful.',  unlocked: s => s.streakDays >= 3 },
    { id: 'streak_5',     icon: ICON_LOTUS_S, hint: 'Complete a 5-day reading cycle — your Lotus of Wisdom starts to bloom.',unlocked: s => s.streakDays >= 5 },
    { id: 'logins_20',    icon: ICON_PANDA,   hint: 'Open the app on 20 different days — consistency works wonders.',       unlocked: s => s.loginDays >= 20 },
    { id: 'all_read',     icon: ICON_LOTUS_B, hint: 'Read all available stories — the big Lotus blooms in your honor!',     unlocked: s => s.allStoriesRead },
  ], []);

  const [openIds, setOpenIds] = useState<Set<AchievementId>>(new Set());

  const scalesRef  = useRef<Record<AchievementId, Animated.Value>>({} as any);
  const contentRef = useRef<Record<AchievementId, { opacity: Animated.Value; ty: Animated.Value }>>({} as any);
  const enterRef   = useRef<Record<AchievementId, { opacity: Animated.Value; tx: Animated.Value; ty: Animated.Value }>>({} as any);

  useEffect(() => {
    const scales: Record<AchievementId, Animated.Value> = {} as any;
    const content: Record<AchievementId, { opacity: Animated.Value; ty: Animated.Value }> = {} as any;
    const enter: Record<AchievementId, { opacity: Animated.Value; tx: Animated.Value; ty: Animated.Value }> = {} as any;

    ACHS.forEach(a => {
      scales[a.id]  = new Animated.Value(a.unlocked(stats) ? 1 : 0.96);
      content[a.id] = { opacity: new Animated.Value(0), ty: new Animated.Value(8) };
      enter[a.id]   = { opacity: new Animated.Value(0), tx: new Animated.Value(0), ty: new Animated.Value(0) };
    });

    scalesRef.current  = scales;
    contentRef.current = content;
    enterRef.current   = enter;
  }, [ACHS.length]);

  useEffect(() => {
    ACHS.forEach(a => {
      const v = scalesRef.current[a.id];
      if (!v) return;
      Animated.spring(v, {
        toValue: a.unlocked(stats) ? 1 : 0.96,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }).start();
    });
  }, [ACHS, stats]);

  useEffect(() => {
    setOpenIds(new Set());
    const seq: Animated.CompositeAnimation[] = [];
    ACHS.forEach((a, idx) => {
      const isLeft = idx % NUM_COLS === 0;
      const ea = enterRef.current[a.id];
      if (!ea) return;
      ea.opacity.setValue(0);
      ea.tx.setValue(isLeft ? -24 : 24);
      ea.ty.setValue(-24);
      seq.push(
        Animated.parallel([
          Animated.timing(ea.opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.spring(ea.tx, { toValue: 0, friction: 7, tension: 110, useNativeDriver: true }),
          Animated.spring(ea.ty, { toValue: 0, friction: 7, tension: 110, useNativeDriver: true }),
        ])
      );
    });
    Animated.stagger(70, seq).start();
  }, [ACHS.length]);

  useEffect(() => {
    ACHS.forEach(a => {
      const anims = contentRef.current[a.id];
      if (!anims) return;
      const needOpen = openIds.has(a.id);
      anims.opacity.stopAnimation();
      anims.ty.stopAnimation();
      if (needOpen) {
        anims.opacity.setValue(0);
        anims.ty.setValue(8);
        Animated.parallel([
          Animated.timing(anims.opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.spring(anims.ty, { toValue: 0, friction: 7, tension: 120, useNativeDriver: true }),
        ]).start();
      } else {
        anims.opacity.setValue(0);
        anims.ty.setValue(8);
      }
    });
  }, [openIds, ACHS]);
  useFocusEffect(
    useCallback(() => {
      return () => {
        setOpenIds(new Set());
        Object.values(contentRef.current).forEach(a => {
          a.opacity.setValue(0);
          a.ty.setValue(8);
        });
      };
    }, [])
  );

 
  const loadStats = useCallback(async () => {
    const { y, m, d } = ymToday();

    const daysToCheck = 60;
    const dates = Array.from({ length: daysToCheck }, (_, i) => new Date(y, m - 1, d - i));
    const dayKeys  = dates.map(dt => keyForDay(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()));
    const dayPairs = await AsyncStorage.multiGet(dayKeys);

    let readDays = 0;
    let streak = 0;
    for (let i = 0; i < dayPairs.length; i++) {
      const [, v] = dayPairs[i];
      const has = dayHasActivity(v);
      if (has) {
        readDays += 1;
        if (i === 0) streak += 1;
        else if (streak === i) streak += 1;
      }
    }
    streak = Math.max(1, streak);

    const allKeys = await AsyncStorage.getAllKeys();

    const readStoryCount = allKeys.filter(k => /^story:read:/.test(k)).length;
    const ratedCount     = allKeys.filter(k => /^(ratings?:|story:rating:|rated:)/.test(k)).length;
    const loginDays      = allKeys.filter(k => /^login:/.test(k)).length;

    const totalStories = Number(await AsyncStorage.getItem('stories:total')) || 0;
    const allStoriesRead = totalStories > 0 && readStoryCount >= totalStories;

    setStats({ readDays, readStories: readStoryCount, ratedCount, streakDays: streak, loginDays, allStoriesRead });
  }, []);

  useEffect(() => {
    loadStats();
    const subs = [
      DeviceEventEmitter.addListener('story:read',  loadStats),
      DeviceEventEmitter.addListener('story:rated', loadStats),
      DeviceEventEmitter.addListener('login:day',   loadStats),
      DeviceEventEmitter.addListener('achievements:cleared', loadStats),
    ];
    return () => subs.forEach(s => s.remove());
  }, [loadStats]);

  const renderItem = ({ item }: { item: Ach }) => {
    const unlocked = item.unlocked(stats);
    const scale = scalesRef.current[item.id] ?? new Animated.Value(unlocked ? 1 : 0.96);
    const isOpen = openIds.has(item.id);
    const cAnim = contentRef.current[item.id];
    const eAnim = enterRef.current[item.id];

    const onPress = () => {
      if (!unlocked) return;
      setOpenIds(prev => {
        const next = new Set(prev);
        next.has(item.id) ? next.delete(item.id) : next.add(item.id);
        return next;
      });
    };

    return (
      <View style={{ width: TILE_W, marginHorizontal: GUTTER / 2, marginVertical: isSmall ? 8 : 10 }}>
        <Animated.View style={{ opacity: eAnim?.opacity, transform: [{ translateX: eAnim?.tx ?? 0 }, { translateY: eAnim?.ty ?? 0 }] }}>
          <Pressable
            onPress={onPress}
            disabled={!unlocked}
            android_ripple={unlocked ? { color: 'rgba(255,255,255,0.08)' } : undefined}
            style={{ alignItems: 'center' }}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              {isOpen ? (
                <Animated.View style={{ opacity: cAnim?.opacity, transform: [{ translateY: cAnim?.ty ?? 0 }] }}>
                  <ImageBackground
                    source={TILE_EMPTY}
                    resizeMode="stretch"
                    style={[styles.emptyTile, { width: TILE_W, height: TILE_H }]}
                    imageStyle={{ borderRadius: 14 }}
                  >
                    <View style={styles.centerBox}>
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.hintText,
                          isSmall ? { fontSize: 9,  lineHeight: 11 } : { fontSize: 11, lineHeight: 14 },
                        ]}
                        numberOfLines={4}
                        ellipsizeMode="tail"
                      >
                        {item.hint}
                      </Text>
                    </View>
                  </ImageBackground>
                </Animated.View>
              ) : (
                <Image
                  source={unlocked ? item.icon : ICON_LOCK}
                  style={{ width: TILE_W, height: TILE_H, borderRadius: 14 }}
                  resizeMode="stretch"
                />
              )}
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  const EXTRA_TOP = 20;

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={BG_IMG} resizeMode="cover" style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safe} edges={['top','bottom','left','right']}>
        <FlatList
          data={ACHS}
          numColumns={NUM_COLS}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: GUTTER,
            paddingTop: 8 + EXTRA_TOP, 
            paddingBottom: insets.bottom + TAB_BAR_H + 10,
          }}
          scrollIndicatorInsets={{ bottom: insets.bottom + TAB_BAR_H }}
          extraData={{ openIds, stats }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  emptyTile: {
    borderRadius: 14,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerBox: {
    width: Math.round(TILE_W * (isSmall ? 0.70 : 0.66)),
    height: Math.round(TILE_H * 0.64),
    alignItems: 'center',
    justifyContent: 'center',
  },

  hintText: {
    color: '#000',
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
    ...Platform.select({
      ios: { letterSpacing: 0.1 },
      android: { textAlignVertical: 'center' as any },
    }),
  },
});
