# AutoForwardX System Architecture

## Overview
AutoForwardX is a comprehensive Telegram-Discord-Telegram message forwarding system with intelligent content moderation, trap detection, and administrative controls. The system uses multiple technologies to create a seamless message flow while protecting against malicious content and maintaining operational security.

## Core Components

### 1. Web Dashboard (React/TypeScript)
- **Purpose**: Administrative interface for managing pairs, sessions, and monitoring system health
- **Technology**: React 18, TypeScript, Vite, Tailwind CSS, Shadcn/ui
- **Features**:
  - Real-time statistics dashboard
  - Pair management (create, edit, pause/resume)
  - Session monitoring and status tracking
  - Activity feed with live updates
  - Blocklist management (global and per-pair)
  - Form validation with Zod schemas

### 2. Backend API (Express/Node.js)
- **Purpose**: REST API for dashboard operations and data persistence
- **Technology**: Express.js, TypeScript, Drizzle ORM, PostgreSQL
- **Endpoints**:
  - `/api/pairs` - Pair CRUD operations
  - `/api/sessions` - Session management
  - `/api/blocklists` - Content filtering rules
  - `/api/activities` - System activity logs
  - `/api/stats` - Real-time system statistics

### 3. Database Layer (PostgreSQL)
- **Provider**: Neon Serverless PostgreSQL
- **ORM**: Drizzle with TypeScript schemas
- **Tables**:
  - `users` - Authentication and user management
  - `pairs` - Forwarding route configurations
  - `sessions` - Telegram userbot session data
  - `blocklists` - Content filtering rules
  - `activities` - System activity and audit logs
  - `message_mappings` - Cross-platform message relationships
  - `system_stats` - Performance metrics and counters

## Message Flow Architecture

### Phase 1: Source Reading (Telegram → Discord)
```
Telegram Source Channel
         ↓
Telethon Userbot (Reader)
         ↓
Discord Webhook
         ↓
Discord Channel
```

**Components:**
- **Telethon Session**: Authenticated user session reading from private channels
- **Session Management**: OTP-based authentication with phone verification
- **Load Balancing**: Multiple session files per account for rate distribution

### Phase 2: Content Processing (Discord)
```
Discord Channel
         ↓
Discord Bot (discord.py)
         ↓
Content Analysis & Filtering
         ↓
AI Rewriting (Optional)
         ↓
Trap Detection
```

**Discord Bot Responsibilities:**
- Monitor webhook channels for new messages
- Perform content analysis and filtering
- Apply AI rewriting using GPT or local models
- Detect and handle trap messages
- Track message edits and deletions
- Maintain message ID mapping for synchronization

### Phase 3: Destination Posting (Discord → Telegram)
```
Processed Message
         ↓
Telegram Posting Bot
         ↓
Destination Channel(s)
         ↓
Message Mapping Storage
```

**Telegram Poster Bot Features:**
- Multi-bot support for rate limit distribution
- Configurable bot tokens per pair
- Message edit/delete synchronization
- Error handling and retry logic

## Security & Content Filtering

### Trap Detection System
**Text Traps:**
- Pattern matching: `/ *`, `1`, `leak`, `trap`
- Custom regex patterns per pair
- Edit frequency analysis (3+ edits = trap)

**Image Traps:**
- MD5 hash comparison against known trap images
- OCR text analysis for embedded trap content
- Perceptual hash matching for similar images

**Auto-Pause Mechanism:**
- Threshold-based triggering (configurable per pair)
- 2-3 minute automatic pause duration
- Admin notification via Telegram bot
- Automatic resume after cooldown

### Blocklist Architecture
**Global Blocklist:**
- Applied to all pairs system-wide
- Text patterns, image hashes, trap rules
- Managed through web dashboard

**Per-Pair Blocklist:**
- Specific filtering rules for individual routes
- Override or supplement global rules
- Configurable priority levels

**Runtime Processing:**
- Merge global and pair-specific rules
- Apply filters before content forwarding
- Log blocked content for analysis

## Administrative Controls

### Telegram Admin Bot
**Inline Controls:**
- [⏸ Pause Pair] / [▶ Resume Pair]
- [📋 Show Blocklist] / [➕ Add Word] / [❌ Remove Word]
- [📊 System Status] / [🔧 Emergency Stop]

**Notification System:**
- Trap detection alerts
- Pair auto-pause notifications
- Session OTP expiration warnings
- System health monitoring

**Configuration:**
```env
ADMIN_CHAT_ID=123456789
ADMIN_BOT_TOKEN=123456:ABCDEF...
```

### Web Dashboard Controls
- Real-time pair status monitoring
- Bulk operations (pause/resume multiple pairs)
- Session health dashboard
- Activity log with filtering
- System statistics and performance metrics

## Data Synchronization

### Message ID Mapping
```json
{
  "discord_msg_id": "1234567890123456789",
  "telegram_msg_id": 987654321,
  "pair_id": 1,
  "created_at": "2025-06-30T14:49:42Z"
}
```

**Synchronization Events:**
- Message edits in source → update destination
- Message deletions in source → delete from destination
- Trap detection → delete from all platforms
- Admin actions → cross-platform consistency

### Configuration Management
**Pair Configuration:**
```json
{
  "name": "GBPUSD",
  "source_channel": "@vip_source_channel",
  "discord_webhook": "https://discord.com/api/webhooks/...",
  "destination_channel": "@client_channel",
  "bot_token": "123456:ABCDEF...",
  "session": "gold_session_1",
  "status": "active",
  "enable_ai": true,
  "trap_threshold": 3
}
```

**Session Configuration:**
```json
{
  "name": "gold_session_1",
  "phone": "+91xxxxxxxxxx",
  "session_file": "gold_session_1.session",
  "status": "active",
  "last_active": "2025-06-30T14:49:42Z"
}
```

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and HMR
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **TanStack Query** for API state management
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Neon Database** (serverless PostgreSQL)
- **Express Sessions** for authentication

### Python Services
- **Telethon** for Telegram userbot operations
- **discord.py** for Discord bot functionality
- **Pyrogram** for Telegram posting bots
- **OpenAI API** for content rewriting (optional)

### Infrastructure
- **WebSocket** connections for real-time updates
- **REST API** for dashboard operations
- **PostgreSQL** for persistent data storage
- **Environment variables** for configuration management

## Deployment Architecture

### Development Environment
- Vite dev server for frontend development
- tsx for TypeScript execution
- File watching for automatic restarts
- Hot module replacement for rapid iteration

### Production Considerations
- Frontend built to static files
- Backend bundled with ESBuild
- Database migrations via Drizzle Kit
- Environment-based configuration
- Health check endpoints for monitoring

## Security Considerations

### Authentication
- Telegram OTP verification for session creation
- Express session management for web dashboard
- Bot token rotation capabilities
- Admin chat ID verification

### Data Protection
- Encrypted session file storage
- Secure webhook URL management
- Rate limiting for API endpoints
- Input validation and sanitization

### Operational Security
- Automated trap detection and response
- Content filtering before forwarding
- Activity logging for audit trails
- Emergency stop mechanisms

This architecture provides a robust, scalable foundation for automated message forwarding while maintaining security and operational integrity across multiple platforms.