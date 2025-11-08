# Deployment Guide

## Frontend Deployment to Vercel

### Prerequisites
- Your backend is already deployed on Render
- You have a GitHub account
- You have a Vercel account (sign up at vercel.com)

### Step 1: Prepare Your Repository

1. Make sure you're in the **root directory** (Finance-Growth-Co-pilot), NOT the backend folder
2. Initialize git if not already done:
   ```bash
   git init
   git add .
   git commit -m "Initial frontend commit"
   ```

3. Create a new GitHub repository for your frontend
4. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository (Finance-Growth-Co-pilot)
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

5. **Add Environment Variables** (IMPORTANT):
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
   - Replace with your actual Render backend URL

6. Click "Deploy"

### Step 3: Update Backend CORS Settings

After deployment, update your backend's `settings.py` to allow your Vercel domain:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-vercel-app.vercel.app",  # Add your Vercel URL
]

ALLOWED_HOSTS = [
    "backend-kavi-sme.onrender.com",
    "localhost",
    "127.0.0.1",
]
```

### Step 4: Test Your Deployment

1. Visit your Vercel URL (e.g., https://your-app.vercel.app)
2. Test the registration and login flows
3. Check browser console for any CORS errors

### Troubleshooting

**CORS Errors:**
- Make sure your Vercel URL is added to `CORS_ALLOWED_ORIGINS` in backend
- Redeploy your backend after making changes

**API Connection Issues:**
- Verify `VITE_API_URL` environment variable in Vercel dashboard
- Check that your Render backend is running
- Ensure the URL ends with `/api`

**Build Failures:**
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Try building locally first: `npm run build`

### Redeployment

Vercel automatically redeploys when you push to your main branch:
```bash
git add .
git commit -m "Your changes"
git push
```

## Important Notes

- **DO NOT** commit `.env` file (it's in .gitignore)
- Always use environment variables for sensitive data
- The `backend` folder is separate and should remain on Render
- Only the frontend (root directory) goes to Vercel
