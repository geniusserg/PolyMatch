/**
 * Game Context
 * Manages global game state: balance, bets, wallet, matches
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, Bet, MatchNotification, Market } from '@/types';
import {
  createInitialState,
  initializeGame,
  placeBet,
  updateBetPrices,
  checkGameOver,
  getSessionStats,
} from '@/api/gameLogic';

interface GameContextType {
  state: GameState;
  connectWallet: (address: string, balance: number) => void;
  placeBetAction: (market: Market, side: 'YES' | 'NO') => void;
  updatePrices: (prices: Record<string, { yesPrice: number; noPrice: number }>) => void;
  dismissMatch: () => void;
  resetGame: () => void;
  currentMatch: MatchNotification | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

type Action =
  | { type: 'CONNECT_WALLET'; payload: { address: string; balance: number } }
  | { type: 'PLACE_BET'; payload: { market: Market; side: 'YES' | 'NO'; newState: GameState; bet: Bet } }
  | { type: 'UPDATE_PRICES'; payload: { newState: GameState; matches: MatchNotification[] } }
  | { type: 'DISMISS_MATCH' }
  | { type: 'RESET_GAME' };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'CONNECT_WALLET':
      return initializeGame(state, action.payload.address, action.payload.balance);
    
    case 'PLACE_BET':
      return action.payload.newState;
    
    case 'UPDATE_PRICES':
      return action.payload.newState;
    
    case 'DISMISS_MATCH':
      return { ...state };
    
    case 'RESET_GAME':
      return createInitialState();
    
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const [currentMatch, setCurrentMatch] = React.useState<MatchNotification | null>(null);

  const connectWallet = (address: string, balance: number) => {
    dispatch({ type: 'CONNECT_WALLET', payload: { address, balance } });
  };

  const placeBetAction = (market: Market, side: 'YES' | 'NO') => {
    const { newState, bet } = placeBet(state, market, side);
    dispatch({ type: 'PLACE_BET', payload: { market, side, newState, bet } });
  };

  const updatePrices = (prices: Record<string, { yesPrice: number; noPrice: number }>) => {
    const { newState, matches } = updateBetPrices(state, prices);
    dispatch({ type: 'UPDATE_PRICES', payload: { newState, matches } });
    
    // Set first match if any
    if (matches.length > 0 && !currentMatch) {
      setCurrentMatch(matches[0]);
    }
  };

  const dismissMatch = () => {
    setCurrentMatch(null);
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
    setCurrentMatch(null);
  };

  return (
    <GameContext.Provider
      value={{
        state,
        connectWallet,
        placeBetAction,
        updatePrices,
        dismissMatch,
        resetGame,
        currentMatch,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export function useIsGameOver() {
  const { state } = useGame();
  return checkGameOver(state);
}

export function useSessionStats() {
  const { state } = useGame();
  return getSessionStats(state);
}
