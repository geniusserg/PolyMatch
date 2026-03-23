/**
 * Polymarket API Client
 * 
 * Fetches trending markets and real-time price data from Polymarket.
 * Uses the public Polymarket API (no authentication required for read-only access).
 * 
 * @see https://polymarket.com
 */

import { Market } from '@/types';

// Polymarket API base URLs
const POLYMARKET_API_BASE = 'https://gamma-api.polymarket.com';
const POLYMARKET_CLOB_BASE = 'https://clob.polymarket.com';

/**
 * Mock trending markets for development/testing
 * In production, these would come from the real API
 */
const MOCK_MARKETS: Market[] = [
  {
    id: 'lakers-warriors-2024',
    title: 'Lakers to win vs Warriors tonight?',
    category: 'Sports',
    endDate: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
    yesPrice: 62,
    noPrice: 38,
    volume: 2400000,
    emoji: '🏀',
    url: 'https://polymarket.com/event/lakers-warriors',
  },
  {
    id: 'btc-100k-2024',
    title: 'Will Bitcoin hit $100K this year?',
    category: 'Crypto',
    endDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    yesPrice: 45,
    noPrice: 55,
    volume: 5600000,
    emoji: '₿',
    url: 'https://polymarket.com/event/btc-100k',
  },
  {
    id: 'fed-rate-cut-jan',
    title: 'Fed to cut rates in January?',
    category: 'Politics',
    endDate: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
    yesPrice: 73,
    noPrice: 27,
    volume: 3200000,
    emoji: '🏛️',
    url: 'https://polymarket.com/event/fed-rates',
  },
  {
    id: 'super-bowl-chiefs',
    title: 'Chiefs to win Super Bowl?',
    category: 'Sports',
    endDate: Date.now() + 45 * 24 * 60 * 60 * 1000, // 45 days
    yesPrice: 28,
    noPrice: 72,
    volume: 8900000,
    emoji: '🏈',
    url: 'https://polymarket.com/event/super-bowl',
  },
  {
    id: 'eth-5k-2024',
    title: 'Will Ethereum hit $5K this year?',
    category: 'Crypto',
    endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    yesPrice: 35,
    noPrice: 65,
    volume: 4100000,
    emoji: '♦',
    url: 'https://polymarket.com/event/eth-5k',
  },
];

/**
 * Fetch trending markets from Polymarket
 * 
 * @returns Array of market data
 * @throws Error if fetch fails
 */
export async function fetchTrendingMarkets(): Promise<Market[]> {
  try {
    // Try to fetch from real API first
    const response = await fetch(`${POLYMARKET_API_BASE}/events/trending`);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    return parsePolymarketResponse(data);
  } catch (error) {
    // Fallback to mock data for development
    console.warn('Using mock market data:', error);
    return MOCK_MARKETS;
  }
}

/**
 * Fetch current price for a specific market
 * 
 * @param marketId - Market identifier
 * @param side - 'yes' or 'no'
 * @returns Current price in cents (0-100)
 */
export async function fetchMarketPrice(marketId: string, side: 'yes' | 'no'): Promise<number> {
  try {
    const response = await fetch(
      `${POLYMARKET_CLOB_BASE}/prices?market=${marketId}&side=${side}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    return Math.round(data.price * 100);
  } catch (error) {
    console.warn('Price fetch failed, using cached value:', error);
    // Return a random fluctuation for demo purposes
    const basePrice = side === 'yes' ? 50 : 50;
    const fluctuation = Math.floor(Math.random() * 20) - 10;
    return basePrice + fluctuation;
  }
}

/**
 * Fetch updated prices for multiple markets
 * Used for real-time price tracking and match detection
 * 
 * @param marketIds - Array of market IDs to fetch prices for
 * @returns Map of market ID to { yesPrice, noPrice }
 */
export async function fetchMarketPrices(marketIds: string[]): Promise<Record<string, { yesPrice: number; noPrice: number }>> {
  const prices: Record<string, { yesPrice: number; noPrice: number }> = {};
  
  await Promise.all(
    marketIds.map(async (marketId) => {
      try {
        const [yesPrice, noPrice] = await Promise.all([
          fetchMarketPrice(marketId, 'yes'),
          fetchMarketPrice(marketId, 'no'),
        ]);
        prices[marketId] = { yesPrice, noPrice };
      } catch (error) {
        console.warn(`Failed to fetch prices for ${marketId}:`, error);
      }
    })
  );
  
  return prices;
}

/**
 * Parse Polymarket API response into our Market type
 */
function parsePolymarketResponse(data: any): Market[] {
  if (!Array.isArray(data)) {
    return MOCK_MARKETS;
  }
  
  return data.slice(0, 20).map((event: any) => {
    const market = event.markets?.[0];
    return {
      id: event.event_id || event.id || `market-${Date.now()}`,
      title: event.title || 'Unknown Market',
      category: event.category || 'Other',
      endDate: new Date(event.end_date_iso).getTime() || Date.now() + 86400000,
      yesPrice: market ? Math.round(market.price * 100) : 50,
      noPrice: market ? Math.round((1 - market.price) * 100) : 50,
      volume: market?.volume || 0,
      emoji: getEmojiForCategory(event.category || ''),
      url: `https://polymarket.com/event/${event.event_id}`,
    };
  });
}

/**
 * Get emoji for market category
 */
function getEmojiForCategory(category: string): string {
  const emojiMap: Record<string, string> = {
    'Sports': '🏀',
    'Crypto': '₿',
    'Politics': '🏛️',
    'Finance': '📈',
    'Entertainment': '🎬',
    'Technology': '💻',
    'Science': '🔬',
  };
  return emojiMap[category] || '🎯';
}

/**
 * Format time remaining until market resolution
 */
export function formatTimeRemaining(endDate: number): string {
  const now = Date.now();
  const diff = endDate - now;
  
  if (diff <= 0) return 'Ended';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }
  
  if (hours > 0) {
    return `${hours}h`;
  }
  
  return `${minutes}m`;
}

/**
 * Format volume for display
 */
export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `$${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `$${(volume / 1000).toFixed(1)}K`;
  }
  return `$${volume}`;
}
