# Deployment Guide

## Overview

This document provides comprehensive guidance for deploying the Inventory Requisition System to production and upgrading from the mock database to a real database solution.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Migration](#database-migration)
4. [Deployment Options](#deployment-options)
5. [Production Optimizations](#production-optimizations)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Upgrade Paths](#upgrade-paths)

## Prerequisites

### Required Software
- Node.js 18.x or higher
- pnpm 8.x or higher (or npm/yarn)
- Git for version control

### Optional (for production)
- Docker and Docker Compose
- PostgreSQL 14+ or MySQL 8+
- Redis for caching
- Nginx for reverse proxy

## Environment Configuration

### Environment Variables

Create a `.env.production` file with the following variables:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database (when migrating from mock)
DATABASE_URL=postgresql://user:password@localhost:5432/inventory_db
# or
DATABASE_URL=mysql://user:password@localhost:3306/inventory_db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
COOKIE_SECURE=true

# File Upload (future)
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp

# Email (future)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Webhook (future)
WEBHOOK_SECRET=your-webhook-secret

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

## Database Migration

### Step 1: Choose Your Database

The system currently uses a mock in-memory database. For production, choose one of:

1. **PostgreSQL** (Recommended for enterprise)
2. **MySQL** (Good for general use)
3. **Supabase** (Managed PostgreSQL with auth)
4. **PlanetScale** (Managed MySQL)

### Step 2: Install Database Client

#### For PostgreSQL with Prisma:

```bash
pnpm add @prisma/client
pnpm add -D prisma
```

Initialize Prisma:

```bash
npx prisma init
```

#### For MySQL with TypeORM:

```bash
pnpm add typeorm mysql2 reflect-metadata
```

### Step 3: Create Database Schema

#### Prisma Schema Example (`prisma/schema.prisma`):

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id          String        @id @default(cuid())
  email       String        @unique
  password    String
  name        String
  role        String        @default("user")
  department  String
  isActive    Boolean       @default(true)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  requisitions Requisition[]
}

model InventoryItem {
  id            String        @id @default(cuid())
  code          String        @unique
  name          String
  description   String?
  category      String
  unit          String
  currentStock  Int
  minimumStock  Int           @default(0)
  imageUrl      String?
  isActive      Boolean       @default(true)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  requisitionItems RequisitionItem[]
  stockAdjustments StockAdjustment[]
}

model Requisition {
  id              String        @id @default(cuid())
  documentNumber  String        @unique
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  status          String        @default("draft")
  notes           String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  approvedBy      String?
  approvedAt      DateTime?
  rejectionReason String?
  issuedAt        DateTime?
  items           RequisitionItem[]
}

model RequisitionItem {
  id              String        @id @default(cuid())
  requisitionId   String
  requisition     Requisition   @relation(fields: [requisitionId], references: [id], onDelete: Cascade)
  inventoryItemId String
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])
  quantity        Int
  unitPrice       Float?
  createdAt       DateTime      @default(now())
}

model StockAdjustment {
  id              String        @id @default(cuid())
  inventoryItemId String
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])
  type            String
  quantity        Int
  reason          String
  adjustedBy      String
  createdAt       DateTime      @default(now())
}

model Notice {
  id        String   @id @default(cuid())
  title     String
  content   String
  isActive  Boolean  @default(true)
  createdBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Step 4: Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Step 5: Update Database Service

Replace `lib/database/mock-database.ts` usage with Prisma client:

```typescript
// lib/database/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Step 6: Migrate Data

If you have existing mock data to migrate:

```bash
node scripts/migrate-mock-to-db.js
```

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

1. Install Vercel CLI:
```bash
pnpm add -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Configure environment variables in Vercel dashboard

### Option 2: Docker

1. Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g pnpm && pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

2. Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/inventory
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=inventory
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  postgres_data:
```

3. Deploy:
```bash
docker-compose up -d
```

### Option 3: Traditional VPS (Ubuntu)

1. Install Node.js and pnpm
2. Clone repository
3. Install dependencies: `pnpm install`
4. Build: `pnpm build`
5. Start with PM2:

```bash
pnpm add -g pm2
pm2 start npm --name "inventory-system" -- start
pm2 save
pm2 startup
```

## Production Optimizations

### 1. Enable Output Standalone

Update `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  // ... other config
};
```

### 2. Configure Caching

Add Redis for session and data caching:

```typescript
// lib/cache/redis.ts
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL,
});

client.connect();

export { client as redis };
```

### 3. Enable Compression

Install compression middleware:

```bash
pnpm add compression
```

### 4. Set Up CDN

Configure CDN for static assets:
- Cloudflare
- AWS CloudFront
- Vercel Edge Network (automatic)

### 5. Database Connection Pooling

```typescript
// For Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
});
```

## Monitoring and Maintenance

### 1. Error Tracking

Install Sentry:

```bash
pnpm add @sentry/nextjs
```

Configure in `sentry.client.config.ts` and `sentry.server.config.ts`

### 2. Performance Monitoring

Use Vercel Analytics or Google Analytics:

```bash
pnpm add @vercel/analytics
```

### 3. Logging

Implement structured logging:

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});
```

### 4. Health Checks

Create health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  const dbHealthy = await checkDatabaseHealth();
  
  return Response.json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
  });
}
```

### 5. Backup Strategy

Set up automated database backups:

```bash
# PostgreSQL backup script
pg_dump -U postgres inventory_db > backup_$(date +%Y%m%d).sql
```

## Upgrade Paths

### From Mock Database to PostgreSQL

1. Install Prisma and dependencies
2. Create schema based on mock database structure
3. Run migrations
4. Export mock data to JSON
5. Import JSON data to PostgreSQL
6. Update all API routes to use Prisma
7. Test thoroughly
8. Deploy

### Adding Authentication Provider

1. Install NextAuth.js:
```bash
pnpm add next-auth
```

2. Configure providers (Google, Azure AD, etc.)
3. Migrate JWT simulation to NextAuth
4. Update middleware

### Enabling PWA

1. Install next-pwa:
```bash
pnpm add next-pwa
```

2. Configure in `next.config.ts`
3. Add manifest.json (already created)
4. Register service worker
5. Test offline functionality

### Adding Real-time Features

1. Install Socket.io or Pusher
2. Create WebSocket server
3. Implement real-time notifications
4. Update UI for live updates

### Scaling Horizontally

1. Set up load balancer (Nginx/HAProxy)
2. Deploy multiple app instances
3. Use Redis for session sharing
4. Configure database read replicas
5. Implement caching strategy

## Security Checklist

- [ ] Change all default secrets and passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Enable CSRF protection
- [ ] Sanitize all user inputs
- [ ] Use prepared statements for database queries
- [ ] Enable security headers
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Performance Checklist

- [ ] Enable gzip/brotli compression
- [ ] Configure CDN for static assets
- [ ] Implement database indexing
- [ ] Enable query caching
- [ ] Optimize images
- [ ] Lazy load components
- [ ] Code splitting
- [ ] Monitor Core Web Vitals

## Support

For deployment issues or questions:
- Check Next.js documentation: https://nextjs.org/docs
- Review Prisma guides: https://www.prisma.io/docs
- Consult deployment platform docs (Vercel, AWS, etc.)
