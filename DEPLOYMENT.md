# Deployment Guide

This guide covers deploying your Loan Advisor app to Netlify or Render.

## Prerequisites
- GitHub account with your project pushed to a repository
- Netlify or Render account (free tier available)

---

## Option 1: Deploy to Netlify (Recommended)

### Step 1: Prepare Your Repository
Make sure your `.env` file is NOT committed to GitHub (it's already in `.gitignore`).

### Step 2: Create Netlify Account
1. Go to [https://netlify.com](https://netlify.com)
2. Sign up with GitHub

### Step 3: Deploy from GitHub
1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - Click **"Show advanced"** → **"New variable"**

### Step 4: Add Environment Variables
Add these variables one by one:

```
VITE_SUPABASE_URL=https://bqlotqbwpnynlvixursj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbG90cWJ3cG55bmx2aXh1cnNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjQzODAsImV4cCI6MjA3NDc0MDM4MH0.REfmcXg823k1IU2pEBWKkVe-OEkU4EIkIhGw8GuI5rs
VITE_SUPABASE_PROJECT_ID=bqlotqbwpnynlvixursj
```

### Step 5: Deploy
Click **"Deploy site"**. Your site will be live in 2-3 minutes at `your-site-name.netlify.app`.

### Step 6: Custom Domain (Optional)
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow DNS configuration instructions

---

## Option 2: Deploy to Render

### Step 1: Create Render Account
1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create New Static Site
1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: loan-advisor (or your preferred name)
   - **Branch**: main
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

### Step 3: Add Environment Variables
Click **"Advanced"** and add:

```
VITE_SUPABASE_URL=https://bqlotqbwpnynlvixursj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbG90cWJ3cG55bmx2aXh1cnNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjQzODAsImV4cCI6MjA3NDc0MDM4MH0.REfmcXg823k1IU2pEBWKkVe-OEkU4EIkIhGw8GuI5rs
VITE_SUPABASE_PROJECT_ID=bqlotqbwpnynlvixursj
```

### Step 4: Deploy
Click **"Create Static Site"**. Build will start automatically.

### Step 5: Custom Domain (Optional)
1. Go to **Settings** → **Custom Domains**
2. Add your domain and follow DNS instructions

---

## How to Apply Changes Locally After Deployment

### Method 1: Pull from GitHub (If you made changes in Lovable)

1. **Open terminal in your project folder**
   ```bash
   cd YOUR_PROJECT_FOLDER
   ```

2. **Pull latest changes**
   ```bash
   git pull origin main
   ```

3. **Install any new dependencies**
   ```bash
   npm install
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```

### Method 2: Push Local Changes to Deploy

1. **Make your changes locally**

2. **Commit changes**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

3. **Push to GitHub**
   ```bash
   git push origin main
   ```

4. **Automatic deployment**: Netlify/Render will automatically detect the push and redeploy!

---

## Continuous Deployment

Both Netlify and Render support automatic deployments:
- Every push to your `main` branch triggers a new deployment
- No manual intervention needed
- Builds take 2-5 minutes

---

## Troubleshooting

### Build Fails
- Check build logs in Netlify/Render dashboard
- Verify environment variables are set correctly
- Ensure `package.json` has all dependencies

### App Loads But Features Don't Work
- Verify environment variables in deployment settings
- Check browser console for errors
- Ensure Supabase URL and keys are correct

### Guest Mode Not Working
- Clear browser cache
- Check localStorage is enabled in browser

---

## Testing Your Deployment

1. **Visit your deployed URL**
2. **Try guest mode**: Click "Continue as Guest"
3. **Sign up**: Create a test account
4. **Test features**:
   - Send messages
   - Try voice recording
   - Switch languages
   - Check quick actions

---

## Interview Talking Points

### "Why Netlify/Render?"
- **Zero configuration**: Works with Vite out of the box
- **CI/CD built-in**: Auto-deploys on git push
- **Global CDN**: Fast worldwide access
- **Free tier**: Perfect for demos and MVPs
- **Easy environment management**: Secure variable storage

### "How does deployment work?"
1. Code pushed to GitHub
2. Webhook triggers build on Netlify/Render
3. `npm run build` creates optimized bundle
4. Static files deployed to CDN
5. Live in minutes

### "What about the backend?"
- Backend (Supabase) is already hosted in the cloud
- Edge functions are managed by Supabase
- No separate backend deployment needed
- Environment variables connect frontend to backend

### "How do you handle updates?"
- Git-based workflow
- Feature branches for development
- Merge to main triggers production deploy
- Instant rollbacks via Netlify/Render UI
- Version history maintained in Git