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
2. **Session Control**: Manage multiple Telegram userbot sessions
3. **Content Filtering**: AI-powered content moderation with blocklist management
4. **Live Monitoring**: Real-time activity feed and system statistics
5. **Admin Controls**: Bulk operations for pausing/resuming pairs

### Data Storage Strategy
- **In-Memory Storage**: Development implementation using Map-based storage
- **PostgreSQL**: Production database with Drizzle migrations
- **Session Store**: PostgreSQL-backed session storage using connect-pg-simple

## Data Flow

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

## Changelog

Changelog:
- June 30, 2025. Initial setup