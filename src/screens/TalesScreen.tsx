import React, { useState, useRef } from 'react';
import {
  SafeAreaView, StyleSheet, ImageBackground, FlatList,
  View, Text, Image, Pressable, Dimensions, Share, Platform, StatusBar,
  Animated, Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TalesStackParamList, TaleParam, TaleNode } from '../navigation/types';

type Props = NativeStackScreenProps<TalesStackParamList, 'TalesList'>;

const BG_IMG   = require('../assets/background.png');
const CARD_BG  = require('../assets/bak_rek.png');

const THUMBS = {
  lotus: require('../assets/panda_lotus_thumb.png'),
  star:  require('../assets/panda_star_thumb.png'),
  grove: require('../assets/panda_grove_thumb.png'),
  moon:  require('../assets/panda_moon_thumb.png'),
  wind:  require('../assets/panda_wind_thumb.png'),
} as const;

const ICON_STAR     = require('../assets/star_filled.png');
const ICON_STAR_OFF = require('../assets/star_outline.png');
const ICON_SHARE    = require('../assets/share.png');

const { width: W, height: H } = Dimensions.get('window');
const isSmall = W < 360 || H < 700;

const TALES: TaleParam[] = [
  {
    id: 'hiddenLotus',
    title: 'The Panda and the Hidden Lotus',
    category: 'lotus',
    thumb: THUMBS.lotus,
    start: 'begin',
    nodes: {
      begin: {
        text:
          'Once upon a time, deep inside a bamboo forest, there lived a wise panda named Lin. Every morning, Lin would walk to the river, watching the lotus flowers bloom and listening to the whispers of the wind.\n\n' +
          'One day, Lin discovered a strange bud among the lotuses. It was glowing softly, as if hiding a secret. The panda felt that the flower was not ordinary but magical, waiting for someone to unlock its mystery.',
        choices: [
          { label: 'Lin decides to sit quietly and meditate by the glowing bud.', next: 'pathA' },
          { label: 'Lin decides to ask the fireflies, the guardians of the forest, about the lotus.', next: 'pathB' },
        ],
      },
      pathA: {
        text:
          'Lin closed his eyes and took a deep breath. The forest fell silent, and the glowing bud pulsed in rhythm with his calm heart.\n\n' +
          'The bud opened slightly, showing golden light within. Lin understood: the lotus would only bloom for those who carried peace in their heart.',
        choices: [
          { label: 'Lin gently touches the lotus.', next: 'endA' },
          { label: 'Lin decides to sing a song of gratitude to the forest.', next: 'endB' },
        ],
      },
      pathB: {
        text:
          'Lin followed the tiny sparks of fireflies until he found their leader, a bright green one named Lumi. “The lotus is ancient,” Lumi whispered. “It will open only to those who ask with kindness.”\n\n' +
          'The fireflies surrounded the bud, lighting it with gentle glow. The lotus shimmered — ready to reveal its secret, if Lin chose wisely.',
        choices: [
          { label: 'Lin gently touches the lotus.', next: 'endA' },
          { label: 'Lin decides to sing a song of gratitude to the forest.', next: 'endB' },
        ],
      },
      endA: { isEnding: true, text: 'The bud unfolded into a golden bloom, filling the forest with peace.' },
      endB: { isEnding: true, text: 'The lotus bloomed on its own, its golden light turning into stars above the forest.' },
    } as Record<string, TaleNode>,
  },
  { id: 'lostStar', title: 'The Panda and the Lost Star', category: 'star', thumb: THUMBS.star, start: 'begin',
    nodes: { begin: { text: 'One quiet evening, Lin saw a star fall into the bamboo forest…', isEnding: true } } },
  { id: 'hiddenGrove', title: 'The Panda and the Hidden Bamboo Grove', category: 'grove', thumb: THUMBS.grove, start: 'begin',
    nodes: { begin: { text: 'A sealed bamboo gate with glowing symbols whispered: “Wisdom or courage will open the way.”', isEnding: true } } },
  { id: 'moonBridge', title: 'The Panda and the Moonlit Bridge', category: 'moon', thumb: THUMBS.moon, start: 'begin',
    nodes: { begin: { text: 'A bridge made of moonlight stretched across the river…', isEnding: true } } },
  { id: 'windWhisper', title: 'The Panda and the Whispering Wind', category: 'wind', thumb: THUMBS.wind, start: 'begin',
    nodes: { begin: { text: 'Wind-spirits whispered from a hollow tree, asking for help.', isEnding: true } } },
];

export default function TalesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [ratings, setRatings] = useState<Record<string, number>>({});

 
  const animsRef = useRef<{ o: Animated.Value; x: Animated.Value }[]>([]);
  useFocusEffect(
    React.useCallback(() => {
      animsRef.current = TALES.map((_, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        return { o: new Animated.Value(0), x: new Animated.Value(40 * dir) };
      });

      const seq = animsRef.current.map(a =>
        Animated.parallel([
          Animated.timing(a.o, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(a.x, { toValue: 0, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ])
      );
      Animated.stagger(100, seq).start();
      return undefined;
    }, [])
  );

  const rate = (id: string, n: number) => setRatings(p => ({ ...p, [id]: n }));
  const onShare = async (t: TaleParam) => { try { await Share.share({ message: t.title }); } catch {} };

  const renderCard = ({ item, index }: { item: TaleParam; index: number }) => {
    const stars = ratings[item.id] ?? 0;
    const a = animsRef.current[index];

    return (
      <Animated.View
        style={[
          { opacity: a?.o ?? 1, transform: [{ translateX: a?.x ?? 0 }] },
          { borderRadius: 18, overflow: 'hidden' },
        ]}
      >
        <Pressable onPress={() => navigation.navigate('TaleReader', { tale: item })}>
          <ImageBackground source={CARD_BG} resizeMode="cover" imageStyle={{ borderRadius: 18 }} style={s.card}>
         
            <Text style={[s.cardTitle, isSmall && { fontSize: 15 }]} numberOfLines={2}>
              {item.title}
            </Text>

            
            <View style={s.thumbWrap}>
              <Image source={item.thumb} style={s.thumb} resizeMode="contain" />
            </View>

         
            <View style={s.bottomRow}>
              <View style={{ width: 75 }} />
              <View style={s.starsRow}>
                {[1, 2, 3].map(n => (
                  <Pressable key={n} onPress={() => rate(item.id, n)} hitSlop={6}>
                    <Image source={n <= stars ? ICON_STAR : ICON_STAR_OFF} style={s.starIcon} />
                  </Pressable>
                ))}
              </View>
              <Pressable style={s.shareBtn} onPress={() => onShare(item)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Image source={ICON_SHARE} style={s.shareImg} />
              </Pressable>
            </View>
          </ImageBackground>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar translucent backgroundColor="transparent" barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'} />
      <ImageBackground source={BG_IMG} style={s.bg} resizeMode="cover">
        <FlatList
          data={TALES}
          keyExtractor={i => i.id}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top + 8,
            paddingBottom: 24 + insets.bottom + 90,
            paddingHorizontal: 16,
            rowGap: 12,
          }}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const { width: W2 } = Dimensions.get('window');
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },

  card: {
    width: W2 - 32,
    alignSelf: 'center',
    aspectRatio: 375 / 209,
    paddingHorizontal: 14,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  cardTitle: { color: '#3a2b0b', fontSize: 16, fontWeight: '700' },
  thumbWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 116, height: 110 },

  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  starIcon: { width: 28, height: 28, resizeMode: 'contain' },

  shareBtn: { width: 75, height: 50, alignItems: 'center', justifyContent: 'center' },
  shareImg: { width: 36, height: 36, resizeMode: 'contain' },
});
