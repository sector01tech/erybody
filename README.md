# erybody

A modern Nostr microblogging platform with PWA support and Nostr Wallet Connect integration.

## Features

- 🌐 **Nostr Protocol** - Built on the decentralized Nostr protocol
- 📱 **Progressive Web App** - Install as a mobile or desktop app
- ⚡ **Lightning Payments** - Zap posts using Nostr Wallet Connect (NWC)
- 🔐 **Encrypted Messaging** - Direct messages with NIP-04 and NIP-17 support
- 🔑 **Multiple Login Options** - Extension (NIP-07), secret key, or remote signer (bunker)
- 🌙 **Dark Mode** - Beautiful pure black theme with orange accents
- 📡 **Relay Management** - Customizable relay connections with NIP-65
- 🎨 **Modern UI** - Built with shadcn/ui and TailwindCSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm run test
```

## Features

### Microblogging

Post short notes to the Nostr network and view posts from other users in your feed.

### Search

Search for posts and people on Nostr with real-time results for both content and profiles.

### Live Streams

Watch live streams on Nostr with support for NIP-53 Live Activities. See who's streaming, view participant counts, and join live broadcasts.

### Direct Messaging

Send encrypted direct messages to other Nostr users using NIP-04 and NIP-17 protocols.

### Lightning Zaps

Connect your Lightning wallet using Nostr Wallet Connect (NWC) to send zaps (Lightning tips) to posts.

### Profile Management

Edit your profile with display name, bio, avatar, banner, and NIP-05 verification.

### PWA Support

Install erybody as a Progressive Web App on your device for a native app experience.

## Technology Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Nostrify** - Nostr protocol framework
- **TanStack Query** - Data fetching and caching

## Nostr NIPs Supported

- **NIP-01** - Basic protocol flow
- **NIP-04** - Encrypted Direct Messages
- **NIP-05** - Mapping Nostr keys to DNS identifiers
- **NIP-07** - Browser extension signer
- **NIP-17** - Private Direct Messages
- **NIP-19** - bech32-encoded entities
- **NIP-46** - Nostr Remote Signing (bunker)
- **NIP-47** - Nostr Wallet Connect
- **NIP-50** - Search Capability
- **NIP-53** - Live Activities
- **NIP-57** - Lightning Zaps
- **NIP-65** - Relay List Metadata

## License

MIT

---

Vibed with [Shakespeare](https://shakespeare.diy)
