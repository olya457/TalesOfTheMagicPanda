
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet, View, Image, ImageBackground, Text, Dimensions,
  Platform, StatusBar, Animated, Easing, DeviceEventEmitter
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG_IMG = require('../assets/background.png');
const CARD_BG = require('../assets/bak_rek.png');
const PANDA_CARD = require('../assets/panda_card.png');

const LOTUS_1 = require('../assets/lotus1.png');
const LOTUS_2 = require('../assets/lotus2.png');
const LOTUS_3 = require('../assets/lotus3.png');
const LOTUS_4 = require('../assets/lotus4.png');
const LOTUS_5 = require('../assets/lotus5.png');
const LOTUS_STAGES = [LOTUS_1, LOTUS_2, LOTUS_3, LOTUS_4, LOTUS_5] as const;

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = W < 360 || H < 700;
const TAB_BAR_H = 58;

const QUOTES = [
  'A kind heart is stronger than any roar',
  'Bravery is choosing the gentle path',
  'Wisdom grows where patience lives',
  'Small steps awaken great journeys',
];

const ymToday = () => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() }; };
const pad2 = (n: number) => String(n).padStart(2, '0');
const keyLoose = (y: number, m: number, d: number) => `activities:${y}-${m}-${d}`;                  // без нулей
const keyPadded = (y: number, m: number, d: number) => `activities:${y}-${pad2(m)}-${pad2(d)}`;     // с нулями

function dayHasActivity(val: string | null): boolean {
  if (!val) return false;
  try {
    const obj = JSON.parse(val);
    return !!(obj.calm || obj.energy || obj.focus || obj.read || obj.done || obj.story);
  } catch {
    return val === '1' || val === 'true';
  }
}

export default function MenuScreen() {
  const insets = useSafeAreaInsets();

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [streakDays, setStreakDays] = useState(1); 

  const panda = useRef({ o: new Animated.Value(0), x: new Animated.Value(40) }).current;
  const streak = useRef({ o: new Animated.Value(0), x: new Animated.Value(-40) }).current;

  const loadStreak = useCallback(async () => {
    const { y, m, d } = ymToday();
    const daysToCheck = 60;

    const dates = Array.from({ length: daysToCheck }, (_, i) => new Date(y, m - 1, d - i));

    const keys: string[] = [];
    dates.forEach(dt => {
      const Y = dt.getFullYear();
      const M = dt.getMonth() + 1;
      const D = dt.getDate();
      keys.push(keyLoose(Y, M, D));
      keys.push(keyPadded(Y, M, D));
    });

    const pairs = await AsyncStorage.multiGet(keys);

    let streakCount = 0;
    for (let dayIdx = 0; dayIdx < dates.length; dayIdx++) {
      const looseVal = pairs[dayIdx * 2]?.[1] ?? null;
      const padVal   = pairs[dayIdx * 2 + 1]?.[1] ?? null;

      const has = dayHasActivity(looseVal) || dayHasActivity(padVal);
      if (has) streakCount += 1;
      else break; 
    }

    setStreakDays(Math.max(1, streakCount));
  }, []);

  useFocusEffect(
    useCallback(() => {
      panda.o.setValue(0);  panda.x.setValue(40);
      streak.o.setValue(0); streak.x.setValue(-40);

      Animated.sequence([
        Animated.parallel([
          Animated.timing(panda.o, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(panda.x, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.delay(100),
        Animated.parallel([
          Animated.timing(streak.o, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(streak.x, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
      ]).start();

      setQuoteIndex(Math.floor(Math.random() * QUOTES.length));
      loadStreak();
    }, [loadStreak])
  );


  useEffect(() => {
    const s1 = DeviceEventEmitter.addListener('story:read', loadStreak);
    const s2 = DeviceEventEmitter.addListener('login:day', loadStreak);
    const s3 = DeviceEventEmitter.addListener('achievements:cleared', () => { setStreakDays(1); loadStreak(); });
    return () => { s1.remove(); s2.remove(); s3.remove(); };
  }, [loadStreak]);

  const viewDays = streakDays;
  const lotusImg = LOTUS_STAGES[Math.min(LOTUS_STAGES.length - 1, viewDays - 1)];

  const CARD_AR = 209 / 375;
  const cardW = W - 32;
  const cardH = Math.round(cardW * CARD_AR);
  const cardRadius = IS_SMALL ? 16 : 20;

  const quote = QUOTES[quoteIndex];

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent"
        barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'} />

      <ImageBackground source={BG_IMG} resizeMode="cover" style={StyleSheet.absoluteFillObject} />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeContent}>
        <View style={[styles.content, { paddingTop: (IS_SMALL ? 8 : 12) + 20  }]}>

          <Animated.View style={{ opacity: panda.o, transform: [{ translateX: panda.x }] }}>
            <ImageBackground
              source={CARD_BG}
              style={[styles.cardBg, {
                width: cardW, height: cardH, borderRadius: cardRadius,
                paddingHorizontal: IS_SMALL ? 14 : 18, paddingVertical: IS_SMALL ? 14 : 18
              }]}
              imageStyle={{ borderRadius: cardRadius }}
            >
              <View style={styles.cardRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text numberOfLines={3}
                    style={[styles.quoteTitle, IS_SMALL && { fontSize: 18, lineHeight: 24 }]}>
                    {quote}
                  </Text>
                </View>
                <Image source={PANDA_CARD}
                  style={{ width: IS_SMALL ? 96 : 120, height: IS_SMALL ? 96 : 120 }}
                  resizeMode="contain" />
              </View>
            </ImageBackground>
          </Animated.View>

          <Animated.View style={[
            { opacity: streak.o, transform: [{ translateX: streak.x }] },
            { marginTop: IS_SMALL ? 14 : 18 },
          ]}>
            <View style={[
              styles.streakCard,
              { borderRadius: IS_SMALL ? 16 : 18, paddingVertical: IS_SMALL ? 14 : 16, paddingHorizontal: 16 },
            ]}>
              <Text style={[styles.streakTitle, IS_SMALL && { fontSize: 18 }]}>Your reading streak is</Text>
              <Text style={[styles.streakDays, IS_SMALL && { fontSize: 28 }]}>
                {viewDays} {viewDays === 1 ? 'day' : 'days'}
              </Text>
              <Text style={[styles.streakHint, IS_SMALL && { fontSize: 14, lineHeight: 20 }]}>
                Read every day to let your Lotus{'\n'}of Wisdom bloom.
              </Text>
            </View>
          </Animated.View>

          <View pointerEvents="none" style={[styles.lotusWrap, { bottom: TAB_BAR_H }]}>
            <Image source={lotusImg} style={{ width: 101, height: 151 }} resizeMode="contain" />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  safeContent: { flex: 1, backgroundColor: 'transparent' },
  content: { flex: 1, paddingHorizontal: 16 },

  cardBg: { alignSelf: 'center', justifyContent: 'center' },
  cardRow: { flexDirection: 'row', alignItems: 'center' },

  quoteTitle: { color: '#3a2b0b', fontSize: 20, lineHeight: 26, fontWeight: '800' },

  streakCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(7, 97, 35, 0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  streakTitle: { color: '#111', fontSize: 20, fontWeight: '800' },
  streakDays: { marginTop: 2, color: '#000', fontSize: 32, fontWeight: '800' },
  streakHint: { marginTop: 6, textAlign: 'center', color: '#111', fontSize: 15, lineHeight: 22 },

  lotusWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
});
