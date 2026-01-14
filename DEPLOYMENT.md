# Deployment Guide - ContaCoop

## Manual Deployment to VPS (146.190.235.111)

### Prerequisites
- SSH access to VPS as root
- Git repository access
- Node.js and npm installed on VPS

### Frontend Deployment Steps

```bash
# 1. SSH into VPS
ssh root@146.190.235.111

# 2. Navigate to frontend directory
cd /var/www/ContaCoop

# 3. Pull latest changes from GitHub
git pull origin master

# 4. Install dependencies (if package.json changed)
npm install

# 5. Build production version
npm run build

# 6. Verify build completed
ls -lh dist/

# 7. Reload nginx (if needed)
systemctl reload nginx

# 8. Check nginx status
systemctl status nginx
```

### Backend Deployment Steps

```bash
# 1. SSH into VPS (if not already connected)
ssh root@146.190.235.111

# 2. Navigate to backend directory
cd /var/www/ContaCoop/backend

# 3. Pull latest changes
git pull origin master

# 4. Install dependencies (if package.json changed)
npm install

# 5. Run Prisma migrations (if schema changed)
npx prisma migrate deploy

# 6. Rebuild TypeScript
npm run build

# 7. Restart backend with PM2
pm2 restart all

# 8. Check PM2 status
pm2 status

# 9. View logs if needed
pm2 logs --lines 50
```

### Quick Deploy Script

Create a file `/root/deploy-contacoop.sh` on VPS:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying ContaCoop..."

# Frontend
echo "📦 Deploying Frontend..."
cd /var/www/ContaCoop
git pull origin master
npm install
npm run build
echo "✅ Frontend built"

# Backend
echo "📦 Deploying Backend..."
cd /var/www/ContaCoop/backend
git pull origin master
npm install
npm run build
pm2 restart all
echo "✅ Backend restarted"

echo "🎉 Deployment complete!"
echo "Frontend: https://www.contacoop.cl"
pm2 status
```

Make it executable:
```bash
chmod +x /root/deploy-contacoop.sh
```

Run deployment:
```bash
/root/deploy-contacoop.sh
```

### Troubleshooting

#### SSH Connection Reset
If you get "Connection reset" errors:
1. Wait 1-2 minutes (might be rate limiting)
2. Check fail2ban status: `systemctl status fail2ban`
3. Unban your IP if needed: `fail2ban-client set sshd unbanip YOUR_IP`

#### Build Fails
- Check Node.js version: `node --version` (should be 18.x or higher)
- Clear npm cache: `npm cache clean --force`
- Remove node_modules and reinstall: `rm -rf node_modules && npm install`

#### PM2 Issues
- Check logs: `pm2 logs`
- Restart specific app: `pm2 restart backend`
- Save PM2 config: `pm2 save`
- Check startup script: `pm2 startup`

#### Nginx Issues
- Check nginx config: `nginx -t`
- View error logs: `tail -f /var/log/nginx/error.log`
- Restart nginx: `systemctl restart nginx`

### Verification Steps

After deployment, verify:

1. **Frontend**: Visit https://www.contacoop.cl
   - Should load without errors
   - Check browser console for errors

2. **Backend**:
   ```bash
   # Check if backend is running
   pm2 status

   # Test backend API
   curl http://localhost:3001/api/health || echo "Health check endpoint"
   ```

3. **Database**:
   ```bash
   cd /var/www/ContaCoop/backend
   npx prisma studio
   # Access at http://146.190.235.111:5555 (if port open)
   ```

### Recent Changes (Commit f71f118)

This deployment includes:
- ✅ New Notifications page for admins (`/notifications`)
- ✅ Send notifications to all socios, socios with debt, or specific users
- ✅ Notification history table
- ✅ Bell icon added to admin sidebar navigation

### Testing the New Features

After deployment, test:
1. Login as admin (admin@cooperative.com)
2. Navigate to "Notificaciones" in sidebar
3. Click "Enviar Notificación"
4. Send a test notification to yourself
5. Login as socio account to verify notification received
6. Click bell icon in header to see notification
