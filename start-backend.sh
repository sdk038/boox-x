#!/bin/bash

echo "🚀 Запуск Backend сервера..."
echo ""

# Проверка MongoDB
echo "Проверка MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB не установлен!"
    echo ""
    echo "Установите MongoDB:"
    echo "  brew tap mongodb/brew"
    echo "  brew install mongodb-community"
    echo "  brew services start mongodb-community"
    exit 1
fi

# Запуск MongoDB если не запущен
if ! brew services list | grep -q "mongodb-community.*started"; then
    echo "▶️  Запуск MongoDB..."
    brew services start mongodb-community
    sleep 2
    echo "✅ MongoDB запущен"
else
    echo "✅ MongoDB уже работает"
fi

echo ""
echo "▶️  Запуск Backend API на http://localhost:5000"
echo ""

cd backend
npm run dev
