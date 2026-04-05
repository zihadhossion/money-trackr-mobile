# Money Trackr Mobile

A cross-platform personal finance management app built with Expo (React Native) and TypeScript. Track income, expenses, lending, and budgets with a clean, themeable UI.

## Features

- **Dashboard** — Overview of income, expenses, balance, and budget usage with charts
- **Income Tracking** — Log and categorize income transactions by month
- **Expense Tracking** — Track spending with category breakdown and recurring expense support
- **Lending Management** — Track money lent to others or borrowed, with repayment records and due dates
- **Categories** — Create and manage custom income/expense categories with icons and colors
- **Budget Alerts** — Warning at 80% and danger at 100% of monthly budget
- **Dark/Light Theme** — System-aware theme with manual toggle
- **Google Sign-In** — OAuth 2.0 authentication with JWT token auto-refresh

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Expo ~55.0.7 + React Native 0.83.2 |
| Language | TypeScript ~5.9.2 |
| Routing | Expo Router (file-based) |
| State | React Context API (Auth + Theme) |
| Authentication | Google Sign-In + JWT (Axios interceptors) |
| Storage | AsyncStorage + Expo SecureStore |
| Charts | react-native-gifted-charts |
| HTTP Client | Axios with token refresh interceptors |
| Build & Distribution | EAS (Expo Application Services) |

## Project Structure

```
money-trackr-mobile/
├── app/                    # Expo Router file-based routes
│   ├── _layout.tsx         # Root layout with providers
│   ├── (auth)/             # Auth screens (login)
│   └── (tabs)/             # Tab screens (dashboard, income, expenses, lending, categories, settings)
├── src/
│   ├── components/
│   │   ├── ui/             # Reusable UI components (StatCard, TransactionItem, etc.)
│   │   ├── forms/          # Form components (ExpenseForm, IncomeForm, LendingForm, etc.)
│   │   └── charts/         # Chart components (ExpensePieChart, TrendsBarChart)
│   ├── contexts/           # AuthContext, ThemeContext
│   ├── services/           # API service layer (expense, income, lending, category, etc.)
│   ├── hooks/              # Custom hooks (useBottomSheet)
│   ├── theme/              # Color palettes, form styles, screen styles
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Currency formatting, date utilities, storage helpers
│   └── enums/              # LendingType, LendingStatus
├── assets/                 # App icons and images
├── app.json                # Expo app configuration
├── eas.json                # EAS build configuration
└── .env.example            # Environment variables template
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- [EAS CLI](https://docs.expo.dev/eas/) (for builds) — `npm install -g eas-cli`
- Android Studio or Xcode for running on emulator/simulator

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd money-trackr-mobile

# Install dependencies
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend API base URL (e.g., `http://10.0.2.2:3000/api` for Android emulator) |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth Web Client ID |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google OAuth Android Client ID |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google OAuth iOS Client ID |

> Get Google Client IDs from the [Google Cloud Console](https://console.cloud.google.com/).

### Running

```bash
# Start Expo dev server
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator
npm run ios

# Run in browser
npm run web
```

## Building

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for both platforms
eas build --platform all
```

## License

Private — all rights reserved.
