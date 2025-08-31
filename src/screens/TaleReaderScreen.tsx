
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  Text,
  Pressable,
  Platform,
  StatusBar,
  Share,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TalesStackParamList, TaleParam, TaleNode } from '../navigation/types';
import { getRating, setRating, markStoryReadToday } from '../utils/progress';
import StarField from '../components/StarField'; 

const BG_IMG        = require('../assets/background.png');
const CARD_BG       = require('../assets/bak_rek.png');
const ICON_STAR     = require('../assets/star_filled.png');
const ICON_STAR_OFF = require('../assets/star_outline.png');
const ICON_SHARE    = require('../assets/share.png');
const ICON_BACK     = require('../assets/back.png');

type Props = NativeStackScreenProps<TalesStackParamList, 'TaleReader'>;
type Step  = { id: string; picked?: string };

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = W < 360 || H < 700;

const CARD_AR   = 209 / 375;
const TAB_BAR_H = 58;

export default function TaleReaderScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { tale } = route.params as { tale: TaleParam };


  const headerW = W - 32;
  const headerH = Math.round(headerW * CARD_AR);


  const STARFIELD_DENSITY = IS_SMALL ? 14 : 22;
  const STARFIELD_SIZES: [number, number] = IS_SMALL ? [10, 26] : [12, 36];


  const innerReaderW = W - 32 - 24; 
  const GAP = 10;
  const choiceW = Math.floor((innerReaderW - GAP) / 2);
  const choiceH = Math.round(choiceW * (91 / 163));

 
  const thumbWBase = Math.min(116, Math.round(headerH * 0.58));
  const thumbW = IS_SMALL ? Math.round(thumbWBase * 0.9) : thumbWBase;
  const thumbH = Math.round(thumbW * (110 / 116));

  const TOP_EXTRA    = IS_SMALL ? 14 : 8;
  const BOTTOM_GAP   = IS_SMALL ? (TAB_BAR_H + insets.bottom + 22) : (TAB_BAR_H + 8);


  const readerHeight =
    H - insets.top - TOP_EXTRA - headerH - BOTTOM_GAP - 24;
  const readerFixedH = Math.max(220, Math.min(Math.round(H * 0.52), readerHeight));

  const [steps, setSteps] = useState<Step[]>([{ id: tale.start }]);
  const [stars, setStars] = useState(0);

  const starScales = useRef([0, 1, 2].map(() => new Animated.Value(0.8))).current;
  const starOpac   = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  const entranceStars = () => {
    const items = [0, 1, 2].map(i =>
      Animated.parallel([
        Animated.timing(starOpac[i],   { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(starScales[i], { toValue: 1, friction: 6, tension: 200, useNativeDriver: true }),
      ])
    );
    Animated.stagger(80, items).start();
  };

  const popStar = (i: number) =>
    Animated.sequence([
      Animated.spring(starScales[i], { toValue: 1.18, friction: 5, tension: 260, useNativeDriver: true }),
      Animated.spring(starScales[i], { toValue: 1.00, friction: 6, tension: 220, useNativeDriver: true }),
    ]);

  const calmStar = (i: number) =>
    Animated.timing(starScales[i], { toValue: 1.00, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true });

  useEffect(() => { entranceStars(); }, []);

  useEffect(() => {
    (async () => {
      const saved = await getRating(tale.id);
      setStars(saved);
      if (saved > 0) {
        Animated.stagger(70, Array.from({ length: saved }, (_, i) => popStar(i))).start();
      }
    })();
  }, [tale.id]);

  const setStarsPersist = async (n: number) => {
    setStars(n);
    try { await setRating(tale.id, n); } catch {}
  
    const anims: Animated.CompositeAnimation[] = [];
    for (let i = 0; i < 3; i++) {
      if (i < n) anims.push(popStar(i));
      else       anims.push(calmStar(i));
    }
    Animated.stagger(60, anims).start();
  };

  const pickChoice = (stepIndex: number, label: string, nextId: string) => {
    const nextNode: TaleNode | undefined = tale.nodes[nextId];
    setSteps(prev => {
      const copy = [...prev];
      copy[stepIndex] = { ...copy[stepIndex], picked: label };
      return [...copy, { id: nextId }];
    });
    if (nextNode?.isEnding) markStoryReadToday(tale.id).catch(() => {});
  };

  const onShare = async () => {
    try {
      const lastNode: TaleNode | undefined = tale.nodes[steps[steps.length - 1]?.id];
      const snippet = (lastNode?.text ?? '').replace(/\s+/g, ' ').trim().slice(0, 140);
      const message =
        `I'm reading "${tale.title}" in Tales of the Magic Panda 🐼📖` +
        (snippet ? `\n\n“${snippet}…”` : '');
      await Share.share(Platform.select({ ios: { message }, android: { message }, default: { message } }) as any);
    } catch {}
  };

  return (
    <View style={{ flex: 1 }}>
    
      <ImageBackground source={BG_IMG} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <StarField density={STARFIELD_DENSITY} sizeRange={STARFIELD_SIZES} travelMultiplier={1.15} />
      </View>

      <SafeAreaView style={s.safe} edges={['top','bottom','left','right']}>
        <StatusBar translucent backgroundColor="transparent"
          barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'} />

        <ImageBackground
          source={CARD_BG}
          resizeMode="cover"
          imageStyle={{ borderRadius: 18 }}
          style={[
            s.headerCard,
            {
              width: headerW,
              height: headerH,
              marginTop: insets.top + TOP_EXTRA,
              paddingHorizontal: 14,
              paddingTop: IS_SMALL ? 10 : 8,
              paddingBottom: IS_SMALL ? 10 : 8,
            },
          ]}
        >
          <Text
            style={[
              s.headerTitle,
              IS_SMALL && { fontSize: 15, lineHeight: 20, marginBottom: 8 },
            ]}
            numberOfLines={2}
          >
            {tale.title}
          </Text>

          <View style={s.headerCenter}>
            <Image source={tale.thumb} style={{ width: thumbW, height: thumbH }} resizeMode="contain" />
          </View>

          <View style={s.headerBottomRow}>
            <Pressable style={s.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
              <Image source={ICON_BACK} style={s.headerBtnImg} />
            </Pressable>

            <View style={s.starsRow}>
              {[1, 2, 3].map((n, i) => (
                <Pressable key={n} onPress={() => setStarsPersist(n)} hitSlop={6}>
                  <Animated.Image
                    source={n <= stars ? ICON_STAR : ICON_STAR_OFF}
                    style={[
                      s.starIcon,
                      { opacity: starOpac[i], transform: [{ scale: starScales[i] }] },
                    ]}
                  />
                </Pressable>
              ))}
            </View>

            <Pressable style={s.headerBtn} onPress={onShare} hitSlop={8}>
              <Image source={ICON_SHARE} style={s.headerBtnImg} />
            </Pressable>
          </View>
        </ImageBackground>

       
        <View
          style={[
            s.readerWrap,
            IS_SMALL ? { height: readerFixedH } : { flex: 1 },
            { marginBottom: BOTTOM_GAP, paddingBottom: 12 },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12 }}
          >
            {steps.map((step, idx) => {
              const node: TaleNode = tale.nodes[step.id];
              return (
                <View key={`${step.id}-${idx}`} style={{ marginBottom: 14 }}>
                  {!!node.text && (
                    <Text style={[s.paragraph, IS_SMALL && { fontSize: 15, lineHeight: 22 }]}>
                      {node.text}
                    </Text>
                  )}

                  {node.choices && !step.picked && (
                    <View
                      style={[
                        s.choicesRow, 
                        { justifyContent: 'space-between' },
                      ]}
                    >
                      {node.choices.slice(0, 2).map((c, i) => (
                        <Pressable key={i} onPress={() => pickChoice(idx, c.label, c.next)}
                                   style={{ width: choiceW, height: choiceH }}>
                          <ImageBackground source={CARD_BG} resizeMode="cover"
                                           imageStyle={{ borderRadius: 12 }} style={s.choiceCard}>
                            <Text style={[s.choiceTxt, { fontSize: 14, lineHeight: 18 }]} numberOfLines={4}>
                              {c.label}
                            </Text>
                          </ImageBackground>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {node.choices && step.picked && (
                    <View style={[s.choicePickedWrap, { alignItems: 'flex-start' }]}>
                      <ImageBackground source={CARD_BG} resizeMode="cover"
                                       imageStyle={{ borderRadius: 12 }}
                                       style={[s.choiceCard, { width: choiceW, height: choiceH }]}>
                        <Text style={[s.choiceTxt, { fontSize: 14 }]} numberOfLines={3}>{step.picked}</Text>
                        <View style={s.tickBadge}><Text style={s.tickTxt}>✓</Text></View>
                      </ImageBackground>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  headerCard: {
    alignSelf: 'center',
    borderRadius: 18,
    overflow: 'hidden',
  },
  headerTitle: {
    color: '#3a2b0b',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  headerBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  headerBtn: { width: 90, height: 60, alignItems: 'center', justifyContent: 'center' },
  headerBtnImg: { width: 46, height: 46, resizeMode: 'contain' },

  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  starIcon: { width: 28, height: 28, resizeMode: 'contain' },

  readerWrap: {
    marginTop: 10,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  paragraph: { color: '#fff', fontSize: 16, lineHeight: 23 },

  choicesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    columnGap: 10,
  },
  choiceCard: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  choiceTxt: { color: '#3a2b0b', fontWeight: '800', textAlign: 'center' },

  choicePickedWrap: { marginTop: 10 },

  tickBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1a9f4b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickTxt: { color: '#fff', fontWeight: '900', fontSize: 14 },
});
