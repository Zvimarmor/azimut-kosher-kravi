import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';

interface TextareaProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  rows?: number;
}

export function Textarea({ 
  label, 
  error, 
  containerStyle, 
  style,
  rows = 4,
  ...props 
}: TextareaProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.textarea,
          { minHeight: rows * 20 + 24 }, // Approximate height per row
          error && styles.textareaError,
          style
        ]}
        multiline
        textAlignVertical="top"
        placeholderTextColor="#999"
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'right', // RTL for Hebrew
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
    textAlign: 'right', // RTL for Hebrew
  },
  textareaError: {
    borderColor: '#DC2626',
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'right', // RTL for Hebrew
  },
});