/**
 * PolyMatch App Entry Point
 * Tinder-style Polymarket betting simulation
 */

import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GameProvider, useGame, useIsGameOver } from '@/contexts/GameContext';
import { WalletScreen, SwipeScreen, GameOverScreen } from '@/screens';

function AppContent() {
  const { state, resetGame } = useGame();
  const isGameOver = useIsGameOver();
  const [screen, setScreen] = useState<'wallet' | 'swipe' | 'gameover'>('wallet');

  const handleConnected = () => {
    setScreen('swipe');
  };

  const handleGameOver = () => {
    setScreen('gameover');
  };

  const handleRestart = () => {
    resetGame();
    setScreen('wallet');
  };

  return (
    <SafeAreaView style={styles.container}>
      {screen === 'wallet' && <WalletScreen onConnected={handleConnected} />}
      {screen === 'swipe' && <SwipeScreen onGameOver={handleGameOver} />}
      {screen === 'gameover' && <GameOverScreen onRestart={handleRestart} />}
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.fullScreen}>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
});
