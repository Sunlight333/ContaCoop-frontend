# VPS Deployment Guide - ContaCoop

## Server Requirements
- Ubuntu 25.10
- Minimum 2GB RAM
- Node.js 20+
- PostgreSQL 15+
- Nginx

## Step 1: Connect to VPS

```bash
ssh root@72.61.41.94
```

## Step 2: Run Initial Setup Script

Copy and paste this entire script into the terminal:

```bash
#!/bin/bash

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl git nginx postgresql postgresql-contrib ufw certbot python3-certbot-nginx

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installations
node --version
npm --version
psql --version

# Create app user
useradd -m -s /bin/bash coopfinanzas
```

## Step 3: Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell, run:
CREATE USER coopfinanzas WITH PASSWORD 'ContaCoop2024!Secure';
CREATE DATABASE coopfinanzas_db OWNER coopfinanzas;
GRANT ALL PRIVILEGES ON DATABASE coopfinanzas_db TO coopfinanzas;
\q
```

## Step 4: Clone and Setup Backend

```bash
# Create app directory
mkdir -p /var/www/coopfinanzas
cd /var/www/coopfinanzas

# Clone backend repository
git clone https://github.com/linecodedev/socio-founds-backend.git backend
cd backend

# Install dependencies
npm install

# Create environment file
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://coopfinanzas:ContaCoop2024!Secure@localhost:5432/coopfinanzas_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-$(openssl rand -hex 32)"
FRONTEND_URL="https://your-domain.com"
EOF

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy

# Seed database (optional - creates demo data)
npm run seed

# Build TypeScript
npm run build
```

## Step 5: Clone and Setup Frontend

```bash
cd /var/www/coopfinanzas

# Clone frontend repository
git clone https://github.com/linecodedev/socios-funds.git frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cat > .env.production << 'EOF'
VITE_API_URL=https://api.your-domain.com/api
EOF

# Build frontend
npm run build
```

## Step 6: Setup PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd /var/www/coopfinanzas/backend
pm2 start dist/app.js --name "coopfinanzas-api"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
```

## Step 7: Configure Nginx

```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/coopfinanzas << 'EOF'
# Frontend
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/coopfinanzas/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/coopfinanzas /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

## Step 8: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
ufw allow ssh
ufw allow 'Nginx Full'
ufw enable
```

## Step 9: Setup SSL with Let's Encrypt (Optional - requires domain)

```bash
# Replace with your actual domain
certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com
```

## Step 10: Verify Deployment

```bash
# Check backend is running
pm2 status

# Check Nginx is running
systemctl status nginx

# Test API
curl http://localhost:3001/api/health
```

---

## Quick Deploy Script (All-in-One)

Save this as `deploy.sh` and run with `bash deploy.sh`:

```bash
#!/bin/bash
set -e

echo "=== ContaCoop VPS Deployment ==="

# Variables - CHANGE THESE
DOMAIN="your-domain.com"
API_DOMAIN="api.your-domain.com"
DB_PASSWORD="ContaCoop2024!Secure"
JWT_SECRET=$(openssl rand -hex 32)

# Update system
echo "=== Updating system ==="
apt update && apt upgrade -y

# Install packages
echo "=== Installing packages ==="
apt install -y curl git nginx postgresql postgresql-contrib ufw

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# Setup PostgreSQL
echo "=== Setting up PostgreSQL ==="
sudo -u postgres psql -c "CREATE USER coopfinanzas WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE coopfinanzas_db OWNER coopfinanzas;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE coopfinanzas_db TO coopfinanzas;"

# Clone repositories
echo "=== Cloning repositories ==="
mkdir -p /var/www/coopfinanzas
cd /var/www/coopfinanzas

git clone https://github.com/linecodedev/socio-founds-backend.git backend
git clone https://github.com/linecodedev/socios-funds.git frontend

# Setup backend
echo "=== Setting up backend ==="
cd /var/www/coopfinanzas/backend
npm install

cat > .env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://coopfinanzas:$DB_PASSWORD@localhost:5432/coopfinanzas_db"
JWT_SECRET="$JWT_SECRET"
FRONTEND_URL="https://$DOMAIN"
EOF

npx prisma generate
npx prisma migrate deploy
npm run seed
npm run build

# Start backend with PM2
pm2 start dist/app.js --name "coopfinanzas-api"
pm2 save
pm2 startup systemd

# Setup frontend
echo "=== Setting up frontend ==="
cd /var/www/coopfinanzas/frontend
npm install

cat > .env.production << EOF
VITE_API_URL=https://$API_DOMAIN/api
EOF

npm run build

# Configure Nginx
echo "=== Configuring Nginx ==="
cat > /etc/nginx/sites-available/coopfinanzas << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root /var/www/coopfinanzas/frontend/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}

server {
    listen 80;
    server_name $API_DOMAIN;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/coopfinanzas /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Setup firewall
echo "=== Setting up firewall ==="
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

echo "=== Deployment complete! ==="
echo "Frontend: http://$DOMAIN"
echo "API: http://$API_DOMAIN"
pm2 status
```

---

## Accessing Without Domain (IP Only)

If you don't have a domain yet, use this Nginx config:

```bash
cat > /etc/nginx/sites-available/coopfinanzas << 'EOF'
# Frontend - Port 80
server {
    listen 80;
    server_name 72.61.41.94;
    root /var/www/coopfinanzas/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF
```

Then update frontend `.env.production`:
```
VITE_API_URL=http://72.61.41.94/api
```

---

## Useful Commands

```bash
# View backend logs
pm2 logs coopfinanzas-api

# Restart backend
pm2 restart coopfinanzas-api

# Update backend
cd /var/www/coopfinanzas/backend
git pull
npm install
npm run build
pm2 restart coopfinanzas-api

# Update frontend
cd /var/www/coopfinanzas/frontend
git pull
npm install
npm run build
```
