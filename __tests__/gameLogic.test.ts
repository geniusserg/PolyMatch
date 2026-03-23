/**
 * Game Logic Tests
 */

import {
  createInitialState,
  initializeGame,
  placeBet,
  updateBetPrices,
  skipMarket,
  checkGameOver,
  getSessionStats,
  calculatePotentialWin,
  calculateProfitLoss,
} from '@/api/gameLogic';
import { Market, GameState } from '@/types';

// Mock market for testing
const mockMarket: Market = {
  id: 'test-market-1',
  title: 'Test Market Question?',
  category: 'Sports',
  endDate: Date.now() + 3600000,
  yesPrice: 60,
  noPrice: 40,
  volume: 1000000,
  emoji: '🏀',
  url: 'https://polymarket.com/event/test',
};

describe('Game Logic', () => {
  describe('createInitialState', () => {
    it('should create empty initial state', () => {
      const state = createInitialState();
      
      expect(state.balance).toBe(0);
      expect(state.startingBalance).toBe(0);
      expect(state.bets).toEqual([]);
      expect(state.resolvedBets).toEqual([]);
      expect(state.totalBets).toBe(0);
      expect(state.totalMatches).toBe(0);
      expect(state.isGameOver).toBe(false);
      expect(state.walletAddress).toBeNull();
    });
  });

  describe('initializeGame', () => {
    it('should initialize game with wallet and balance', () => {
      const state = createInitialState();
      const walletAddress = 'TTestWalletAddress123456789';
      const initialBalance = 1000;
      
      const newState = initializeGame(state, walletAddress, initialBalance);
      
      expect(newState.walletAddress).toBe(walletAddress);
      expect(newState.balance).toBe(initialBalance);
      expect(newState.startingBalance).toBe(initialBalance);
      expect(newState.isGameOver).toBe(false);
    });
  });

  describe('placeBet', () => {
    it('should place a YES bet and deduct balance', () => {
      const state = initializeGame(createInitialState(), 'TTest...', 100);
      
      const { newState, bet } = placeBet(state, mockMarket, 'YES');
      
      expect(newState.balance).toBe(99); // $100 - $1 bet
      expect(newState.bets).toHaveLength(1);
      expect(newState.totalBets).toBe(1);
      expect(bet.side).toBe(true); // YES = true
      expect(bet.entryPrice).toBe(60); // YES price
      expect(bet.amount).toBe(1);
      expect(bet.marketId).toBe(mockMarket.id);
    });

    it('should place a NO bet and deduct balance', () => {
      const state = initializeGame(createInitialState(), 'TTest...', 100);
      
      const { newState, bet } = placeBet(state, mockMarket, 'NO');
      
      expect(newState.balance).toBe(99);
      expect(bet.side).toBe(false); // NO = false
      expect(bet.entryPrice).toBe(40); // NO price
    });

    it('should throw error if insufficient balance', () => {
      const state = initializeGame(createInitialState(), 'TTest...', 0.5);
      
      expect(() => placeBet(state, mockMarket, 'YES')).toThrow('Insufficient balance');
    });
  });

  describe('updateBetPrices', () => {
    it('should update bet prices with new market data', () => {
      const state = initializeGame(createInitialState(), 'TTest...', 100);
      const { newState: stateWithBet } = placeBet(state, mockMarket, 'YES');
      
      // Price moved up from 60 to 70 (10 cents in favor)
      const prices = {
        [mockMarket.id]: { yesPrice: 70, noPrice: 30 },
      };
      
      const { newState, matches } = updateBetPrices(stateWithBet, prices);
      
      // Bet is resolved and moved to resolvedBets on match
      expect(newState.resolvedBets[0].currentPrice).toBe(70);
      expect(newState.resolvedBets[0].profitLoss).toBeGreaterThan(0);
      expect(matches).toHaveLength(1); // Should trigger match (>5 cents move)
    });

    it('should trigger match when price moves >= 5 cents in favor', () => {
      const state = initializeGame(createInitialState(), 'TTest...', 100);
      const { newState: stateWithBet } = placeBet(state, mockMarket, 'YES');
      
      // Price moved up exactly 5 cents
      const prices = {
        [mockMarket.id]: { yesPrice: 65, noPrice: 35 },
      };
      
      const { newState, matches } = updateBetPrices(stateWithBet, prices);
      
      expect(matches).toHaveLength(1);
      expect(matches[0].priceChange).toBe(5);
      expect(matches[0].profit).toBeGreaterThan(0);
    });

    it('should NOT trigger match when price moves < 5 cents', () => {
      const state = initializeGame(createInitialState(), 'TTest...', 100);
      const { newState: stateWithBet } = placeBet(state, mockMarket, 'YES');
      
      // Price moved up only 3 cents
      const prices = {
        [mockMarket.id]: { yesPrice: 63, noPrice: 37 },
      };
      
      const { newState, matches } = updateBetPrices(stateWithBet, prices);
      
      expect(matches).toHaveLength(0);
      expect(newState.bets[0].isResolved).toBe(false);
    });

    it('should trigger match for NO bet when price goes down', () => {
      const state = initializeGame(createInitialState(), 'TTest...', 100);
      const { newState: stateWithBet } = placeBet(state, mockMarket, 'NO');
      
      // NO bet: entry at 40, price went down to 30 (good for NO)
      const prices = {
        [mockMarket.id]: { yesPrice: 70, noPrice: 30 },
      };
      
      const { newState, matches } = updateBetPrices(stateWithBet, prices);
      
      expect(matches).toHaveLength(1);
      expect(matches[0].priceChange).toBe(10); // 40 - 30 = 10 cents in favor
    });

    it('should add profit to balance on match', () => {
      const state = initializeGame(createInitialState(), 'TTest...', 100);
      const { newState: stateWithBet } = placeBet(state, mockMarket, 'YES');
      
      const prices = {
        [mockMarket.id]: { yesPrice: 70, noPrice: 30 },
      };
      
      const { newState } = updateBetPrices(stateWithBet, prices);
      
      // Should have balance + profit from cashed out bet
      expect(newState.balance).toBeGreaterThan(99); // Original $99 + profit
    });

    it('should move resolved bet to resolvedBets array', () => {
      const state = initializeGame(createInitialState(), 'TTest...', 100);
      const { newState: stateWithBet } = placeBet(state, mockMarket, 'YES');
      
      const prices = {
        [mockMarket.id]: { yesPrice: 70, noPrice: 30 },
      };
      
      const { newState } = updateBetPrices(stateWithBet, prices);
      
      expect(newState.resolvedBets[0].isResolved).toBe(true);
      expect(newState.resolvedBets).toHaveLength(1);
    });
  });

  describe('skipMarket', () => {
    it('should return unchanged state', () => {
      const state = initializeGame(createInitialState(), 'TTest...', 100);
      
      const newState = skipMarket(state);
      
      expect(newState).toEqual(state);
    });
  });

  describe('checkGameOver', () => {
    it('should return false when balance is sufficient', () => {
      const state = initializeGame(createInitialState(), 'TTest...', 10);
      
      expect(checkGameOver(state)).toBe(false);
    });

    it('should return true when balance < $1 and no active bets', () => {
      const state: GameState = {
        balance: 0.50,
        startingBalance: 100,
        bets: [],
        resolvedBets: [],
        totalBets: 10,
        totalMatches: 5,
        isGameOver: false,
        walletAddress: 'TTest...',
      };
      
      expect(checkGameOver(state)).toBe(true);
    });

    it('should return false when balance < $1 but has active bets', () => {
      const state: GameState = {
        balance: 0.50,
        startingBalance: 100,
        bets: [{ 
          id: 'bet-1', 
          marketId: 'm1', 
          marketTitle: 'Test',
          marketEmoji: '🏀',
          side: true, 
          entryPrice: 50, 
          amount: 1, 
          timestamp: Date.now(),
          currentPrice: 50,
          isResolved: false,
          profitLoss: 0,
        }],
        resolvedBets: [],
        totalBets: 10,
        totalMatches: 5,
        isGameOver: false,
        walletAddress: 'TTest...',
      };
      
      expect(checkGameOver(state)).toBe(false);
    });
  });

  describe('getSessionStats', () => {
    it('should calculate correct session statistics', () => {
      const state: GameState = {
        balance: 150,
        startingBalance: 100,
        bets: [],
        resolvedBets: [
          { id: '1', marketId: 'm1', marketTitle: 'T', marketEmoji: '🏀', side: true, entryPrice: 50, amount: 1, timestamp: 0, currentPrice: 60, isResolved: true, profitLoss: 0.10 },
          { id: '2', marketId: 'm2', marketTitle: 'T', marketEmoji: '🏀', side: false, entryPrice: 50, amount: 1, timestamp: 0, currentPrice: 40, isResolved: true, profitLoss: 0.10 },
        ],
        totalBets: 10,
        totalMatches: 5,
        isGameOver: true,
        walletAddress: 'TTest...',
      };
      
      const stats = getSessionStats(state);
      
      expect(stats.startBalance).toBe(100);
      expect(stats.endBalance).toBe(150);
      expect(stats.totalBets).toBe(10);
      expect(stats.totalMatches).toBe(5);
      expect(stats.profitLoss).toBe(50);
    });
  });

  describe('calculatePotentialWin', () => {
    it('should calculate correct potential win for YES bet', () => {
      // Entry at 60 cents, bet $1
      // If price goes to 100: profit = $1 * (100/60) - $1 = $0.67
      const win = calculatePotentialWin(60, 1);
      expect(win).toBeCloseTo(0.67, 2);
    });

    it('should calculate correct potential win for NO bet', () => {
      // Entry at 40 cents, bet $1
      // If price goes to 100: profit = $1 * (100/40) - $1 = $1.50
      const win = calculatePotentialWin(40, 1);
      expect(win).toBeCloseTo(1.5, 2);
    });
  });

  describe('calculateProfitLoss', () => {
    it('should calculate profit for YES bet when price goes up', () => {
      const pl = calculateProfitLoss(50, 60, 1, true);
      expect(pl).toBe(0.10); // 10 cents move = $0.10 profit
    });

    it('should calculate loss for YES bet when price goes down', () => {
      const pl = calculateProfitLoss(50, 40, 1, true);
      expect(pl).toBe(-0.10);
    });

    it('should calculate profit for NO bet when price goes down', () => {
      const pl = calculateProfitLoss(50, 40, 1, false);
      expect(pl).toBe(0.10);
    });

    it('should calculate loss for NO bet when price goes up', () => {
      const pl = calculateProfitLoss(50, 60, 1, false);
      expect(pl).toBe(-0.10);
    });
  });
});
