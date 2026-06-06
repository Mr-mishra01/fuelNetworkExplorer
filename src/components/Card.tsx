import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { EFFECTS } from '../theme/Theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glass?: boolean;
}

export const Card = ({ children, style, glass = true }: CardProps) => {
  return (
    <View style={[glass ? styles.glassCard : styles.flatCard, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  glassCard: {
    ...EFFECTS.glass,
  },
  flatCard: {
    ...EFFECTS.card,
  },
});

export default Card;
