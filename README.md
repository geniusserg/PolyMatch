# 🔥 PolyMatch

**Tinder for Polymarket bets** - Swipe right for YES, left for NO. Match when your bet moves in your favor!

## 🎮 How to Play

1. **Connect** - Enter your Tron wallet address to load your virtual balance
2. **Swipe** - Browse trending Polymarket markets
   - → **Right** = Bet YES
   - ← **Left** = Bet NO  
   - ↑ **Up** = Skip
3. **Match** - When your bet moves ≥5¢ in your favor, you get a Match! and instant cashout
4. **Repeat** - Keep swiping until you run out of money
5. **Come Back** - When balance hits $0, see you next day!

## 🏗️ Architecture

```
┌────────────────────────────────────────────┐
│           React Native + Expo             │
│  ┌────────────────────────────────────┐   │
│  │         UI Components              │   │
│  └────────────────────────────────────┘   │
│                    │                       │
│  ┌────────────────────────────────────┐   │
│  │         Game Logic                 │   │
│  │  (Bets, Balance, Match Detection) │   │
│  └────────────────────────────────────┘   │
│                    │                       │
│  ┌────────────────────────────────────┐   │
│  │         API Layer                  │   │
│  │  (Polymarket + TronGrid APIs)     │   │
│  └────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

## 📁 Project Structure

```
polymatch/
├── src/
│   ├── api/
│   │   ├── index.ts          # API exports
│   │   ├── polymarket.ts     # Polymarket API client
│   │   ├── tron.ts           # Tron wallet API client
│   │   └── gameLogic.ts      # Game state & match detection
│   ├── components/           # React Native components
│   ├── screens/              # App screens
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
├── __tests__/                # Jest tests
├── docs/                     # Documentation
│   ├── API.md                # API documentation
│   └── UML.md                # UML diagrams
├── app.json                  # Expo config
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📱 Features

### Wallet Connect
- Paste or scan Tron wallet address
- Fetch real TRX balance
- Convert to USD for virtual starting balance
- **No real transactions** - read-only!

### Swipe Mechanics
- Real Polymarket trending markets
- Live odds (YES/NO prices)
- $1 fixed bet amount
- Skip option for uninteresting markets

### Match System
- Real-time price polling (every 5 seconds)
- Match triggered when price moves ≥5¢ in your favor
- Instant cashout on match
- Animated match popup with profit display

### Game Over
- Ends when balance < $1 and no active bets
- Session statistics:
  - Starting/ending balance
  - Total bets made
  - Matches hit
  - Best win

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo |
| Language | TypeScript |
| Gestures | react-native-gesture-handler |
| Animations | react-native-reanimated |
| State | React Context + useReducer |
| Testing | Jest + jest-expo |
| APIs | Polymarket, TronGrid |

## 📊 API Integration

### Polymarket API
- **Endpoint**: `https://gamma-api.polymarket.com/events/trending`
- **Purpose**: Fetch trending markets
- **Fallback**: Mock data for development

### TronGrid API
- **Endpoint**: `https://api.trongrid.io`
- **Purpose**: Fetch wallet balance
- **Fallback**: Mock balance (1000-6000 TRX)

## 🎨 Design Principles

1. **Tinder-Simple** - Minimal UI, focus on swiping
2. **Dark Mode** - Crypto aesthetic, easy on eyes
3. **Instant Feedback** - Smooth animations, quick responses
4. **No Complexity** - Fixed $1 bets, instant cashout

## 📝 Game Rules

| Rule | Value |
|------|-------|
| Bet Amount | $1 (fixed) |
| Match Threshold | ≥5¢ price movement |
| Cashout | Instant on match |
| Game Over | Balance < $1 |
| Reset | Next day |

## 🔐 Security Notes

- **No real betting** - Virtual balance only
- **Read-only API** - No transactions sent
- **No private keys** - Wallet address only
- **No data storage** - Session resets on app close

## 📄 Documentation

- [API Documentation](docs/API.md) - Detailed API reference
- [UML Diagrams](docs/UML.md) - Architecture diagrams

## 🤝 Contributing

This is a demo project. Feel free to fork and modify!

## 📄 License

MIT License - See LICENSE file for details.

## 🙏 Acknowledgments

- Polymarket for the market data
- Tron Foundation for the wallet API
- Tinder for the swipe inspiration

---

**Made with ❤️ for crypto degens everywhere**
