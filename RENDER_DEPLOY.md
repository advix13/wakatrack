# Deploying to Render.com

## Prerequisites
1. Create a [Render](https://render.com) account
2. Have your code pushed to GitHub
3. Get your OpenRouteService API key ready

## Deployment Steps

### 1. Initial Setup
1. Log in to Render dashboard
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository

### 2. Configuration
Configure your web service with these settings:

```
Name: shipment-tracker (or your preferred name)
Environment: Node
Branch: main (or your default branch)
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm start
Instance Type: Free
```

### 3. Environment Variables
Add these environment variables in Render's dashboard:
```
NODE_ENV=production
DATABASE_URL=file:/var/data/sqlite.db
NEXT_PUBLIC_OPENROUTE_API_KEY=your_api_key
```

### 4. Disk Storage
Under "Advanced" settings:
1. Enable "Persistent Disk"
2. Set size to 1 GB (free tier limit)

### 5. Deploy
Click "Create Web Service" and wait for the deployment to complete.

## Post-Deployment

### Checking Deployment
1. Wait for the initial build to complete (5-10 minutes)
2. Your app will be available at `https://your-app-name.onrender.com`
3. The database will be automatically initialized on first run

### Free Tier Limits
- 750 hours/month runtime
- 512 MB RAM
- 0.1 CPU
- 1 GB persistent storage
- Automatic HTTPS
- Global CDN

## Troubleshooting

### If the app doesn't start:
1. Check build logs in Render dashboard
2. Verify environment variables are set correctly
3. Check if persistent disk is properly mounted

### If database issues occur:
1. Verify DATABASE_URL is correct
2. Check if persistent disk has enough space
3. Ensure database file permissions are correct

### Need Help?
- Check Render's documentation: https://render.com/docs
- View service logs in Render dashboard
- Contact Render support if needed
