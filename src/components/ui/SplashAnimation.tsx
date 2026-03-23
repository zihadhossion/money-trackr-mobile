import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  visible: boolean;
  onHidden: () => void;
}

const TEAL = '#4ECDC4';
const BG = '#0F3D4A';

export default function SplashAnimation({ visible, onHidden }: Props) {
  const containerOpacity = useSharedValue(1);

  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.5);

  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.35);

  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);

  const spinnerRotation = useSharedValue(0);

  useEffect(() => {
    // Icon fades + scales in
    iconOpacity.value = withTiming(1, { duration: 500 });
    iconScale.value = withSequence(
      withTiming(1.1, { duration: 400 }),
      withTiming(1, { duration: 150 }),
    );

    // Pulse ring sonar effect
    ringScale.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(1.8, { duration: 1200 }),
          withTiming(1, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );
    ringOpacity.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 1200 }),
          withTiming(0.35, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );

    // App name slides up + fades in
    textOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    textTranslateY.value = withDelay(300, withTiming(0, { duration: 400 }));

    // Tagline slides up + fades in
    taglineOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    taglineTranslateY.value = withDelay(500, withTiming(0, { duration: 400 }));

    // Spinner rotates continuously
    spinnerRotation.value = withRepeat(withTiming(360, { duration: 900 }), -1, false);
  }, []);

  useEffect(() => {
    if (!visible) {
      containerOpacity.value = withTiming(0, { duration: 400 }, (finished) => {
        if (finished) runOnJS(onHidden)();
      });
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinnerRotation.value}deg` }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, containerStyle]}>
      {/* Icon with pulse ring */}
      <View style={styles.iconContainer}>
        <Animated.View style={[styles.ring, ringStyle]} />
        <Animated.View style={[styles.iconCircle, iconStyle]}>
          <Feather name="dollar-sign" size={44} color={TEAL} />
        </Animated.View>
      </View>

      {/* App name */}
      <Animated.Text style={[styles.appName, textStyle]}>
        Money Trackr
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, taglineStyle]}>
        Track every penny
      </Animated.Text>

      {/* Spinner */}
      <View style={styles.spinnerWrapper}>
        <Animated.View style={[styles.spinner, spinnerStyle]} />
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
