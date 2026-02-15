# Datalens Backend API

Backend API для системы управления проектами Datalens.

## 🚀 Технологии

- **Node.js** - Серверная платформа
- **Express.js** - Web framework
- **MongoDB** - База данных
- **Mongoose** - ODM для MongoDB
- **JWT** - Аутентификация
- **bcryptjs** - Хеширование паролей
- **Multer** - Загрузка файлов

## 📦 Установка

### 1. Установите зависимости:

```bash
npm install
```

### 2. Установите и запустите MongoDB:

**MacOS (с Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
Скачайте и установите MongoDB Community Server с [официального сайта](https://www.mongodb.com/try/download/community)

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 3. Настройте переменные окружения:

Создайте файл `.env` в корне backend папки:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/datalens
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### 4. Запустите сервер:

**Режим разработки (с автоперезагрузкой):**
```bash
npm run dev
```

**Режим production:**
```bash
npm start
```

Сервер запустится на `http://localhost:5000`

## 📡 API Endpoints

### Authentication (Аутентификация)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Регистрация нового пользователя | ❌ |
| POST | `/api/auth/login` | Вход в систему | ❌ |
| GET | `/api/auth/me` | Получить текущего пользователя | ✅ |
| PUT | `/api/auth/profile` | Обновить профиль | ✅ |

### Boards (Доски)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/boards` | Получить все доски | ✅ |
| GET | `/api/boards/:id` | Получить одну доску | ✅ |
| POST | `/api/boards` | Создать доску | ✅ |
| PUT | `/api/boards/:id` | Обновить доску | ✅ |
| DELETE | `/api/boards/:id` | Удалить доску | ✅ |
| GET | `/api/boards/:boardId/tasks` | Получить задачи доски | ✅ |

### Tasks (Задачи)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Получить все задачи | ✅ |
| POST | `/api/tasks` | Создать задачу | ✅ |
| PUT | `/api/tasks/:id` | Обновить задачу | ✅ |
| DELETE | `/api/tasks/:id` | Удалить задачу | ✅ |

### Files (Файлы)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/files` | Получить все файлы | ✅ |
| POST | `/api/files/upload` | Загрузить файл | ✅ |
| DELETE | `/api/files/:id` | Удалить файл | ✅ |

### Settings (Настройки)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/settings` | Получить настройки | ✅ |
| PUT | `/api/settings` | Обновить настройки | ✅ |

## 🔐 Аутентификация

API использует JWT (JSON Web Tokens) для аутентификации.

### Как это работает:

1. **Регистрация/Вход**: Отправьте POST запрос на `/api/auth/register` или `/api/auth/login`
2. **Получение токена**: В ответе вы получите JWT токен
3. **Использование токена**: Включите токен в заголовок Authorization для защищенных маршрутов:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📝 Примеры запросов

### Регистрация

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "password": "password123"
  }'
```

### Вход

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ivan@example.com",
    "password": "password123"
  }'
```

### Создание доски

```bash
curl -X POST http://localhost:5000/api/boards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Мой проект",
    "color": "#4066ff"
  }'
```

### Создание задачи

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Новая задача",
    "description": "Описание задачи",
    "status": "pending",
    "priority": "high",
    "board": "BOARD_ID"
  }'
```

## 🗂 Структура проекта

```
backend/
├── config/
│   └── db.js                 # Конфигурация базы данных
├── controllers/
│   ├── authController.js     # Логика аутентификации
│   ├── boardController.js    # Логика досок
│   ├── taskController.js     # Логика задач
│   ├── fileController.js     # Логика файлов
│   └── settingsController.js # Логика настроек
├── middleware/
│   └── auth.js               # Middleware аутентификации
├── models/
│   ├── User.js               # Модель пользователя
│   ├── Board.js              # Модель доски
│   ├── Task.js               # Модель задачи
│   ├── File.js               # Модель файла
│   └── Settings.js           # Модель настроек
├── routes/
│   ├── auth.js               # Маршруты аутентификации
│   ├── boards.js             # Маршруты досок
│   ├── tasks.js              # Маршруты задач
│   ├── files.js              # Маршруты файлов
│   └── settings.js           # Маршруты настроек
├── utils/
│   └── generateToken.js      # Утилита генерации JWT
├── uploads/                  # Папка загруженных файлов
├── .env                      # Переменные окружения
├── .gitignore
├── package.json
├── README.md
└── server.js                 # Точка входа приложения
```

## 🔒 Безопасность

- ✅ Пароли хешируются с помощью bcryptjs
- ✅ JWT токены для аутентификации
- ✅ Защита маршрутов middleware
- ✅ Валидация входных данных
- ✅ CORS настроен для frontend
- ✅ Проверка прав доступа к ресурсам

## 🐛 Отладка

### Проверка подключения к MongoDB:

```bash
mongo
> show dbs
> use datalens
> show collections
```

### Проверка работы API:

```bash
curl http://localhost:5000
```

Должен вернуть информацию об API.

## 📊 Модели данных

### User (Пользователь)
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  createdAt: Date
}
```

### Board (Доска)
```javascript
{
  name: String,
  color: String,
  owner: ObjectId (ref: User),
  tasks: [ObjectId] (ref: Task),
  createdAt: Date,
  updatedAt: Date
}
```

### Task (Задача)
```javascript
{
  title: String,
  description: String,
  status: Enum ['pending', 'in_progress', 'completed', 'cancelled'],
  priority: Enum ['low', 'medium', 'high'],
  board: ObjectId (ref: Board),
  assignee: ObjectId (ref: User),
  createdBy: ObjectId (ref: User),
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### File (Файл)
```javascript
{
  name: String,
  originalName: String,
  type: String,
  size: Number,
  path: String,
  url: String,
  uploadedBy: ObjectId (ref: User),
  board: ObjectId (ref: Board),
  uploadedAt: Date
}
```

## 🚀 Деплой

### Подготовка к production:

1. Измените `NODE_ENV` на `production`
2. Используйте сильный `JWT_SECRET`
3. Настройте MongoDB Atlas для облачной БД
4. Настройте переменные окружения на сервере

---

**Разработано для Datalens Project Management System** 🎯
