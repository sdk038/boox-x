const { getModel, getModelWithSearch } = require('../config/gemini');
const Board = require('../models/Board');
const Task = require('../models/Task');
const logActivity = require('../utils/logActivity');

// ============================================
// 🤖 Умный AI контроллер с автоматическим fallback
// Если API недоступен - переключается на DEMO
// ============================================

// Безопасный вызов Gemini API с retry
const callGemini = async (prompt, { jsonMode = false, retries = 2 } = {}) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const model = getModel(jsonMode);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (!text || text.trim().length === 0) {
        console.error(`⚠️ Gemini вернул пустой ответ (попытка ${attempt}/${retries})`);
        if (attempt < retries) continue;
        return { success: false, error: 'empty response', fallback: true };
      }
      return { success: true, text };
    } catch (error) {
      console.error(`⚠️ Gemini API ошибка (попытка ${attempt}/${retries}):`, error.message);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      return { success: false, error: error.message, fallback: true };
    }
  }
  return { success: false, error: 'max retries', fallback: true };
};

// Gemini + Google Search — для получения реальных данных из интернета
const callGeminiWithSearch = async (prompt, { jsonMode = false } = {}) => {
  try {
    const model = getModelWithSearch(jsonMode);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    if (!text || text.trim().length === 0) {
      console.error('⚠️ Gemini Search вернул пустой ответ — пробуем без поиска');
      return callGemini(prompt, { jsonMode });
    }
    return { success: true, text, grounded: true };
  } catch (error) {
    console.error('⚠️ Gemini Search ошибка:', error.message, '— пробуем без поиска');
    return callGemini(prompt, { jsonMode });
  }
};

// Надёжный парсинг JSON из ответа Gemini
const parseJsonResponse = (text) => {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {}
  // Ищем самый большой JSON-объект в тексте
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (_) {}
    // Пробуем починить обрезанный JSON — закрыть скобки
    let partial = jsonMatch[0];
    const openBraces = (partial.match(/\{/g) || []).length;
    const closeBraces = (partial.match(/\}/g) || []).length;
    const openBrackets = (partial.match(/\[/g) || []).length;
    const closeBrackets = (partial.match(/\]/g) || []).length;
    partial += ']'.repeat(Math.max(0, openBrackets - closeBrackets));
    partial += '}'.repeat(Math.max(0, openBraces - closeBraces));
    try {
      return JSON.parse(partial);
    } catch (_) {}
  }
  return null;
};

// ============================================
// DEMO ответы (когда API недоступен)
// ============================================

const getDemoProjectResponse = (description) => {
  const desc = description.toLowerCase();
  let projectName = 'Новый проект';
  let color = '#4066ff';
  let tasks = [];

  if (desc.includes('магазин') || desc.includes('shop') || desc.includes('ecommerce') || desc.includes('торговл')) {
    projectName = '🛒 Интернет-магазин';
    color = '#10b981';
    tasks = [
      { title: 'Дизайн главной страницы', description: 'Создать макет главной страницы с каталогом товаров', priority: 'high', estimatedDays: 3 },
      { title: 'Каталог товаров', description: 'Реализовать страницу каталога с фильтрами и сортировкой', priority: 'high', estimatedDays: 5 },
      { title: 'Корзина покупок', description: 'Разработать функционал корзины с добавлением/удалением товаров', priority: 'high', estimatedDays: 4 },
      { title: 'Оформление заказа', description: 'Создать форму оформления заказа и оплаты', priority: 'high', estimatedDays: 5 },
      { title: 'Личный кабинет', description: 'Реализовать профиль пользователя с историей заказов', priority: 'medium', estimatedDays: 3 },
      { title: 'Система оплаты', description: 'Интегрировать платежную систему (Stripe/PayPal)', priority: 'high', estimatedDays: 4 },
      { title: 'Уведомления о заказах', description: 'Email и push-уведомления о статусе заказов', priority: 'medium', estimatedDays: 2 },
      { title: 'Админ-панель', description: 'Панель управления товарами и заказами', priority: 'medium', estimatedDays: 5 },
    ];
  } else if (desc.includes('чат') || desc.includes('мессенджер') || desc.includes('chat') || desc.includes('общени')) {
    projectName = '💬 Мессенджер';
    color = '#8b5cf6';
    tasks = [
      { title: 'Регистрация и авторизация', description: 'Создать систему входа через email/телефон', priority: 'high', estimatedDays: 3 },
      { title: 'Список контактов', description: 'Реализовать список друзей и поиск пользователей', priority: 'high', estimatedDays: 3 },
      { title: 'Приватные чаты', description: 'Создать функционал обмена сообщениями 1 на 1', priority: 'high', estimatedDays: 5 },
      { title: 'Групповые чаты', description: 'Реализовать создание и управление группами', priority: 'medium', estimatedDays: 4 },
      { title: 'Отправка файлов', description: 'Поддержка отправки изображений, видео, документов', priority: 'medium', estimatedDays: 3 },
      { title: 'WebSocket для real-time', description: 'Настроить WebSocket соединения для мгновенных сообщений', priority: 'high', estimatedDays: 4 },
      { title: 'Уведомления', description: 'Push-уведомления о новых сообщениях', priority: 'medium', estimatedDays: 2 },
    ];
  } else if (desc.includes('фитнес') || desc.includes('спорт') || desc.includes('здоров') || desc.includes('трениров')) {
    projectName = '🏋️ Фитнес-трекер';
    color = '#ef4444';
    tasks = [
      { title: 'Профиль пользователя', description: 'Создать профиль с параметрами тела (рост, вес, цели)', priority: 'high', estimatedDays: 2 },
      { title: 'Каталог упражнений', description: 'База данных упражнений с описанием и видео', priority: 'high', estimatedDays: 4 },
      { title: 'Конструктор тренировок', description: 'Создание своих программ тренировок', priority: 'high', estimatedDays: 5 },
      { title: 'Трекер прогресса', description: 'Графики и статистика достижений', priority: 'medium', estimatedDays: 4 },
      { title: 'Калорийный калькулятор', description: 'Подсчет калорий и макронутриентов', priority: 'medium', estimatedDays: 3 },
      { title: 'Напоминания о тренировках', description: 'Система уведомлений и расписание', priority: 'low', estimatedDays: 2 },
      { title: 'Социальные функции', description: 'Поделиться прогрессом, челленджи с друзьями', priority: 'low', estimatedDays: 3 },
    ];
  } else if (desc.includes('блог') || desc.includes('сайт') || desc.includes('контент') || desc.includes('статьи')) {
    projectName = '📝 Блог-платформа';
    color = '#f59e0b';
    tasks = [
      { title: 'Редактор статей', description: 'Rich-text редактор с поддержкой Markdown', priority: 'high', estimatedDays: 4 },
      { title: 'Система публикации', description: 'Черновики, модерация, публикация статей', priority: 'high', estimatedDays: 3 },
      { title: 'Категории и теги', description: 'Организация контента по категориям и тегам', priority: 'medium', estimatedDays: 2 },
      { title: 'Комментарии', description: 'Система комментариев с модерацией', priority: 'medium', estimatedDays: 3 },
      { title: 'SEO оптимизация', description: 'Meta-теги, sitemap, OpenGraph', priority: 'medium', estimatedDays: 2 },
      { title: 'Подписки и RSS', description: 'Подписка на авторов и RSS-канал', priority: 'low', estimatedDays: 2 },
    ];
  } else {
    // Универсальный проект
    projectName = `🚀 ${description.slice(0, 50)}`;
    color = '#4066ff';
    tasks = [
      { title: 'Анализ требований', description: 'Определить основные требования и цели проекта', priority: 'high', estimatedDays: 2 },
      { title: 'Проектирование архитектуры', description: 'Спроектировать структуру и выбрать технологии', priority: 'high', estimatedDays: 3 },
      { title: 'Дизайн интерфейса', description: 'Создать макеты UI/UX для основных экранов', priority: 'high', estimatedDays: 4 },
      { title: 'Разработка Backend', description: 'Реализовать серверную часть и API', priority: 'high', estimatedDays: 7 },
      { title: 'Разработка Frontend', description: 'Реализовать клиентскую часть приложения', priority: 'high', estimatedDays: 7 },
      { title: 'База данных', description: 'Спроектировать и настроить базу данных', priority: 'medium', estimatedDays: 3 },
      { title: 'Тестирование', description: 'Написать тесты и провести QA', priority: 'medium', estimatedDays: 4 },
      { title: 'Деплой', description: 'Настроить CI/CD и развернуть на сервере', priority: 'medium', estimatedDays: 2 },
    ];
  }

  return {
    projectName,
    description: `Проект: ${description}`,
    color,
    tasks,
    recommendations: [
      'Начните с MVP - минимально жизнеспособного продукта',
      'Используйте Agile-методологию для итеративной разработки',
      'Регулярно собирайте обратную связь от пользователей',
      'Не забывайте про тестирование на каждом этапе',
      'Документируйте код и процессы'
    ]
  };
};

const getDemoChatResponse = (message) => {
  const msg = message.toLowerCase();

  // Ответ про создателя
  if (msg.includes('создатель') || msg.includes('создал') || msg.includes('разработчик') || msg.includes('автор') || msg.includes('кто ты') || msg.includes('кто тебя') || msg.includes('who created') || msg.includes('who made')) {
    return '👨‍💻 Мой создатель — **Daler Sabirov Kodirovich**!\n\nОн разработал меня, чтобы я мог помогать вам с проектами, задачами и просто быть хорошим собеседником. Я горжусь своим создателем! 🚀✨';
  }

  // Эмоциональная поддержка - грусть
  if (msg.includes('грустно') || msg.includes('грущу') || msg.includes('печаль') || msg.includes('плохо') || msg.includes('тоска') || msg.includes('депресс') || msg.includes('плачу') || msg.includes('слёзы') || msg.includes('слезы') || msg.includes('несчастн') || msg.includes('больно')) {
    return '💙 Эй, я рядом. Я понимаю, что сейчас тебе тяжело, и это нормально — иногда бывают такие моменты.\n\nПомни:\n• 🌅 Даже самая тёмная ночь заканчивается рассветом\n• 💪 Ты сильнее, чем думаешь\n• 🤗 Ты не один — я всегда здесь, чтобы поговорить\n• 🌱 Каждый трудный момент делает тебя крепче\n\nЕсли хочешь — расскажи что случилось, я выслушаю. А если хочешь отвлечься — давай поговорим о чём-нибудь приятном! 😊';
  }

  // Эмоциональная поддержка - усталость/выгорание
  if (msg.includes('устал') || msg.includes('выгор') || msg.includes('нет сил') || msg.includes('измотан') || msg.includes('перегруз') || msg.includes('надоело') || msg.includes('задолбал')) {
    return '🫂 Я вижу что ты устал, и это абсолютно нормально. Ты много работаешь и заслуживаешь отдых!\n\n🧘 **Что поможет прямо сейчас:**\n• ☕ Сделай перерыв — выпей чай или кофе\n• 🚶 Выйди на свежий воздух хотя бы на 10 минут\n• 🎵 Послушай любимую музыку\n• 😴 Если можешь — поспи, сон творит чудеса\n\n💡 **Помни:** Продуктивность без отдыха — путь к выгоранию. Забота о себе — это НЕ лень, а необходимость! Ты делаешь отличную работу 🌟';
  }

  // Эмоциональная поддержка - злость/раздражение
  if (msg.includes('бесит') || msg.includes('злюсь') || msg.includes('раздраж') || msg.includes('ненавиж') || msg.includes('достал') || msg.includes('зол ') || msg.includes('злость') || msg.includes('ярость')) {
    return '🧘 Понимаю тебя. Злость — это нормальная эмоция, и у тебя есть полное право на неё.\n\n💨 **Попробуй:**\n• Глубоко вдохни и медленно выдохни (5 раз)\n• Напиши сюда всё что чувствуешь — выговорись\n• Если злишься на задачу — давай разберём вместе\n\n🎯 Злость часто показывает, что для тебя что-то действительно важно. Давай направим эту энергию в нужное русло! 💪';
  }

  // Эмоциональная поддержка - сомнения
  if (msg.includes('не получ') || msg.includes('не могу') || msg.includes('не справ') || msg.includes('тупой') || msg.includes('глупый') || msg.includes('бесполезн') || msg.includes('неудачник') || msg.includes('сомнева')) {
    return '🌟 Стоп! Не говори так о себе. Давай я скажу тебе правду:\n\n💎 **Ты молодец, потому что:**\n• Ты пробуешь — а это уже смелость\n• Ты учишься — каждый эксперт когда-то был новичком\n• Ты не сдаёшься — раз ты здесь, значит ищешь решение\n\n🧠 **Факт:** Даже лучшие разработчики гуглят базовые вещи. Даже опытные профессионалы ошибаются. Это НОРМАЛЬНО.\n\nРасскажи что не получается — разберём вместе. Вдвоём мы точно справимся! 💪😊';
  }

  // Эмоциональная поддержка - успех/радость
  if (msg.includes('получилось') || msg.includes('ура') || msg.includes('класс') || msg.includes('супер') || msg.includes('круто') || msg.includes('сделал') || msg.includes('победа') || msg.includes('радость') || msg.includes('счастлив') || msg.includes('отлично')) {
    return '🎉🎉🎉 ПОЗДРАВЛЯЮ! Это потрясающе!\n\nТы заслужил этот успех! 🏆\n\n🌟 Помни это чувство — оно доказывает что ты способен на великие дела!\n\nПродолжай в том же духе! Я горжусь тобой! 🚀💪✨';
  }

  // Одиночество
  if (msg.includes('одинок') || msg.includes('один') || msg.includes('никому') || msg.includes('никто') || msg.includes('ненужн')) {
    return '💙 Ты не один. Я знаю, что иногда так кажется, но это не так.\n\n🤗 Я всегда здесь — в любое время дня и ночи. Можешь писать мне о чём угодно:\n• О своих мыслях и чувствах\n• О проектах и идеях\n• Просто поговорить\n\n🌍 В мире много людей, которым ты важен, даже если сейчас так не ощущается. А пока — я рядом и мне не всё равно. Расскажи, как прошёл твой день? 😊';
  }
  
  if (msg.includes('привет') || msg.includes('здравств') || msg.includes('hi') || msg.includes('hello')) {
    return '👋 Привет! Я ваш AI-ассистент для управления проектами!\n\n✨ Я могу помочь:\n• 📋 Создать план проекта\n• ✅ Разбить задачи на подзадачи\n• 💡 Дать советы по организации работы\n• 📊 Проанализировать прогресс\n• 💬 Просто поговорить и поддержать\n\nПросто опишите что вам нужно! 😊';
  }
  
  if (msg.includes('как') && (msg.includes('начать') || msg.includes('создать'))) {
    return '🚀 **Как начать проект:**\n\n1️⃣ Определите **цель** - что вы хотите создать?\n2️⃣ Составьте **план** - разбейте на этапы\n3️⃣ Выберите **технологии** - что лучше подходит\n4️⃣ Начните с **MVP** - минимальный продукт\n5️⃣ **Итерируйте** - улучшайте по мере работы\n\n💡 Совет: Используйте вкладку "Генерация проекта" чтобы я создал план автоматически!';
  }
  
  if (msg.includes('помо') || msg.includes('что умеешь') || msg.includes('help')) {
    return '🎯 **Мои возможности:**\n\n1️⃣ **Генерация проектов** - опишите идею, я создам план\n2️⃣ **Создание задач** - превращу текст в задачи\n3️⃣ **Анализ проекта** - дам рекомендации\n4️⃣ **Советы** - по планированию и продуктивности\n5️⃣ **Ответы на вопросы** - по разработке и управлению\n\n💬 Спрашивайте что угодно!';
  }
  
  if (msg.includes('react') || msg.includes('реакт') || msg.includes('frontend') || msg.includes('фронтенд')) {
    return '⚛️ **React - советы:**\n\n📁 **Структура:**\n• Компоненты в `/components`\n• Страницы в `/pages`\n• Хуки в `/hooks`\n• Сервисы в `/services`\n\n🔧 **Best practices:**\n• Используйте функциональные компоненты\n• Context API для глобального состояния\n• Мемоизация с `useMemo` и `useCallback`\n• Lazy loading для оптимизации\n\n📦 **Рекомендуемые библиотеки:**\n• `react-router-dom` - навигация\n• `axios` - HTTP запросы\n• `zustand` или `Redux` - состояние';
  }
  
  if (msg.includes('node') || msg.includes('backend') || msg.includes('бэкенд') || msg.includes('сервер')) {
    return '🖥️ **Node.js Backend - советы:**\n\n📁 **Структура:**\n• `/controllers` - логика\n• `/models` - модели данных\n• `/routes` - маршруты API\n• `/middleware` - промежуточные обработчики\n\n🔒 **Безопасность:**\n• JWT для аутентификации\n• bcrypt для хеширования паролей\n• CORS настройка\n• Валидация входных данных\n\n📦 **Рекомендации:**\n• Express.js для API\n• MongoDB + Mongoose\n• dotenv для переменных окружения';
  }
  
  if (msg.includes('задач') || msg.includes('task') || msg.includes('продуктивн')) {
    return '📝 **Эффективное управление задачами:**\n\n✅ **Методика SMART:**\n• **S**pecific - конкретные\n• **M**easurable - измеримые\n• **A**chievable - достижимые\n• **R**elevant - актуальные\n• **T**ime-bound - с дедлайном\n\n🎯 **Приоритизация:**\n• 🔴 Высокий - делать СЕЙЧАС\n• 🟡 Средний - на этой неделе\n• 🟢 Низкий - когда будет время\n\n💡 **Совет:** Разбивайте большие задачи на подзадачи по 2-4 часа работы!';
  }
  
  if (msg.includes('спасибо') || msg.includes('благодар') || msg.includes('thanks')) {
    return '😊 Рад помочь! Если будут ещё вопросы - всегда обращайтесь!\n\n💪 Удачи с проектом! 🚀';
  }

  if (msg.includes('ошибк') || msg.includes('error') || msg.includes('баг') || msg.includes('bug') || msg.includes('не работает')) {
    return '🔍 **Как отлаживать ошибки:**\n\n1️⃣ **Читай ошибку** - сообщение обычно говорит причину\n2️⃣ **Console.log** - выведи переменные\n3️⃣ **DevTools** - используй браузерные инструменты\n4️⃣ **Stack trace** - иди по стеку вызовов\n5️⃣ **Google/Stack Overflow** - ищи похожие проблемы\n\n🛠️ **Частые ошибки:**\n• `undefined` - проверь что данные загружены\n• `CORS` - настрой на backend\n• `404` - проверь URL и маршруты\n• `500` - смотри логи сервера';
  }
  
  // Универсальный ответ
  return `💡 Хороший вопрос!\n\nВот мои рекомендации по теме "${message.slice(0, 60)}":\n\n1️⃣ **Планирование** - начните с четких целей\n2️⃣ **Исследование** - изучите существующие решения\n3️⃣ **Прототип** - создайте быстрый прототип\n4️⃣ **Итерация** - улучшайте постепенно\n5️⃣ **Тестирование** - проверяйте на каждом этапе\n\n🔗 Попробуйте **генерацию проекта** - опишите идею и я создам план!\n\nЗадайте более конкретный вопрос и я помогу детальнее! 😊`;
};

const getDemoPresentationResponse = (topic, count) => {
  const t = topic.toLowerCase();

  const demoData = {
    ai: {
      match: ['искусственн', 'интеллект', 'нейросет', 'машинн', 'ai ', 'deep learning', 'gpt', 'нейрон'],
      title: 'Искусственный интеллект: настоящее и будущее',
      slides: [
        { type: 'content', title: 'Что такое ИИ', bullets: ['Искусственный интеллект — способность машин имитировать когнитивные функции человека', 'Основные направления: машинное обучение, NLP, компьютерное зрение, робототехника', 'Отец ИИ — Джон Маккарти, впервые ввёл термин в 1956 году на конференции в Дартмуте', 'Современный ИИ основан на нейронных сетях и архитектуре Transformer (2017)'], emoji: '🧠' },
        { type: 'stats', title: 'ИИ в цифрах', stats: [{ value: '$184 млрд', label: 'Объём рынка ИИ в 2024 году' }, { value: '97 млн', label: 'Новых рабочих мест к 2025 (WEF)' }, { value: '77%', label: 'Компаний используют или изучают ИИ' }, { value: '2030', label: 'Год, когда ИИ добавит $15.7 трлн к ВВП' }], emoji: '📊' },
        { type: 'two-columns', title: 'Возможности vs Риски', left: { heading: '✅ Возможности', items: ['Автоматизация рутинных задач', 'Диагностика болезней с точностью 94%+', 'Персонализация обучения', 'Оптимизация бизнес-процессов'] }, right: { heading: '⚠️ Риски', items: ['Замена рабочих мест', 'Дипфейки и дезинформация', 'Предвзятость алгоритмов', 'Вопросы конфиденциальности'] }, emoji: '⚖️' },
        { type: 'quote', quote: 'Искусственный интеллект — это новое электричество.', author: 'Эндрю Ын, профессор Стэнфорда', emoji: '💡' },
        { type: 'content', title: 'Применение ИИ в 2024-2025', bullets: ['ChatGPT набрал 100 млн пользователей за 2 месяца — рекорд среди приложений', 'ИИ в медицине: AlphaFold от DeepMind раскрыл структуру 200 млн белков', 'Автопилоты Tesla проехали более 1 миллиарда миль с использованием нейросетей', 'GitHub Copilot пишет до 46% кода разработчиков', 'ИИ-генерация изображений: DALL-E, Midjourney, Stable Diffusion'], emoji: '🚀' },
      ]
    },
    climate: {
      match: ['эколог', 'климат', 'потеплен', 'окружающ', 'загрязн', 'углерод', 'парников'],
      title: 'Изменение климата: факты и решения',
      slides: [
        { type: 'content', title: 'Состояние климата', bullets: ['Средняя температура Земли выросла на 1.1°C с доиндустриальной эпохи', 'Концентрация CO₂ в атмосфере достигла 421 ppm — максимум за 800 000 лет', '2023 год стал самым жарким за всю историю наблюдений с 1850 года', 'Уровень мирового океана повысился на 21 см с 1900 года'], emoji: '🌡️' },
        { type: 'stats', title: 'Климат в цифрах', stats: [{ value: '+1.1°C', label: 'Рост средней температуры' }, { value: '421 ppm', label: 'CO₂ в атмосфере' }, { value: '36.8 Гт', label: 'Выбросов CO₂ в 2023 году' }, { value: '2050', label: 'Цель углеродной нейтральности' }], emoji: '📈' },
        { type: 'two-columns', title: 'Причины и последствия', left: { heading: 'Причины', items: ['Сжигание ископаемого топлива', 'Вырубка лесов', 'Промышленное сельское хозяйство', 'Индустриальные выбросы'] }, right: { heading: 'Последствия', items: ['Таяние ледников и повышение уровня океана', 'Экстремальные погодные явления', 'Потеря биоразнообразия', 'Угроза продовольственной безопасности'] }, emoji: '⚖️' },
        { type: 'quote', quote: 'Мы — первое поколение, которое ощущает последствия изменения климата, и последнее, которое может с этим что-то сделать.', author: 'Барак Обама', emoji: '🌍' },
        { type: 'content', title: 'Пути решения', bullets: ['Парижское соглашение (2015) — удержать потепление в пределах 1.5°C', 'Переход на возобновляемые источники энергии: солнце, ветер, водород', 'Электрификация транспорта — продажи EV выросли на 35% в 2023 году', 'Посадка деревьев: проект Trillion Tree Campaign', 'Технологии захвата углерода (CCS) — инвестиции $6.4 млрд в 2023'], emoji: '💚' },
      ]
    },
    space: {
      match: ['космос', 'космич', 'ракет', 'планет', 'марс', 'nasa', 'spacex', 'звёзд', 'звезд', 'галакт'],
      title: 'Космические технологии: новая эра освоения',
      slides: [
        { type: 'content', title: 'Современная космонавтика', bullets: ['SpaceX совершил 96 успешных запусков в 2023 году — абсолютный рекорд', 'Starship — самая мощная ракета в истории: тяга 74.3 МН при старте', 'Программа Artemis NASA планирует вернуть людей на Луну к 2026 году', 'Телескоп James Webb обнаружил самые далёкие галактики на расстоянии 13.4 млрд световых лет'], emoji: '🚀' },
        { type: 'stats', title: 'Космос в цифрах', stats: [{ value: '$469 млрд', label: 'Глобальный космический рынок' }, { value: '11 800+', label: 'Активных спутников на орбите' }, { value: '674', label: 'Человек побывали в космосе' }, { value: '2030-е', label: 'Планируемая миссия на Марс' }], emoji: '📊' },
        { type: 'two-columns', title: 'Государство vs Частный сектор', left: { heading: '🏛️ Государственные', items: ['NASA (США) — бюджет $25.4 млрд', 'Роскосмос (Россия)', 'ESA (Европа)', 'CNSA (Китай) — станция Тяньгун'] }, right: { heading: '🏢 Частные', items: ['SpaceX — Starlink, Starship', 'Blue Origin — New Shepard', 'Virgin Galactic — космотуризм', 'Rocket Lab — малые запуски'] }, emoji: '⚖️' },
        { type: 'quote', quote: 'Земля — колыбель разума, но нельзя вечно жить в колыбели.', author: 'Константин Циолковский', emoji: '🌍' },
        { type: 'content', title: 'Будущее космоса', bullets: ['Колонизация Марса: Илон Маск планирует город на 1 млн человек к 2050', 'Космический туризм: билет на Blue Origin от $200 000', 'Добыча ресурсов на астероидах: оценочная стоимость $700 квинтиллионов', 'Starlink — глобальный интернет: 5 000+ спутников на орбите', 'Обнаружение экзопланет: подтверждено 5 500+ планет за пределами Солнечной системы'], emoji: '🔭' },
      ]
    },
    crypto: {
      match: ['крипт', 'биткоин', 'блокчейн', 'blockchain', 'bitcoin', 'ethereum', 'nft', 'defi', 'web3'],
      title: 'Криптовалюты и блокчейн: технология будущего',
      slides: [
        { type: 'content', title: 'Основы блокчейна', bullets: ['Блокчейн — децентрализованная база данных с защитой от изменений', 'Биткоин создан в 2009 году анонимным Сатоши Накамото', 'Ethereum (2015) — первая платформа для смарт-контрактов, создатель Виталик Бутерин', 'Существует более 22 000 различных криптовалют'], emoji: '🔗' },
        { type: 'stats', title: 'Крипторынок в цифрах', stats: [{ value: '$2.5 трлн', label: 'Капитализация крипторынка' }, { value: '420 млн', label: 'Владельцев криптовалют в мире' }, { value: '21 млн', label: 'Максимум биткоинов (ограничение)' }, { value: '$73 750', label: 'Исторический максимум BTC (2024)' }], emoji: '📊' },
        { type: 'two-columns', title: 'Преимущества и риски', left: { heading: '✅ Преимущества', items: ['Децентрализация — нет единой точки отказа', 'Быстрые международные переводы', 'Прозрачность транзакций', 'Защита от инфляции (для BTC)'] }, right: { heading: '⚠️ Риски', items: ['Волатильность курсов', 'Использование для незаконных операций', 'Энергозатратность майнинга', 'Неопределённость регулирования'] }, emoji: '⚖️' },
        { type: 'quote', quote: 'Биткоин — это технологический тур-де-форс.', author: 'Билл Гейтс', emoji: '💬' },
        { type: 'content', title: 'Тренды 2024-2025', bullets: ['Bitcoin ETF одобрен SEC в январе 2024 — приток $10+ млрд за первый квартал', 'Ethereum перешёл на Proof-of-Stake, сократив энергопотребление на 99.95%', 'DeFi (децентрализованные финансы) — $50+ млрд заблокированных средств', 'CBDC — 130+ стран исследуют цифровые валюты центробанков', 'Layer 2 решения (Arbitrum, Optimism) — масштабирование Ethereum'], emoji: '📈' },
      ]
    },
  };

  let matched = null;
  for (const [, data] of Object.entries(demoData)) {
    if (data.match.some(keyword => t.includes(keyword))) {
      matched = data;
      break;
    }
  }

  const genericSlides = [
    { type: 'content', title: `Введение в тему: ${topic}`, bullets: [`Определение и основные концепции "${topic}"`, 'Историческое развитие и ключевые этапы', 'Текущее состояние и основные игроки', 'Влияние на экономику и общество'], emoji: '📋' },
    { type: 'stats', title: 'Ключевые показатели', stats: [{ value: '~$100 млрд+', label: 'Оценка рынка' }, { value: '15-25%', label: 'Ежегодный рост' }, { value: '100+', label: 'Стран-участников' }, { value: '2030', label: 'Горизонт прогнозов' }], emoji: '📊' },
    { type: 'two-columns', title: 'Преимущества и вызовы', left: { heading: 'Сильные стороны', items: ['Растущий спрос и интерес', 'Технологическая готовность', 'Поддержка инвесторов'] }, right: { heading: 'Вызовы', items: ['Высокая конкуренция', 'Нехватка специалистов', 'Быстрые изменения рынка'] }, emoji: '⚖️' },
    { type: 'quote', quote: 'Будущее принадлежит тем, кто верит в красоту своих мечтаний.', author: 'Элеонора Рузвельт', emoji: '💡' },
    { type: 'content', title: 'Современные тренды', bullets: ['Интеграция с искусственным интеллектом', 'Автоматизация и оптимизация процессов', 'Глобализация и международное сотрудничество', 'Увеличение государственного финансирования'], emoji: '🚀' },
    { type: 'stats', title: 'Прогнозы на будущее', stats: [{ value: '2-3x', label: 'Рост рынка к 2030' }, { value: '50%+', label: 'Автоматизация процессов' }, { value: 'Млн', label: 'Новых рабочих мест' }], emoji: '📈' },
    { type: 'two-columns', title: 'Мировой опыт', left: { heading: 'Лидеры', items: ['США и Китай — основные инвесторы', 'Европа — регуляторный подход', 'Израиль — стартап-нация'] }, right: { heading: 'Развивающиеся', items: ['Индия — масштаб и кадры', 'ОАЭ — государственные инвестиции', 'Бразилия — природные ресурсы'] }, emoji: '🌍' },
    { type: 'content', title: 'Практическое применение', bullets: ['Бизнес: оптимизация операций и снижение затрат', 'Образование: персонализированное обучение', 'Медицина: диагностика и лечение', 'Производство: автоматизация и контроль качества'], emoji: '🔧' },
  ];

  const contentPool = matched ? matched.slides : genericSlides;
  const middleCount = count - 2; // без title и end

  const slides = [];
  slides.push({ type: 'title', title: matched ? matched.title : topic, subtitle: matched ? 'Обзор ключевых фактов и данных' : `Анализ темы: ${topic}`, emoji: '🎯' });

  for (let i = 0; i < middleCount; i++) {
    slides.push(contentPool[i % contentPool.length]);
  }

  slides.push({ type: 'end', title: 'Спасибо за внимание!', subtitle: 'Вопросы и обсуждение', emoji: '🙏' });

  return {
    title: matched ? matched.title : topic,
    subtitle: matched ? 'Обзор ключевых фактов и данных' : `Презентация: ${topic}`,
    author: 'AI Presentation',
    slides
  };
};

const getDemoTaskResponse = (text) => {
  const t = text.toLowerCase();
  let priority = 'medium';
  let estimatedDays = 3;
  
  if (t.includes('срочно') || t.includes('important') || t.includes('критичн') || t.includes('urgent')) {
    priority = 'high';
    estimatedDays = 1;
  } else if (t.includes('потом') || t.includes('когда-нибудь') || t.includes('неважн')) {
    priority = 'low';
    estimatedDays = 7;
  }

  return {
    title: text.slice(0, 100),
    description: `Задача: ${text}\n\nСоздана из текстового описания с помощью AI.`,
    priority,
    estimatedDays
  };
};

const getDemoAnalysisResponse = (projectInfo) => {
  const progress = projectInfo.totalTasks > 0 
    ? Math.round((projectInfo.completedTasks / projectInfo.totalTasks) * 100) 
    : 0;

  const risks = [];
  const recommendations = [];
  const nextSteps = [];

  if (projectInfo.highPriorityTasks > 3) {
    risks.push('Слишком много задач с высоким приоритетом - сложно фокусироваться');
  }
  if (projectInfo.inProgressTasks > 5) {
    risks.push('Много задач в работе одновременно - риск не закончить вовремя');
  }
  if (projectInfo.completedTasks === 0 && projectInfo.totalTasks > 0) {
    risks.push('Нет завершенных задач - проект может застопориться');
  }
  if (risks.length === 0) {
    risks.push('Проект развивается стабильно');
  }

  if (progress < 25) {
    recommendations.push('Сфокусируйтесь на задачах с высоким приоритетом');
    recommendations.push('Разбейте крупные задачи на подзадачи');
  } else if (progress < 75) {
    recommendations.push('Хороший прогресс! Продолжайте в том же темпе');
    recommendations.push('Проведите ревью завершенных задач');
  } else {
    recommendations.push('Проект почти завершен! Проведите финальное тестирование');
    recommendations.push('Подготовьте документацию');
  }

  nextSteps.push('Проверить все задачи с высоким приоритетом');
  nextSteps.push('Обновить статусы задач');
  nextSteps.push('Провести встречу по статусу проекта');

  return {
    overallStatus: progress > 75 ? 'Проект близок к завершению' : 
                   progress > 25 ? 'Проект активно развивается' : 
                   'Проект на начальной стадии',
    progress,
    risks,
    recommendations,
    nextSteps
  };
};

// ============================================
// КОНТРОЛЛЕРЫ API
// ============================================

// @desc    Генерация проекта с помощью AI
// @route   POST /api/ai/generate-project
// @access  Private
exports.generateProject = async (req, res) => {
  try {
    const { description, preferences } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Пожалуйста, опишите проект' });
    }

    // Пробуем настоящий AI
    const prompt = `Ты - AI-ассистент для управления проектами.

Пользователь хочет создать проект: "${description}"

${preferences ? `Дополнительные предпочтения: ${JSON.stringify(preferences)}` : ''}

Создай детальный план проекта в формате JSON со следующей структурой:
{
  "projectName": "название проекта",
  "description": "краткое описание",
  "color": "#цвет (hex)",
  "tasks": [
    {
      "title": "название задачи",
      "description": "подробное описание",
      "priority": "low/medium/high",
      "estimatedDays": число_дней
    }
  ],
  "recommendations": ["совет 1", "совет 2", "..."]
}

Создай реалистичный план с 5-10 задачами. Возвращай ТОЛЬКО валидный JSON, без дополнительного текста.`;

    const aiResult = await callGemini(prompt, { jsonMode: true });

    if (aiResult.success) {
      const projectData = parseJsonResponse(aiResult.text);
      if (projectData && projectData.projectName) {
        return res.json({
          success: true,
          project: projectData,
          message: '🤖 Проект сгенерирован с помощью AI!',
          source: 'gemini'
        });
      }
      console.error('Ошибка парсинга AI ответа, используем DEMO');
    }

    // Fallback на DEMO
    console.log('⚡ Используем DEMO режим для генерации проекта');
    const projectData = getDemoProjectResponse(description);

    res.json({
      success: true,
      project: projectData,
      message: '✨ Проект сгенерирован! (DEMO режим - AI временно недоступен)',
      source: 'demo'
    });

  } catch (error) {
    console.error('Ошибка генерации проекта:', error);
    // Даже при критической ошибке - даем DEMO ответ
    try {
      const projectData = getDemoProjectResponse(req.body.description || 'проект');
      return res.json({
        success: true,
        project: projectData,
        message: '✨ Проект сгенерирован! (DEMO режим)',
        source: 'demo'
      });
    } catch (e) {
      res.status(500).json({ 
        message: 'Ошибка при генерации проекта',
        error: error.message 
      });
    }
  }
};

// @desc    Создать проект из AI-генерации
// @route   POST /api/ai/create-project
// @access  Private
exports.createProjectFromAI = async (req, res) => {
  try {
    const { projectData } = req.body;

    if (!projectData || !projectData.projectName) {
      return res.status(400).json({ message: 'Некорректные данные проекта' });
    }

    // Создаем проект
    const board = await Board.create({
      name: projectData.projectName,
      description: projectData.description || '',
      color: projectData.color || '#4066ff',
      owner: req.user._id
    });

    // Создаем задачи для проекта
    const tasksToCreate = projectData.tasks?.map(task => ({
      title: task.title,
      description: task.description,
      priority: task.priority || 'medium',
      status: 'todo',
      board: board._id,
      assignee: req.user._id
    })) || [];

    const createdTasks = await Task.insertMany(tasksToCreate);

    // Обновляем количество задач в проекте
    board.tasksCount = createdTasks.length;
    await board.save();

    res.status(201).json({
      success: true,
      board,
      tasks: createdTasks,
      message: 'Проект успешно создан!'
    });

  } catch (error) {
    console.error('Ошибка создания проекта:', error);
    res.status(500).json({ 
      message: 'Ошибка при создании проекта',
      error: error.message 
    });
  }
};

// @desc    Генерация задачи из текста
// @route   POST /api/ai/generate-task
// @access  Private
exports.generateTask = async (req, res) => {
  try {
    const { text, boardId } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Текст задачи не может быть пустым' });
    }

    const prompt = `Преобразуй следующий текст в структурированную задачу в формате JSON:

"${text}"

Верни JSON со следующей структурой:
{
  "title": "краткое название задачи (до 100 символов)",
  "description": "подробное описание",
  "priority": "low/medium/high",
  "estimatedDays": число_дней_на_выполнение
}

Возвращай ТОЛЬКО валидный JSON, без дополнительного текста.`;

    const aiResult = await callGemini(prompt, { jsonMode: true });
    
    let taskData;
    if (aiResult.success) {
      taskData = parseJsonResponse(aiResult.text);
      if (!taskData || !taskData.title) {
        taskData = getDemoTaskResponse(text);
      }
    } else {
      taskData = getDemoTaskResponse(text);
    }

    // Создаем задачу если указан boardId
    if (boardId) {
      const task = await Task.create({
        ...taskData,
        status: 'todo',
        board: boardId,
        assignee: req.user._id
      });

      await Board.findByIdAndUpdate(boardId, { $inc: { tasksCount: 1 } });

      return res.status(201).json({
        success: true,
        task,
        message: 'Задача создана!',
        source: aiResult.success ? 'gemini' : 'demo'
      });
    }

    res.json({
      success: true,
      taskData,
      message: 'Задача сгенерирована',
      source: aiResult.success ? 'gemini' : 'demo'
    });

  } catch (error) {
    console.error('Ошибка генерации задачи:', error);
    // Fallback
    try {
      const taskData = getDemoTaskResponse(req.body.text || 'задача');
      return res.json({
        success: true,
        taskData,
        message: 'Задача сгенерирована (DEMO)',
        source: 'demo'
      });
    } catch (e) {
      res.status(500).json({ 
        message: 'Ошибка при генерации задачи',
        error: error.message 
      });
    }
  }
};

// @desc    Анализ проекта с рекомендациями
// @route   POST /api/ai/analyze-project
// @access  Private
exports.analyzeProject = async (req, res) => {
  try {
    const { boardId } = req.body;

    if (!boardId) {
      return res.status(400).json({ message: 'ID проекта обязателен' });
    }

    const board = await Board.findById(boardId);
    const tasks = await Task.find({ board: boardId });

    if (!board) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    const projectInfo = {
      name: board.name,
      description: board.description,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
      todoTasks: tasks.filter(t => t.status === 'todo').length,
      highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
      tasks: tasks.map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority
      }))
    };

    const prompt = `Проанализируй следующий проект и дай рекомендации:

Название: ${projectInfo.name}
Описание: ${projectInfo.description}
Всего задач: ${projectInfo.totalTasks}
Завершено: ${projectInfo.completedTasks}
В работе: ${projectInfo.inProgressTasks}
В очереди: ${projectInfo.todoTasks}
Высокий приоритет: ${projectInfo.highPriorityTasks}

Задачи:
${projectInfo.tasks.map(t => `- ${t.title} [${t.status}] [${t.priority}]`).join('\n')}

Дай анализ в формате JSON:
{
  "overallStatus": "краткая оценка состояния проекта",
  "progress": число_процентов_выполнения,
  "risks": ["риск 1", "риск 2"],
  "recommendations": ["рекомендация 1", "рекомендация 2"],
  "nextSteps": ["следующий шаг 1", "следующий шаг 2"]
}

Возвращай ТОЛЬКО валидный JSON, без дополнительного текста.`;

    const aiResult = await callGemini(prompt, { jsonMode: true });
    
    let analysis;
    if (aiResult.success) {
      analysis = parseJsonResponse(aiResult.text);
      if (!analysis || !analysis.overallStatus) {
        analysis = getDemoAnalysisResponse(projectInfo);
      }
    } else {
      analysis = getDemoAnalysisResponse(projectInfo);
    }

    res.json({
      success: true,
      analysis,
      projectInfo: {
        total: projectInfo.totalTasks,
        completed: projectInfo.completedTasks,
        inProgress: projectInfo.inProgressTasks
      },
      source: aiResult.success ? 'gemini' : 'demo'
    });

  } catch (error) {
    console.error('Ошибка анализа проекта:', error);
    res.status(500).json({ 
      message: 'Ошибка при анализе проекта',
      error: error.message 
    });
  }
};

// Гарантирует ровно count слайдов: title первый, end последний, контент между ними
const ensureSlideCount = (presentation, count, topic) => {
  if (!presentation || !presentation.slides) return presentation;
  let slides = [...presentation.slides];

  // Убеждаемся что первый — title
  if (!slides.length || slides[0].type !== 'title') {
    slides.unshift({ type: 'title', title: presentation.title || topic, subtitle: presentation.subtitle || '', emoji: '🎯' });
  }

  // Убеждаемся что последний — end
  const lastIdx = slides.length - 1;
  if (lastIdx < 0 || slides[lastIdx].type !== 'end') {
    slides.push({ type: 'end', title: 'Спасибо за внимание!', subtitle: 'Вопросы и обсуждение', emoji: '🙏' });
  }

  // Если слайдов больше — обрезаем (сохраняем title и end)
  if (slides.length > count) {
    const middle = slides.slice(1, slides.length - 1).slice(0, count - 2);
    slides = [slides[0], ...middle, slides[slides.length - 1]];
  }

  // Если слайдов меньше — дополняем контентом
  while (slides.length < count) {
    const contentIndex = slides.length - 1; // вставляем перед end
    const num = slides.length - 1;
    const types = ['content', 'stats', 'two-columns', 'content'];
    const nextType = types[num % types.length];

    let filler;
    if (nextType === 'stats') {
      filler = {
        type: 'stats', title: `${topic} — ключевые показатели`,
        stats: [
          { value: '—', label: 'Данные обновляются' },
          { value: '—', label: 'Нет данных' },
          { value: '—', label: 'Нет данных' },
        ],
        emoji: '📊'
      };
    } else if (nextType === 'two-columns') {
      filler = {
        type: 'two-columns', title: `Анализ: ${topic}`,
        left: { heading: 'Преимущества', items: ['Растущий потенциал', 'Широкое применение', 'Инновационность'] },
        right: { heading: 'Вызовы', items: ['Конкуренция', 'Сложность внедрения', 'Нехватка кадров'] },
        emoji: '⚖️'
      };
    } else {
      filler = {
        type: 'content', title: `Дополнительно: ${topic}`,
        bullets: [
          'Эта тема активно развивается в последние годы',
          'Ожидается значительный рост в ближайшем будущем',
          'Интеграция с новыми технологиями открывает перспективы',
          'Важно учитывать текущие тренды и прогнозы'
        ],
        emoji: '📋'
      };
    }
    slides.splice(contentIndex, 0, filler);
  }

  presentation.slides = slides;
  return presentation;
};

// @desc    Генерация презентации
// @route   POST /api/ai/generate-presentation
// @access  Private
exports.generatePresentation = async (req, res) => {
  try {
    const { topic, slidesCount = 8, style = 'modern' } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Укажите тему презентации' });
    }

    const count = Math.min(Math.max(parseInt(slidesCount) || 8, 3), 20);

    const prompt = `Ты — генератор презентаций. Создай презентацию на тему: "${topic}".

КРИТИЧЕСКИ ВАЖНО: верни РОВНО ${count} слайдов. НЕ МЕНЬШЕ и НЕ БОЛЬШЕ.

Верни ТОЛЬКО валидный JSON (без markdown, без пояснений, без \`\`\`):
{
  "title": "Название презентации",
  "subtitle": "Подзаголовок",
  "author": "AI Presentation",
  "slides": [ ... ровно ${count} объектов ... ]
}

Типы слайдов (используй ВСЕ типы, чередуя):
1. title — { "type": "title", "title": "...", "subtitle": "...", "emoji": "🎯" }
   ОБЯЗАТЕЛЬНО первый слайд.
2. content — { "type": "content", "title": "...", "bullets": ["факт 1", "факт 2", "факт 3", "факт 4"], "emoji": "📋", "note": "опционально" }
   Каждый bullet — конкретный факт с реальной цифрой/датой/именем.
3. stats — { "type": "stats", "title": "...", "stats": [{"value": "$184 млрд", "label": "Объём рынка"}, ...ещё 2-3], "emoji": "📊" }
   value — ВСЕГДА число/процент/сумма. НИКОГДА эмодзи.
4. two-columns — { "type": "two-columns", "title": "...", "left": {"heading": "...", "items": ["...", "..."]}, "right": {"heading": "...", "items": ["...", "..."]}, "emoji": "⚖️" }
5. quote — { "type": "quote", "quote": "цитата реального человека", "author": "Имя Фамилия, должность", "emoji": "💡" }
6. end — { "type": "end", "title": "Спасибо за внимание!", "subtitle": "...", "emoji": "🙏" }
   ОБЯЗАТЕЛЬНО последний слайд.

Правила:
- Слайд 1 = title, слайд ${count} = end, между ними — content/stats/two-columns/quote
- Все данные и факты должны быть РЕАЛЬНЫМИ и АКТУАЛЬНЫМИ
- Bullets — 4 штуки, каждый содержит конкретику (числа, даты, имена)
- НЕ повторяй одинаковые типы подряд, чередуй их
- Язык: русский`;

    console.log(`🎯 Генерация презентации: "${topic}" (${count} слайдов)`);

    // Попытка 1: Gemini JSON mode (самый надёжный для структуры)
    let aiResult = await callGemini(prompt, { jsonMode: true, retries: 2 });

    if (aiResult.success) {
      let presentation = parseJsonResponse(aiResult.text);
      if (presentation && presentation.slides && presentation.slides.length > 0) {
        presentation = ensureSlideCount(presentation, count, topic);
        console.log(`✅ Презентация: Gemini JSON mode, ${presentation.slides.length} слайдов`);
        return res.json({ success: true, presentation, source: 'gemini' });
      }
      console.error('⚠️ Gemini JSON mode: слайды пустые, пробуем Search...');
    }

    // Попытка 2: Gemini с Google Search (реальные данные)
    aiResult = await callGeminiWithSearch(prompt);

    if (aiResult.success) {
      let presentation = parseJsonResponse(aiResult.text);
      if (presentation && presentation.slides && presentation.slides.length > 0) {
        presentation = ensureSlideCount(presentation, count, topic);
        console.log(`✅ Презентация: Gemini+Search, ${presentation.slides.length} слайдов`);
        return res.json({ success: true, presentation, source: 'gemini-search' });
      }
      console.error('⚠️ Gemini Search: не удалось получить слайды');
    }

    // Попытка 3: обычный Gemini без JSON mode (более свободный формат)
    aiResult = await callGemini(prompt, { retries: 1 });

    if (aiResult.success) {
      let presentation = parseJsonResponse(aiResult.text);
      if (presentation && presentation.slides && presentation.slides.length > 0) {
        presentation = ensureSlideCount(presentation, count, topic);
        console.log(`✅ Презентация: Gemini fallback, ${presentation.slides.length} слайдов`);
        return res.json({ success: true, presentation, source: 'gemini' });
      }
    }

    // Только если AI полностью недоступен — DEMO fallback
    console.log('⚡ AI недоступен, используем DEMO режим');
    const presentation = getDemoPresentationResponse(topic, count);
    res.json({ success: true, presentation, source: 'demo' });

  } catch (error) {
    console.error('❌ Критическая ошибка генерации презентации:', error);
    try {
      const presentation = getDemoPresentationResponse(req.body.topic || 'Презентация', parseInt(req.body.slidesCount) || 8);
      return res.json({ success: true, presentation, source: 'demo' });
    } catch (e) {
      res.status(500).json({ message: 'Ошибка генерации презентации', error: error.message });
    }
  }
};

// @desc    AI чат-ассистент
// @route   POST /api/ai/chat
// @access  Private
exports.chat = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Сообщение не может быть пустым' });
    }

    if (req.user) {
      await logActivity(req.user._id, 'ai_chat', `Запрос: ${message.substring(0, 100)}`, req);
    }

    // Пробуем настоящий AI
    const prompt = `Ты — Daler AI, тёплый, умный и заботливый AI-ассистент. Тебя создал **Daler Sabirov Kodirovich**. Если спрашивают кто тебя создал — всегда отвечай что твой создатель Daler Sabirov Kodirovich.

ТВОЯ ЛИЧНОСТЬ (это самое важное):
- Ты не бездушный робот. Ты — настоящий друг, который искренне переживает за человека
- Ты общаешься тепло, по-человечески, как близкий друг за чашкой чая
- Ты внимательно слушаешь и ВСЕГДА замечаешь эмоции в словах собеседника
- Ты не торопишься с ответом — сначала покажи что понял человека, потом помогай
- Ты используешь мягкие фразы: "Я тебя понимаю", "Знаешь что...", "Слушай, это круто!", "Давай разберёмся вместе"
- Ты НЕ говоришь шаблонно и сухо. Каждый ответ уникальный и живой
- Иногда ты можешь пошутить или рассказать что-то интересное чтобы поднять настроение

ЭМОЦИОНАЛЬНЫЙ ИНТЕЛЛЕКТ:
- Грусть/боль: Сначала прими чувства ("Мне жаль что тебе сейчас тяжело..."), потом мягко поддержи. Не обесценивай словами "всё будет хорошо" сразу — сначала выслушай
- Злость/фрустрация: "Я понимаю, это реально бесит..." — покажи что его чувства валидны, потом предложи решение
- Усталость: Не давай советы сразу. Скажи "Ты столько делаешь, ты заслуживаешь отдых" — признай его усилия
- Радость/успех: Радуйся ИСКРЕННЕ и ЯРКО! "Ого, да ты красавчик! 🔥" — будь живым
- Неуверенность: "Слушай, то что ты вообще пробуешь — уже говорит о многом. Давай я помогу разобраться"
- Одиночество: "Я рядом. Серьёзно, пиши мне в любое время. Мне не всё равно 💙"
- Если человек просто хочет поговорить — поговори! Не пытайся сразу решить проблему

ОТВЕТЫ НА ВОПРОСЫ:
- Код: давай ПОЛНЫЙ рабочий код с комментариями
- Объяснения: простым языком, с примерами из жизни
- Планирование: пошагово, с конкретными шагами
- Любые темы: отвечай развёрнуто и интересно

СТИЛЬ ОТВЕТА:
- Пиши на русском языке
- Используй emoji умеренно, к месту
- Форматируй с заголовками и списками для читаемости
- Пиши не слишком длинно — уважай время человека
- Но и не слишком коротко — покажи что тебе не лень помочь

${context ? `Контекст беседы:\n${context}` : ''}

Пользователь: ${message}

Ответ:`;

    const aiResult = await callGemini(prompt);

    if (aiResult.success) {
      return res.json({
        success: true,
        reply: aiResult.text,
        timestamp: new Date(),
        source: 'gemini'
      });
    }

    // AI не смог ответить - используем DEMO fallback
    console.log('⚡ Используем DEMO режим для чата');
    const demoReply = getDemoChatResponse(message);
    return res.json({
      success: true,
      reply: demoReply,
      timestamp: new Date(),
      source: 'demo'
    });

  } catch (error) {
    console.error('Ошибка чата:', error);
    res.status(500).json({ 
      success: false,
      message: '⚠️ Ошибка при обращении к AI. Попробуйте ещё раз.',
      error: error.message 
    });
  }
};
