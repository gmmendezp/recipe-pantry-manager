# Recipe Pantry Manager

Recipe Pantry Manager is a full-stack recipe, pantry, and grocery-list app. Users can save recipes, manage a home pantry, and generate grocery lists that separate what they need to buy from what is already on hand.

The app includes authenticated user data, server-side mutations, recipe importing, Supabase-backed storage, database migrations, Row Level Security, and automated tests.

## Features

- Email/password authentication with protected app routes
- Recipe create, read, update, and delete flows
- Recipe URL import from structured JSON-LD recipe pages
- Recipe image URL and upload support through Supabase Storage
- Pantry item create, read, update, and delete flows
- Recipe and pantry items search and filtering
- Grocery list generation from one or more recipes
- Pantry-aware grocery list sections for `Need to Buy` and `Already in Pantry`
- Grocery item checkoff while shopping
- Saved grocery lists with delete and regenerate from source recipes and current pantry
- Unit tests and a Playwright core workflow test

## Tech Stack

- TanStack Start
- TanStack Router
- React
- TypeScript
- Tailwind
- Supabase Auth, Storage and Database
- Drizzle ORM and Drizzle Kit
- Zod
- Biome
- Vitest
- Playwright
- Netlify

## Screenshot

![Recipe Pantry Manager screenshot](docs/images/recipe-pantry-manager.png)

## Getting Started

Install dependencies:

```bash
pnpm install
```

Copy the environment template and fill in real values:

```bash
cp .env.example .env
```

Start the development server:

```bash
pnpm run dev
```

The app runs at `http://localhost:3000` by default.

## Environment Variables

The app expects these values:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
VITE_SUPABASE_URL="https://PROJECT_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

E2E_EMAIL="recipe-pantry-e2e@example.com"
E2E_PASSWORD="YOUR_E2E_TEST_PASSWORD"
PLAYWRIGHT_BASE_URL="http://localhost:3000"
```

`DATABASE_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` are required for the app to connect to Supabase. The `E2E_*` values are only required when running the Playwright workflow test.

## Database

Generate migrations after schema changes:

```bash
pnpm run db:generate
```

Apply migrations:

```bash
pnpm run db:migrate
```

Open Drizzle Studio:

```bash
pnpm run db:studio
```

The schema includes Row Level Security policies so authenticated users can only access their own recipes, pantry items, grocery lists, recipe tags, and related child records.

## Scripts

- `pnpm run dev` starts the local dev server
- `pnpm run build` builds the production app
- `pnpm run preview` previews the production build locally
- `pnpm run check` runs Biome checks
- `pnpm run check:fix` runs Biome and writes safe fixes
- `pnpm run typecheck` runs TypeScript without emitting files
- `pnpm run test` runs unit tests
- `pnpm run test:e2e` runs Playwright tests
- `pnpm run verify` runs checks, typecheck, and unit tests

## Testing

Run unit tests:

```bash
pnpm run test
```

Run the standard verification suite:

```bash
pnpm run verify
```

Run the Playwright workflow test:

```bash
pnpm run test:e2e
```

The E2E test requires `E2E_EMAIL` and `E2E_PASSWORD` for an existing test account. It creates a pantry item, recipe, and grocery list, verifies the pantry-aware split, then performs best-effort cleanup.

## Deployment

The project includes `netlify.toml` for Netlify deployment.

Build command:

```bash
pnpm run build
```

Publish directory:

```txt
dist/client
```

Add the Supabase environment variables in Netlify before deploying:

- `DATABASE_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Server functions run through Netlify Functions.
