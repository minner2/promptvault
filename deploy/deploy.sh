#!/bin/bash

# 安装依赖
echo "Installing dependencies..."
cd frontend && npm install
cd ../backend && npm install
cd ..

# 构建前端
echo "Building frontend..."
cd frontend && npm run build
cd ..

# 创建部署目录
echo "Creating deployment directory..."
sudo mkdir -p /var/www/promptvault
sudo chown -R $USER:$USER /var/www/promptvault

# 复制前端文件
echo "Copying frontend files..."
sudo cp -r frontend/dist/* /var/www/promptvault/

# 安装 PM2（如果未安装）
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# 使用 PM2 启动后端
echo "Starting backend with PM2..."
pm2 start deploy/ecosystem.config.js

# 配置 Nginx
echo "Configuring Nginx..."
sudo cp deploy/nginx.conf /etc/nginx/sites-available/promptvault
sudo ln -sf /etc/nginx/sites-available/promptvault /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

echo "Deployment completed!" 