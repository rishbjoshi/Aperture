# Aperture: photography community (Next.js + Supabase)

## 1. Create the backend (free)
1. Go to supabase.com, create a project.
2. Open **SQL Editor > New query**, paste all of `supabase/schema.sql`, click **Run**.
   This creates the tables, security rules, and the `photos` storage bucket.
3. Open **Authentication > Providers > Email**. For quick testing, turn off "Confirm email".
4. Open **Project Settings > API** and copy the Project URL and the anon public key.

## 2. Run it locally
```bash
cp .env.local.example .env.local   # paste your URL and anon key
npm install
npm run dev                        # http://localhost:3000
```
Sign up two accounts (use a private window for the second) to test follow, like, and feedback.

## 3. Deploy
Push to GitHub, import the repo in vercel.com, add the same two environment variables, deploy.
Then in Supabase **Authentication > URL Configuration**, set Site URL to your Vercel URL.

## What's included
- Email and password signup and login (sessions kept fresh by `middleware.js`)
- Photo upload to Supabase Storage, one folder per user
- Likes, follows, and two comment types (Appreciation / Suggestion)
- Row Level Security so users can only change their own data
