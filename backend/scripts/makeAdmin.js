// Скрипт для быстрого создания администратора
// Использование: node scripts/makeAdmin.js email@example.com

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];

if (!email) {
  console.log('❌ Ошибка: Укажите email пользователя');
  console.log('Использование: node scripts/makeAdmin.js email@example.com');
  process.exit(1);
}

async function makeAdmin() {
  try {
    // Подключение к базе данных
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Подключено к MongoDB');

    // Поиск пользователя
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ Пользователь с email "${email}" не найден`);
      process.exit(1);
    }

    // Проверка текущей роли
    if (user.role === 'admin') {
      console.log(`ℹ️  Пользователь "${user.name}" уже является администратором`);
    } else {
      // Изменение роли
      user.role = 'admin';
      await user.save();
      console.log(`✅ Пользователь "${user.name}" теперь администратор!`);
    }

    console.log('\nИнформация о пользователе:');
    console.log(`  Имя: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Роль: ${user.role}`);
    console.log(`  Регистрация: ${user.createdAt}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

makeAdmin();
