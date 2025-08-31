
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView, StyleSheet, ImageBackground, View, Image, Pressable,
  StatusBar, Platform, Dimensions, Animated, Easing, Text, Share,
  StyleProp, ViewStyle, DeviceEventEmitter, 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useMusic } from '../providers/MusicProvider';
import { clearAllProgress } from '../utils/progress';

const BG_IMG   = require('../assets/background.png');
const PANEL    = require('../assets/settings_panel.png');   
const CARD_BG  = require('../assets/bak_rek.png');

const BTN_MUSIC_ON   = require('../assets/btn_music_on.png');
const BTN_MUSIC_OFF  = require('../assets/btn_music_off.png');
const BTN_NOTIF_ON   = require('../assets/btn_notifications_on.png');
const BTN_NOTIF_OFF  = require('../assets/btn_notifications_off.png');
const BTN_RESET      = require('../assets/btn_reset.png');
const BTN_SHARE      = require('../assets/btn_share.png');

const BTN_YES        = require('../assets/btn_yes.png');
const BTN_NO         = require('../assets/btn_no.png');

const { width: W, height: H } = Dimensions.get('window');
const PANEL_W = 306, PANEL_H = 549, BTN_W = 216, BTN_H = 83, YESNO_W = 117, YESNO_H = 47;
const TAB_BAR_H = 58;
const MUSIC_KEY = 'settings:musicEnabled';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const safeH = H - insets.top - insets.bottom - TAB_BAR_H - 24;
  const scale = Math.min(1, (W - 32) / PANEL_W, safeH / PANEL_H);

  const S_PANEL_W = Math.round(PANEL_W * scale);
  const S_PANEL_H = Math.round(PANEL_H * scale);
  const S_BTN_W   = Math.round(BTN_W   * scale);
  const S_BTN_H   = Math.round(BTN_H   * scale);
  const S_YESNO_W = Math.round(YESNO_W * scale);
  const S_YESNO_H = Math.round(YESNO_H * scale);
  const GAP       = Math.max(10, Math.round(14 * scale));

  const { musicOn, setOn } = useMusic();

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(MUSIC_KEY);
      if (saved == null) {
        await AsyncStorage.setItem(MUSIC_KEY, musicOn ? '1' : '0');
      }

    })();
  }, [musicOn]);

  const onToggleMusic = useCallback(async () => {
    const next = !musicOn;
    setOn(next);                               
    await AsyncStorage.setItem(MUSIC_KEY, next ? '1' : '0'); 
  }, [musicOn, setOn]);

  const [notifOn, setNotifOn] = useState(true);
  const toggleNotif = () => setNotifOn(v => !v);

  const [confirmReset, setConfirmReset] = useState(false);
  const doShare = async () => { try { await Share.share({ message: 'Check out "Tales of the Magic Panda" 🐼✨' }); } catch {} };

  const doReset = useCallback(async () => {
    await clearAllProgress();
    setConfirmReset(false);
  }, []);

  const panelAnim = useRef({ o: new Animated.Value(0), ty: new Animated.Value(16), s: new Animated.Value(0.98) }).current;
  const btnAnims = useRef(Array.from({ length: 4 }, () => ({ o: new Animated.Value(0), ty: new Animated.Value(8) }))).current;

  useFocusEffect(
    React.useCallback(() => {
      panelAnim.o.setValue(0); panelAnim.ty.setValue(16); panelAnim.s.setValue(0.98);
      btnAnims.forEach(a => { a.o.setValue(0); a.ty.setValue(8); });

      const panelIn = Animated.parallel([
        Animated.timing(panelAnim.o,  { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(panelAnim.ty, { toValue: 0, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(panelAnim.s,  { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]);
      const buttonsIn = btnAnims.map(a => Animated.parallel([
        Animated.timing(a.o, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(a.ty, { toValue: 0, friction: 7, tension: 110, useNativeDriver: true }),
      ]));
      Animated.sequence([panelIn, Animated.stagger(90, buttonsIn)]).start();
    }, [])
  );

  const modalO = useRef(new Animated.Value(0)).current;
  const modalS = useRef(new Animated.Value(0.96)).current;
  useEffect(() => {
    if (!confirmReset) return;
    modalO.setValue(0); modalS.setValue(0.96);
    Animated.parallel([
      Animated.timing(modalO, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(modalS, { toValue: 1, friction: 7, tension: 120, useNativeDriver: true }),
    ]).start();
  }, [confirmReset, modalO, modalS]);

  const ButtonImg = ({
    src, idx, onPress, style,
  }: { src:any; idx:number; onPress:() => void; style?: StyleProp<ViewStyle> }) => (
    <Animated.View
      style={[
        { opacity: btnAnims[idx].o, transform: [{ translateY: btnAnims[idx].ty }] },
        idx === 0 ? null : { marginTop: GAP },
        style,
      ]}
    >
      <Pressable onPress={onPress} style={{ width: S_BTN_W, height: S_BTN_H }} hitSlop={6}>
        <Image source={src} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
      </Pressable>
    </Animated.View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar translucent backgroundColor="transparent" barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'} />
      <ImageBackground source={BG_IMG} style={s.bg} resizeMode="cover">
        <View style={[s.center, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + TAB_BAR_H + 8 }]}>
          <Animated.View style={{ opacity: panelAnim.o, transform: [{ translateY: panelAnim.ty }, { scale: panelAnim.s }] }}>
            <ImageBackground source={PANEL} resizeMode="contain" style={{ width: S_PANEL_W, height: S_PANEL_H, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ alignItems: 'center' }}>
                <ButtonImg idx={0} src={musicOn ? BTN_MUSIC_ON : BTN_MUSIC_OFF} onPress={onToggleMusic} />
                <ButtonImg idx={1} src={notifOn ? BTN_NOTIF_ON : BTN_NOTIF_OFF} onPress={toggleNotif} />
                <ButtonImg idx={2} src={BTN_RESET} onPress={() => setConfirmReset(true)} />
                <ButtonImg idx={3} src={BTN_SHARE} onPress={doShare} />
              </View>
            </ImageBackground>
          </Animated.View>
        </View>

        {confirmReset && (
          <View style={s.modalWrap} pointerEvents="box-none">
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setConfirmReset(false)} />
            <Animated.View style={{ opacity: modalO, transform: [{ scale: modalS }] }}>
              <ImageBackground
                source={CARD_BG}
                resizeMode="cover"
                imageStyle={{ borderRadius: 18 }}
                style={[
                  s.modalCard,
                  {
                    paddingVertical: Math.round(16 * scale),
                    paddingHorizontal: Math.round(18 * scale),
                    width: Math.min(W - 48, Math.round(340 * Math.min(1, scale * 1.05))),
                  },
                ]}
              >
                <Text style={s.modalQ} numberOfLines={3}>
                  Are you sure you want to reset your{'\n'}progress?
                </Text>

                <View style={s.yesnoRow}>
                  <Pressable onPress={doReset} style={{ width: S_YESNO_W, height: S_YESNO_H }}>
                    <Image source={BTN_YES} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                  </Pressable>
                  <Pressable onPress={() => setConfirmReset(false)} style={{ width: S_YESNO_W, height: S_YESNO_H }}>
                    <Image source={BTN_NO} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                  </Pressable>
                </View>
              </ImageBackground>
            </Animated.View>
          </View>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  bg:   { flex: 1, width: '100%', height: '100%' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },

  modalWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 24,
    paddingBottom: TAB_BAR_H,
  },
  modalCard: { borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  yesnoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 18 },
  modalQ: { color: '#3a2b0b', fontWeight: '800', textAlign: 'center', fontSize: 18, lineHeight: 22, marginBottom: 12 },
});
