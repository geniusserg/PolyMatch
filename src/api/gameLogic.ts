/**
 * Game Logic Module
 * 
 * Handles game state management, betting logic, and match detection.
 * 
 * Match Detection Logic:
 * - When user swipes, we record their entry price
 * - We poll prices every few seconds
 * - If price moves >= $0.05 (5 cents) in user's favor, trigger match
 * - Match = instant cashout, profit added to balance
 */

import { Market, Bet, GameState, MatchNotification, BetSide } from '@/types';

// Match threshold: price must move this much in user's favor (in cents)
const MATCH_THRESHOLD_CENTS = 5;

// Bet amount in USD
const BET_AMOUNT = 1.0;

/**
 * Create initial game state
 */
export function createInitialState(): GameState {
  return {
    balance: 0,
    startingBalance: 0,
    bets: [],
    resolvedBets: [],
    totalBets: 0,
    totalMatches: 0,
    isGameOver: false,
    walletAddress: null,
  };
}

/**
 * Initialize game with wallet balance
 */
export function initializeGame(
  state: GameState,
  walletAddress: string,
  initialBalance: number
): GameState {
  return {
    ...state,
    walletAddress,
    balance: initialBalance,
    startingBalance: initialBalance,
    isGameOver: false,
  };
}

/**
 * Place a bet on a market
 * 
 * @param state - Current game state
 * @param market - Market to bet on
 * @param side - YES or NO
 * @returns Updated game state and the bet placed
 */
export function placeBet(
  state: GameState,
  market: Market,
  side: BetSide
): { newState: GameState; bet: Bet } {
  if (state.balance < BET_AMOUNT) {
    throw new Error('Insufficient balance');
  }
  
  const entryPrice = side === 'YES' ? market.yesPrice : market.noPrice;
  
  const bet: Bet = {
    id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    marketId: market.id,
    marketTitle: market.title,
    marketEmoji: market.emoji,
    side: side === 'YES',
    entryPrice,
    amount: BET_AMOUNT,
    timestamp: Date.now(),
    currentPrice: entryPrice,
    isResolved: false,
    profitLoss: 0,
  };
  
  const newState: GameState = {
    ...state,
    balance: state.balance - BET_AMOUNT,
    bets: [...state.bets, bet],
    totalBets: state.totalBets + 1,
  };
  
  return { newState, bet };
}

/**
 * Update bet prices with latest market data
 * Called periodically to track price movements
 * 
 * @param state - Current game state
 * @param prices - Map of market ID to { yesPrice, noPrice }
 * @returns Updated game state with potential matches
 */
export function updateBetPrices(
  state: GameState,
  prices: Record<string, { yesPrice: number; noPrice: number }>
): { newState: GameState; matches: MatchNotification[] } {
  const matches: MatchNotification[] = [];
  const updatedBets: Bet[] = [];
  
  for (const bet of state.bets) {
    if (bet.isResolved) {
      updatedBets.push(bet);
      continue;
    }
    
    const marketPrices = prices[bet.marketId];
    if (!marketPrices) {
      updatedBets.push(bet);
      continue;
    }
    
    // Update current price
    const newCurrentPrice = bet.side ? marketPrices.yesPrice : marketPrices.noPrice;
    const priceChange = newCurrentPrice - bet.entryPrice;
    
    // For NO bets, profit is when price goes DOWN
    const effectiveChange = bet.side ? priceChange : -priceChange;
    
    // Calculate profit/loss
    // Profit = (price change in cents) * (bet amount / entry price)
    // Simplified: each cent move = $0.01 profit per $1 bet
    const profitLoss = (effectiveChange / 100) * bet.amount;
    
    const updatedBet: Bet = {
      ...bet,
      currentPrice: newCurrentPrice,
      profitLoss,
    };
    
    // Check for match: price moved >= 5 cents in user's favor
    if (effectiveChange >= MATCH_THRESHOLD_CENTS && !bet.isResolved) {
      // Trigger match!
      updatedBet.isResolved = true;
      
      const match: MatchNotification = {
        bet: updatedBet,
        priceChange: effectiveChange,
        profit: profitLoss,
        timestamp: Date.now(),
      };
      
      matches.push(match);
    } else {
      updatedBets.push(updatedBet);
    }
  }
  
  // Add profits from matches to balance
  const totalProfit = matches.reduce((sum, m) => sum + m.profit, 0);
  
  const newState: GameState = {
    ...state,
    bets: updatedBets,
    resolvedBets: [...state.resolvedBets, ...matches.map(m => m.bet)],
    balance: state.balance + totalProfit,
    totalMatches: state.totalMatches + matches.length,
    isGameOver: state.balance < BET_AMOUNT && updatedBets.length === 0,
  };
  
  return { newState, matches };
}

/**
 * Skip a market (swipe up)
 * No bet placed, just move to next
 */
export function skipMarket(state: GameState): GameState {
  return { ...state };
}

/**
 * Check if game is over
 * Game ends when:
 * - Balance is less than bet amount
 * - No active bets remaining
 */
export function checkGameOver(state: GameState): boolean {
  return state.balance < BET_AMOUNT && state.bets.every(b => b.isResolved);
}

/**
 * Get session statistics
 */
export function getSessionStats(state: GameState): {
  startBalance: number;
  endBalance: number;
  totalBets: number;
  totalMatches: number;
  bestWin: number;
  profitLoss: number;
} {
  const bestWin = Math.max(
    0,
    ...state.resolvedBets.map(b => b.profitLoss)
  );
  
  return {
    startBalance: state.startingBalance,
    endBalance: state.balance,
    totalBets: state.totalBets,
    totalMatches: state.totalMatches,
    bestWin,
    profitLoss: state.balance - state.startingBalance,
  };
}

/**
 * Calculate potential win for a bet
 * Returns the amount won if the bet wins (price goes to 100)
 */
export function calculatePotentialWin(entryPrice: number, betAmount: number): number {
  // If price goes from entryPrice to 100, profit = (100 - entryPrice) / entryPrice * betAmount
  // Simplified: potential return = betAmount * (100 / entryPrice)
  const potentialReturn = betAmount * (100 / entryPrice);
  return potentialReturn - betAmount; // Net profit
}

/**
 * Calculate current profit/loss for a bet
 */
export function calculateProfitLoss(
  entryPrice: number,
  currentPrice: number,
  betAmount: number,
  side: boolean
): number {
  const priceChange = side ? (currentPrice - entryPrice) : (entryPrice - currentPrice);
  return (priceChange / 100) * betAmount;
}
