# Quick Deploy to Vercel - Step by Step

## 🚀 What You Need to Upload

**Upload the ROOT folder** (`Finance-Growth-Co-pilot`) to GitHub, NOT the `backend` folder.

The folder structure should be:
```
Finance-Growth-Co-pilot/          ← Upload THIS to GitHub
├── src/                          ← Frontend source code
├── public/                       ← Static assets
├── package.json                  ← Dependencies
├── vite.config.js               ← Build config
├── vercel.json                  ← Vercel config (created)
├── .env.example                 ← Environment template (created)
├── backend/                     ← Keep separate (already on Render)
└── ... other files
```

## 📋 Step-by-Step Instructions

### Step 1: Initialize Git for Frontend (if not done)

Open terminal in the ROOT directory (`Finance-Growth-Co-pilot`):

```bash
# Make sure you're in the root directory
cd c:\Users\Hp\Desktop\Finance-Growth-Co-pilot

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Frontend ready for Vercel deployment"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `Finance-Growth-Frontend`)
3. **DO NOT** initialize with README (you already have code)
4. Copy the repository URL

### Step 3: Push to GitHub

```bash
# Add remote (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/Finance-Growth-Frontend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

1. **Go to**: https://vercel.com/signup
2. **Sign in** with your GitHub account
3. Click **"Add New Project"**
4. **Import** your `Finance-Growth-Frontend` repository
5. **Configure**:
   - Framework Preset: **Vite** (auto-detected)
   - Root Directory: **`./`** (leave as root)
   - Build Command: **`npm run build`** (auto-detected)
   - Output Directory: **`dist`** (auto-detected)

6. **Environment Variables** (CRITICAL):
   Click "Environment Variables" and add:
   ```
   Name: VITE_API_URL
   Value: https://backend-kavi-sme.onrender.com/api
   ```
   ⚠️ Replace with your actual Render backend URL!

7. Click **"Deploy"**

### Step 5: Update Backend CORS

After deployment, you'll get a Vercel URL like: `https://your-app.vercel.app`

Update your backend's `settings.py` on Render:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-app.vercel.app",  # Add your Vercel URL here
]
```

Then redeploy your backend on Render.

## ✅ Verification

1. Visit your Vercel URL
2. Try to register a new business
3. Check if file uploads work
4. Test login functionality

## 🔄 Future Updates

To update your deployed app:

```bash
# Make changes to your code
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically redeploy! 🎉

## ❓ Troubleshooting

**Problem: CORS errors**
- Solution: Add your Vercel URL to backend's `CORS_ALLOWED_ORIGINS`

**Problem: API not connecting**
- Solution: Check `VITE_API_URL` in Vercel dashboard → Settings → Environment Variables

**Problem: Build fails**
- Solution: Check build logs in Vercel dashboard
- Try building locally: `npm run build`

**Problem: 404 on routes**
- Solution: Already fixed with `vercel.json` rewrites

## 📝 Important Notes

- ✅ Upload the **ROOT folder** to GitHub
- ✅ The `backend` folder stays separate (already on Render)
- ✅ Never commit `.env` file (use environment variables in Vercel)
- ✅ Always use `VITE_API_URL` environment variable for API endpoint
