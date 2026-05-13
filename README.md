# Bedouin

> An authentic Saudi tourism platform connecting tourists with unique farm, desert, and cultural experiences across Saudi Arabia.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38BDF8?logo=tailwindcss)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)

---

## Overview

Bedouin is a full-stack tourism marketplace built for Saudi Arabia. It enables tourists to discover and book authentic local experiences — desert camps, farm stays, mountain cabins, glamping sites, and cultural properties — while giving property owners a complete hosting toolkit.

The platform supports three distinct participant types:

- **Tourists** — browse listings, make bookings, leave reviews, message hosts
- **Hosts** — apply to list properties, manage bookings, coordinate with co-hosts
- **Co-hosts** — service providers (cleaners, guides, photographers, etc.) who apply to support hosts and receive listing assignments

A built-in **admin panel** governs the approval pipeline for hosts, co-hosts, and listing submissions, ensuring quality control before anything goes live.

---

## Features

### Guest / Tourist
- Browse and filter listings by region, category, and search term
- Full listing detail pages with photo galleries, amenities, host profile, and guest reviews
- Availability-checked booking flow (multi-step: dates → guests → payment)
- Booking management dashboard (view, cancel, download confirmation)
- Post-stay review submission (one review per booking, enforced by RLS)
- Wishlist — save and manage favourite listings
- Direct messaging with hosts (thread-based, with listing/booking context)
- Message soft-delete with "no reply after" enforcement
- Conversation hide (per-user, reappears on new message)
- Support ticket system (raise issues, receive replies)

### Host
- Host application and onboarding flow (bio, languages, property types, region)
- Multi-step listing submission wizard with image upload
- Listing management — view all submissions and their review status
- Edit submitted listings (pending/approved)
- Listing cancellation request (goes through admin review)
- Host dashboard — grouped upcoming bookings, past bookings, per-listing guest views
- Bulk messaging guests (per listing or all guests via broadcast modal)
- Co-host marketplace — browse approved co-hosts, send invitations per listing
- Co-host assignment management (view active co-hosts, cancel invites, remove assignments)
- Booking cancellation (with configurable cancellation type and reason)

### Co-host / Service Provider
- Co-host application (services offered, property types, bio, fee model)
- Application edit and resubmission after approval or rejection
- Invitation inbox — accept or decline host invitations
- Active assignment dashboard with withdrawal request flow
- Self-service withdrawal (sent to host for approval)
- Co-host marketplace profile visible to hosts
- Messaging with assigned hosts

### Admin Panel
- Listing submission review queue (approve / reject with reason)
- Host application review queue
- Co-host application review queue
- Queue statistics dashboard
- Listing cancellation request review
- Support ticket management (reply, update status, close)

### Platform
- Role-based access control via Supabase Row Level Security (RLS)
- Dual-mode UI — users toggle between Tourist and Host modes
- Notification system (host and user activity feeds)
- Responsive design (mobile-first, full desktop layout)
- Image upload pipeline to Supabase Storage with client-side compression

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.1.6 (App Router, React Server Components) |
| **Language** | TypeScript 5 (strict mode) |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS v4 (CSS-native config via `@theme`) |
| **Animations** | Framer Motion 12 |
| **Charts** | Recharts 3 |
| **Icons** | Lucide React |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (email/password) + `@supabase/ssr` |
| **Storage** | Supabase Storage (listing images, avatars) |
| **State management** | React Context API (`AuthProvider`) + `useState` / `useTransition` |
| **Data fetching** | Next.js Server Components + Server Actions |
| **Fonts** | Google Fonts — Roboto (body), Poppins (display) |
| **Deployment** | Vercel (Next.js native, no custom config required) |
| **Dev tools** | ESLint (eslint-config-next), TypeScript compiler |

---

## Architecture

Bedouin follows the **Next.js App Router** architecture with a clear separation between server and client code:

```
Request
  └─► Next.js Server Component (fetches data via lib/services/)
        └─► Renders UI (React Server Component)
              └─► Client Components hydrate for interactivity
                    └─► Server Actions (lib/actions/) handle mutations
                          └─► Supabase (PostgreSQL + Auth + Storage)
```

**Key architectural decisions:**

- **Server Components by default** — pages fetch data server-side; client components are opt-in with `"use client"`.
- **Server Actions for mutations** — all form submissions and data writes go through typed server actions, not API routes (with 3 exceptions under `/api/host/listings/`).
- **Three Supabase clients** — browser client (anon key + cookie session), server client (SSR session), and admin client (service role, bypasses RLS) — each used in the appropriate context.
- **RLS as the security layer** — Row Level Security policies in PostgreSQL enforce all access rules; the application layer adds UX guards on top.
- **Denormalised snapshots** — `bookings` stores a snapshot of listing title, image, and location at time of booking to avoid cascade update issues.
- **Dual-status model** — every user can be both a guest and a host/co-host; `active_mode` controls which dashboard UI is shown.

---

## Project Structure

```
bedouin/
├── app/                          # Next.js App Router — all routes
│   ├── page.tsx                  # Home / landing page
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   ├── globals.css               # Tailwind v4 theme tokens, base styles
│   ├── account/                  # User profile & settings
│   ├── admin/                    # Admin panel (protected)
│   ├── api/
│   │   └── host/listings/        # REST API: listing submission endpoints
│   ├── booking/[id]/             # Booking confirmation page
│   ├── cohost/
│   │   ├── apply/                # Co-host application / edit form
│   │   └── invitations/          # Co-host invitation inbox
│   ├── dashboard/                # User bookings dashboard
│   ├── explore/                  # Browse & filter listings
│   ├── faq/                      # FAQ page
│   ├── host/
│   │   ├── listings/[id]/edit/   # Edit existing listing
│   │   ├── new/                  # Create new listing
│   │   └── onboarding/           # Host application form
│   ├── listing/[id]/             # Public listing detail page
│   ├── login/                    # Sign in
│   ├── messages/                 # Messaging inbox & threads
│   ├── provide-service/          # Co-host marketplace (browse co-hosts)
│   ├── signup/                   # Register
│   └── wishlist/                 # Saved listings
│
├── components/                   # React components
│   ├── admin/                    # Admin panel UI
│   ├── auth/                     # Login & signup forms
│   ├── booking/                  # Booking flow steps & confirmation
│   ├── cohost/                   # Co-host marketplace, invitations
│   ├── dashboard/                # Host & user dashboard sections
│   ├── explore/                  # Listing cards, search, filters
│   ├── home/                     # Landing page sections
│   ├── host/                     # Host onboarding, listing creation/edit
│   ├── layout/                   # Navbar, Footer
│   ├── listing/                  # Listing detail components & gallery
│   ├── messages/                 # Message thread & inbox UI
│   ├── notifications/            # Notification feed
│   ├── reviews/                  # Review form & display
│   ├── ui/                       # Reusable primitives (UserAvatar, badges…)
│   ├── user/                     # User profile, co-host section
│   └── wishlist/                 # Wishlist display
│
├── context/
│   └── AuthProvider.tsx          # Global auth state (user, session, mode)
│
├── lib/
│   ├── actions/                  # Server Actions (mutations)
│   │   ├── admin.ts              # Approve/reject hosts, co-hosts, submissions
│   │   ├── availability.ts       # Check listing availability
│   │   ├── booking.ts            # Create & cancel bookings
│   │   ├── cancellation.ts       # Listing cancellation requests
│   │   ├── cohost.ts             # Invite, respond, assign, withdraw
│   │   ├── listing.ts            # Submit, update, duplicate, remove listings
│   │   ├── messages.ts           # Send, delete, hide conversations
│   │   ├── profile.ts            # Update profile, apply as host/co-host
│   │   ├── reviews.ts            # Submit reviews
│   │   ├── support.ts            # Support tickets & replies
│   │   └── wishlist.ts           # Toggle saved listings
│   ├── services/                 # Read-only data fetching (server-side)
│   │   ├── admin.ts              # Submission & application queues
│   │   ├── bookings.ts           # User booking history
│   │   ├── cohost.ts             # Approved co-hosts, invitations, assignments
│   │   ├── host-dashboard.ts     # Host listings & bookings
│   │   ├── listing-detail.ts     # Single listing detail
│   │   ├── listings.ts           # Listing catalogue & search
│   │   ├── messages.ts           # Conversations & threads
│   │   ├── notifications.ts      # User & host notifications
│   │   ├── reviews.ts            # Listing reviews
│   │   ├── support.ts            # Support tickets
│   │   └── wishlist.ts           # Saved listings
│   ├── types/                    # TypeScript interfaces
│   ├── constants/
│   │   └── regions.ts            # 13 Saudi regions
│   ├── data/                     # Static reference data (amenities, labels)
│   ├── client/
│   │   └── upload-images.ts      # Client-side image upload to Supabase Storage
│   ├── supabase.ts               # Browser Supabase client
│   ├── supabase-server.ts        # Server Supabase client (SSR, cookie-based)
│   └── supabase-admin.ts         # Admin Supabase client (service role)
│
├── public/
│   └── logo.png                  # Bedouin circular logo
│
├── supabase/                     # SQL migration files (schema + RLS)
│   ├── 01_profiles.sql
│   ├── 02_listings.sql
│   ├── ...
│   └── 33_cohost_app_update_rls.sql
│
├── next.config.ts                # Next.js config (image remote patterns)
├── postcss.config.mjs            # Tailwind CSS v4 via @tailwindcss/postcss
├── tsconfig.json                 # TypeScript (strict, path alias @/*)
└── package.json
```

---

## Installation

### Prerequisites

- Node.js 18.17 or later
- npm / yarn / pnpm
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/bedouin.git
cd bedouin
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Find these values in your Supabase dashboard under **Project Settings → API**.

### 4. Set up the database

Run the SQL migration files in the `supabase/` directory against your Supabase project in order.

**Option A — Supabase Dashboard (SQL Editor):**
Copy and run each file from `01_profiles.sql` through `33_cohost_app_update_rls.sql` in sequence.

**Option B — Supabase CLI:**
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 5. Configure Supabase Storage

In your Supabase dashboard, create a storage bucket named `listing-images` and configure its RLS policy to allow authenticated uploads and public reads.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL. Exposed to the browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key. Used by browser and server clients. Respects RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role secret. Used only server-side (admin client). Bypasses all RLS. **Never expose to the browser.** |

> All three variables are required. The application will not function without them.

---

## Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Build for Production

```bash
npm run build
npm run start
```

Check for errors before building:

```bash
npx tsc --noEmit   # TypeScript type check
npm run lint       # ESLint
npm run build      # Production build
```

---

## Deployment

The project is configured for **Vercel**. No custom `vercel.json` is needed — Next.js is auto-detected.

### Deploy to Vercel

1. Push the repository to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Add the three environment variables in Vercel's project settings.
4. Vercel will build and deploy automatically on every push to `main`.

### Environment variables on Vercel

In **Project Settings → Environment Variables**, add:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   ← mark as Server-only
```

---

## API Documentation

Three REST API routes exist under `/api/host/listings/`. All other data operations use Server Actions.

### `GET /api/host/listings`
Returns all listing submissions for the authenticated host.

**Auth:** Required (session cookie)

**Response:**
```json
[
  {
    "id": "uuid",
    "reference": "BDN-XXXXXXXX",
    "title": "string",
    "status": "pending_review | approved | rejected | cancelled",
    "submitted_at": "ISO timestamp"
  }
]
```

---

### `POST /api/host/listings/submit`
Submits a new listing for admin review.

**Auth:** Required

**Request body:**
```json
{
  "title": "string",
  "category": "string",
  "region": "string",
  "location": "string",
  "description": "string",
  "price": 0,
  "price_unit": "night | week | month",
  "max_guests": 0,
  "bedrooms": 0,
  "beds": 0,
  "baths": 0,
  "min_nights": 0,
  "check_in_time": "string",
  "check_out_time": "string",
  "highlights": ["string"],
  "amenities": ["string"],
  "house_rules": ["string"],
  "image_urls": ["string"]
}
```

**Response:** `{ "reference": "BDN-XXXXXXXX", "id": "uuid" }`

---

### `GET /api/host/listings/[id]`
Returns a single listing submission by ID.

**Auth:** Required (must be the submission owner or admin)

**Response:** Full `listing_submissions` row.

---

## Authentication Flow

```
1. User submits email + password on /login or /signup
2. Supabase Auth creates or verifies the session and sets a secure HTTP-only cookie
3. @supabase/ssr reads the cookie on every server request
4. AuthProvider (context/AuthProvider.tsx) initialises on the client:
   - Calls supabase.auth.getSession() for initial state
   - Subscribes to onAuthStateChange for live updates
   - Fetches the user's profile row from the `profiles` table
   - Exposes: user, session, activeMode, isAdmin, hostStatus, cohostStatus
5. Server Actions validate the session independently via the server Supabase client
6. Admin actions additionally use createAdminClient() (service role) to bypass RLS
```

**Session persistence:** Managed automatically by `@supabase/ssr` via HTTP-only cookies.

**Sign out:** Calls `supabase.auth.signOut()` and clears the React context state.

---

## Database Schema Overview

The database contains **16 tables**:

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users` — stores role, mode, host/co-host status, avatar |
| `listings` | Live, public-facing property listings |
| `listing_details` | Extended detail data for a listing (1-to-1 with `listings`) |
| `listing_submissions` | Submission queue — listings awaiting admin review |
| `listing_cancellation_requests` | Host requests to take a listing offline |
| `bookings` | Guest reservations (denormalised snapshot of listing data at booking time) |
| `host_applications` | Host onboarding applications |
| `cohost_applications` | Co-host service provider applications |
| `cohost_invitations` | Host → co-host listing invitations |
| `cohost_assignments` | Active co-host assignments on a listing |
| `messages` | User-to-user messages with optional listing/booking context |
| `conversation_hides` | Per-user soft-hide of a conversation thread |
| `wishlists` | User-saved listing slugs |
| `reviews` | Post-stay guest reviews (one per booking, enforced by unique constraint) |
| `support_tickets` | User-raised help/issue tickets |
| `support_replies` | Threaded replies on support tickets (user + admin) |

**Key relationships:**

```
auth.users
  └─► profiles (1:1)
  └─► listings (1:many, as host)
  └─► bookings (1:many, as guest or host)
  └─► host_applications (1:1)
  └─► cohost_applications (1:1)

listings
  └─► listing_details (1:1)
  └─► listing_submissions (submission history)
  └─► bookings (1:many)
  └─► reviews (1:many)
  └─► cohost_invitations (1:many)
  └─► cohost_assignments (1:many)

cohost_invitations
  └─► cohost_assignments (1:1 on accept)
```

---

## User Roles

### `user` (default)
All registered accounts. Can switch between Tourist and Host modes independently of approval status.

### `admin`
Set directly in `profiles.role`. Has unrestricted read/write access via the `is_admin()` RLS function and the service-role Supabase client.

---

### Modes (`profiles.active_mode`)

| Mode | Access |
|---|---|
| `tourist` | Browse, book, review, message, wishlist, support tickets |
| `host` | All tourist access + listing management, host dashboard, co-host tools |

Mode switching is instant — no approval required.

---

### Application Statuses

**Host (`profiles.host_status`)**

| Status | Meaning |
|---|---|
| `null` | No application submitted |
| `pending` | Application under admin review |
| `approved` | Can create and manage listings |
| `rejected` | Can reapply with updated information |

**Co-host (`profiles.cohost_status`)**

| Status | Meaning |
|---|---|
| `null` | No application submitted |
| `pending` | Application under admin review |
| `approved` | Profile visible in co-host marketplace; can receive invitations |
| `rejected` | Can edit and resubmit application |

---

### Permission Summary (RLS)

| Resource | Anonymous | Authenticated | Host (approved) | Admin |
|---|---|---|---|---|
| `listings` (read) | ✓ | ✓ | ✓ | ✓ |
| `listings` (write) | — | — | — | ✓ |
| `listing_submissions` | — | Create/read own | Create/read own | Full |
| `bookings` | — | Read own (as guest) | Read own (as host) | Full |
| `host_applications` | — | Create/read own | Create/read own | Full |
| `cohost_applications` | — | Create/read own | — | Full |
| `cohost_invitations` | — | — | Send/cancel | Full |
| `messages` | — | Read/write own | Read/write own | Full |
| `wishlists` | — | Manage own | Manage own | — |
| `reviews` (read) | ✓ | ✓ | ✓ | ✓ |
| `reviews` (write) | — | One per booking | — | — |
| `support_tickets` | — | Create/read own | Create/read own | Full |

---

## Screenshots

> _Add screenshots to `/public/screenshots/` and update the paths below._

| Page | Description |
|---|---|
| `screenshots/home.png` | Landing page with hero, destinations, and deals |
| `screenshots/explore.png` | Listing search and filter interface |
| `screenshots/listing.png` | Listing detail with gallery and booking panel |
| `screenshots/dashboard.png` | Host booking dashboard |
| `screenshots/cohost.png` | Co-host marketplace browse page |
| `screenshots/admin.png` | Admin submission review queue |
| `screenshots/messages.png` | Messaging inbox and thread view |

---

## Troubleshooting

**`Error: NEXT_PUBLIC_SUPABASE_URL is not defined`**
Ensure `.env.local` exists in the project root with all three required variables. Restart the dev server after editing environment files.

**Auth session not persisting between page refreshes**
Confirm `@supabase/ssr` is at `^0.9.0`. Verify the server client in `lib/supabase-server.ts` uses `cookies()` from `next/headers`. In your Supabase project, ensure **Site URL** and **Redirect URLs** include `http://localhost:3000`.

**Images not loading from Supabase Storage**
Verify the storage bucket name in `lib/client/upload-images.ts` matches your Supabase bucket. Confirm the bucket has a public read policy or that requests include a valid session token.

**Database queries returning empty arrays**
Run the SQL migration files in order (01 → 33). Some tables have foreign key dependencies on earlier tables. Confirm RLS is enabled on each table and that the correct `SELECT` policies exist for the anon role.

**TypeScript errors after pulling changes**
```bash
npm install
npx tsc --noEmit
```

**Build fails with `Module not found`**
All imports must use the `@/` path alias (maps to the project root). Check `tsconfig.json → compilerOptions.paths` for the alias definition.

---

## Contributing

1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make changes. TypeScript strict mode is enforced — verify before committing:
   ```bash
   npx tsc --noEmit
   npm run lint
   ```
3. Write clear, scoped commit messages.
4. Open a pull request against `main` with a description of what changed and why.

> There is no automated test suite. Manual testing against a local or staging Supabase instance is the expected workflow.

---

## License

This project is currently **unlicensed** — all rights reserved.

> This is a graduation project. License terms need confirmation before open-sourcing.
