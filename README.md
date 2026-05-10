# Texas Permit Tracker

A professional SaaS dashboard for Texas contractors to track building permits, monitor status, and manage expiration dates.

## Tech Stack

- **Frontend:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Database & Auth:** Supabase (PostgreSQL)

## Features

- Dashboard with active permits overview
- Manual permit logging with status tracking
- Expiration date countdown
- Notes section for city official interactions
- Status badges (Pending, Approved, Delayed)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Folder Structure

```
/app
  /dashboard          # Dashboard page
  /permits            # Permit-related pages
/components
  /ui                 # Reusable UI components
  /permits            # Permit-specific components
/lib
  /supabase           # Supabase client
  /utils              # Utility functions
/types                # TypeScript types
```