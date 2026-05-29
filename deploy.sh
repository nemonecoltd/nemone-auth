#!/bin/bash
set -e

echo "🔄 [auth] 배포 시작"

cd /var/www/auth

echo "📦 패키지 설치 중..."
npm ci --production=false

echo "🔨 빌드 중..."
npm run build

echo "🚀 PM2 auth 프로세스 재시작..."
pm2 restart auth --update-env

echo "💾 PM2 상태 저장..."
pm2 save

echo "✅ [auth] 배포 완료"
