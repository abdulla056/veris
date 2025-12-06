# Development Guide - Compliance Co-Pilot

## 📋 Table of Contents
1. [Project Setup](#project-setup)
2. [Development Workflow](#development-workflow)
3. [Project Structure](#project-structure)
4. [Adding Features](#adding-features)
5. [Code Standards](#code-standards)
6. [Troubleshooting](#troubleshooting)

---

## Project Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Git
- A Clerk account (free at [clerk.com](https://clerk.com))

### Initial Setup

```bash
# 1. Clone and install
git clone <your-repo>
cd veris
npm install

# 2. Set up authentication
cp .env.example .env.local
# Edit .env.local with your Clerk keys from dashboard.clerk.com

# 3. Start development
npm run dev
```

Visit `http://localhost:3000` - you'll see the sign-in page!

---

## Development Workflow

### Daily Development

```bash
# Start dev server (with hot reload)
npm run dev

# Run linter
npm run lint

# Build for production (test before deploying)
npm run build

# Test production build locally
npm run build && npm start
```

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Edit files in `app/`, `components/`, etc.
   - Hot reload will show changes instantly

3. **Test your changes**
   ```bash
   npm run build  # Ensure it builds
   npm run lint   # Check for issues
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

---

## Project Structure

### Key Directories

```
veris/
├── app/                    # Next.js pages & routes
├── components/
│   ├── dashboard/         # Dashboard-specific components
│   └── ui/                # Shadcn UI components
├── lib/                   # Utilities & helpers
├── hooks/                 # Custom React hooks
├── public/                # Static assets
└── middleware.ts          # Auth middleware
```

**📖 See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed breakdown**

### Important Files

| File | Purpose | Edit? |
|------|---------|-------|
| `app/page.tsx` | Main dashboard | ✅ Yes |
| `app/layout.tsx` | Root layout | ⚠️ Careful |
| `middleware.ts` | Auth protection | ⚠️ Careful |
| `components.json` | Shadcn config | ❌ Rarely |
| `.env.local` | Your secrets | ❌ Never commit |

---

## Adding Features

### 1. Add a New Dashboard Component

```bash
# Create the component
touch components/dashboard/my-new-component.tsx
```

```typescript
// components/dashboard/my-new-component.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function MyNewComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My New Feature</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Content goes here</p>
      </CardContent>
    </Card>
  );
}
```

Add to dashboard:
```typescript
// app/page.tsx
import { MyNewComponent } from "@/components/dashboard/my-new-component";

export default function Home() {
  return (
    // ... existing code
    <MyNewComponent />
  );
}
```

### 2. Add a New Shadcn Component

```bash
# Install the component
npx shadcn@latest add dialog

# Use it in your code
import { Dialog } from "@/components/ui/dialog";
```

**Available components**: https://ui.shadcn.com/docs/components

### 3. Add a New Route

```bash
# Create route folder and page
mkdir -p app/new-route
touch app/new-route/page.tsx
```

```typescript
// app/new-route/page.tsx
export default function NewRoute() {
  return <div>New Route Content</div>;
}
```

**Note**: All routes are protected by Clerk automatically!

### 4. Add API Route

```bash
mkdir -p app/api/my-endpoint
touch app/api/my-endpoint/route.ts
```

```typescript
// app/api/my-endpoint/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ data: 'Your data here' });
}
```

### 5. Add State Management

For simple state, use React hooks:
```typescript
"use client";
import { useState } from 'react';

export function MyComponent() {
  const [count, setCount] = useState(0);
  // ...
}
```

For complex state, consider:
- **Zustand**: Lightweight state management
- **React Context**: Built-in solution
- **TanStack Query**: For server state

---

## Code Standards

### TypeScript

✅ **Do:**
```typescript
interface Props {
  title: string;
  count: number;
}

export function MyComponent({ title, count }: Props) {
  return <div>{title}: {count}</div>;
}
```

❌ **Don't:**
```typescript
export function MyComponent(props: any) {
  return <div>{props.title}: {props.count}</div>;
}
```

### Naming Conventions

- **Components**: `PascalCase` (e.g., `UserProfile.tsx`)
- **Files**: `kebab-case` (e.g., `user-profile.tsx`)
- **Functions**: `camelCase` (e.g., `getUserData`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

### Component Structure

```typescript
"use client"; // Only if needed (for hooks, events)

import { ComponentFromLib } from 'library';
import { LocalComponent } from '@/components/local';

interface ComponentProps {
  // Props here
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Hooks
  const [state, setState] = useState();

  // Effects
  useEffect(() => {
    // ...
  }, []);

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Styling

Use Tailwind utility classes:
```typescript
<div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow-sm">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
</div>
```

Use `cn()` for conditional classes:
```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === "primary" && "primary-class"
)}>
```

---

## Troubleshooting

### Build Errors

**Error**: `Missing publishableKey`
```bash
# Solution: Add Clerk keys to .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Error**: `Module not found`
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Development Issues

**Hot reload not working**
```bash
# Restart dev server
# Press Ctrl+C, then:
npm run dev
```

**Port 3000 already in use**
```bash
# Option 1: Kill the process
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
PORT=3001 npm run dev
```

### Type Errors

```bash
# Rebuild TypeScript
npm run build

# Check types only
npx tsc --noEmit
```

### Styling Issues

```bash
# Ensure Tailwind is working
npm run dev

# Check globals.css is imported in layout.tsx
```

---

## Environment Variables

### Required

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | [Clerk Dashboard](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk secret key | [Clerk Dashboard](https://dashboard.clerk.com) |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign in route | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign up route | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign in | `/` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign up | `/` |

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables in Production

Add these in Vercel dashboard:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

**Important**: Use production keys from Clerk!

### Build Command

Vercel auto-detects, but if needed:
```bash
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

---

## Testing

### Manual Testing Checklist

- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Dashboard loads after auth
- [ ] User data shows in header
- [ ] Sign out works
- [ ] Protected routes redirect when not authed
- [ ] Build completes without errors

### Test User

Create a test account:
```
Email: test@example.com
Password: TestPassword123!
```

---

## Getting Help

- **Next.js Docs**: https://nextjs.org/docs
- **Clerk Docs**: https://clerk.com/docs
- **Shadcn UI**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## Quick Reference

### Common Commands

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run linter
```

### Import Aliases

```typescript
@/components/*    # Components folder
@/lib/*          # Lib folder
@/hooks/*        # Hooks folder
@/app/*          # App folder
```

### Clerk Hooks

```typescript
import { useUser } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';

const { user } = useUser();      // Get user object
const { userId } = useAuth();    // Get user ID
```

---

**Happy coding! 🚀**

