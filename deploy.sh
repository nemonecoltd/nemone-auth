#!/bin/bash
set -e

echo "🔄 [auth] 배포 시작"

cd /var/www/auth

# 의존성 설치 (package-lock.json 기준, node_modules 외 건드리지 않음)
echo "📦 패키지 설치 중..."
npm ci --production=false

# 빌드
echo "🔨 빌드 중..."
npm run build

# auth 프로세스만 재시작 (다른 PM2 프로세스 절대 영향 없음)
echo "🚀 PM2 auth 프로세스 재시작..."
pm2 restart auth --update-env

echo "✅ [auth] 배포 완료"
