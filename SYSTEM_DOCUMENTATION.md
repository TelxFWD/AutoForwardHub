
# AutoForwardX Dashboard - Complete System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [File Structure & Components](#file-structure--components)
4. [Backend Logic](#backend-logic)
5. [Frontend Logic](#frontend-logic)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Configuration Files](#configuration-files)
9. [Development & Deployment](#development--deployment)

## System Overview

AutoForwardX Dashboard is a full-stack web application designed to manage automated message forwarding between Telegram and Discord platforms. The system provides an administrative interface for managing forwarding pairs, sessions, blocklists, and monitoring system activities.

### Core Features
- **Message Forwarding Management**: Configure Telegram ↔ Discord ↔ Telegram routing
- **Session Management**: Handle multiple Telegram userbot sessions
- **Content Filtering**: AI-powered moderation with customizable blocklists
- **Real-time Monitoring**: Live activity feeds and system statistics
- **Administrative Controls**: Bulk operations for system management

## Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Shadcn/ui + Radix UI + Tailwind CSS
- **State Management**: TanStack Query
- **Validation**: Zod schemas
- **Routing**: Wouter (client-side)

### System Flow
```
User Interface (React) → API Calls (TanStack Query) → Express Routes → Drizzle ORM → PostgreSQL Database
```

## File Structure & Components

### Root Directory Files

#### `.replit`
**Purpose**: Replit environment configuration
**Tasks**:
- Defines Node.js 20 and PostgreSQL modules
- Sets up port forwarding (5000 → 80)
- Configures deployment settings
- Defines workflow for running the application

#### `package.json`
**Purpose**: Project dependencies and scripts
**Key Scripts**:
- `dev`: Development server with hot reload
- `build`: Production build (frontend + backend)
- `start`: Production server
- `db:push`: Database schema synchronization

#### `components.json`
**Purpose**: Shadcn/ui configuration
**Tasks**:
- Defines UI component aliases
- Sets Tailwind configuration paths
- Configures component style preferences

#### `drizzle.config.ts`
**Purpose**: Database ORM configuration
**Tasks**:
- Defines database connection settings
- Configures schema and migration paths

#### `tailwind.config.ts`
**Purpose**: Tailwind CSS configuration
**Tasks**:
- Extends default theme with custom colors
- Defines CSS custom properties
- Configures animations and utilities

#### `tsconfig.json`
**Purpose**: TypeScript configuration
**Tasks**:
- Sets compilation options
- Defines path aliases for imports
- Configures module resolution

#### `vite.config.ts`
**Purpose**: Vite build tool configuration
**Tasks**:
- Configures React plugin
- Sets up development server
- Defines build optimization settings

### Backend Logic (`server/` directory)

#### `server/index.ts`
**Purpose**: Main server entry point
**Tasks**:
- Express app initialization
- Middleware setup (JSON parsing, logging)
- Request/response logging with performance metrics
- Error handling middleware
- Development/production environment handling
- Server startup on port 5000

**Key Features**:
- Automatic API request logging with timing
- JSON response capture for debugging
- Environment-specific static file serving

#### `server/routes.ts`
**Purpose**: API route definitions
**Tasks**:
- **Pairs Management**:
  - `GET /api/pairs` - Retrieve all forwarding pairs
  - `POST /api/pairs` - Create new forwarding pair
  - `PATCH /api/pairs/:id` - Update existing pair
  - `DELETE /api/pairs/:id` - Delete pair
- **Sessions Management**:
  - `GET /api/sessions` - Retrieve all sessions
  - `POST /api/sessions` - Create new session
  - `PATCH /api/sessions/:id` - Update session
- **Blocklists Management**:
  - `GET /api/blocklists` - Retrieve blocklists (with filtering)
  - `POST /api/blocklists` - Create blocklist entry
  - `DELETE /api/blocklists/:id` - Delete blocklist entry
- **Activities Tracking**:
  - `GET /api/activities` - Retrieve recent activities
  - `POST /api/activities` - Create activity log
- **System Statistics**:
  - `GET /api/stats` - Retrieve system statistics
- **Control Operations**:
  - `POST /api/control/pause-all` - Pause all active pairs
  - `POST /api/control/resume-all` - Resume all paused pairs

**Key Features**:
- Comprehensive error handling with appropriate HTTP status codes
- Zod schema validation for all POST/PATCH requests
- Automatic activity logging for major operations
- Bulk operations for system control

#### `server/storage.ts`
**Purpose**: Database operations and business logic
**Tasks**:
- **Database Connection**: PostgreSQL connection via Drizzle ORM
- **CRUD Operations**:
  - Pairs: Create, read, update, delete, bulk operations
  - Sessions: Full session lifecycle management
  - Blocklists: Filtering and management with global/pair-specific rules
  - Activities: Logging and retrieval with pagination
  - System Stats: Real-time statistics calculation
- **Business Logic**:
  - Message count tracking
  - Blocked message statistics
  - Session status management
  - Activity categorization and severity levels

**Key Features**:
- Type-safe database operations
- Automatic timestamp management
- Complex filtering and querying
- Statistics aggregation

#### `server/vite.ts`
**Purpose**: Development server integration
**Tasks**:
- Vite development server setup
- Hot module replacement configuration
- Static file serving for production
- Frontend/backend integration

### Frontend Logic (`client/` directory)

#### `client/src/main.tsx`
**Purpose**: React application entry point
**Tasks**:
- React DOM root creation
- App component mounting
- CSS imports

#### `client/src/App.tsx`
**Purpose**: Main application component
**Tasks**:
- Query client provider setup
- Routing configuration (Wouter)
- Global providers (Tooltip, Toast)
- Route definitions (Dashboard, 404)

#### `client/src/pages/dashboard.tsx`
**Purpose**: Main dashboard page
**Tasks**:
- Layout management with sidebar
- Component orchestration
- Data fetching coordination
- State management for dashboard view

#### `client/src/components/` Directory

##### Core Components

**`sidebar.tsx`**
- Navigation menu
- Active state management
- Responsive design

**`stats-cards.tsx`**
- System statistics display
- Real-time data visualization
- Performance metrics

**`pairs-table.tsx`**
- Forwarding pairs management
- CRUD operations interface
- Status indicators
- Bulk actions

**`session-status.tsx`**
- Session monitoring
- Connection status display
- Session management controls

**`activity-feed.tsx`**
- Real-time activity logging
- Severity-based filtering
- Timestamp formatting
- Activity categorization

**`blocklist-summary.tsx`**
- Content filtering overview
- Blocklist statistics
- Rule management interface

**`add-pair-modal.tsx`**
- Pair creation form
- Form validation
- Modal interface
- Success/error handling

##### UI Components (`client/src/components/ui/`)
All UI components are based on Radix UI primitives with custom styling:

- **Form Components**: `button.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`
- **Layout Components**: `card.tsx`, `dialog.tsx`, `sheet.tsx`, `tabs.tsx`
- **Navigation**: `dropdown-menu.tsx`, `context-menu.tsx`, `menubar.tsx`
- **Feedback**: `toast.tsx`, `alert.tsx`, `progress.tsx`
- **Data Display**: `table.tsx`, `badge.tsx`, `avatar.tsx`

#### `client/src/lib/` Directory

**`queryClient.ts`**
**Purpose**: TanStack Query configuration
**Tasks**:
- Query client setup
- Default query options
- Cache configuration
- Error handling defaults

**`utils.ts`**
**Purpose**: Utility functions
**Tasks**:
- Class name merging (clsx + tailwind-merge)
- Common helper functions
- Type guards and validators

#### `client/src/hooks/` Directory

**`use-mobile.tsx`**
**Purpose**: Responsive design hook
**Tasks**:
- Screen size detection
- Mobile/desktop state management
- Breakpoint monitoring

**`use-toast.ts`**
**Purpose**: Toast notification management
**Tasks**:
- Toast state management
- Success/error notifications
- Auto-dismiss functionality

### Shared Logic (`shared/` directory)

#### `shared/schema.ts`
**Purpose**: Database schema and validation
**Tasks**:
- **Database Tables**:
  - `users`: Authentication management
  - `pairs`: Forwarding pair configurations
  - `sessions`: Telegram session management
  - `blocklists`: Content filtering rules
  - `messageMappings`: Cross-platform message tracking
  - `activities`: System activity logging
  - `systemStats`: Performance metrics
- **Validation Schemas**: Zod schemas for API validation
- **TypeScript Types**: Inferred types for type safety
- **Insert Schemas**: Data transformation for database operations

**Key Features**:
- Full-stack type safety
- Automatic schema validation
- Database migration support
- Foreign key relationships

## Database Schema

### Core Tables

#### `users`
- **Purpose**: User authentication and authorization
- **Fields**: id, username, password
- **Relationships**: None (authentication table)

#### `pairs`
- **Purpose**: Message forwarding configuration
- **Fields**: id, name, sourceChannel, discordWebhook, destinationChannel, botToken, session, status, enableAI, messageCount, blockedCount, timestamps
- **Relationships**: Links to sessions, activities, blocklists

#### `sessions`
- **Purpose**: Telegram userbot session management
- **Fields**: id, name, phone, sessionFile, status, lastActive, createdAt
- **Relationships**: Used by pairs for authentication

#### `blocklists`
- **Purpose**: Content filtering rules
- **Fields**: id, type, value, pairId, isActive, createdAt
- **Types**: word, image_hash, trap_pattern
- **Scope**: Global (pairId = null) or pair-specific

#### `messageMappings`
- **Purpose**: Cross-platform message relationship tracking
- **Fields**: id, telegramMessageId, discordMessageId, destinationTelegramMessageId, pairId, status, createdAt
- **Status**: forwarded, blocked, error

#### `activities`
- **Purpose**: System activity and audit logging
- **Fields**: id, type, message, details, pairId, sessionId, severity, createdAt
- **Types**: message_forwarded, trap_detected, session_connected, pair_paused, etc.
- **Severity**: info, warning, error, success

#### `systemStats`
- **Purpose**: Real-time system performance metrics
- **Fields**: id, activePairs, totalMessages, blockedMessages, activeSessions, lastUpdated

## API Endpoints

### Pairs Management
- `GET /api/pairs` - List all forwarding pairs
- `POST /api/pairs` - Create new pair
- `PATCH /api/pairs/:id` - Update pair configuration
- `DELETE /api/pairs/:id` - Remove pair

### Sessions Management  
- `GET /api/sessions` - List all sessions
- `POST /api/sessions` - Add new session
- `PATCH /api/sessions/:id` - Update session

### Content Filtering
- `GET /api/blocklists` - Get blocklist entries (filterable by type/pair)
- `POST /api/blocklists` - Add blocklist entry
- `DELETE /api/blocklists/:id` - Remove blocklist entry

### Monitoring
- `GET /api/activities` - Recent activity feed
- `POST /api/activities` - Log new activity
- `GET /api/stats` - System statistics

### Control Operations
- `POST /api/control/pause-all` - Pause all active pairs
- `POST /api/control/resume-all` - Resume all paused pairs

## Configuration Files

### Environment Configuration
- **Development**: Uses `.env` file for database connection
- **Production**: Uses environment variables
- **Database**: `DATABASE_URL` for PostgreSQL connection

### Build Configuration
- **Frontend**: Vite builds to `dist/public`
- **Backend**: ESBuild bundles to `dist/index.js`
- **Assets**: Static files served from `dist/public`

## Development & Deployment

### Development Workflow
1. **Start Development**: `npm run dev`
   - Runs backend with tsx (TypeScript execution)
   - Starts Vite dev server with HMR
   - Watches for file changes
2. **Database Operations**: `npm run db:push`
   - Synchronizes schema changes
   - Updates database structure
3. **Type Checking**: `npm run check`
   - TypeScript compilation check
   - Type safety validation

### Production Deployment
1. **Build Process**: `npm run build`
   - Vite builds optimized frontend bundle
   - ESBuild creates backend bundle
   - Assets optimization and minification
2. **Production Server**: `npm run start`
   - Serves static files from Express
   - API routes on same port (5000)
   - Single-port deployment strategy

### Key Features
- **Hot Module Replacement**: Instant development feedback
- **Type Safety**: Full-stack TypeScript with shared schemas
- **Performance Monitoring**: Built-in request/response logging
- **Error Handling**: Comprehensive error boundaries and logging
- **Responsive Design**: Mobile-first UI with adaptive layouts
- **Real-time Updates**: Polling-based live data updates
- **Form Validation**: Client and server-side validation
- **Activity Logging**: Comprehensive audit trail
- **Bulk Operations**: Administrative control features

This system provides a robust, scalable solution for managing automated message forwarding with comprehensive monitoring, filtering, and administrative capabilities.
