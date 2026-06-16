# CanteenPre — Food Pre-Order System

A canteen food pre-ordering platform built with **Next.js**, **React**, and **TypeScript**.

## Features

- **Menu Browsing & Pre-Ordering** — Browse categorized menu items and add them to cart
- **Cart & Order Management** — Review cart, set pickup time, and place pre-orders
- **Order Status Tracking** — Real-time order status with visual progress tracker
- **Admin Dashboard** — Overview of active orders, revenue, and recent activity
- **Revenue Reporting** — Category breakdown, top items, and daily revenue charts

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customer vs Admin

The app is split into two separate areas:

| Area | URL | Access |
|------|-----|--------|
| **Customer** | `/`, `/cart`, `/orders` | Public — no login required |
| **Admin** | `/admin/login` → `/admin` | Password-protected — staff only |

Default admin password: `admin123` (set `ADMIN_PASSWORD` in `.env` to change it).

Customers do **not** see any admin links in the navigation.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Menu browsing with category filters |
| `/cart` | Cart and checkout |
| `/orders` | Track orders by phone number |
| `/orders/[id]` | Order detail with live status tracker |
| `/admin/login` | Admin sign-in (separate from customer app) |
| `/admin` | Admin dashboard |
| `/admin/orders` | Manage and update order statuses |
| `/admin/menu` | Add, edit, and remove menu items |
| `/admin/revenue` | Revenue analytics and reports |

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- File-based JSON storage

## API Routes

- `GET/POST /api/menu` — List and create menu items
- `GET/PUT/DELETE /api/menu/[id]` — Manage individual items
- `GET/POST /api/orders` — List and create orders
- `GET/PATCH /api/orders/[id]` — View and update order status
- `GET /api/revenue` — Revenue statistics
