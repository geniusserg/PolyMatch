/**
 * Swipe Card Component
 * Displays a market with swipe gestures
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Market } from '@/types';
import { formatTimeRemaining, formatVolume } from '@/api/polymarket';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = 480;
const SWIPE_THRESHOLD = 120;

interface SwipeCardProps {
  market: Market;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  isActive: boolean;
}

export function SwipeCard({ market, onSwipe, isActive }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const isSwiping = useSharedValue(false);

  const pan = Gesture.Pan()
    .enabled(isActive)
    .onStart(() => {
      isSwiping.value = true;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = event.translationX * 0.05;
    })
    .onEnd((event) => {
      const absX = Math.abs(event.translationX);
      const absY = Math.abs(event.translationY);

      // Swipe right (YES)
      if (event.translationX > SWIPE_THRESHOLD && absX > absY) {
        translateX.value = withSpring(SCREEN_WIDTH * 2, { velocity: event.velocityX });
        rotate.value = withSpring(20);
        onSwipe('right');
      }
      // Swipe left (NO)
      else if (event.translationX < -SWIPE_THRESHOLD && absX > absY) {
        translateX.value = withSpring(-SCREEN_WIDTH * 2, { velocity: event.velocityX });
        rotate.value = withSpring(-20);
        onSwipe('left');
      }
      // Swipe up (SKIP)
      else if (event.translationY < -SWIPE_THRESHOLD && absY > absX) {
        translateY.value = withSpring(-CARD_HEIGHT * 2, { velocity: event.velocityY });
        onSwipe('up');
      }
      // Reset
      else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
      isSwiping.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const yesOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        rotate: `${interpolate(translateX.value, [0, SWIPE_THRESHOLD], [-15, 15], Extrapolation.CLAMP)}deg`,
      },
    ],
  }));

  const noOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        rotate: `${interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [-15, 15], Extrapolation.CLAMP)}deg`,
      },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* Swipe Indicators */}
        <Animated.View style={[styles.swipeIndicator, styles.nopeIndicator, noOpacity]}>
          <Text style={[styles.swipeText, styles.nopeText]}>NOPE</Text>
        </Animated.View>
        <Animated.View style={[styles.swipeIndicator, styles.likeIndicator, yesOpacity]}>
          <Text style={[styles.swipeText, styles.likeText]}>LIKE</Text>
        </Animated.View>

        {/* Time Badge */}
        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>⏰ {formatTimeRemaining(market.endDate)}</Text>
        </View>

        {/* Card Image */}
        <View style={styles.cardImage}>
          <Text style={styles.cardEmoji}>{market.emoji}</Text>
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <Text style={styles.marketTitle} numberOfLines={2}>
            {market.title}
          </Text>
          <Text style={styles.marketSubtitle}>{market.category}</Text>

          {/* Odds */}
          <View style={styles.odds}>
            <View style={[styles.odd, styles.oddYes]}>
              <Text style={styles.oddLabel}>YES</Text>
              <Text style={[styles.oddValue, styles.oddValueYes]}>{market.yesPrice}¢</Text>
            </View>
            <View style={[styles.odd, styles.oddNo]}>
              <Text style={styles.oddLabel}>NO</Text>
              <Text style={[styles.oddValue, styles.oddValueNo]}>{market.noPrice}¢</Text>
            </View>
          </View>

          {/* Volume */}
          <View style={styles.volumeContainer}>
            <View style={styles.volumeHeader}>
              <Text style={styles.volumeLabel}>VOLUME</Text>
              <Text style={styles.volumeValue}>{formatVolume(market.volume)}</Text>
            </View>
            <View style={styles.volumeBar}>
              <View style={[styles.volumeFill, { width: `${Math.min(market.volume / 100000, 100)}%` }]} />
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#2d2d44',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
    elevation: 10,
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 3,
    zIndex: 10,
  },
  nopeIndicator: {
    left: 20,
    borderColor: '#f87171',
    transform: [{ rotate: '-15deg' }],
  },
  likeIndicator: {
    right: 20,
    borderColor: '#4ade80',
    transform: [{ rotate: '15deg' }],
  },
  swipeText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  nopeText: {
    color: '#f87171',
  },
  likeText: {
    color: '#4ade80',
  },
  timeBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeText: {
    color: '#feca57',
    fontSize: 12,
    fontWeight: '700',
  },
  cardImage: {
    height: 220,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 80,
  },
  cardContent: {
    padding: 20,
  },
  marketTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    lineHeight: 26,
  },
  marketSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  odds: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  odd: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  oddYes: {
    borderTopWidth: 3,
    borderTopColor: '#4ade80',
  },
  oddNo: {
    borderTopWidth: 3,
    borderTopColor: '#f87171',
  },
  oddLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
    fontWeight: '700',
  },
  oddValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  oddValueYes: {
    color: '#4ade80',
  },
  oddValueNo: {
    color: '#f87171',
  },
  volumeContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  volumeLabel: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  volumeValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  volumeBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 6,
  },
});
