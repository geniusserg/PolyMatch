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

## 🚀 Quick Start

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

## 📱 Features

| Feature | Description |
|---------|-------------|
| **Wallet Connect** | Paste/scan Tron address, fetch real balance |
| **Swipe Cards** | Smooth gestures with react-native-gesture-handler |
| **Real Markets** | Live Polymarket trending data |
| **Match System** | Price moves ≥5¢ = instant cashout |
| **Dark UI** | Tinder-inspired design |

## 🛠️ Tech Stack

- React Native + Expo
- TypeScript
- react-native-gesture-handler
- react-native-reanimated
- Polymarket API
- TronGrid API

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## 📊 Game Rules

| Rule | Value |
|------|-------|
| Bet Amount | $1 (fixed) |
| Match Threshold | ≥5¢ price movement |
| Cashout | Instant on match |
| Game Over | Balance < $1 |

## 📄 License

MIT License

---

**Made with ❤️ for crypto degens everywhere**
