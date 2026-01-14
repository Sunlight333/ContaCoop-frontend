#!/bin/bash
set -e

# ContaCoop VPS Deployment Script
# For Ubuntu 25.10 - IP-based deployment (no domain)

SERVER_IP="72.61.41.94"
DB_PASSWORD="ContaCoop2024Secure"
JWT_SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)

echo "============================================"
echo "  ContaCoop VPS Deployment"
echo "  Server: $SERVER_IP"
echo "============================================"

# Update system
echo "[1/10] Updating system..."
apt update && apt upgrade -y

# Install required packages
echo "[2/10] Installing packages..."
apt install -y curl git nginx postgresql postgresql-contrib ufw

# Install Node.js 20
echo "[3/10] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Setup PostgreSQL
echo "[4/10] Setting up PostgreSQL..."
sudo -u postgres psql -c "DROP USER IF EXISTS coopfinanzas;"
sudo -u postgres psql -c "CREATE USER coopfinanzas WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "DROP DATABASE IF EXISTS coopfinanzas_db;"
sudo -u postgres psql -c "CREATE DATABASE coopfinanzas_db OWNER coopfinanzas;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE coopfinanzas_db TO coopfinanzas;"

# Create app directory
echo "[5/10] Cloning repositories..."
rm -rf /var/www/coopfinanzas
mkdir -p /var/www/coopfinanzas
cd /var/www/coopfinanzas

# Clone backend
git clone https://github.com/linecodedev/socio-founds-backend.git backend

# Clone frontend
git clone https://github.com/linecodedev/socios-funds.git frontend

# Setup backend
echo "[6/10] Setting up backend..."
cd /var/www/coopfinanzas/backend
npm install

cat > .env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://coopfinanzas:$DB_PASSWORD@localhost:5432/coopfinanzas_db"
JWT_SECRET="$JWT_SECRET"
FRONTEND_URL="http://$SERVER_IP"
EOF

# Generate Prisma client and migrate
npx prisma generate
npx prisma migrate deploy

# Seed database with demo data
npm run seed || echo "Seed might have partial data, continuing..."

# Build backend
npm run build

# Start backend with PM2
echo "[7/10] Starting backend with PM2..."
pm2 delete coopfinanzas-api 2>/dev/null || true
pm2 start dist/app.js --name "coopfinanzas-api"
pm2 save
pm2 startup systemd -u root --hp /root

# Setup frontend
echo "[8/10] Building frontend..."
cd /var/www/coopfinanzas/frontend
npm install

cat > .env.production << EOF
VITE_API_URL=http://$SERVER_IP/api
EOF

npm run build

# Configure Nginx
echo "[9/10] Configuring Nginx..."
cat > /etc/nginx/sites-available/coopfinanzas << EOF
server {
    listen 80;
    server_name $SERVER_IP;
    root /var/www/coopfinanzas/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Frontend routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/coopfinanzas /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx

# Setup firewall
echo "[10/10] Configuring firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "============================================"
echo "  DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "  Frontend: http://$SERVER_IP"
echo "  API:      http://$SERVER_IP/api"
echo ""
echo "  Demo Credentials:"
echo "  Admin: admin@cooperative.com / admin123"
echo "  Socio: socio@cooperative.com / socio123"
echo ""
echo "  Useful commands:"
echo "  - pm2 status          (check backend status)"
echo "  - pm2 logs            (view backend logs)"
echo "  - pm2 restart all     (restart backend)"
echo ""
pm2 status
echo ""
curl -s http://localhost:3001/api/health || echo "API starting..."
echo ""
echo "============================================"
