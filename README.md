# Apartment Locator AI

An AI-powered apartment locator application that helps users find apartments, analyze market trends, and make informed rental decisions.

## Features

- **Apartment Search** - Search properties with advanced filtering by price, bedrooms, location, and amenities
- **AI-Powered Recommendations** - Get personalized property suggestions based on your preferences
- **Market Intelligence** - Access analytics and trends for rental markets
- **Save & Track** - Save favorite apartments and track their status
- **User Preferences** - Set up alerts for price drops and new listings

## Tech Stack

- **Frontend**: React 18 with Vite, TailwindCSS, Shadcn/UI
- **Backend**: Express 5.x with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based auth with bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Development

```sh
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`.

## Project Structure

```
├── client/src/          # Frontend source
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database layer
│   └── db.ts            # Database connection
├── shared/              # Shared types and schemas
│   └── schema.ts        # Drizzle schema definitions
└── src/                 # React frontend components
```

## API Endpoints

- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Sign in
- `GET /api/auth/me` - Get current user
- `GET /api/properties` - Search properties
- `GET/POST /api/saved-apartments/:userId` - Manage saved apartments
- `GET/POST /api/preferences/:userId` - User preferences
- `GET /api/market-snapshots/:city/:state` - Market data

## Deployment

This project is configured for deployment on Replit. Click the "Deploy" button to publish your app.
