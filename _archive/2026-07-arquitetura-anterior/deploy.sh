#!/bin/bash
echo "🚀 Iniciando Deploy da Captur Agência de Viagens..."

# 1. Pull das últimas alterações
git pull origin main

# 2. Subida e migração do banco
cd services/backend
npm install
npx prisma db push
npm run build
cd ../..

# 3. Reiniciar containers com Docker Compose
docker-compose down
docker-compose up -d --build

echo "✅ Sistema no ar e operando com sucesso!"
