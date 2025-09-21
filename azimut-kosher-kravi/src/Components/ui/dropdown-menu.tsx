import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ViewStyle } from 'react-native';

interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <View>{children}</View>;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
}

export function DropdownMenuTrigger({ children, onPress, style }: DropdownMenuTriggerProps) {
  return (
    <TouchableOpacity style={style} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  style?: ViewStyle;
}

export function DropdownMenuContent({ children, visible, onClose, style }: DropdownMenuContentProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[styles.content, style]}>
          {children}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
}

export function DropdownMenuItem({ children, onPress, style }: DropdownMenuItemProps) {
  return (
    <TouchableOpacity style={[styles.item, style]} onPress={onPress}>
      {typeof children === 'string' ? (
        <Text style={styles.itemText}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'right', // RTL for Hebrew
  },
});