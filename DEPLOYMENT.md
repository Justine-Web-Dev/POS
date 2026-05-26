# POS System Deployment Guide

This document describes how to deploy the POS System (Frontend + Backend + Database) to production using cloud services.

## Architecture Setup
- **Frontend**: Hosted on **Vercel**
- **Backend**: Hosted on **Render** (recommended for persistent PostgreSQL connections) or **Vercel**
- **Database**: Hosted on a cloud Postgres provider (e.g. **Neon**, **Supabase**, or **Render PostgreSQL**)

---

## Step 1: Database Setup
1. Create a PostgreSQL instance on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Copy the connection string (`DATABASE_URL`). It will look something like this:
   `postgres://username:password@hostname:port/database_name?sslmode=require`

---

## Step 2: Backend Deployment (Render.com - Recommended)
1. Go to [Render](https://render.com) and create a **Web Service**.
2. Connect your Git repository.
3. Configure the service:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the following **Environment Variables** in Render's dashboard:
   - `DATABASE_URL`: *your-database-connection-string*
   - `PORT`: `5001`
   - `JWT_SECRET`: *a-random-secure-string-for-tokens*
5. Deploy the service. Take note of your Render Web Service URL (e.g., `https://pos-system-server.onrender.com`).

---

## Step 3: Frontend Deployment (Vercel)
1. Go to [Vercel](https://vercel.com) and create a new project.
2. Connect your Git repository.
3. In the project creation screen, configure:
   - **Root Directory**: Select `client`
   - **Framework Preset**: `Vite`
4. Add the following **Environment Variable** in Vercel's settings:
   - `VITE_API_URL`: *Your Render backend URL from Step 2 (e.g. https://pos-system-server.onrender.com/)*
5. Click **Deploy**.

---

## Local Configuration Checklist
To test locally, your root should have env configs.
- For `client/.env.local`:
  ```env
  VITE_API_URL=http://localhost:5001/
  ```
- For `server/.env`:
  ```env
  PORT=5001
  PG_USER=postgres
  PG_PASSWORD=your_local_password
  PG_HOST=localhost
  PG_PORT=5432
  PG_DB=pos_db
  JWT_SECRET=your_secret_key
  ```
