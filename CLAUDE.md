# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vadivelu Cars — a multi-app monorepo for an automotive service center management system. Includes admin dashboard, customer portal, marketing landing page, and a serverless API backend, all deployed on Cloudflare.

## Repository Structure

| Directory | Purpose | Framework | Port |
|-----------|---------|-----------|------|
| `admin-app/` | Admin dashboard (invoices, customers, vehicles, reports) | React 18 + Vite 7 + TypeScript | 5176 |
| `customer-app/` | Customer-facing portal (service tracking, invoices) | React 18 + Vite 5 + TypeScript | 3001 |
| `frontend/` | Unified app with landing page + admin + customer dashboards | React 18 + Vite 7 + TypeScript | 5173 |
| `landingpage/` | Standalone marketing site with 3D car visuals | React 18 + Vite 7 + Three.js | 5173 |
| `workers/` | Serverless API backend | Hono + Cloudflare Workers + TypeScript | 8787 |
| `vadivelucars/` | Legacy static HTML site (not actively developed) | Static HTML | — |

## Common Commands

Each app uses **npm** as the package manager. Run commands from within each app directory.

### Frontend Apps (admin-app, customer-app, frontend, landingpage)
```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # tsc -b && vite build
npm run preview    # Preview production build
```

### Workers (API Backend)
```bash
npm install        # Install dependencies
wrangler dev       # Start local dev server on port 8787
wrangler deploy    # Deploy to Cloudflare Workers
npm run build      # tsc type-check only
```

### Deployment (admin-app, customer-app)
```bash
npm run deploy:preview     # Deploy to Cloudflare Pages preview
npm run deploy:production  # Deploy to Cloudflare Pages production
```

## Architecture

### Backend API (`workers/`)
- **Framework**: Hono router on Cloudflare Workers
- **Database**: Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Entry point**: `workers/src/index.ts` — registers all route groups
- **Route files**: `workers/src/routes/*.ts` — each file exports a Hono app for a resource
- **Middleware chain**: CORS → Logger → Auth (skipped for auth endpoints)
- **Environment secrets** (set via `wrangler secret put`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `CUSTOMER_JWT_SECRET`, `DEV`

### Authentication (Dual System)
- **Admin auth**: Firebase (UI) + backend JWT (HS256). Token in `sessionStorage['token']` (fallback `localStorage`).
- **Customer auth**: Phone + vehicle number verification → backend JWT. Token in `localStorage['customerToken']`.
- **Middleware** (`workers/src/middleware/`): Separate middleware for admin routes, customer routes (`/api/customer/*`), and shared routes (`/api/invoices/:id/print`).

### Frontend Patterns (shared across React apps)
- **Path alias**: `@` → `./src` (configured in vite.config.ts and tsconfig)
- **API client**: Each app has `src/lib/api.ts` with a class that auto-attaches auth tokens and handles 401 redirects
- **State**: Zustand for client state, TanStack Query for server state
- **UI**: Radix UI primitives + Tailwind CSS + Lucide icons
- **Component library**: Reusable components in `src/components/ui/` (shadcn/ui pattern)

### Environment Variables
Frontend apps use `VITE_` prefix. Key variables:
- `VITE_API_URL` — backend API URL (`http://localhost:8787` in dev)
- `VITE_FIREBASE_*` — Firebase config (admin-app, frontend)
- `.env.example` files exist in admin-app, customer-app, frontend, landingpage

### Database
- Schema defined in `/schema.sql`
- Key tables: `users`, `user_sessions`, `customers`, `customer_sessions`, `vehicles`, `invoices`, `parts`, `car_models`, `customer_feedback`, `audit_logs`
- UUIDs for primary keys, JSONB for flexible fields (permissions, line items)

### Deployment
- **Frontend apps**: Cloudflare Pages (static, build output: `dist/`)
- **Backend**: Cloudflare Workers (wrangler.toml in `workers/`)
- Worker name: `vadivelucars`, compatibility date: `2024-09-23`
