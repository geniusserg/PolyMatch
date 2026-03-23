/**
 * Match Popup Component
 * Shows when a bet moves >= 5 cents in user's favor
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
} from 'react-native-reanimated';

interface MatchPopupProps {
  visible: boolean;
  marketEmoji: string;
  marketTitle: string;
  betSide: 'YES' | 'NO';
  entryPrice: number;
  currentPrice: number;
  profit: number;
  onClose: () => void;
}

export function MatchPopup({
  visible,
  marketEmoji,
  marketTitle,
  betSide,
  entryPrice,
  currentPrice,
  profit,
  onClose,
}: MatchPopupProps) {
  const scale = useSharedValue(0.8);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      // Pop in animation
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      
      // Continuous pulse effect
      pulse.value = withRepeat(
        withSequence(
          withSpring(1.02, { damping: 15 }),
          withSpring(1, { damping: 15 })
        ),
        -1,
        true
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const priceChange = currentPrice - entryPrice;
  const effectiveChange = betSide === 'YES' ? priceChange : -priceChange;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.popup, animatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.fireEmoji}>🔥</Text>
            <Text style={styles.title}>
              It's a <Text style={styles.matchText}>MATCH!</Text>
            </Text>
          </View>

          {/* Market Info */}
          <Animated.View style={[styles.body, pulseStyle]}>
            <Text style={styles.marketEmoji}>{marketEmoji}</Text>
            <Text style={styles.marketTitle} numberOfLines={2}>
              {marketTitle}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                You bet {betSide} at {entryPrice}¢
              </Text>
            </View>
          </Animated.View>

          {/* Profit Display */}
          <View style={styles.profitContainer}>
            <Text style={styles.profitLabel}>Current Profit</Text>
            <Animated.View style={[styles.profitValue, pulseStyle]}>
              <Text style={styles.profitAmount}>
                {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
              </Text>
            </Animated.View>
            <View style={styles.priceDetails}>
              <View style={styles.priceDetail}>
                <Text style={styles.priceDetailLabel}>Entry</Text>
                <Text style={styles.priceDetailValue}>{entryPrice}¢</Text>
              </View>
              <View style={styles.priceDetail}>
                <Text style={styles.priceDetailLabel}>Now</Text>
                <Text style={[styles.priceDetailValue, styles.priceNow]}>
                  {currentPrice}¢
                </Text>
              </View>
              <View style={styles.priceDetail}>
                <Text style={styles.priceDetailLabel}>Change</Text>
                <Text style={[styles.priceDetailValue, styles.priceChange]}>
                  {effectiveChange >= 0 ? '+' : ''}{effectiveChange}¢
                </Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>💰 Keep Swiping →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popup: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#2d2d44',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#feca57',
  },
  header: {
    backgroundColor: '#ff2d55',
    padding: 24,
    alignItems: 'center',
  },
  fireEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  matchText: {
    color: '#feca57',
  },
  body: {
    padding: 24,
    alignItems: 'center',
  },
  marketEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  marketTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  badge: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '700',
  },
  profitContainer: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 20,
  },
  profitLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  profitValue: {
    backgroundColor: '#4ade80',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  profitAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
  },
  priceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priceDetail: {
    alignItems: 'center',
  },
  priceDetailLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  priceDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  priceNow: {
    color: '#feca57',
  },
  priceChange: {
    color: '#4ade80',
  },
  button: {
    backgroundColor: '#667eea',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
