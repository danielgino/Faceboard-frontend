
<img width="651" height="361" alt="FACEBOARD" src="https://github.com/user-attachments/assets/88b6ffda-9dfb-4f09-a8c6-a517e7aa323c" />

# Faceboard Frontend

React client for Faceboard, a social network with posts, friendships, real-time chat and notifications. It talks to the [Faceboard backend](https://github.com/danielgino/Faceboard-backend) over a REST API and a STOMP/WebSocket connection.

This repo covers the client only — API design, auth internals and data storage live in the backend repository.

## Live Demo

https://faceboard-frontend.vercel.app

The Login page has an "Explore as Demo User" button that logs into a shared, read-only demo account — no sign-up needed. Mutating actions (posting, liking, messaging, editing a profile, etc.) are disabled in the UI, and the backend rejects them independently.

## Screenshots

### Desktop

#### Feed
<img width="1661" height="893" alt="feed desktop" src="https://github.com/user-attachments/assets/65dabde8-4799-40e7-a9a8-73d069e204d2" />

#### Profile
<img width="1800" height="913" alt="profile desktop" src="https://github.com/user-attachments/assets/54aa9cee-c2aa-4ef6-a072-f04d1a806653" />

### Mobile

#### Chat
<img width="441" height="813" alt="chat desktop" src="https://github.com/user-attachments/assets/8599afc5-880c-4d98-b416-914a9d81fd5f" />

#### Feed
<img width="523" height="837" alt="feed mobile" src="https://github.com/user-attachments/assets/bd894f8f-628a-4085-b7f3-4876a2478915" />

#### Profile
<img width="436" height="832" alt="profile mobile" src="https://github.com/user-attachments/assets/0586d420-4326-487f-a5fa-cfdbb2b3c71b" />

## Features

- News feed with posts, image uploads, likes and comments
- Friend requests, friend list and suggested friends
- User search
- Stories and a profile image gallery
- Real-time notifications
- Real-time chat with persisted history, read receipts and sharing a post's permalink into a conversation
- Profile and account settings
- Responsive layout: sidebar navigation on desktop, bottom navigation on mobile
- Demo mode with a read-only sample account

## Frontend Highlights

- State managed through React Context providers (user, posts, messages, notifications, friendships, stories, search) rather than Redux
- All authenticated requests go through a single `fetchWithAuth` helper (`src/utils/Utils.js`) that attaches the JWT, handles 401 cleanup and surfaces demo-mode denials
- Route protection via a `RouteGuard` component that gates public/protected routes and redirects based on auth state
- WebSocket client built directly on `@stomp/stompjs`, with reconnect and heartbeat configured on the STOMP client; the provider never opens a connection for a demo session
- Infinite-scroll feed with page-based fetching and de-duplication
- Client-side upload validation (type/size) ahead of the backend's own checks
- Responsive desktop sidebar / mobile bottom-nav layout driven by the same route set

## Tech Stack

- React 18, React Router
- Create React App (`react-scripts`)
- Tailwind CSS and styled-components
- `@stomp/stompjs` for WebSocket/STOMP messaging
- ChatScope UI Kit for the chat interface
- Jest and React Testing Library

## Client Architecture

`App.js` wraps the route tree in `UserProvider`, then nests the protected routes inside the domain providers (`FriendshipProvider`, `NotificationProvider`, `MessageProvider`, `WebSocketProvider`, `StoryProvider`, `PostProvider`, `SearchProvider`). `RouteGuard` decides, per route group, whether to render the page, redirect to login, or show `Unauthorized`/`Page404`.

`WebSocketProvider` owns the STOMP client lifecycle (connect/reconnect/teardown on login, logout and account switch); `WebSocketHandler` subscribes to the per-user message, notification and read-receipt topics and pushes updates into the relevant context. All REST calls go through `fetchWithAuth`, which is the one place that attaches the JWT and reacts to 401/403 responses.

Pages live under `src/pages`, reusable UI under `src/components`, and shared logic under `src/hooks` and `src/utils`.

## Demo Mode

The Demo button logs into a shared account flagged `demo: true` on `/auth/me`. The frontend uses that flag to:

- show a `DemoModeBanner` and disable/hide mutation controls (posting, liking, commenting, friend actions, profile edits, uploads)
- serve stories and gallery images for the seed demo profiles from static assets in `public/demo-assets` instead of hitting the backend
- surface a toast when the backend still rejects a demo request (`DEMO_READ_ONLY` / `DEMO_ACCESS_DENIED`)
- skip opening a WebSocket connection entirely for demo sessions

These frontend checks are for UX; the backend remains the authoritative security boundary for demo restrictions. See the [backend README](https://github.com/danielgino/Faceboard-backend) for the server-side implementation.

## Running Locally

```bash
git clone https://github.com/danielgino/Faceboard-frontend.git
cd Faceboard-frontend
npm install
npm start
```

Runs on `http://localhost:3000`. You'll need a running instance of the [backend](https://github.com/danielgino/Faceboard-backend) and the environment variables below.

## Environment Variables

Set these in a `.env` or `.env.local` file at the project root:

| Variable | Purpose |
|---|---|
| `REACT_APP_API_URL` | Base URL of the backend REST API |
| `REACT_APP_WS_URL` | WebSocket (STOMP) broker URL for chat/notifications |

## Testing

```bash
npm test
```

Tests use Jest and React Testing Library, covering contexts/providers, hooks, `fetchWithAuth` and other utils, and key components/pages (chat, posts, settings, auth forms, demo-mode behavior). There's no end-to-end test suite.

## Deployment

The frontend is hosted on Vercel. GitHub Actions (`.github/workflows/ci.yml`) runs `npm test` and `npm run build` on pull requests and pushes to `main`; deployment is handled separately by Vercel.

## Project Structure

```
src/
  pages/
  components/
  context/
  hooks/
  service/
  utils/
```

## Backend

API, auth, WebSocket server, database and infrastructure details live in the backend repo:

https://github.com/danielgino/Faceboard-backend

## Author

Daniel Gino

- GitHub: https://github.com/danielgino
- LinkedIn: https://www.linkedin.com/in/daniel-gino-2b6350345/
