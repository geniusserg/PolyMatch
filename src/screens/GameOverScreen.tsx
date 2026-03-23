/**
 * Game Over Screen
 * Shows when user runs out of money
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSessionStats } from '@/hooks';

interface GameOverScreenProps {
  onRestart: () => void;
}

export function GameOverScreen({ onRestart }: GameOverScreenProps) {
  const stats = useSessionStats();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Emoji */}
      <Text style={styles.emoji}>😅</Text>

      {/* Title */}
      <Text style={styles.title}>See You Next Day!</Text>
      <Text style={styles.subtitle}>
        You've run out of virtual credits.{'\n'}Come back tomorrow!
      </Text>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Starting Balance</Text>
          <Text style={styles.statValue}>${stats.startBalance.toFixed(2)}</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Bets Made</Text>
          <Text style={styles.statValue}>{stats.totalBets}</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Matches Hit</Text>
          <Text style={[styles.statValue, styles.matches]}>{stats.totalMatches} 🔥</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Best Win</Text>
          <Text style={[styles.statValue, styles.bestWin]}>
            ${stats.bestWin.toFixed(2)}
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Final Balance</Text>
          <Text style={[
            styles.statValue,
            stats.endBalance >= stats.startBalance ? styles.profit : styles.loss
          ]}>
            ${stats.endBalance.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Restart Button */}
      <TouchableOpacity style={styles.button} onPress={onRestart} activeOpacity={0.8}>
        <Text style={styles.buttonText}>🔒 Come Back Tomorrow</Text>
      </TouchableOpacity>

      {/* Hint */}
      <Text style={styles.hint}>
        (Just kidding - restart anytime!)
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 70,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  stats: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  stat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  statLast: {
    borderBottomWidth: 0,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  matches: {
    color: '#feca57',
  },
  bestWin: {
    color: '#4ade80',
  },
  profit: {
    color: '#4ade80',
  },
  loss: {
    color: '#f87171',
  },
  button: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
  },
});
