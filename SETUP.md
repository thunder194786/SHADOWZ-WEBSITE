# SHADOWZ HUB — Setup Guide

This project is a complete website with real accounts, roles, and an admin
dashboard. Everything is built, but a handful of one-time setup steps only
you can do (I can't create accounts or API keys on your behalf). Follow
these in order.

## 1. Create your Supabase project

1. Go to https://supabase.com and sign in (free tier is enough).
2. Click **New Project**. Pick any name/region, set a database password
   (save it somewhere), and wait ~2 minutes for it to finish setting up.

## 2. Run the database schema

1. Open `supabase/schema.sql` from this project in a text editor.
2. Find this line near the top of the Owner section:
   ```
   when lower(new.email) = lower('YOUR_OWNER_EMAIL_HERE') then 'owner'
   ```
   Replace `YOUR_OWNER_EMAIL_HERE` with your real Gmail:
   ```
   when lower(new.email) = lower('thunder194786@gmail.com') then 'owner'
   ```
3. In Supabase: left sidebar → **SQL Editor** → **New query**.
4. Paste the entire `schema.sql` file in and click **Run**.
   - This creates every table, the 5 roles, all security rules, the
     storage bucket for images, and the Owner auto-assignment logic.
   - Run it only once on a fresh project.

## 3. Get your API keys

1. In Supabase: left sidebar → **Project Settings** → **API**.
2. Copy the **Project URL** and the **anon public** key.

## 4. Create your local `.env` file

In the project folder, copy `.env.example` to a new file named `.env`,
and paste in the two values from Step 3:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

This file is already in `.gitignore`, so it will **not** be uploaded to
GitHub (that's intentional — it's safe to keep your keys here).

## 5. Add the same keys to GitHub (for live deployment)

The anon key is safe to expose publicly (it's designed for that), but to
keep it out of your repo's source code, the live site reads it from a
GitHub secret:

1. On GitHub: your repo → **Settings** → **Secrets and variables** →
   **Actions** → **New repository secret**.
2. Add two secrets:
   - Name: `VITE_SUPABASE_URL` → value: your Project URL
   - Name: `VITE_SUPABASE_ANON_KEY` → value: your anon public key

## 6. Turn on GitHub Pages (if not done already)

Repo → **Settings** → **Pages** → under "Build and deployment",
set **Source** to **GitHub Actions**.

## 7. Install and test locally

```bash
npm install
npm run dev
```

Open the local address shown (e.g. `http://localhost:5173`). You should
see the full site: Home with live stats, Websites directory, Login/Sign
Up, and after creating an account with your Owner Gmail, an **Admin
Dashboard** link in your account menu.

## 8. Create your Owner account

1. Click **Sign Up** and register using **thunder194786@gmail.com**
   (the exact email you put into the schema in Step 2).
2. Check that inbox for a verification email from Supabase and click it.
3. Log in. Your account menu (top right) should now show **Admin
   Dashboard** — that confirms the Owner setup worked.
4. Anyone who registers with a different email automatically gets the
   MEMBER role — only this exact Gmail becomes Owner.

## 9. Deploy

```bash
git add -A
git commit -m "Full SHADOWZ HUB build"
git push
```

Watch the **Actions** tab on GitHub for the build to finish (~1 minute),
then visit `https://thunder194786.github.io/SHADOWZ-WEBSITE/`.

## 10. Add your first website

Log in as Owner → Admin Dashboard → **Add Website** → fill in the form
(you can upload a logo/thumbnail image directly) → set Status to
**Published** → Save. It will now appear on the public Websites page.

---

## What's included

- Public site: Home (live stats), Websites directory (search, filter by
  category, sort, pagination), Website Details, About, Contact.
- Accounts: Sign up, Login, Logout, Forgot/Reset Password, Account
  Dashboard, Account Settings.
- 5-tier roles (Member → Moderator → Administrator → Admin → Owner),
  enforced in the database itself — not just hidden buttons.
- Admin Dashboard: Overview stats, Manage/Add/Edit/Delete Websites
  (with image upload), Categories, Users (role change, ban/unban),
  Roles & Permissions (Owner-only), Analytics, Reports, Appearance
  Settings (colors + homepage text, applied live), General Settings,
  Activity Logs.
- Protected routes: visiting `/admin` without permission shows a proper
  "Access Denied" page, and the database itself refuses the request too.

## Known limitations (honest notes, not hidden)

- **Deleting a user account** isn't implemented yet — Ban/Unban is,
  which is the secure, working way to block someone. True account
  deletion needs a small server-side function (a Supabase Edge
  Function) because it requires a secret key that must never sit in
  frontend code. I can build that as a follow-up if you want it.
- **Banned users** are signed out the moment the app loads their
  profile after login. For instant blocking at the login screen itself,
  a Supabase "Auth Hook" can be added later — a small Dashboard config
  step.
- **Appearance Settings** currently control the 4 theme colors and the
  homepage intro text, applied live across the site. Logo upload and
  deeper layout customization aren't wired up yet.
- **Contact messages** are saved to the database correctly, but there's
  no admin screen to read them yet (only the database itself holds them
  for now).

None of the above are fake buttons — they just aren't built yet. Tell me
if you want any of them added next.
