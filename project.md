# Frame (Atelier Frame) — Architecture & Product Specification

Frame is a high-precision, photo-first editorial mobile application built for visual artists, photographers, and creative communities.

---

## 1. Technical Stack

- **Framework**: React Native + Expo SDK 52+ + TypeScript
- **Routing & Navigation**: Expo Router (v4, file-based routing)
- **Backend & Database**: Supabase (PostgreSQL 15+, Row-Level Security, Auth, Storage, Realtime)
- **Edge Logic**: Supabase Edge Functions (Deno / TypeScript)
- **Media Delivery & Transformation**: Cloudinary (dynamic crops, responsive sizes, auto-format, quality optimization) + Supabase Storage (original uncompressed RAW/HEIC/JPEG archives)
- **Real-Time Engine**: Supabase Realtime channels (`presence`, `postgres_changes`, `broadcast`) for comments, room activity, story contributions, and unread badges
- **Direct Messaging**: Stream Chat SDK (React Native integration ready)
- **Push Notifications**: Expo Notifications
- **Observability**: PostHog (product analytics) + Sentry (crash reporting and performance)
- **Design System**: Atelier Frame design tokens (`#FFFFFF` Canvas, `#EAEAEA` Hairline, `#111111` Ink, `#E64B38` Venetian Coral accent, Inter typography, 8pt modular grid)

---

## 2. Information Architecture & App Routes

```
src/app/
├── _layout.tsx                 # Root layout & providers (Stack navigation)
├── index.tsx                   # Redirects root to (tabs)
├── (tabs)/
│   ├── _layout.tsx             # 5-slot bottom tab bar (49px, hairline top border)
│   ├── index.tsx               # Tab 1: Home Feed (Stories strip, Draft banner, Feed cards)
│   ├── rooms/index.tsx         # Tab 2: Discover Rooms (Category filter chips, Search, 16:9 cards)
│   ├── create/index.tsx        # Tab 3: Creation Studio Flow (Moment vs Story vs Challenge, RAW crop)
│   ├── challenges/index.tsx    # Tab 4: Challenge Hub (Active challenges, countdown badges, guidelines)
│   └── profile/index.tsx       # Tab 5: You / Profile (Elena Vance, gear list, metrics, portfolio grid)
├── room/[id].tsx               # Room Detail (Cover hero, verified badge, active challenge, room feed)
├── challenge/[id].tsx          # Challenge Detail (16:9 widescreen, guidelines, entries grid, submit CTA)
├── story/[id].tsx              # Collaborative Shared Story ("A Weekend in Ella", timeline, invite CTA)
├── process/[postId].tsx        # Post & Process Breakdown (Draggable RAW vs Final comparison slider, recipe)
└── activity/index.tsx          # Activity & Conversations (Invites with Accept/Decline, chat threads)
```

---

## 3. Database Schema (Supabase PostgreSQL)

Full schema and migration scripts are located at:
- `supabase/schema.sql` (Tables, Foreign Keys, Indexes, RLS Policies, Realtime Publications)
- `supabase/seed.sql` (Seed rooms, challenges, and photography records)
- `supabase/functions/process-image/index.ts` (Cloudinary transformation webhook)

### Core Tables:
1. `profiles`: User identity, handle, avatar, bio, gear list, quiet mode preferences.
2. `rooms`: Thematic communities (Street Photography, Home Cooking, Nordic Ceramics).
3. `room_members`: Membership relations and roles.
4. `posts`: Photo creations with aspect ratios, EXIF metadata, likes/comments counters.
5. `process_stages`: Step-by-step breakdown stages (RAW capture, Lightroom curves, Master grade).
6. `shared_stories`: Multi-contributor story containers.
7. `story_contributions`: Individual chronological contributions with timestamps and locations.
8. `challenges`: Community creative prompts with guidelines and countdown deadlines.
9. `challenge_submissions`: Submissions entered by creators.
10. `post_comments`: Real-time threaded commentary.
11. `post_likes` & `post_bookmarks`: User interactions.

---

## 4. Setup & Running Locally

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### 2. Start Expo Development Server
```bash
# Web preview
npm run web

# Mobile (iOS simulator or Android emulator / Expo Go)
npm run start
```
