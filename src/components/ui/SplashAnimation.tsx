import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  visible: boolean;
  onHidden: () => void;
}

export default function SplashAnimation({ visible, onHidden }: Props) {
  const containerOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const spinnerRotation = useSharedValue(0);

  useEffect(() => {
    // Fade in logo
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withTiming(1, { duration: 600 });
    // Spin the arc continuously
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

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinnerRotation.value}deg` }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, containerStyle]}>
      <Animated.View style={[styles.logoWrapper, logoStyle]}>
        <Image
          source={require('../../../assets/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <View style={styles.spinnerWrapper}>
        <Animated.View style={[styles.spinner, spinnerStyle]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F3D4A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  logoWrapper: {
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
  spinnerWrapper: {
    marginTop: 40,
    width: 40,
    height: 40,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#4ECDC4',
    borderRightColor: '#4ECDC4',
  },
});
