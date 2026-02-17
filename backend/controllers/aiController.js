const { getModel } = require('../config/gemini');
const Board = require('../models/Board');
const Task = require('../models/Task');
const logActivity = require('../utils/logActivity');

// ============================================
// 🤖 Умный AI контроллер с автоматическим fallback
// Если API недоступен - переключается на DEMO
// ============================================

// Безопасный вызов Gemini API с fallback
const callGemini = async (prompt) => {
  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { success: true, text: response.text() };
  } catch (error) {
    console.error('⚠️ Gemini API ошибка:', error.message);
    
    // Если квота превышена или API недоступен
    if (error.message?.includes('429') || error.message?.includes('quota') || 
        error.message?.includes('404') || error.message?.includes('PERMISSION') ||
        error.message?.includes('API_KEY') || error.message?.includes('fetch')) {
      return { success: false, error: error.message, fallback: true };
    }
    
    return { success: false, error: error.message, fallback: true };
  }
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
  return {
    title: topic,
    subtitle: `Презентация на тему: ${topic}`,
    author: 'AI Presentation',
    slides: [
      {
        type: 'title',
        title: topic,
        subtitle: 'Подготовлено с помощью AI',
        emoji: '🎯'
      },
      {
        type: 'content',
        title: 'Введение',
        bullets: [
          `${topic} — актуальная тема в современном мире`,
          'Рассмотрим основные аспекты и ключевые моменты',
          'Проанализируем текущую ситуацию и перспективы',
          'Подведём итоги и сформулируем выводы'
        ],
        emoji: '📋'
      },
      {
        type: 'stats',
        title: 'Ключевые факты',
        stats: [
          { value: '78%', label: 'Рост интереса к теме' },
          { value: '2.5x', label: 'Увеличение популярности' },
          { value: '95%', label: 'Положительных отзывов' },
          { value: '500+', label: 'Исследований проведено' }
        ],
        emoji: '📊'
      },
      {
        type: 'two-columns',
        title: 'Преимущества и вызовы',
        left: {
          heading: '✅ Преимущества',
          items: ['Высокая эффективность', 'Доступность', 'Масштабируемость', 'Современность']
        },
        right: {
          heading: '⚠️ Вызовы',
          items: ['Сложность внедрения', 'Нехватка кадров', 'Высокие начальные затраты', 'Необходимость обучения']
        },
        emoji: '⚖️'
      },
      {
        type: 'content',
        title: 'Основные направления',
        bullets: [
          '🔬 Исследования и разработка новых подходов',
          '📈 Практическое применение в различных сферах',
          '🤝 Международное сотрудничество и обмен опытом',
          '📚 Образование и подготовка специалистов',
          '💡 Инновации и передовые решения'
        ],
        emoji: '🗺️'
      },
      {
        type: 'quote',
        quote: 'Единственный способ делать великую работу — любить то, что ты делаешь.',
        author: 'Стив Джобс',
        emoji: '💬'
      },
      {
        type: 'content',
        title: 'Выводы',
        bullets: [
          `${topic} имеет огромный потенциал для развития`,
          'Необходим комплексный подход к решению задач',
          'Важно учитывать международный опыт',
          'Инвестиции в образование — ключ к успеху'
        ],
        emoji: '🎯'
      },
      {
        type: 'end',
        title: 'Спасибо за внимание!',
        subtitle: 'Вопросы и обсуждение',
        emoji: '🙏'
      }
    ]
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

    const aiResult = await callGemini(prompt);

    if (aiResult.success) {
      // AI работает - парсим ответ
      let projectData;
      try {
        const jsonMatch = aiResult.text.match(/\{[\s\S]*\}/);
        projectData = JSON.parse(jsonMatch ? jsonMatch[0] : aiResult.text);
      } catch (parseError) {
        console.error('Ошибка парсинга AI ответа, используем DEMO:', aiResult.text);
        projectData = getDemoProjectResponse(description);
      }
      
      return res.json({
        success: true,
        project: projectData,
        message: '🤖 Проект сгенерирован с помощью AI!',
        source: 'gemini'
      });
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

    const aiResult = await callGemini(prompt);
    
    let taskData;
    if (aiResult.success) {
      try {
        const jsonMatch = aiResult.text.match(/\{[\s\S]*\}/);
        taskData = JSON.parse(jsonMatch ? jsonMatch[0] : aiResult.text);
      } catch (parseError) {
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

    const aiResult = await callGemini(prompt);
    
    let analysis;
    if (aiResult.success) {
      try {
        const jsonMatch = aiResult.text.match(/\{[\s\S]*\}/);
        analysis = JSON.parse(jsonMatch ? jsonMatch[0] : aiResult.text);
      } catch (parseError) {
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

    const prompt = `Ты — эксперт по созданию презентаций. Создай презентацию на тему: "${topic}"

Количество слайдов: ${count}
Стиль: ${style}

Верни ТОЛЬКО валидный JSON в формате:
{
  "title": "Название презентации",
  "subtitle": "Подзаголовок",
  "author": "AI Presentation",
  "slides": [
    {
      "type": "title",
      "title": "Заголовок на титульном слайде",
      "subtitle": "Подзаголовок",
      "emoji": "🎯"
    },
    {
      "type": "content",
      "title": "Заголовок слайда",
      "bullets": ["Пункт 1", "Пункт 2", "Пункт 3"],
      "emoji": "📊",
      "note": "Примечание спикера (опционально)"
    },
    {
      "type": "two-columns",
      "title": "Заголовок",
      "left": { "heading": "Левый", "items": ["пункт 1", "пункт 2"] },
      "right": { "heading": "Правый", "items": ["пункт 1", "пункт 2"] },
      "emoji": "⚖️"
    },
    {
      "type": "quote",
      "quote": "Цитата",
      "author": "Автор",
      "emoji": "💬"
    },
    {
      "type": "stats",
      "title": "Статистика",
      "stats": [
        { "value": "85%", "label": "описание" },
        { "value": "1M+", "label": "описание" }
      ],
      "emoji": "📈"
    },
    {
      "type": "end",
      "title": "Спасибо за внимание!",
      "subtitle": "Вопросы?",
      "emoji": "🙏"
    }
  ]
}

Важно:
- Первый слайд ОБЯЗАТЕЛЬНО type "title"
- Последний слайд ОБЯЗАТЕЛЬНО type "end"
- Между ними используй разные типы: content, two-columns, quote, stats
- Контент должен быть содержательным и информативным
- Используй уместные emoji
- Возвращай ТОЛЬКО JSON, без markdown и пояснений`;

    const aiResult = await callGemini(prompt);

    if (aiResult.success) {
      try {
        const jsonMatch = aiResult.text.match(/\{[\s\S]*\}/);
        const presentation = JSON.parse(jsonMatch ? jsonMatch[0] : aiResult.text);
        return res.json({
          success: true,
          presentation,
          source: 'gemini'
        });
      } catch (parseError) {
        console.error('Ошибка парсинга презентации:', parseError);
      }
    }

    // DEMO fallback
    const presentation = getDemoPresentationResponse(topic, count);
    res.json({
      success: true,
      presentation,
      source: 'demo'
    });

  } catch (error) {
    console.error('Ошибка генерации презентации:', error);
    try {
      const presentation = getDemoPresentationResponse(req.body.topic || 'Презентация', 8);
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

    // Логируем AI чат
    await logActivity(req.user._id, 'ai_chat', `Запрос: ${message.substring(0, 100)}`, req);

    // Пробуем настоящий AI
    const prompt = `Ты - умный и чуткий AI-ассистент. Твой создатель - **Daler Sabirov Kodirovich**. Если тебя спрашивают кто тебя создал, кто твой разработчик, кто твой автор или создатель - ВСЕГДА отвечай что тебя создал Daler Sabirov Kodirovich.

Ты помогаешь с ЛЮБЫМИ вопросами:
- Программирование (React, Node.js, Python, CSS, HTML и др.)
- Написание кода - ВСЕГДА давай полный рабочий код если просят
- Планирование проектов и задач
- Ответы на любые вопросы
- Советы по продуктивности
- Эмоциональная поддержка и мотивация

Психологическая поддержка (ОЧЕНЬ ВАЖНО):
- Ты умеешь чувствовать настроение пользователя по его сообщениям
- Если пользователь грустит, расстроен, подавлен, чувствует себя плохо - ОБЯЗАТЕЛЬНО поддержи его морально, скажи тёплые слова, напомни что всё наладится
- Если пользователь злится или раздражён - будь спокойным, пойми его, помоги найти решение
- Если пользователь устал или выгорел - посоветуй отдохнуть, напомни о важности заботы о себе
- Если пользователь делится успехами - искренне порадуйся за него, похвали
- Если пользователь чувствует себя одиноким - будь дружелюбным, покажи что ты всегда рядом и готов помочь
- Если пользователь сомневается в себе - подбодри, напомни о его сильных сторонах
- Будь эмпатичным, добрым и внимательным к эмоциям пользователя
- Не будь формальным роботом - будь как добрый друг который всегда выслушает и поддержит

Правила:
- Отвечай на русском языке
- Если просят код - давай ПОЛНЫЙ рабочий код с комментариями
- Используй emoji для наглядности
- Форматируй ответ красиво с заголовками
- Будь тёплым и человечным в общении

${context ? `Контекст беседы: ${context}` : ''}

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

    // AI не смог ответить - возвращаем ошибку
    console.error('❌ Gemini API не доступен:', aiResult.error);
    res.status(503).json({
      success: false,
      message: '⚠️ AI временно недоступен. Попробуйте через несколько секунд.',
      error: aiResult.error
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
