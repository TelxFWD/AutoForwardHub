# AutoForwardX Dashboard - System Architecture

## Overview

AutoForwardX Dashboard is a web-based admin interface for managing automated message forwarding between Telegram and Discord platforms. The system follows a full-stack architecture with a React frontend, Express.js backend, and PostgreSQL database using Drizzle ORM for data management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite for development and build processes
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints with JSON responses
- **Session Management**: Express sessions with PostgreSQL storage

## Key Components

### Database Schema
The system uses five main entities:
- **Users**: Authentication and authorization management
- **Pairs**: Configuration for Telegram ↔ Discord ↔ Telegram routing
- **Sessions**: Telegram userbot session management
- **Blocklists**: Content filtering rules (words, image hashes, trap patterns)
- **Activities**: System activity logging and audit trail
- **Message Mappings**: Cross-platform message relationship tracking
- **System Stats**: Real-time performance metrics

### Core Features
1. **Pair Management**: Create and configure forwarding routes between platforms
2. **Session Control**: Manage multiple Telegram userbot sessions with OTP authentication
3. **Content Filtering**: AI-powered content moderation with global and per-pair blocklists
4. **Trap Detection**: Automated detection of text patterns, image hashes, and edit-based traps
5. **Live Monitoring**: Real-time activity feed and system statistics
6. **Admin Controls**: Telegram bot with inline controls for pause/resume operations
7. **Message Mapping**: Cross-platform message synchronization and edit tracking

### Data Storage Strategy
- **In-Memory Storage**: Development implementation using Map-based storage
- **PostgreSQL**: Production database with Drizzle migrations
- **Session Store**: PostgreSQL-backed session storage using connect-pg-simple

## System Message Flow

### End-to-End Message Lifecycle
1. **Telegram Reader (Telethon)**: Userbot sessions read messages from source channels
2. **Discord Webhook**: Messages posted to designated Discord channels
3. **Discord Bot (discord.py)**: Monitors webhook channels for:
   - AI rewriting using GPT or local models
   - Trap detection (text patterns, image hashes, edit frequency)
   - Message edit/delete tracking via ID mapping
4. **Telegram Poster Bot**: Cleaned messages sent to destination channels
5. **Admin Bot**: Notifications sent for trap detection and auto-pause events
6. **Message Mapping**: Cross-platform synchronization stored in message_map.json

### Trap Detection System
- **Text Traps**: Patterns like `/ *`, `1`, `leak`, `trap`
- **Image Traps**: MD5 hash comparison and OCR analysis
- **Edit Traps**: Messages edited 3+ times trigger alerts
- **Auto-Pause**: Pairs automatically paused for 2-3 minutes after threshold exceeded
- **Recovery**: Automatic resume after cooldown period

### Session Management
- **OTP Authentication**: Telethon sessions created via phone verification
- **Load Balancing**: Multiple session files per account for rate distribution
- **Status Monitoring**: Active/inactive session tracking in dashboard
- **File Storage**: Session files stored as `.session` format

### Blocklist Architecture
- **Global Scope**: Applied to all pairs system-wide
- **Per-Pair Scope**: Specific filtering rules for individual forwarding routes
- **Runtime Merging**: Combined filtering using both global and pair-specific rules
- **Content Types**: Text patterns, image hashes, trap detection rules

## Dashboard Data Flow

1. **Frontend → Backend**: React components make API calls using TanStack Query
2. **Backend → Database**: Express routes interact with Drizzle ORM
3. **Real-time Updates**: Polling-based updates every 30 seconds for live data
4. **Form Validation**: Client-side validation with Zod schemas, server-side validation for security

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Class Variance Authority**: Type-safe component variants

### Backend Dependencies
- **Drizzle ORM**: Type-safe database operations
- **Zod**: Schema validation for API endpoints
- **Express**: Web application framework
- **Neon Database**: Serverless PostgreSQL provider

### Development Tools
- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend
- **tsx**: TypeScript execution for backend development
- **File Watching**: Automatic server restart on changes

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend assets

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Push Command**: Direct schema synchronization for development
- **Environment**: DATABASE_URL environment variable for connection

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **June 30, 2025**: Complete AutoForwardX system implementation finished
  - All 7 core components implemented according to design specifications
  - Enhanced Telegram reader with comprehensive trap detection and AI processing
  - Discord bot with message mapping, edit tracking, and cross-platform synchronization
  - Telegram admin bot with inline controls for real-time management
  - Advanced web dashboard with tabbed interface and session controls
  - Trap detection system with global and pair-specific blocklists
  - Production-ready configuration management and error handling
  - Comprehensive README documentation with setup instructions
- **June 30, 2025**: Advanced dashboard features implemented
  - Session controls component for managing userbot sessions
  - Trap detection interface with blocking rules management
  - Tabbed navigation with Overview, Sessions, Trap Detection, and Monitoring
  - Real-time status monitoring with auto-refresh capabilities
  - Enhanced UI components with proper TypeScript integration
- **June 30, 2025**: Python components with full AutoForwardX functionality
  - Enhanced Telegram reader with multi-session support and trap detection
  - Discord bot with message mapping and edit synchronization
  - Admin bot with inline keyboard controls and image blocking
  - Configuration management system with JSON file handling
  - Cross-platform message flow with formatting preservation
- **June 30, 2025**: Project successfully migrated from Replit Agent to standard Replit environment
  - Resolved database connection issues by implementing in-memory storage for development
  - Fixed TypeScript compilation errors in storage implementation
  - All API endpoints now responding correctly with sample data
  - Dashboard fully functional with real-time updates
  - Project runs cleanly without external dependencies

## User Preferences

- **Communication Style**: Simple, everyday language for non-technical users
- **Documentation**: Technical and developer-friendly with clear markdown structure
- **UI Design**: Professional dashboard with blue primary color scheme
- **Architecture**: Full-stack TypeScript with React frontend and Express backend