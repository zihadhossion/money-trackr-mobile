import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onHidden: () => void;
}

const TEAL = '#4ECDC4';
const BG = '#0F3D4A';

export default function SplashAnimation({ visible, onHidden }: Props) {
  const containerOpacity = useRef(new Animated.Value(1)).current;

  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;

  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.35)).current;

  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;

  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;

  const spinnerRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Icon fades + scales in
    Animated.parallel([
      Animated.timing(iconOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(iconScale, { toValue: 1.1, duration: 400, useNativeDriver: true }),
        Animated.timing(iconScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]),
    ]).start();

    // Pulse ring sonar effect
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(ringScale, { toValue: 1.8, duration: 1200, useNativeDriver: true }),
          Animated.timing(ringScale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(ringOpacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.35, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();

    // App name slides up + fades in
    Animated.parallel([
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(textTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // Tagline slides up + fades in
    Animated.parallel([
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(taglineTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // Spinner rotates continuously
    Animated.loop(
      Animated.timing(spinnerRotation, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  useEffect(() => {
    if (!visible) {
      Animated.timing(containerOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(
        ({ finished }) => {
          if (finished) onHidden();
        },
      );
    }
  }, [visible]);

  const spin = spinnerRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, { opacity: containerOpacity }]}>
      {/* Icon with pulse ring */}
      <View style={styles.iconContainer}>
        <Animated.View
          style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]}
        />
        <Animated.View
          style={[styles.iconCircle, { opacity: iconOpacity, transform: [{ scale: iconScale }] }]}
        >
          <Feather name="dollar-sign" size={44} color={TEAL} />
        </Animated.View>
      </View>

      {/* App name */}
      <Animated.Text
        style={[styles.appName, { opacity: textOpacity, transform: [{ translateY: textTranslateY }] }]}
      >
        Money Trackr
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        style={[
          styles.tagline,
          { opacity: taglineOpacity, transform: [{ translateY: taglineTranslateY }] },
        ]}
      >
        Track every penny
      </Animated.Text>

      {/* Spinner */}
      <View style={styles.spinnerWrapper}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  iconContainer: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: TEAL,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(78,205,196,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(78,205,196,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    marginTop: 28,
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: 8,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  spinnerWrapper: {
    position: 'absolute',
    bottom: 72,
    width: 32,
    height: 32,
  },
  spinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: 'transparent',
    borderTopColor: TEAL,
    borderRightColor: TEAL,
  },
});
