import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ 
  children, 
  variant = 'default', 
  style, 
  textStyle 
}: BadgeProps) {
  return (
    <View style={[
      styles.badge,
      styles[variant],
      style
    ]}>
      <Text style={[
        styles.text,
        styles[`${variant}Text`],
        textStyle
      ]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Variants
  default: {
    backgroundColor: '#2D5530', // Military green
  },
  secondary: {
    backgroundColor: '#F3F4F6',
  },
  destructive: {
    backgroundColor: '#DC2626',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2D5530',
  },
  
  // Text styles
  text: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  defaultText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#374151',
  },
  destructiveText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#2D5530',
  },
});