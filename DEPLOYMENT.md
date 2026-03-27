# Zamalek Academy System - Production Deployment Guide

This project is built as a complete Monorepo. Both applications are completely independent and ready for production out-of-the-box.

---

## 🏗 Backend Deployment (Railway)

We use Railway to securely host the Node.js/Express backend connected to a Neon PostgreSQL database.
A `railway.json` file is already included inside `/backend` which tells Railway exactly how to build and start the server so no manual build commands are needed!

### Steps:
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech/) and copy your **Connection String**.
2. Create a new account/project on [Railway.app](https://railway.app/) and choose **Deploy from GitHub**.
3. Point to your repository. **CRITICAL:** Before hitting deploy, go to the Service Settings -> **Root Directory** and set it to `/backend`.
4. Define the following Environment Variables in Railway:
   - `PORT` = `8000`
   - `DATABASE_URL` = `postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require` *(paste your Neon string)*
   - `JWT_SECRET` = `(Type a random 64-character secure string here)`
   - `NODE_ENV` = `production`
5. Railway will now automatically read the `railway.json` file, install dependencies, run `npx prisma generate`, compile TypeScript, and start the app!

### First-Time Database Setup (Run Once)
Once the backend is "Active" on Railway, you must push your database schema to Neon.
1. Open the **Variables / Command Line** terminal on the Railway Dashboard for your app.
2. Run: `npx prisma db push`
3. If you want demo users to test logging in, also run: `npx ts-node prisma/seed.ts`

**Result:** Your Backend API is now live. Copy the Public URL (e.g., `https://backend-zamalek.up.railway.app`).

---

## 🎨 Frontend Deployment (Vercel)

We use Vercel to host the Next.js React frontend. The codebase already securely maps all API calls exclusively through `NEXT_PUBLIC_API_URL` without any hardcoded localhost leftovers.

### Steps:
1. Go to [Vercel.com](https://vercel.com/) and click **Add New -> Project**.
2. Connect your GitHub repository.
3. In the Import Project screen, under **"Root Directory"**, click Edit and select `frontend`.
4. Next.js will be detected automatically. Open the **Environment Variables** section.
5. Add the following variable:
   - `NEXT_PUBLIC_API_URL` = `https://backend-zamalek.up.railway.app/api/v1` *(Replace with the URL you got from Railway in step 5 above).*
6. Click **Deploy**.

**Result:** Your beautiful System is now fully live and accessible from anywhere via the Vercel generated URL!
