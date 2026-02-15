# 🚀 Пошаговая инструкция по запуску проекта

## ⚠️ Важно: Сначала установите MongoDB!

### Шаг 1: Установите MongoDB

Откройте **Терминал** и выполните команды:

```bash
# 1. Добавьте репозиторий MongoDB
brew tap mongodb/brew

# 2. Установите MongoDB
brew install mongodb-community

# 3. Запустите MongoDB
brew services start mongodb-community

# 4. Проверьте что MongoDB работает
brew services list | grep mongodb
```

Должно показать: `mongodb-community started`

---

## 📦 Шаг 2: Установите зависимости (УЖЕ ВЫПОЛНЕНО ✅)

Backend зависимости уже установлены!

Теперь установите для Frontend:

```bash
cd /Users/dalersabirov/Desktop/шаблоны/frontend
npm install
```

---

## 🚀 Шаг 3: Запустите Backend

**Откройте ПЕРВЫЙ терминал:**

```bash
cd /Users/dalersabirov/Desktop/шаблоны/backend
npm run dev
```

Вы должны увидеть:
```
✅ MongoDB подключена: localhost
🚀 Сервер запущен на порту 5000
📡 API доступен по адресу: http://localhost:5000
```

---

## 🎨 Шаг 4: Запустите Frontend

**Откройте ВТОРОЙ терминал:**

```bash
cd /Users/dalersabirov/Desktop/шаблоны/frontend
npm start
```

Браузер откроется автоматически на `http://localhost:3000`

---

## ✅ Проверка что всё работает

### 1. Проверьте Backend API:
Откройте в браузере: http://localhost:5000

Должно показать:
```json
{
  "message": "🚀 Datalens API работает!",
  "version": "1.0.0",
  ...
}
```

### 2. Проверьте Frontend:
Откройте: http://localhost:3000

Должна загрузиться страница входа/регистрации

---

## 🐛 Если что-то не работает

### Проблема: "MongoDB не подключается"

**Решение:**
```bash
# Проверьте статус MongoDB
brew services list

# Если не запущен, запустите:
brew services start mongodb-community

# Или запустите вручную:
mongod --config /opt/homebrew/etc/mongod.conf
```

### Проблема: "Port 5000 already in use"

**Решение:**
```bash
# Найдите процесс на порту 5000
lsof -ti:5000

# Убейте процесс (замените PID на номер из предыдущей команды)
kill -9 PID
```

### Проблема: "Frontend не подключается к Backend"

**Решение:**
1. Убедитесь что Backend запущен (http://localhost:5000 работает)
2. Проверьте что нет ошибок CORS в консоли браузера
3. Проверьте Network tab в DevTools

---

## 📝 Полезные команды

### Backend:
```bash
# Запуск в режиме разработки
npm run dev

# Остановить сервер
Ctrl + C
```

### Frontend:
```bash
# Запуск
npm start

# Остановить
Ctrl + C
```

### MongoDB:
```bash
# Запустить
brew services start mongodb-community

# Остановить
brew services stop mongodb-community

# Перезапустить
brew services restart mongodb-community

# Подключиться к MongoDB shell
mongosh
```

---

## 🎯 Быстрый запуск (когда всё уже установлено)

**Терминал 1 - Backend:**
```bash
cd /Users/dalersabirov/Desktop/шаблоны/backend && npm run dev
```

**Терминал 2 - Frontend:**
```bash
cd /Users/dalersabirov/Desktop/шаблоны/frontend && npm start
```

---

## 💡 Совет: Создайте скрипт для быстрого запуска

Создайте файл `start.sh` в корне проекта:

```bash
#!/bin/bash
echo "🚀 Запуск Datalens..."
echo ""

# Проверка MongoDB
if brew services list | grep -q "mongodb-community.*started"; then
    echo "✅ MongoDB уже запущен"
else
    echo "▶️  Запуск MongoDB..."
    brew services start mongodb-community
    sleep 2
fi

# Запуск Backend
echo "▶️  Запуск Backend на порту 5000..."
cd backend
npm run dev &
BACKEND_PID=$!

# Ждем пока Backend запустится
sleep 3

# Запуск Frontend
echo "▶️  Запуск Frontend на порту 3000..."
cd ../frontend
npm start

# При закрытии скрипта - убиваем Backend
trap "kill $BACKEND_PID" EXIT
```

Сделайте скрипт исполняемым:
```bash
chmod +x start.sh
```

Теперь можно запускать всё одной командой:
```bash
./start.sh
```

---

**Готово! Теперь у вас работает полноценное fullstack приложение! 🎉**
