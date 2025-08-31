
import React, { memo, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
  Platform,
  Animated,
  Easing,
} from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

const STAR_PARTICLE: ImageSourcePropType = require('../assets/star_particle.png');

type StarConfig = {
  id: string;
  x: number;          
  startY: number;    
  size: number;        
  drift: number;       
  dur: number;        
  wiggleDur: number;   
  delay: number;       
};

type Props = {

  density?: number; 
  sizeRange?: [number, number]; 
  travelMultiplier?: number; 
  style?: object;
};

const StarField = memo(function StarField({
  density = 18,
  sizeRange = [14, 40],
  travelMultiplier = 1.2,
  style,
}: Props) {
  const stars = useMemo<StarConfig[]>(() => {
    const [minS, maxS] = sizeRange;
    const arr: StarConfig[] = [];
    for (let i = 0; i < density; i++) {
      const size = rand(minS, maxS);
      arr.push({
        id: `star-${i}-${Math.random().toString(36).slice(2, 8)}`,
        x: Math.random() * W,
        startY: H * (0.35 + Math.random() * 0.6),     
        size,
        drift: rand(6, 22),                           
        dur: rand(9000, 16000),                         
        wiggleDur: rand(1600, 2600),                  
        delay: rand(0, 4000),
      });
    }
    return arr;
  }, [density, W, H]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {stars.map(cfg => (
        <RisingStar key={cfg.id} cfg={cfg} travelMultiplier={travelMultiplier} />
      ))}
    </View>
  );
});

export default StarField;

function rand(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

function RisingStar({
  cfg,
  travelMultiplier,
}: {
  cfg: StarConfig;
  travelMultiplier: number;
}) {
  const progress = new Animated.Value(0);
  const wiggle = new Animated.Value(0);  

  useEffect(() => {
    const rise = Animated.loop(
      Animated.sequence([
        Animated.delay(cfg.delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: cfg.dur,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    const sway = Animated.loop(
      Animated.sequence([
        Animated.timing(wiggle, {
          toValue: 1,
          duration: cfg.wiggleDur,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wiggle, {
          toValue: -1,
          duration: cfg.wiggleDur,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    rise.start();
    sway.start();

    return () => {
      rise.stop();
      sway.stop();
    };
  }, [cfg.delay, cfg.dur, cfg.wiggleDur, progress, wiggle]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [cfg.startY, -H * (0.2 * travelMultiplier)],
  });

  const translateX = wiggle.interpolate({
    inputRange: [-1, 1],
    outputRange: [-cfg.drift, cfg.drift],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 1, 1, 0],
  });

  const scale = wiggle.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.85, 1, 1.1],
  });

  return (
    <Animated.Image
      source={STAR_PARTICLE}
      fadeDuration={0}
      style={[
        styles.star,
        {
          width: cfg.size,
          height: cfg.size,
          left: cfg.x - cfg.size / 2,
          transform: [{ translateY }, { translateX }, { scale }],
          opacity,
        },
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
  },
});
