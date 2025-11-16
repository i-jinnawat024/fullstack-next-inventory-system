# Project Structure - Inventory Requisition System

## Overview
This document outlines the project structure and foundation setup for the Inventory Requisition System built with Next.js 15, TypeScript, and Tailwind CSS.

## Technology Stack
- **Framework**: Next.js 16.0.3 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Package Manager**: pnpm

## Directory Structure

### App Directory (Next.js App Router)
```
app/
├── (auth)/                    # Authentication routes group
│   ├── login/                 # Login page
│   └── forgot-password/       # Password reset page
├── (dashboard)/               # Main application routes group
│   ├── inventory/             # Inventory listing page
│   ├── requisitions/
│   │   ├── create/            # Create new requisition
│   │   └── history/           # Requisition history
│   └── admin/                 # Admin-only routes
│       ├── approvals/         # Approval queue
│       ├── products/          # Product management
│       ├── stock-adjustments/ # Stock adjustments
│       ├── notices/           # Notice management
│       ├── import/            # Data import
│       └── reports/           # Reporting
├── api/                       # API routes
│   ├── auth/                  # Authentication endpoints
│   ├── inventory/             # Inventory management
│   ├── requisitions/          # Requisition operations
│   ├── stock-adjustments/     # Stock adjustment operations
│   ├── notices/               # Notice management
│   ├── import/                # Data import endpoints
│   └── reports/               # Reporting endpoints
├── globals.css                # Global styles with theme variables
├── layout.tsx                 # Root layout
└── page.tsx                   # Home page
```

### Components Directory
```
components/
├── ui/                        # Reusable UI components
├── forms/                     # Form-specific components
├── tables/                    # Table and data display components
└── layout/                    # Layout components (header, sidebar, etc.)
```

### Library Directory
```
lib/
├── auth/                      # Authentication utilities
├── database/                  # Mock database implementation
├── utils/                     # General utility functions
├── types/                     # TypeScript type definitions
├── constants/                 # Application constants
└── config/                    # Configuration files
```

## Key Features Implemented

### 1. Theme System
- **CSS Variables**: Comprehensive theme system with light/dark mode support
- **Color Palette**: Primary, background, text, surface, border, and status colors
- **Transitions**: Smooth theme switching with configurable transition speeds
- **Utility Classes**: Pre-defined CSS classes for common theme colors

### 2. TypeScript Configuration
- **Data Models**: Complete type definitions for all entities
  - User, InventoryItem, Requisition, StockAdjustment, Notice
- **API Types**: Request/response interfaces and error handling
- **Form Types**: Type-safe form interfaces
- **Utility Types**: Generic types for CRUD operations

### 3. Thai Localization
- **Language Constants**: Comprehensive Thai labels for all UI elements
- **Date Formatting**: Thai date format (DD/MM/YYYY) utilities
- **Validation Messages**: Thai error messages and validation feedback
- **Number Formatting**: Thai locale number and currency formatting

### 4. Utility Functions
- **Validation**: Email, password, required fields, stock quantity validation
- **Formatting**: Date, time, number, and currency formatting for Thai locale
- **Configuration**: Centralized app configuration with environment support

## Configuration Files

### Theme Variables (globals.css)
- Light and dark theme color schemes
- CSS custom properties for consistent theming
- Smooth transitions and hover effects
- Custom scrollbar styling

### Application Config (lib/config/app.ts)
- API configuration
- Authentication settings
- Pagination defaults
- File upload limits
- Theme preferences
- Validation rules

### Thai Labels (lib/constants/thai-labels.ts)
- Complete Thai translation for all UI text
- Navigation labels
- Form field labels
- Status indicators
- Validation messages

## Next Steps
The foundation is now ready for implementing the specific features:
1. Authentication system and middleware
2. Core UI components and layout
3. Mock database implementation
4. Inventory management features
5. Requisition workflow
6. Admin approval system
7. Reporting and analytics

## Build Status
✅ TypeScript compilation successful
✅ Next.js build successful
✅ All type definitions properly configured
✅ Theme system implemented
✅ Project structure established