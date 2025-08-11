# RentFlow - Rental Management System

## Overview

RentFlow is a comprehensive rental management platform that provides both admin dashboard capabilities and customer portal functionality. The system handles the complete rental lifecycle including product catalog management, booking workflows, payment processing via Stripe, and order tracking. It's built as a full-stack TypeScript application with a React frontend and Express backend, designed to streamline rental operations for businesses while providing an intuitive customer experience.

**Recent Enhancements (Jan 2025):**
- **Real-time Availability System**: Live product availability updates every 30 seconds
- **Quick Rent Widget**: Instant booking from catalog with date selection and pricing
- **Enhanced User Experience**: Modern hero sections, live status badges, and hover interactions
- **Complete Billing System**: Automated email confirmations, rental tickets, and payment receipts
- **4-Digit OTP Verification**: Two-factor authentication for login and signup sessions with enhanced email notifications
- **Email Notification System**: Beautiful console-based email notifications with clear OTP delivery (no external APIs required)
- **Mobile App Companion**: Push notification system for real-time user engagement with device management and notification history
- **Stripe Integration Removed**: Simplified payment system without external processors

## User Preferences

Preferred communication style: Simple, everyday language.
Latest request: Make rental shop user-friendly and easy to rent anything with real-time updates and live features.

## System Architecture

### Frontend Architecture
The client-side application is built with React and TypeScript, utilizing a component-based architecture with the following key patterns:

- **UI Component Library**: Uses shadcn/ui with Radix UI primitives for a consistent design system
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **State Management**: TanStack Query for server state management with custom query client configuration
- **Routing**: Wouter for lightweight client-side routing with role-based access control
- **Forms**: React Hook Form with Zod validation schemas for type-safe form handling
- **Layout System**: Separate layout components for admin and customer interfaces

### Backend Architecture
The server follows a clean Express.js architecture with the following structure:

- **API Layer**: RESTful endpoints organized in a centralized routes module
- **Data Access**: Storage abstraction layer implementing a repository pattern
- **Database**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Replit Auth integration with session-based authentication
- **Payment Processing**: Stripe integration for handling payment workflows

### Database Design
Uses PostgreSQL with Drizzle ORM featuring:

- **Schema Definition**: Centralized schema with proper relationships and constraints
- **Type Safety**: Full TypeScript integration with inferred types from schema
- **Enums**: PostgreSQL enums for order status, payment status, and user roles
- **Session Storage**: Dedicated sessions table for authentication persistence

### Authentication & Authorization
Implements Replit Auth with the following features:

- **OIDC Integration**: OpenID Connect flow for secure authentication
- **Session Management**: PostgreSQL-backed session storage with TTL
- **Role-Based Access**: Admin and customer role separation with protected routes
- **Middleware**: Authentication middleware for API endpoint protection

### Mobile App Companion
Push notification system provides:

- **Device Registration**: Multi-platform support (iOS, Android, Web) with device token management
- **Real-time Notifications**: Push notifications for OTP verification, booking confirmations, payment reminders, and order updates
- **Notification History**: Persistent storage and retrieval of notification history with read/unread status
- **Admin Integration**: Testing tools and device management through admin dashboard
- **Seamless Integration**: Automatic push notifications alongside existing email notifications

### Development Tooling
The project uses modern development practices:

- **Build System**: Vite for fast development and optimized production builds
- **TypeScript**: Strict type checking across the entire codebase
- **Path Aliases**: Configured aliases for clean imports (@/, @shared/)
- **Hot Reload**: Development server with HMR support
- **Error Handling**: Runtime error overlays and comprehensive error boundaries

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with modern hooks and concurrent features
- **Express.js**: Backend web framework with middleware support
- **TypeScript**: Type system for both frontend and backend code

### Database & ORM
- **PostgreSQL**: Primary database via Neon serverless
- **Drizzle ORM**: Type-safe database toolkit with schema management
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI primitives for accessible components
- **shadcn/ui**: Pre-built component library built on Radix
- **Lucide React**: Icon library for consistent iconography

### State Management & Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form library with validation support
- **Zod**: Schema validation for runtime type checking

### Authentication & Payments
- **Replit Auth**: Authentication service with OIDC support
- **Stripe**: Payment processing platform with React components
- **Passport.js**: Authentication middleware for Express

### Development & Build Tools
- **Vite**: Build tool and development server
- **ESBuild**: Fast bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration