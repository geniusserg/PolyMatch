/**
 * PolyMatch Type Definitions
 */

/**
 * Polymarket Market Data
 */
export interface Market {
  /** Unique market identifier */
  id: string;
  /** Market title/question */
  title: string;
  /** Market category */
  category: string;
  /** Unix timestamp when market resolves */
  endDate: number;
  /** Current YES price in cents (0-100) */
  yesPrice: number;
  /** Current NO price in cents (0-100) */
  noPrice: number;
  /** Total volume in USD */
  volume: number;
  /** Market image/icon emoji */
  emoji: string;
  /** URL to market details */
  url: string;
}

/**
 * User's bet position
 */
export interface Bet {
  /** Unique bet identifier */
  id: string;
  /** Market ID this bet is on */
  marketId: string;
  /** Market title for display */
  marketTitle: string;
  /** Market emoji for display */
  marketEmoji: string;
  /** Bet side: true = YES, false = NO */
  side: boolean;
  /** Entry price in cents */
  entryPrice: number;
  /** Bet amount in USD */
  amount: number;
  /** Timestamp when bet was placed */
  timestamp: number;
  /** Current price (updated in real-time) */
  currentPrice: number;
  /** Whether bet was cashed out / resolved */
  isResolved: boolean;
  /** Profit/loss in USD (negative if loss) */
  profitLoss: number;
}

/**
 * Tron Wallet Balance
 */
export interface WalletBalance {
  /** Wallet address */
  address: string;
  /** TRX balance */
  trx: number;
  /** USD value */
  usdValue: number;
  /** Last updated timestamp */
  lastUpdated: number;
}

/**
 * Game State
 */
export interface GameState {
  /** Current balance in USD */
  balance: number;
  /** Starting balance */
  startingBalance: number;
  /** List of active bets */
  bets: Bet[];
  /** List of resolved bets */
  resolvedBets: Bet[];
  /** Total bets made */
  totalBets: number;
  /** Total matches hit */
  totalMatches: number;
  /** Whether game is over (no money left) */
  isGameOver: boolean;
  /** Wallet address */
  walletAddress: string | null;
}

/**
 * Match Notification
 */
export interface MatchNotification {
  /** Bet that triggered the match */
  bet: Bet;
  /** Price change in cents */
  priceChange: number;
  /** Profit in USD */
  profit: number;
  /** Timestamp */
  timestamp: number;
}

/**
 * API Response Types
 */
export interface PolymarketMarketResponse {
  event_id: string;
  title: string;
  subtitle: string;
  image: string;
  end_date_iso: string;
  markets: Array<{
    outcome: string;
    price: number;
    yes_sub_title: string;
    no_sub_title: string;
    volume: number;
  }>;
}

export interface TronBalanceResponse {
  data: Array<{
    owner_address: string;
    balance: number;
  }>;
  meta: {
    at: number;
  };
}

/**
 * Swipe Direction
 */
export type SwipeDirection = 'left' | 'right' | 'up' | null;

/**
 * Bet Side
 */
export type BetSide = 'YES' | 'NO';
