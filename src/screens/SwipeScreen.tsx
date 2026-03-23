/**
 * Main Swipe Screen
 * Shows market cards with swipe gestures
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useGame, usePricePolling } from '@/hooks';
import { SwipeCard } from '@/components/SwipeCard';
import { MatchPopup } from '@/components/MatchPopup';
import { Market } from '@/types';
import { fetchTrendingMarkets } from '@/api/polymarket';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeScreenProps {
  onGameOver: () => void;
}

export function SwipeScreen({ onGameOver }: SwipeScreenProps) {
  const { state, placeBetAction, currentMatch, dismissMatch } = useGame();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Enable price polling
  usePricePolling();

  // Fetch markets on mount
  useEffect(() => {
    const loadMarkets = async () => {
      try {
        const fetched = await fetchTrendingMarkets();
        setMarkets(fetched);
      } catch (error) {
        console.warn('Failed to load markets:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMarkets();
  }, []);

  // Check for game over when balance changes
  useEffect(() => {
    if (state.balance < 1 && state.bets.every(b => b.isResolved) && !loading) {
      onGameOver();
    }
  }, [state.balance, state.bets, loading]);

  const handleSwipe = useCallback((direction: 'left' | 'right' | 'up') => {
    if (currentIndex >= markets.length) return;

    const market = markets[currentIndex];

    if (direction === 'right') {
      // Bet YES
      if (state.balance >= 1) {
        placeBetAction(market, 'YES');
      }
    } else if (direction === 'left') {
      // Bet NO
      if (state.balance >= 1) {
        placeBetAction(market, 'NO');
      }
    }
    // direction === 'up' is skip, no action needed

    // Move to next card
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  }, [currentIndex, markets, state.balance, placeBetAction]);

  const currentMarket = markets[currentIndex];
  const nextMarket = markets[currentIndex + 1];

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading markets...</Text>
      </View>
    );
  }

  if (!currentMarket) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No more markets!</Text>
        <Text style={styles.emptySubtext}>Check back later for new events</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🔥</Text>
          <Text style={styles.logo}>
            Poly<Text style={styles.logoAccent}>Match</Text>
          </Text>
        </View>
        <View style={styles.balance}>
          <Text style={styles.balanceIcon}>💰</Text>
          <Text style={styles.balanceText}>${state.balance.toFixed(2)}</Text>
        </View>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        {/* Next card (background) */}
        {nextMarket && (
          <View style={styles.card}>
            <View style={styles.cardImage}>
              <Text style={styles.cardEmoji}>{nextMarket.emoji}</Text>
            </View>
          </View>
        )}

        {/* Current card (swipeable) */}
        <SwipeCard
          market={currentMarket}
          onSwipe={handleSwipe}
          isActive={true}
        />
      </View>

      {/* Bet Info */}
      <View style={styles.betSection}>
        <View style={styles.betDisplay}>
          <View style={styles.betAmount}>
            <Text style={styles.betAmountText}>$1</Text>
          </View>
          <Text style={styles.betWin}>
            → Win ${(100 / (currentMarket.yesPrice < 50 ? currentMarket.yesPrice : currentMarket.noPrice)).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.buttonNo]}
          onPress={() => handleSwipe('left')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSkip]}
          onPress={() => handleSwipe('up')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>⬆</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonYes]}
          onPress={() => handleSwipe('right')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>♥</Text>
        </TouchableOpacity>
      </View>

      {/* Match Popup */}
      {currentMatch && (
        <MatchPopup
          visible={true}
          marketEmoji={currentMatch.bet.marketEmoji}
          marketTitle={currentMatch.bet.marketTitle}
          betSide={currentMatch.bet.side ? 'YES' : 'NO'}
          entryPrice={currentMatch.bet.entryPrice}
          currentPrice={currentMatch.bet.currentPrice}
          profit={currentMatch.profit}
          onClose={dismissMatch}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 100,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 24,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  logoAccent: {
    color: '#ff2d55',
  },
  balance: {
    flexDirection: 'row',
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
  },
  balanceIcon: {
    fontSize: 14,
  },
  balanceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: SCREEN_WIDTH - 48,
    height: 480,
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    position: 'absolute',
    opacity: 0.5,
  },
  cardImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 60,
    opacity: 0.5,
  },
  betSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  betDisplay: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  betAmount: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  betAmountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  betWin: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  button: {
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  buttonNo: {
    width: 60,
    height: 60,
    backgroundColor: '#ff5f5f',
  },
  buttonSkip: {
    width: 48,
    height: 48,
    backgroundColor: '#555',
    alignSelf: 'center',
  },
  buttonYes: {
    width: 60,
    height: 60,
    backgroundColor: '#5fdf8f',
  },
  buttonText: {
    fontSize: 26,
  },
});
