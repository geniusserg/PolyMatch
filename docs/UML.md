# PolyMatch UML Diagrams

## Class Diagram

```mermaid
classDiagram
    class Market {
        +string id
        +string title
        +string category
        +number endDate
        +number yesPrice
        +number noPrice
        +number volume
        +string emoji
        +string url
    }

    class Bet {
        +string id
        +string marketId
        +string marketTitle
        +string marketEmoji
        +boolean side
        +number entryPrice
        +number amount
        +number timestamp
        +number currentPrice
        +boolean isResolved
        +number profitLoss
    }

    class WalletBalance {
        +string address
        +number trx
        +number usdValue
        +number lastUpdated
    }

    class GameState {
        +number balance
        +number startingBalance
        +Bet[] bets
        +Bet[] resolvedBets
        +number totalBets
        +number totalMatches
        +boolean isGameOver
        +string walletAddress
    }

    class MatchNotification {
        +Bet bet
        +number priceChange
        +number profit
        +number timestamp
    }

    class PolymarketAPI {
        +fetchTrendingMarkets() Market[]
        +fetchMarketPrice() number
        +fetchMarketPrices() Record
        +formatTimeRemaining() string
        +formatVolume() string
    }

    class TronAPI {
        +fetchWalletBalance() WalletBalance
        +isValidTronAddress() boolean
        +formatTrxBalance() string
        +formatUsdValue() string
    }

    class GameLogic {
        +createInitialState() GameState
        +initializeGame() GameState
        +placeBet() {newState, bet}
        +updateBetPrices() {newState, matches}
        +skipMarket() GameState
        +checkGameOver() boolean
        +getSessionStats() object
    }

    GameState "1" *-- "*" Bet : contains
    GameState "1" *-- "1" WalletBalance : initialized from
    MatchNotification "1" *-- "1" Bet : references
    PolymarketAPI ..> Market : returns
    TronAPI ..> WalletBalance : returns
    GameLogic ..> GameState : manages
    GameLogic ..> MatchNotification : emits
```

## Sequence Diagram: App Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as UI Layer
    participant GL as Game Logic
    participant PM as Polymarket API
    participant TR as Tron API

    U->>UI: Enter Tron address
    UI->>TR: fetchWalletBalance(address)
    TR-->>UI: WalletBalance (TRX, USD)
    UI->>GL: initializeGame(wallet, balance)
    GL-->>UI: GameState

    loop Main Game Loop
        UI->>PM: fetchTrendingMarkets()
        PM-->>UI: Market[]
        UI->>U: Show market card

        U->>UI: Swipe RIGHT (YES) or LEFT (NO)
        UI->>GL: placeBet(state, market, side)
        GL->>GL: Deduct $1 from balance
        GL->>GL: Create Bet object
        GL-->>UI: Updated GameState

        loop Price Polling (every 5s)
            UI->>PM: fetchMarketPrices([betIds])
            PM-->>UI: Current prices
            UI->>GL: updateBetPrices(state, prices)
            GL->>GL: Calculate profit/loss
            GL->>GL: Check if ≥5¢ move
            
            alt Match Found
                GL->>GL: Add profit to balance
                GL->>GL: Mark bet resolved
                GL-->>UI: MatchNotification
                UI->>U: Show "It's a Match!" popup
            end
        end

        alt Balance < $1
            UI->>GL: checkGameOver(state)
            GL-->>UI: true
            UI->>U: Show "See You Next Day" screen
        end
    end
```

## Sequence Diagram: Match Detection

```mermaid
sequenceDiagram
    participant U as User
    participant UI as UI
    participant GL as Game Logic
    participant PM as Polymarket API

    U->>UI: Swipe RIGHT on Lakers market
    UI->>GL: placeBet(state, market, YES)
    Note over GL: entryPrice = 62¢
    GL-->>UI: balance = $99, bet created

    loop Every 5 seconds
        UI->>PM: fetchMarketPrices(["lakers-warriors"])
        PM-->>UI: {yesPrice: 68, noPrice: 32}
        UI->>GL: updateBetPrices(state, prices)
        
        Note over GL: currentPrice = 68¢
        Note over GL: priceChange = 68 - 62 = 6¢
        Note over GL: 6¢ ≥ 5¢ threshold → MATCH!
        
        GL->>GL: profit = (6/100) * $1 = $0.06
        GL->>GL: balance = $99 + $0.06 = $99.06
        GL->>GL: bet.isResolved = true
        GL-->>UI: {newState, matches: [MatchNotification]}
        
        UI->>U: Show "🔥 It's a Match!" popup
        Note over U: Lakers YES bet<br/>Profit: +$0.06
    end
```

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> WalletConnect: App Launch
    WalletConnect --> MainSwipe: Valid Address + Balance Loaded
    WalletConnect --> WalletConnect: Invalid Address / Retry
    
    state MainSwipe {
        [*] --> Browsing: Show Market Card
        Browsing --> PlacingBet: User Swipes (←/→)
        PlacingBet --> Browsing: Bet Placed, Next Card
        Browsing --> Browsing: User Skips (↑)
        
        state PriceTracking {
            [*] --> Monitoring: Poll Prices
            Monitoring --> MatchFound: Price moves ≥5¢
            Monitoring --> Monitoring: No significant move
            MatchFound --> Monitoring: Cashout, Show Popup
        }
    }
    
    MainSwipe --> GameOver: Balance < $1 AND No Active Bets
    GameOver --> [*]: End Session
    
    note right of WalletConnect
        Fetch Tron balance
        Initialize game state
    end note
    
    note right of PlacingBet
        Deduct $1
        Record entry price
        Track position
    end note
    
    note right of MatchFound
        Add profit to balance
        Show match popup
        Increment match counter
    end note
    
    note right of GameOver
        Show session stats
        "See You Next Day"
    end note
```

## Component Diagram

```mermaid
componentDiagram
    component "UI Layer" as UI {
        component "WalletScreen" as WS
        component "SwipeScreen" as SS
        component "MatchPopup" as MP
        component "GameOverScreen" as GS
    }
    
    component "Game Logic" as GL {
        component "State Management" as SM
        component "Bet Engine" as BE
        component "Match Detector" as MD
    }
    
    component "API Layer" as API {
        component "Polymarket Client" as PM
        component "Tron Client" as TR
    }
    
    component "External Services" as EXT {
        database "Polymarket API" as POLY
        database "TronGrid API" as TRON
    }
    
    WS --> SM: Initialize game
    SS --> BE: Place bet on swipe
    SS --> PM: Fetch markets
    MP --> MD: Display match
    GS --> SM: Show stats
    
    SM --> TR: Fetch wallet balance
    BE --> PM: Fetch market prices
    MD --> PM: Poll for price changes
    
    PM --> POLY: HTTP requests
    TR --> TRON: HTTP requests
```

## Data Flow Diagram

```mermaid
flowchart TD
    A[User] -->|Enters Address| B(Wallet Screen)
    B -->|Validate| C{Valid Address?}
    C -->|No| B
    C -->|Yes| D[Tron API]
    D -->|Return Balance| E[Game State]
    
    E -->|Fetch| F[Polymarket API]
    F -->|Return Markets| G[Swipe Screen]
    
    G -->|Swipe Right| H{Bet YES}
    G -->|Swipe Left| I{Bet NO}
    G -->|Swipe Up| J[Skip]
    
    H --> K[Game Logic]
    I --> K
    J --> G
    
    K -->|Deduct $1| L[Update Balance]
    K -->|Record Entry| M[Create Bet]
    
    M -->|Poll Every 5s| N[Price Tracker]
    N -->|Fetch Prices| F
    N -->|Check Threshold| O{≥5¢ Move?}
    
    O -->|Yes| P[Match!]
    O -->|No| N
    
    P -->|Add Profit| L
    P -->|Show Popup| Q[Match Popup]
    Q -->|Continue| G
    
    L -->|Check| R{Balance < $1?}
    R -->|Yes| S[Game Over Screen]
    R -->|No| G
```
