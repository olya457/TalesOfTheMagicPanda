
import React, { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  ImageBackground,
  FlatList,
  View,
  Text,
  Image,
  Pressable,
  Dimensions,
  Share,
  Platform,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TalesStackParamList, TaleParam } from '../navigation/types';
import { useFocusEffect } from '@react-navigation/native';
import { DeviceEventEmitter } from 'react-native';
import { EVENTS, getRatings, setRating } from '../utils/progress';
import { TALES } from '../data/tales';

const BG_IMG   = require('../assets/background.png');
const CARD_BG  = require('../assets/bak_rek.png');
const ICON_STAR     = require('../assets/star_filled.png');
const ICON_STAR_OFF = require('../assets/star_outline.png');
const ICON_SHARE    = require('../assets/share.png');

type Props = NativeStackScreenProps<TalesStackParamList, 'TalesList'>;

const { width: W, height: H } = Dimensions.get('window');
const CARD_W   = W - 32;
const CARD_H   = Math.round(CARD_W * (209 / 375));
const TAB_BAR_H = 58;

const IS_SMALL = W < 360 || H < 700;

const SHARE_W    = IS_SMALL ? 84 : 90;
const SHARE_H    = IS_SMALL ? 56 : 60;
const SHARE_ICON = IS_SMALL ? 40 : 46;

const THUMB_W = IS_SMALL ? 96 : 116;
const THUMB_H = Math.round(THUMB_W * (110 / 116));

export default function TalesListScreen({ navigation }: Props) {
  const [ratings, setRatingsState] = useState<Record<string, number>>({});

  const animsRef = useRef(
    TALES.map((_, i) => ({
      o: new Animated.Value(0),
      x: new Animated.Value((i % 2 === 0 ? -1 : 1) * 40),
    }))
  ).current;

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      animsRef.forEach((anim, i) => {
        anim.o.setValue(0);
        anim.x.setValue(i % 2 === 0 ? -40 : 40);
      });
      const seq = animsRef.map(a =>
        Animated.parallel([
          Animated.timing(a.o, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(a.x, { toValue: 0, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ])
      );
      Animated.stagger(100, seq).start();

      (async () => {
        const map = await getRatings(TALES.map(t => t.id));
        if (isActive) setRatingsState(map);
      })();

      const onRated = DeviceEventEmitter.addListener(EVENTS.STORY_RATED, ({ id, stars }: any) => {
        setRatingsState(prev => ({ ...prev, [id]: stars }));
      });
      const onCleared = DeviceEventEmitter.addListener(EVENTS.CLEARED, () => {
        setRatingsState({});
      });

      return () => {
        isActive = false;
        onRated.remove();
        onCleared.remove();
      };
    }, [animsRef])
  );

  const ratePersist = async (id: string, n: number) => {
    setRatingsState(p => ({ ...p, [id]: n }));
    try { await setRating(id, n); } catch {}
  };

  const onShare = async (t: TaleParam) => {
    try { await Share.share({ message: t.title }); } catch {}
  };

  const renderItem = ({ item, index }: { item: TaleParam; index: number }) => {
    const rate = ratings[item.id] ?? 0;
    const a = animsRef[index];

    return (
      <Animated.View
        style={[
          s.cardOuter,
          { opacity: a?.o, transform: [{ translateX: a?.x }] },
        ]}
      >
        <ImageBackground
          source={CARD_BG}
          resizeMode="cover"
          imageStyle={{ borderRadius: 18 }}
          style={[s.card, { width: CARD_W, height: CARD_H }]}
        >
          <Pressable
            onPress={() => navigation.navigate('TaleReader', { tale: item })}
            style={StyleSheet.absoluteFill}
          />

          <Text
            style={[s.title, IS_SMALL && { fontSize: 16, lineHeight: 20, marginBottom: 6 }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <View style={[s.thumbWrap, IS_SMALL && { marginTop: 2 }]}>
            <Image source={item.thumb} style={{ width: THUMB_W, height: THUMB_H }} resizeMode="contain" />
          </View>

          <View style={s.bottomRow}>
            <View style={{ width: SHARE_W }} />
            <View style={s.starsRow}>
              {[1, 2, 3].map(n => (
                <Pressable
                  key={n}
                  onPress={(e) => { e.stopPropagation(); ratePersist(item.id, n); }}
                  hitSlop={6}
                >
                  <Image source={n <= rate ? ICON_STAR : ICON_STAR_OFF} style={s.star} />
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[s.shareBtn, { width: SHARE_W, height: SHARE_H }]}
              onPress={(e) => { e.stopPropagation(); onShare(item); }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Image source={ICON_SHARE} style={{ width: SHARE_ICON, height: SHARE_ICON, resizeMode: 'contain' }} />
            </Pressable>
          </View>
        </ImageBackground>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top','bottom','left','right']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'}
      />
      <ImageBackground source={BG_IMG} resizeMode="cover" style={s.bg}>
        <FlatList
          data={TALES}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
           
            paddingTop: 35,
            paddingHorizontal: 16,
            gap: 14,
            paddingBottom: TAB_BAR_H + 12,
          }}
          scrollIndicatorInsets={{ bottom: TAB_BAR_H }}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },

  cardOuter: { alignSelf: 'center', width: CARD_W },
  card: {
    alignSelf: 'center',
    borderRadius: 18,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  title: {
    textAlign: 'center',
    color: '#3a2b0b',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    marginBottom: 4,
  },

  thumbWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  star: { width: 28, height: 28, resizeMode: 'contain' },


  shareBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
