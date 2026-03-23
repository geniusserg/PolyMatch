/**
 * Polymarket API Tests
 */

import {
  fetchTrendingMarkets,
  fetchMarketPrice,
  formatTimeRemaining,
  formatVolume,
} from '@/api/polymarket';

describe('Polymarket API', () => {
  describe('fetchTrendingMarkets', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return markets array', async () => {
      // Mock fetch to fail, triggering fallback to mock data
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const markets = await fetchTrendingMarkets();
      
      expect(Array.isArray(markets)).toBe(true);
      expect(markets.length).toBeGreaterThan(0);
    });

    it('should return markets with required fields', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const markets = await fetchTrendingMarkets();
      const market = markets[0];
      
      expect(market).toHaveProperty('id');
      expect(market).toHaveProperty('title');
      expect(market).toHaveProperty('category');
      expect(market).toHaveProperty('endDate');
      expect(market).toHaveProperty('yesPrice');
      expect(market).toHaveProperty('noPrice');
      expect(market).toHaveProperty('volume');
      expect(market).toHaveProperty('emoji');
      expect(market).toHaveProperty('url');
    });

    it('should have valid price range (0-100)', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const markets = await fetchTrendingMarkets();
      
      markets.forEach(market => {
        expect(market.yesPrice).toBeGreaterThanOrEqual(0);
        expect(market.yesPrice).toBeLessThanOrEqual(100);
        expect(market.noPrice).toBeGreaterThanOrEqual(0);
        expect(market.noPrice).toBeLessThanOrEqual(100);
        // YES + NO should equal ~100
        expect(market.yesPrice + market.noPrice).toBeCloseTo(100, 0);
      });
    });
  });

  describe('fetchMarketPrice', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return price for market', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const price = await fetchMarketPrice('test-market', 'yes');
      
      expect(price).toBeGreaterThanOrEqual(0);
      expect(price).toBeLessThanOrEqual(100);
    });
  });

  describe('formatTimeRemaining', () => {
    it('should format hours correctly', () => {
      const twoHours = Date.now() + 2 * 60 * 60 * 1000;
      expect(formatTimeRemaining(twoHours)).toBe('2h');
    });

    it('should format days correctly', () => {
      const twoDays = Date.now() + 48 * 60 * 60 * 1000;
      expect(formatTimeRemaining(twoDays)).toBe('2d');
    });

    it('should format minutes correctly', () => {
      const thirtyMinutes = Date.now() + 30 * 60 * 1000;
      expect(formatTimeRemaining(thirtyMinutes)).toBe('30m');
    });

    it('should return "Ended" for past dates', () => {
      const past = Date.now() - 60 * 60 * 1000;
      expect(formatTimeRemaining(past)).toBe('Ended');
    });
  });

  describe('formatVolume', () => {
    it('should format millions correctly', () => {
      expect(formatVolume(2400000)).toBe('$2.4M');
      expect(formatVolume(1000000)).toBe('$1.0M');
    });

    it('should format thousands correctly', () => {
      expect(formatVolume(2500)).toBe('$2.5K');
      expect(formatVolume(1000)).toBe('$1.0K');
    });

    it('should format small numbers correctly', () => {
      expect(formatVolume(500)).toBe('$500');
      expect(formatVolume(100)).toBe('$100');
    });
  });
});
