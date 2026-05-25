# MasSync — Product Requirements Document

> A private two-person app that keeps two best friends synced, connected, and growing together.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Pairing System](#3-pairing-system)
4. [Design Language](#4-design-language)
5. [Pages & Features](#5-pages--features)
   - 5.1 [Home](#51-home)
   - 5.2 [Tasks](#52-tasks)
   - 5.3 [Memories](#53-memories)
   - 5.4 [Music & Radio](#54-music--radio)
   - 5.5 [Islamic Corner](#55-islamic-corner)
   - 5.6 [Hobbies & Learning](#56-hobbies--learning)
   - 5.7 [Entertainment](#57-entertainment)
6. [Notifications](#6-notifications)
7. [Data Models](#7-data-models)
8. [API References](#8-api-references)
9. [Open Questions](#9-open-questions)

---

## 1. Product Overview

**MasSync** is a private, invite-only app built for exactly two people — you and your best friend. Everything inside the app is shared between the pair. There are no feeds, no public profiles, no strangers. The whole experience is designed to strengthen one specific relationship through shared routines, memories, music, faith, hobbies, and fun.

### Core philosophy

- **Private by default** — the pair bubble is sacred. No one else sees anything.
- **Soft & warm UI** — inspired by the friendship app design language: sky blue backgrounds, white floating cards, teal/cyan accent labels, emoji-forward, rounded and inviting.
- **Low friction** — everything should feel like a good daily habit, not a chore.
- **Meaningful over noisy** — every feature is intentional. No endless scrolling.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Mobile | React Native (Expo recommended) |
| Web | React (Vite) |
| Backend | Supabase (auth, database, storage, realtime) |
| State management | Zustand or React Context |
| Realtime | Supabase Realtime (presence + live updates) |
| Push notifications | Expo Notifications (mobile) / Web Push (web) |
| Media storage | Supabase Storage buckets |
| Styling | NativeWind (mobile) / Tailwind CSS (web) |

---

## 3. Pairing System

The pairing system is the foundation of MasSync. Every user belongs to exactly one pair.

### How it works

1. **User A** signs up and is assigned a unique 6-character invite code (e.g. `MAS-7K2P`).
2. **User B** signs up and enters User A's code (or vice versa).
3. The pair is created in the database and both users are linked permanently.
4. All app data (tasks, memories, music, etc.) is scoped to the `pair_id`.
5. A user cannot join a second pair. If they want to reset, both must agree and all data is cleared.

### Pair states

- `pending` — one user has signed up, waiting for the other to connect
- `active` — both users are linked, full access
- `paused` — optional future feature (freeze without deleting)

---

## 4. Design Language

Based on the provided UI inspiration (warm friendship app aesthetic):

### Colors

| Role | Value |
|---|---|
| Background | Sky blue `#29B6F6` (screen bg) |
| Surface / cards | White `#FFFFFF` |
| Primary accent | Teal / cyan `#00BCD4` |
| Secondary accent | Purple `#A855F7` (FABs, highlights) |
| Badge / new | Amber `#F59E0B` |
| Online indicator | Green `#22C55E` |
| Text primary | Dark gray `#1A1A2E` |
| Text secondary | Medium gray `#6B7280` |

### Typography

- Headings: bold, large, personal (e.g. "Mariam, 24" style)
- Interest/section labels: teal, semi-bold
- Body: 14–15px, readable, relaxed
- All pill tags: rounded-full, outlined or filled with accent color

### Components

- **Profile avatar** — circular photo with online dot
- **Pill tags** — rounded interest/task chips
- **Float cards** — white rounded cards with subtle shadow on blue bg
- **FAB** — large purple/teal circle "+" button
- **Widget** — home screen card showing both users side by side

---

## 5. Pages & Features

---

### 5.1 Home

The landing page of the app. It should feel warm and alive — like opening a window into the friendship.

#### Hero widget — "Us"

A full-width card at the top showing both friends side by side:

```
┌─────────────────────────────────┐
│  [Photo]  You        Her [Photo]│
│  Online ●            Last seen  │
│           📍 Cairo, Egypt        │
└─────────────────────────────────┘
```

- **Photos**: each user's profile picture
- **Online / last seen**: powered by Supabase Realtime presence
- **Location**: optional — user can share current city (not precise GPS). Updated manually or on app open.
- **Friendship duration**: small label like "Friends for 2 years 🌙"

#### Today's snapshot — quick widgets below the hero

- ☑ Tasks today: "3 tasks, 1 done"
- 🎵 Song of the day
- 📅 Next outing: "Coffee next Friday"
- 🤲 Athkar reminder
- 🌱 Current hobby: "Learning calligraphy — day 4"

Each widget is tappable and navigates to the corresponding page.

---

### 5.2 Tasks

A shared daily task list. Both users can see and check off tasks. Tasks are customized by either person.

#### Features

- **Task list view**: shows all tasks for today, with who created each one
- **Check off**: either user can mark a task as done — the other sees it update in real time
- **Task categories**:
  - Personal (only visible to you)
  - Shared (visible to both)
- **Recurring tasks**: daily, weekly, or custom
- **Task editor page**: a separate settings-style page where you add/edit/delete tasks and set recurrence
- **Streak counter**: "You've completed your shared tasks 5 days in a row 🔥"

#### Task object fields

```
id, pair_id, created_by, title, category (personal/shared),
recurrence (none/daily/weekly), is_done, done_by, done_at, date
```

---

### 5.3 Memories

A shared scrapbook and planner. This is the emotional heart of the app.

#### Sub-sections

**Calendar view**
- Monthly calendar showing tagged days (memory days, upcoming plans)
- Tap a date to see or add content for that day
- Color coding: past memories (teal), upcoming plans (amber), special days (purple)

**Memory cards**
- Add a memory to any past date
- Each memory card can include:
  - 📸 Photos (up to 10, stored in Supabase Storage)
  - 📝 A short note / caption
  - 🏷️ Tags (e.g. "café day", "birthday", "random")
  - 😊 Mood emoji
- Both users can add to the same memory card

**Next outing planner**
- Schedule a future hangout from the calendar
- Fields: date, time, place name, vibe (chill / adventure / food / etc.)
- Shows a countdown: "Next outing in 5 days ☕"
- After the date passes it automatically moves to Memories

**On this day**
- A small widget showing memories from the same date in past years (like Google Photos "memories")

---

### 5.4 Music & Radio

A shared music space celebrating what you both love to listen to.

#### Song of the day

- Either friend gifts the other a song each day
- Fields: song title, artist, a short message ("this reminded me of you 🌸")
- Displayed on the Home page widget
- **History feed**: a scrollable log of all past gifted songs, showing who sent it and when
- Both users have a history log — "Songs she gave you" / "Songs you gave her"

#### Radio

- Powered by the **Radio Browser API** (`https://de1.api.radio-browser.info`)
- Users can browse and search radio stations
- A shared "Our Stations" favorites list — both can add/remove stations
- Now playing card showing station name, genre, country
- Stream audio using React Native's `expo-av` (mobile) or the HTML `<audio>` element (web)

#### Radio API usage

```
GET https://de1.api.radio-browser.info/json/stations/search
  ?name=quran
  &limit=20
  &hidebroken=true
```

Relevant fields: `name`, `url_resolved`, `country`, `tags`, `favicon`, `votes`

---

### 5.5 Islamic Corner

A dedicated space for faith — shared routines, Quran, and remembrance.

#### Prayer tracker

- Daily 5 prayers: Fajr, Dhuhr, Asr, Maghrib, Isha
- Each user marks their own prayers
- Both can see each other's prayer completion for the day (encouraging, not judging)
- Prayer times fetched from **Aladhan API** based on user's city

```
GET https://api.aladhan.com/v1/timingsByCity
  ?city=Amman&country=Jordan&method=4
```

#### Athkar

- Morning athkar (أذكار الصباح) — recommended after Fajr
- Evening athkar (أذكار المساء) — recommended after Asr
- Each thikr shows the Arabic text, transliteration, translation, and repeat count
- User taps to count — counter resets daily
- Source: static JSON data (curated from authentic sources) or Aladhan athkar endpoint

#### Quran

- Powered by **Quran.com API** (`https://api.quran.com/api/v4`)
- **Verse of the day**: random or sequential ayah shown daily, shared between both users
- **Reading tracker**: each user can log which surah/page they're on
- **Shared khatma tracker**: if both are doing a Quran khatma together, track combined progress
- Simple surah browser

```
GET https://api.quran.com/api/v4/verses/by_chapter/{chapter_number}
  ?translations=131&audio=7&per_page=10
```

#### Islamic task checklist

Beyond prayers, optional daily habits:
- Read Quran (with page count)
- Give sadaqah
- Fast (on optional days)
- Dhikr count goal

---

### 5.6 Hobbies & Learning

A space to grow together — learn something new as a pair.

#### Features

- **Active hobby card**: shows the current shared hobby (e.g. "Arabic Calligraphy"), day count, and a short description
- **Learning plan**: a checklist of steps/milestones you've planned together
  - Example: "Week 1 — Buy supplies", "Week 2 — Practice basic letters"
  - Both can check off items
- **Add a hobby**: form with name, description, start date, goal/end date, and a cover image
- **Hobby history**: archive of completed or paused hobbies with their duration
- **Notes tab per hobby**: shared notes/resources (links, tips, screenshots)
- **Progress photos**: attach photos showing progress over time

#### Hobby object fields

```
id, pair_id, name, description, cover_image, start_date,
goal_date, status (active/completed/paused), steps (JSON array),
notes (JSON array), photos (array of storage URLs)
```

---

### 5.7 Entertainment

A fun shared space for watchlists, games, and things to do together.

#### Sub-sections

**Watch together list**
- Add movies, series, or YouTube videos to a shared watchlist
- Mark as: Want to watch / Watching / Done
- Add a rating + reaction after watching
- Optional: note who recommended it

**Games & challenges**
- Simple built-in mini challenges:
  - "Send each other a photo of what you're eating right now"
  - "Share something that made you smile today"
  - "Pick a song that matches your mood"
- New challenge suggested daily (from a curated static list)

**Bucket list**
- A shared list of things you want to do together someday
- Items: title, category (travel / food / experience / etc.), priority level
- Mark as done and move to Memories

**Currently vibing**
- A free-form shared status — each user can set a short "what I'm into right now" (a book, a show, a quote)
- Shown on the Home widget

---

## 6. Notifications

| Trigger | Recipient | Message |
|---|---|---|
| Friend comes online | You | "Mariam is online 💙" |
| Friend gifts a song | You | "Mariam gifted you a song 🎵" |
| Task checked off | Both | "Mariam completed 'Morning walk' ✅" |
| New memory added | You | "Mariam added a memory from today 📸" |
| Upcoming outing tomorrow | Both | "Coffee date is tomorrow! ☕" |
| Prayer time (if enabled) | You | "It's Asr time 🤲" |
| Athkar reminder | You | "Evening athkar time 🌙" |
| Daily song reminder | You | "Have you gifted a song today? 🎶" |
| New hobby milestone | Both | "You both hit a new hobby milestone 🌱" |

---

## 7. Data Models

### users
```
id, email, display_name, avatar_url, city, pair_id, invite_code, created_at
```

### pairs
```
id, user_a_id, user_b_id, status (pending/active), created_at
```

### tasks
```
id, pair_id, created_by, title, category, recurrence, is_done,
done_by, done_at, date, created_at
```

### memories
```
id, pair_id, created_by, date, title, note, mood_emoji, tags,
photos (array), type (memory/outing), created_at
```

### songs
```
id, pair_id, gifted_by, title, artist, message, gifted_at
```

### radio_favorites
```
id, pair_id, added_by, station_name, station_url, country, tags, favicon
```

### prayer_logs
```
id, pair_id, user_id, date, fajr, dhuhr, asr, maghrib, isha
```

### hobbies
```
id, pair_id, name, description, cover_image, start_date, goal_date,
status, steps (jsonb), notes (jsonb), photos (array), created_at
```

### entertainment
```
id, pair_id, type (watch/bucket/vibe), title, category, status,
added_by, rating, note, created_at
```

---

## 8. API References

| API | Base URL | Used for |
|---|---|---|
| Radio Browser | `https://de1.api.radio-browser.info/json` | Station search, streaming |
| Aladhan | `https://api.aladhan.com/v1` | Prayer times, Hijri date |
| Quran.com | `https://api.quran.com/api/v4` | Verses, translations, audio |
| Supabase Realtime | via Supabase SDK | Presence, live updates |

---

## 9. Open Questions

These need decisions before or during development:

- [ ] **Location sharing** — manual (user types city) or auto (GPS on app open)? Consider privacy.
- [ ] **Song gifting** — is it a free-text entry or linked to Spotify/Apple Music?
- [ ] **Athkar data source** — static curated JSON or live from an API?
- [ ] **Notifications timing** — user-configured or app-suggested defaults?
- [ ] **Pair reset flow** — what happens to data if a pair is dissolved? Hard delete or archive?
- [ ] **Offline support** — should the app work offline with sync on reconnect?
- [ ] **Languages** — Arabic + English from the start, or English-first?
- [ ] **Dark mode** — is it in scope for v1?
- [ ] **Web vs mobile feature parity** — are all 7 pages available on both platforms from day one?

---

*Document version 1.0 — MasSync*
*Stack: React / React Native · Supabase · Radio Browser API · Aladhan API · Quran.com API*
