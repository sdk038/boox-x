const { getModel } = require('../config/gemini');
const Board = require('../models/Board');
const Task = require('../models/Task');

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
  
  if (msg.includes('привет') || msg.includes('здравств') || msg.includes('hi') || msg.includes('hello')) {
    return '👋 Привет! Я ваш AI-ассистент для управления проектами!\n\n✨ Я могу помочь:\n• 📋 Создать план проекта\n• ✅ Разбить задачи на подзадачи\n• 💡 Дать советы по организации работы\n• 📊 Проанализировать прогресс\n\nПросто опишите что вам нужно!';
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

// @desc    AI чат-ассистент
// @route   POST /api/ai/chat
// @access  Private
exports.chat = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Сообщение не может быть пустым' });
    }

    // Пробуем настоящий AI
    const prompt = `Ты - умный AI-ассистент. Ты помогаешь с ЛЮБЫМИ вопросами:
- Программирование (React, Node.js, Python, CSS, HTML и др.)
- Написание кода - ВСЕГДА давай полный рабочий код если просят
- Планирование проектов и задач
- Ответы на любые вопросы
- Советы по продуктивности

Правила:
- Отвечай на русском языке
- Если просят код - давай ПОЛНЫЙ рабочий код с комментариями
- Используй emoji для наглядности
- Форматируй ответ красиво с заголовками

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

    // Fallback на DEMO
    console.log('⚡ Используем DEMO режим для чата');
    const reply = getDemoChatResponse(message);

    res.json({
      success: true,
      reply,
      demo: true,
      timestamp: new Date(),
      source: 'demo'
    });

  } catch (error) {
    console.error('Ошибка чата:', error);
    // Даже при полном падении - даем DEMO ответ
    try {
      const reply = getDemoChatResponse(req.body.message || 'привет');
      return res.json({
        success: true,
        reply,
        demo: true,
        timestamp: new Date(),
        source: 'demo'
      });
    } catch (e) {
      res.status(500).json({ 
        message: 'Ошибка чата с AI',
        error: error.message 
      });
    }
  }
};
