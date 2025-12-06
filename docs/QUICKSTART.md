# 🚀 Quick Start Guide - Compliance Co-Pilot

## You're almost ready! Just 2 steps to get started:

### Step 1️⃣: Get Your Clerk Keys (2 minutes)

1. Go to **[https://clerk.com](https://clerk.com)** and sign up (free)
2. Click **"+ Add Application"**
3. Name it: "Compliance Co-Pilot"
4. Click **"Create Application"**
5. You'll see your API keys - copy them!

### Step 2️⃣: Add Keys to Your Project

Option A - **Quick** (Copy/Paste):
```bash
# Create .env.local file with your actual keys
echo 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/' > .env.local

# Then edit the file and replace your_key_here with actual keys
```

Option B - **Manual**:
1. Copy `.env.example` to `.env.local`
2. Open `.env.local` in your editor
3. Replace the placeholder keys with your Clerk keys
4. Save the file

### Step 3️⃣: Run the App!

```bash
npm run dev
```

Visit **http://localhost:3000** - you'll see the sign-in page! 🎉

---

## What Happens Next?

1. Click **"Sign up"** to create a test account
2. Use any email (e.g., `test@example.com`)
3. Create a password
4. Verify email (Clerk sends a code)
5. You're in! The dashboard will load with your name

---

## 💡 Tips

**Testing Without Email?**
- In Clerk Dashboard → Settings → Email
- Toggle OFF "Verify email address"
- Now you can sign up instantly!

**Add Social Logins?**
- Clerk Dashboard → Social Connections
- Enable Google, Microsoft, GitHub, etc.
- No code changes needed!

---

## Need Help?

📖 **Detailed Guide**: See [CLERK_SETUP.md](./CLERK_SETUP.md)  
🐛 **Issues?**: Check [Clerk Documentation](https://clerk.com/docs)  
💬 **Questions?**: Join [Clerk Discord](https://clerk.com/discord)

---

## Files You Created

- ✅ `middleware.ts` - Protects your routes
- ✅ `app/sign-in/` - Sign-in page
- ✅ `app/sign-up/` - Sign-up page  
- ✅ `app/layout.tsx` - Clerk provider wrapper
- ✅ `components/dashboard/header.tsx` - Shows real user data

**That's it!** Your dashboard now has enterprise-grade authentication! 🔒

---

Built with Next.js + Clerk + Shadcn UI

