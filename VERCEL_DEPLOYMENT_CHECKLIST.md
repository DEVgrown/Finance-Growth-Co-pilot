# Vercel Deployment Checklist ✅

## Your Configuration

**Backend URL**: `https://backend-kavi-sme.onrender.com`  
**GitHub Repo**: `https://github.com/DEVgrown/Finance-Growth-Co-pilot`  
**Status**: ✅ Code pushed to GitHub

---

## Deployment Steps

### Step 1: Deploy to Vercel
1. Go to: https://vercel.com/login
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Import: `DEVgrown/Finance-Growth-Co-pilot`

### Step 2: Configure Project
Vercel should auto-detect:
- ✅ Framework: **Vite**
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`
- ✅ Install Command: `npm install`

### Step 3: Add Environment Variable
**CRITICAL - Don't skip this!**

Click "Environment Variables" and add:
```
Name:  VITE_API_URL
Value: https://backend-kavi-sme.onrender.com/api
```

⚠️ Make sure it ends with `/api`

### Step 4: Deploy
Click **"Deploy"** button

Wait 2-3 minutes for build to complete

### Step 5: Get Your Vercel URL
After deployment, you'll get a URL like:
```
https://finance-growth-co-pilot.vercel.app
```
or
```
https://finance-growth-co-pilot-devgrown.vercel.app
```

### Step 6: Update Backend CORS (Optional but Recommended)
1. Go to your Render dashboard
2. Open your backend service
3. Edit `backend/FG_copilot/settings.py`
4. Update CORS settings:
```python
CORS_ALLOW_ALL_ORIGINS = False  # Change to False for security
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-vercel-url.vercel.app",  # Add your Vercel URL
]
```
5. Commit and push changes
6. Render will auto-redeploy

---

## Testing Your Deployment

### 1. Visit Your Vercel URL
Open the URL in your browser

### 2. Test Registration
- Go to `/register`
- Fill out the business registration form
- Upload documents
- Submit

### 3. Check File Uploads
- Files should upload successfully
- No CORS errors in console

### 4. Test Login
- After admin approval, try logging in
- Dashboard should load with data

---

## Troubleshooting

### ❌ Build Failed
**Check Vercel build logs for errors**
- Missing dependencies? Add to `package.json`
- Build locally first: `npm run build`

### ❌ CORS Errors
**"Access to fetch has been blocked by CORS policy"**
- Add your Vercel URL to backend's `CORS_ALLOWED_ORIGINS`
- Redeploy backend on Render

### ❌ API Not Connecting
**Check environment variable**
- Go to Vercel Dashboard → Settings → Environment Variables
- Verify `VITE_API_URL` is set correctly
- Should be: `https://backend-kavi-sme.onrender.com/api`
- Redeploy if you change it

### ❌ 404 on Routes
**Already fixed with vercel.json**
- The `vercel.json` file handles this
- All routes redirect to `index.html`

### ❌ File Upload Fails
**Check backend media settings**
- Backend should have `MEDIA_URL` and `MEDIA_ROOT` configured
- Already done in your backend ✅

---

## Post-Deployment

### Update Environment Variables
If you need to change the API URL:
1. Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Edit `VITE_API_URL`
4. Redeploy (automatic)

### Custom Domain (Optional)
1. Vercel Dashboard → Your Project
2. Settings → Domains
3. Add your custom domain
4. Follow DNS configuration steps

### Monitor Performance
- Vercel Dashboard → Analytics
- Check page load times
- Monitor API response times

---

## Quick Commands

### Redeploy (after code changes)
```bash
git add .
git commit -m "Your changes"
git push
```
Vercel auto-deploys on push to main branch

### Local Testing
```bash
# Frontend
npm run dev

# Backend (separate terminal)
cd backend
python manage.py runserver
```

---

## Support

**Vercel Issues**: https://vercel.com/support  
**Backend Issues**: Check Render logs  
**CORS Issues**: Update backend settings  

---

**Status**: Ready to Deploy! 🚀

Your code is already on GitHub. Just follow the steps above to deploy to Vercel.
