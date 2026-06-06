import React from 'react';
import { StyleSheet, Pressable, ViewStyle, Animated } from 'react-native';
import { COLORS, EFFECTS } from '../theme/Theme';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  active?: boolean;
  activeColor?: string;
  size?: number;
}

export const IconButton = ({
  icon,
  onPress,
  style,
  active = false,
  activeColor = COLORS.primary,
  size = 44,
}: IconButtonProps) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 10,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: active ? activeColor : COLORS.glassBg,
          borderColor: active ? activeColor : COLORS.border,
        },
        style,
      ]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...EFFECTS.shadowLow,
  },
});
export default IconButton;
