#!/bin/bash

# 🏠 Connect and Deploy to Hetzner Server
# This script helps you connect to your server and deploy the apartment scraper

SERVER_IP="5.161.233.42"
DOMAIN="${1:-apartment-scraper.hetzner.local}"
EMAIL="${2:-admin@example.com}"

echo "🏠 Apartment Scraper - Server Connection Helper"
echo "=============================================="
echo "Server IP: $SERVER_IP"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Check if we have SSH key
if [ ! -f ~/.ssh/id_rsa ] && [ ! -f ~/.ssh/id_ed25519 ]; then
    echo "⚠️  No SSH key found. You'll need to:"
    echo "1. Generate an SSH key: ssh-keygen -t ed25519"
    echo "2. Add it to your Hetzner server"
    echo "3. Or use password authentication"
    echo ""
fi

echo "🔗 Connection Methods:"
echo ""
echo "1️⃣  SSH into your server:"
echo "   ssh root@$SERVER_IP"
echo ""
echo "2️⃣  Copy deployment script to server:"
echo "   scp server-deploy.sh root@$SERVER_IP:/tmp/"
echo ""
echo "3️⃣  Run deployment on server:"
echo "   ssh root@$SERVER_IP 'cd /tmp && chmod +x server-deploy.sh && ./server-deploy.sh $DOMAIN $EMAIL'"
echo ""
echo "4️⃣  Or do it all in one command:"
echo "   scp server-deploy.sh root@$SERVER_IP:/tmp/ && ssh root@$SERVER_IP 'cd /tmp && chmod +x server-deploy.sh && ./server-deploy.sh $DOMAIN $EMAIL'"
echo ""

echo "📋 What the deployment will install:"
echo "   ✅ Docker and Docker Compose"
echo "   ✅ PostgreSQL database with your apartment schema"
echo "   ✅ Redis cache"
echo "   ✅ Grafana monitoring dashboard"
echo "   ✅ Nginx reverse proxy"
echo "   ✅ Firewall and security settings"
echo "   ✅ Sample apartment data"
echo ""

echo "🔐 After deployment, you'll get:"
echo "   • Database connection details"
echo "   • Grafana admin credentials"
echo "   • Redis connection info"
echo "   • Health check endpoints"
echo ""

echo "🚀 Ready to deploy? Choose an option above!"

# Interactive mode
read -p "Do you want me to try connecting now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Attempting to connect to $SERVER_IP..."
    ssh -o ConnectTimeout=10 root@$SERVER_IP "echo 'Connection successful! 🎉'; uname -a; uptime"
fi