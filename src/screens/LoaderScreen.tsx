import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  ImageBackground,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useMusic } from '../providers/MusicProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Loader'>;

const BG_IMG = require('../assets/background.png');
const CENTER_IMG = require('../assets/central_picture.png');
const LOTUS_FRAMES = [
  require('../assets/lotus1.png'),
  require('../assets/lotus2.png'),
  require('../assets/lotus3.png'),
  require('../assets/lotus4.png'),
  require('../assets/lotus5.png'),
];

const ENTER_MS = 550;
const BREATH_MS = 1200;
const LOTUS_SWAP_MS = 450;
const NAVIGATE_AFTER_MS = 3000;

export default function LoaderScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const { setOn } = useMusic();

  const isSmall = W < 360 || H < 640;
  const safeH = H - insets.top - insets.bottom;

  const CENTER_W = 438;
  const CENTER_H = 338;
  const centerScaleFit = Math.min(
    1,
    (W - (isSmall ? 24 : 48)) / CENTER_W,
    (safeH * (isSmall ? 0.48 : 0.55)) / CENTER_H
  );
  const cW = Math.round(CENTER_W * centerScaleFit);
  const cH = Math.round(CENTER_H * centerScaleFit);

  const LOTUS_W = isSmall ? 42 : 51;
  const LOTUS_H = isSmall ? 74 : 89;


  const centerOpacity = useRef(new Animated.Value(0)).current;
  const centerEnterScale = useRef(new Animated.Value(0.94)).current;
  const centerBreatheScale = useRef(new Animated.Value(1)).current;
  const centerFloatY = useRef(new Animated.Value(0)).current;
  const centerTilt = useRef(new Animated.Value(0)).current;

  const lotusOpacity = useRef(new Animated.Value(0)).current;
  const lotusScale = useRef(new Animated.Value(0.9)).current;
  const lotusTilt = useRef(new Animated.Value(0)).current;

  const [lotusFrame, setLotusFrame] = useState(0);


  useFocusEffect(
    React.useCallback(() => {
      setOn(true);
      return undefined;
    }, [setOn])
  );

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setBarStyle('light-content');
    }
  }, []);


  useEffect(() => {
    const enter = Animated.parallel([
      Animated.timing(centerOpacity, {
        toValue: 1,
        duration: ENTER_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(centerEnterScale, {
        toValue: 1,
        duration: ENTER_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(lotusOpacity, {
        toValue: 1,
        delay: 150,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(lotusScale, {
          toValue: 1.06,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(lotusScale, {
          toValue: 1,
          damping: 12,
          stiffness: 120,
          mass: 0.6,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(lotusTilt, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(centerTilt, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    enter.start();

    const breathe = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(centerBreatheScale, {
            toValue: 1.03,
            duration: BREATH_MS,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(centerFloatY, {
            toValue: -6,
            duration: BREATH_MS,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(centerBreatheScale, {
            toValue: 0.995,
            duration: BREATH_MS,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(centerFloatY, {
            toValue: 0,
            duration: BREATH_MS,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    breathe.start();

    let i = 0;
    const frameTimer = setInterval(() => {
      i += 1;
      if (i >= LOTUS_FRAMES.length) {
        clearInterval(frameTimer);
        return;
      }
      setLotusFrame(i);
    }, LOTUS_SWAP_MS);

    const navT = setTimeout(() => navigation.replace('Onboarding'), NAVIGATE_AFTER_MS);

    return () => {
      enter.stop();
      breathe.stop();
      clearInterval(frameTimer);
      clearTimeout(navT);
    };
  }, [navigation, centerOpacity, centerEnterScale, centerBreatheScale, centerFloatY, centerTilt, lotusOpacity, lotusScale, lotusTilt]);

  const bottomOffset = useMemo(
    () => (Platform.OS === 'ios' ? 24 + insets.bottom : 16 + insets.bottom),
    [insets.bottom]
  );

  return (
    <View style={styles.root}>
      <ImageBackground source={BG_IMG} resizeMode="cover" style={StyleSheet.absoluteFillObject} />
      <View pointerEvents="none" style={styles.overlay} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.centerWrap}>
          <Animated.Image
            source={CENTER_IMG}
            resizeMode="contain"
            style={{
              width: cW,
              height: cH,
              opacity: centerOpacity,
              transform: [
                { perspective: 800 },
                {
                  rotateZ: centerTilt.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '0.6deg'],
                  }),
                },
                { scale: centerEnterScale },
                { scale: centerBreatheScale },
                { translateY: centerFloatY },
              ],
            }}
          />
        </View>

        <View pointerEvents="none" style={[styles.bottomWrap, { bottom: bottomOffset }]}>
          <Animated.Image
            source={LOTUS_FRAMES[lotusFrame]}
            resizeMode="contain"
            style={{
              width: LOTUS_W,
              height: LOTUS_H,
              opacity: lotusOpacity,
              transform: [
                { perspective: 800 },
                {
                  rotateZ: lotusTilt.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '5deg'],
                  }),
                },
                { scale: lotusScale },
              ],
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  bottomWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
