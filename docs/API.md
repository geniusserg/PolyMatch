# PolyMatch API Documentation

## Overview

PolyMatch is a Tinder-style betting simulation app for Polymarket markets. Users swipe right (YES) or left (NO) to place $1 virtual bets. When a bet moves ≥5 cents in their favor, they get a "Match!" notification and instant cashout.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Layer (React Native)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Wallet  │  │  Swipe   │  │  Match   │  ///Game    │   │
│  │  Screen  │  │  Screen  │  │  Popup   │  ///Over    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Game Logic Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  placeBet()  │  │updatePrices()│  │checkGameOver()│    │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   Polymarket API        │     │    Tron API             │
│  - fetchTrending()      │     │  - fetchBalance()       │
│  - fetchPrices()        │     │  - validateAddress()    │
└─────────────────────────┘     └─────────────────────────┘
```

## API Modules

### 1. Polymarket API (`src/api/polymarket.ts`)

#### `fetchTrendingMarkets(): Promise<Market[]>`

Fetches trending markets from Polymarket.

**Returns:**
```typescript
Market[] = {
  id: string;           // Unique market ID
  title: string;        // Market question
  category: string;     // Category (Sports, Crypto, etc.)
  endDate: number;      // Unix timestamp
  yesPrice: number;     // YES price in cents (0-100)
  noPrice: number;      // NO price in cents (0-100)
  volume: number;       // Volume in USD
  emoji: string;        // Visual emoji
  url: string;          // Link to Polymarket
}
```

**Error Handling:** Falls back to mock data if API fails.

---

#### `fetchMarketPrice(marketId, side): Promise<number>`

Fetches current price for a specific market outcome.

**Parameters:**
- `marketId: string` - Market identifier
- `side: 'yes' | 'no'` - Which side to fetch

**Returns:** Price in cents (0-100)

---

#### `fetchMarketPrices(marketIds): Promise<Record>`

Fetches prices for multiple markets at once.

**Parameters:**
- `marketIds: string[]` - Array of market IDs

**Returns:**
```typescript
{
  [marketId: string]: { yesPrice: number, noPrice: number }
}
```

---

#### `formatTimeRemaining(endDate): string`

Formats time until market resolution.

**Returns:** `"2h"`, `"30m"`, `"2d"`, or `"Ended"`

---

#### `formatVolume(volume): string`

Formats volume for display.

**Returns:** `"$2.4M"`, `"$500K"`, `"$500"`

---

### 2. Tron API (`src/api/tron.ts`)

#### `fetchWalletBalance(address): Promise<WalletBalance>`

Fetches TRX balance for a wallet address.

**Parameters:**
- `address: string` - Tron address (must start with 'T', 34 chars)

**Returns:**
```typescript
WalletBalance = {
  address: string;      // Wallet address
  trx: number;          // TRX balance
  usdValue: number;     // USD value
  lastUpdated: number;  // Unix timestamp
}
```

**Error Handling:** Falls back to mock balance (1000-6000 TRX) if API fails.

---

#### `isValidTronAddress(address): boolean`

Validates Tron address format.

**Validation Rules:**
- Must start with 'T'
- Must be exactly 34 characters
- Must contain only base58 characters (A-Z, a-z, 1-9, no 0OIl)

---

#### `formatTrxBalance(trx): string`

Formats TRX balance for display.

**Returns:** `"1234.56"`

---

#### `formatUsdValue(usd): string`

Formats USD value for display.

**Returns:** `"$1,234.56"`

---

### 3. Game Logic (`src/api/gameLogic.ts`)

#### `createInitialState(): GameState`

Creates empty initial game state.

---

#### `initializeGame(state, walletAddress, initialBalance): GameState`

Initializes game with wallet and balance.

---

#### `placeBet(state, market, side): { newState, bet }`

Places a $1 bet on a market.

**Parameters:**
- `state: GameState` - Current state
- `market: Market` - Market to bet on
- `side: 'YES' | 'NO'` - Bet side

**Returns:**
```typescript
{
  newState: GameState,  // Updated state (balance deducted)
  bet: Bet              // The placed bet
}
```

**Bet Structure:**
```typescript
Bet = {
  id: string;
  marketId: string;
  marketTitle: string;
  marketEmoji: string;
  side: boolean;        // true = YES, false = NO
  entryPrice: number;   // Price in cents when bet placed
  amount: number;       // Always $1
  timestamp: number;
  currentPrice: number; // Updated in real-time
  isResolved: boolean;
  profitLoss: number;
}
```

---

#### `updateBetPrices(state, prices): { newState, matches }`

Updates all active bet prices and checks for matches.

**Match Detection:**
- If price moves ≥5 cents in user's favor → Match!
- Match triggers instant cashout
- Profit added to balance

**Returns:**
```typescript
{
  newState: GameState,
  matches: MatchNotification[]
}
```

**MatchNotification:**
```typescript
{
  bet: Bet;
  priceChange: number;  // Cents moved in favor
  profit: number;       // USD profit
  timestamp: number;
}
```

---

#### `checkGameOver(state): boolean`

Checks if game is over.

**Game Over Conditions:**
- Balance < $1 AND no active bets

---

#### `getSessionStats(state): object`

Returns session statistics for game over screen.

---

## Data Flow

### 1. App Launch → Wallet Connect

```
User enters Tron address
       │
       ▼
isValidTronAddress() validates
       │
       ▼
fetchWalletBalance() → USD value
       │
       ▼
initializeGame() → GameState with balance
```

### 2. Swipe → Place Bet

```
User swipes right (YES) or left (NO)
       │
       ▼
placeBet(state, market, side)
       │
       ▼
Deduct $1 from balance
       │
       ▼
Add bet to active bets array
       │
       ▼
Update UI with new balance
```

### 3. Price Polling → Match Detection

```
Every 5 seconds:
       │
       ▼
fetchMarketPrices([active bet IDs])
       │
       ▼
updateBetPrices(state, prices)
       │
       ▼
For each bet:
  - Calculate price change
  - If change ≥ 5 cents → Match!
       │
       ▼
Add profit to balance
Move bet to resolved
Show Match popup
```

### 4. Game Over

```
After each bet resolution:
       │
       ▼
checkGameOver(state)
       │
       ▼
If true → Show "See You Next Day" screen
       │
       ▼
Display session stats
```

## Configuration

### Match Threshold

```typescript
const MATCH_THRESHOLD_CENTS = 5;  // Price must move 5+ cents
```

### Bet Amount

```typescript
const BET_AMOUNT = 1.0;  // Always $1 per bet
```

## Error Handling

All API calls have fallback behavior:
- **Polymarket API** → Mock markets
- **Tron API** → Mock balance (1000-6000 TRX)
- **Price fetch** → Random fluctuation around 50 cents

This ensures the app works for demo/testing without real API access.

## Testing

Run tests:
```bash
npm test
```

Test coverage:
- Game logic: ✅ Full coverage
- Tron API: ✅ Address validation, formatting
- Polymarket API: ✅ Formatting, fallback behavior
