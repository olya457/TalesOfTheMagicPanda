import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ImageBackground,
  Text,
  useWindowDimensions,
  Pressable,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const BG_IMG  = require('../assets/background.png');
const CARD_BG = require('../assets/bak_rek.png');

const PANDA_1 = require('../assets/panda_book.png');
const PANDA_2 = require('../assets/panda_scholar.png');
const PANDA_3 = require('../assets/panda_medal.png');
const PANDA_4 = require('../assets/panda_meditate.png');

const BTN_IMG = require('../assets/button_placeholder.png');

const SLIDES = [
  { key: 'welcome',      img: PANDA_1, title: 'Welcome to Tales of the Magic Panda', body: 'Discover a magical world of stories, wisdom, and adventures guided by the Panda.' },
  { key: 'stories',      img: PANDA_2, title: 'Interactive Stories',                 body: 'Read short fairy tales and choose your own path. Every decision leads to a new adventure.' },
  { key: 'achievements', img: PANDA_3, title: 'Collect Achievements',                body: 'Unlock rewards by reading stories, rating them, and visiting daily. See your progress grow.' },
  { key: 'wisdom',       img: PANDA_4, title: 'Daily Panda Wisdom',                  body: 'Every day, the Panda shares a short piece of wisdom to inspire and guide you.' },
] as const;

export default function OnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const isSmall = W < 360 || H < 700;

  const pandaW = Math.min(392, Math.round(W * (isSmall ? 0.72 : 0.82)));
  const pandaH = Math.round(pandaW * (421 / 392));

  const CARD_AR = 209 / 375;
  const cardW = Math.min(375, W - 32);

  const btnW = Math.min(208, Math.round(W * 0.55));
  const btnH = Math.round(btnW * (75 / 208));

  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef<ScrollView | null>(null);
  const [index, setIndex] = useState(0);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / W);
    setIndex(i);
  };

  const goNext = () => {
    if (index === SLIDES.length - 1) {
      navigation.replace('MainTabs');
    } else {
      const next = index + 1;
      setIndex(next);
      listRef.current?.scrollTo({ x: next * W, animated: true });
    }
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={BG_IMG} resizeMode="cover" style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.ScrollView
          ref={listRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
         
          scrollEnabled={false}
          onMomentumScrollEnd={onMomentumEnd}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingTop: isSmall ? 6 : 10 }}
        >
          {SLIDES.map((slide, i) => {
            const inputRange = [(i - 1) * W, i * W, (i + 1) * W];

            const pandaScale = scrollX.interpolate({
              inputRange, outputRange: [0.9, 1, 0.9], extrapolate: 'clamp',
            });
            const pandaTY = scrollX.interpolate({
              inputRange, outputRange: [8, 0, 8], extrapolate: 'clamp',
            });

            const cardOpacity = scrollX.interpolate({
              inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp',
            });
            const cardTY = scrollX.interpolate({
              inputRange, outputRange: [22, 0, 22], extrapolate: 'clamp',
            });

            const btnOpacity = scrollX.interpolate({
              inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp',
            });
            const btnScale = scrollX.interpolate({
              inputRange, outputRange: [0.96, 1, 0.96], extrapolate: 'clamp',
            });

            return (
              <View key={slide.key} style={[styles.slide, { width: W }]}>
                <Animated.View style={[styles.pandaWrap, { transform: [{ translateY: pandaTY }, { scale: pandaScale }] }]}>
                  <Image source={slide.img} style={{ width: pandaW, height: pandaH }} resizeMode="contain" />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.cardWrap,
                    {
                      width: cardW,
                      height: Math.round(cardW * CARD_AR),
                      opacity: cardOpacity,
                      transform: [{ translateY: cardTY }],
                    },
                  ]}
                >
                  <ImageBackground source={CARD_BG} resizeMode="cover" style={styles.cardBg} imageStyle={{ borderRadius: 18 }}>
                    <View style={styles.cardInner}>
                      <Text
                        style={[styles.cardTitle, { textAlign: 'center', transform: [{ translateY: isSmall ? -8 : -10 }] }]}
                        numberOfLines={2}
                      >
                        {slide.title}
                      </Text>
                      <Text style={[styles.cardBody, { textAlign: 'center' }]}>{slide.body}</Text>
                    </View>
                  </ImageBackground>
                </Animated.View>

                <Animated.View style={[styles.buttonWrap, { opacity: btnOpacity, transform: [{ scale: btnScale }] }]}>
                  <Pressable onPress={goNext} accessibilityRole="button" style={{ marginBottom: 16 }}>
                    <Image source={BTN_IMG} style={[styles.btnImg, { width: btnW, height: btnH }]} resizeMode="contain" />
                  </Pressable>
                </Animated.View>
              </View>
            );
          })}
        </Animated.ScrollView>

        <View style={[styles.dots, { bottom: 10 + insets.bottom }]}>
          {SLIDES.map((_, i) => {
            const animatedDot = scrollX.interpolate({
              inputRange: [(i - 1) * W, i * W, (i + 1) * W],
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  isSmall && { width: 6, height: 6, marginHorizontal: 3 },
                  { opacity: animatedDot },
                ]}
              />
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  slide: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  pandaWrap: { alignItems: 'center', justifyContent: 'flex-end' },

  cardWrap: { marginTop: 12, alignSelf: 'center' },
  cardBg: { flex: 1, borderRadius: 18, overflow: 'hidden' },
  cardInner: { flex: 1, paddingHorizontal: 18, paddingVertical: 16, justifyContent: 'center' },

  cardTitle: { fontSize: 22, lineHeight: 28, fontWeight: '800', color: '#3a2b0b' },
  cardBody: { marginTop: 8, fontSize: 18, lineHeight: 24, color: '#3a2b0b' },

  buttonWrap: { marginTop: 14, alignItems: 'center' },
  btnImg: { borderRadius: 24, overflow: 'hidden' },

  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
});
