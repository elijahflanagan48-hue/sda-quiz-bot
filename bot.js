require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { questions } = require('./questions');

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.error('❌ Укажите BOT_TOKEN в файле .env');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

// Хранилище
const sessions  = {}; // chatId -> session
const topScores = {}; // userId -> { name, scores: { easy, medium, hard, total } }

// Очки за правильный ответ по уровню
const POINTS = { easy: 10, medium: 20, hard: 30 };
const DIFF_LABEL = { easy: '🟢 Лёгкий', medium: '🟡 Средний', hard: '🔴 Сложный' };
const DIFF_EMOJI = { easy: '🟢', medium: '🟡', hard: '🔴' };

// ─── Команды ─────────────────────────────────────────────────────────────────

bot.onText(/\/start/, (msg) => sendWelcome(msg.chat.id, msg.from.first_name));
bot.onText(/\/quiz/,  (msg) => sendDifficultyPicker(msg.chat.id));
bot.onText(/\/top/,   (msg) => sendLeaderboard(msg.chat.id));
bot.onText(/\/stop/,  (msg) => {
  const chatId = msg.chat.id;
  if (sessions[chatId]) {
    delete sessions[chatId];
    bot.sendMessage(chatId, '🛑 Игра остановлена. Напишите /quiz чтобы начать заново.');
  } else {
    bot.sendMessage(chatId, 'Нет активной игры. Напишите /quiz!');
  }
});
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `📖 *История церкви АСД — Викторина*\n\n` +
    `Проверьте свои знания об истории Церкви Адвентистов Седьмого Дня!\n\n` +
    `*Уровни сложности и очки:*\n` +
    `🟢 Лёгкий — 10 очков за вопрос\n` +
    `🟡 Средний — 20 очков за вопрос\n` +
    `🔴 Сложный — 30 очков за вопрос\n\n` +
    `*Команды:*\n` +
    `/quiz — начать новую игру\n` +
    `/top — таблица лидеров\n` +
    `/stop — остановить игру\n` +
    `/help — эта справка`,
    { parse_mode: 'Markdown' }
  );
});

// ─── Кнопки ──────────────────────────────────────────────────────────────────

bot.on('callback_query', async (query) => {
  const chatId  = query.message.chat.id;
  const msgId   = query.message.message_id;
  const data    = query.data;
  const userId  = query.from.id;
  const name    = query.from.first_name;

  await bot.answerCallbackQuery(query.id);

  if (data.startsWith('diff_'))       { startQuiz(chatId, userId, name, data.replace('diff_', ''), msgId); return; }
  if (data.startsWith('ans_'))        { handleAnswer(chatId, userId, name, data.replace('ans_', ''), msgId); return; }
  if (data === 'play_again')          { sendDifficultyPicker(chatId); return; }
  if (data === 'show_top')            { sendLeaderboard(chatId); return; }
});

// ─── Старт ───────────────────────────────────────────────────────────────────

function sendWelcome(chatId, name) {
  bot.sendMessage(chatId,
    `👋 Привет, *${name}*!\n\n` +
    `Добро пожаловать в викторину по истории\n*Церкви Адвентистов Седьмого Дня* ✝️\n\n` +
    `Здесь вас ждут вопросы об основании церкви, ключевых личностях, доктринах, миссии и здравоохранении.\n\n` +
    `Выберите уровень сложности и начинайте! 🎯`,
    {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '🎮 Начать игру', callback_data: 'play_again' }]] }
    }
  );
}

function sendDifficultyPicker(chatId) {
  bot.sendMessage(chatId,
    `🎓 *Выберите уровень сложности:*\n\n` +
    `🟢 *Лёгкий* — основные факты (10 очков/вопрос)\n` +
    `🟡 *Средний* — история и богословие (20 очков/вопрос)\n` +
    `🔴 *Сложный* — детали и источники (30 очков/вопрос)\n` +
    `🎲 *Все уровни* — смешанная игра`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🟢 Лёгкий',    callback_data: 'diff_easy'   }],
          [{ text: '🟡 Средний',   callback_data: 'diff_medium' }],
          [{ text: '🔴 Сложный',   callback_data: 'diff_hard'   }],
          [{ text: '🎲 Все уровни',callback_data: 'diff_mixed'  }],
        ]
      }
    }
  );
}

// ─── Игра ────────────────────────────────────────────────────────────────────

function startQuiz(chatId, userId, name, difficulty, menuMsgId) {
  // Убираем меню выбора уровня
  bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: menuMsgId }).catch(() => {});

  let pool;
  if (difficulty === 'mixed') {
    pool = [...questions].sort(() => Math.random() - 0.5).slice(0, 10);
  } else {
    pool = questions.filter(q => q.difficulty === difficulty)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 10);
  }

  if (pool.length === 0) {
    bot.sendMessage(chatId, '😕 Вопросов для этого уровня пока нет.');
    return;
  }

  const diffLabel = difficulty === 'mixed' ? '🎲 Все уровни' : DIFF_LABEL[difficulty];
  const maxScore  = pool.reduce((sum, q) => sum + POINTS[q.difficulty], 0);

  sessions[chatId] = { userId, name, difficulty, questions: pool, questionIndex: 0, score: 0, maxScore, startTime: Date.now() };

  bot.sendMessage(chatId,
    `🚀 *Начинаем!*\n\nУровень: ${diffLabel}\nВопросов: ${pool.length}\nМакс. очков: ${maxScore}\n\nУдачи! 🍀`,
    { parse_mode: 'Markdown' }
  ).then(() => sendQuestion(chatId));
}

function sendQuestion(chatId) {
  const s = sessions[chatId];
  if (!s) return;

  const { questions: qs, questionIndex, score, maxScore } = s;
  const q    = qs[questionIndex];
  const num  = questionIndex + 1;
  const total = qs.length;
  const pts  = POINTS[q.difficulty];

  const filled = Math.round((num - 1) / total * 10);
  const bar    = '▓'.repeat(filled) + '░'.repeat(10 - filled);

  const text =
    `${bar} ${num}/${total}  |  Счёт: *${score}/${maxScore}*\n\n` +
    `${DIFF_EMOJI[q.difficulty]} *${q.category}* · +${pts} очков\n\n` +
    `❓ ${q.question}`;

  const letters = ['A', 'B', 'C', 'D'];
  const buttons = q.answers.map((ans, i) => ([{ text: `${letters[i]}. ${ans}`, callback_data: `ans_${i}` }]));

  bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: buttons }
  });
}

function handleAnswer(chatId, userId, name, ansIndex, msgId) {
  const s = sessions[chatId];
  if (!s) { bot.sendMessage(chatId, 'Нет активной игры. Напишите /quiz!'); return; }

  const { questions: qs, questionIndex } = s;
  const q        = qs[questionIndex];
  const chosen   = parseInt(ansIndex);
  const correct  = q.correctIndex;
  const isRight  = chosen === correct;
  const pts      = POINTS[q.difficulty];
  const letters  = ['A', 'B', 'C', 'D'];

  if (isRight) s.score += pts;
  s.questionIndex++;

  // Убираем кнопки
  bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: msgId }).catch(() => {});

  const resultLine = isRight
    ? `✅ *Верно!* +${pts} очков`
    : `❌ *Неверно.* Правильный ответ:\n*${letters[correct]}. ${q.answers[correct]}*`;

  const hint = q.explanation ? `\n\n💡 _${q.explanation}_` : '';

  bot.sendMessage(chatId, resultLine + hint, { parse_mode: 'Markdown' })
    .then(() => {
      if (s.questionIndex < qs.length) {
        setTimeout(() => sendQuestion(chatId), 900);
      } else {
        finishQuiz(chatId, userId, name);
      }
    });
}

function finishQuiz(chatId, userId, name) {
  const s = sessions[chatId];
  if (!s) return;

  const { score, maxScore, questions: qs, difficulty, startTime } = s;
  const pct  = Math.round(score / maxScore * 100);
  const secs = Math.round((Date.now() - startTime) / 1000);
  const diffLabel = difficulty === 'mixed' ? '🎲 Все уровни' : DIFF_LABEL[difficulty];

  // Лидерборд
  if (!topScores[userId]) topScores[userId] = { name, best: 0, games: 0 };
  topScores[userId].games++;
  topScores[userId].name = name;
  if (score > topScores[userId].best) topScores[userId].best = score;

  const medal   = pct >= 90 ? '🥇' : pct >= 70 ? '🥈' : pct >= 50 ? '🥉' : '📝';
  const comment = pct >= 90 ? 'Превосходно! Вы настоящий знаток истории АСД!'
                : pct >= 70 ? 'Отличный результат! Знания на высоте.'
                : pct >= 50 ? 'Неплохо! Есть куда расти.'
                : 'Советуем изучить историю церкви глубже 📚';

  const diffStats = {};
  qs.forEach(q => {
    if (!diffStats[q.difficulty]) diffStats[q.difficulty] = { correct: 0, total: 0 };
    diffStats[q.difficulty].total++;
  });

  const text =
    `${medal} *Викторина завершена!*\n\n` +
    `📊 Результат: *${score} / ${maxScore}* (${pct}%)\n` +
    `⏱ Время: ${secs} сек.\n` +
    `🎓 Уровень: ${diffLabel}\n\n` +
    `${comment}`;

  delete sessions[chatId];

  bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎮 Играть снова',       callback_data: 'play_again' }],
        [{ text: '🏆 Таблица лидеров',    callback_data: 'show_top'  }],
      ]
    }
  });
}

// ─── Лидерборд ───────────────────────────────────────────────────────────────

function sendLeaderboard(chatId) {
  const entries = Object.values(topScores)
    .sort((a, b) => b.best - a.best)
    .slice(0, 10);

  if (!entries.length) {
    bot.sendMessage(chatId, '🏆 Таблица лидеров пуста. Сыграйте первым! /quiz');
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];
  const rows = entries.map((e, i) =>
    `${medals[i] || `${i + 1}.`} *${e.name}* — ${e.best} очков (игр: ${e.games})`
  );

  bot.sendMessage(chatId,
    `🏆 *Таблица лидеров*\n_История АСД_\n\n${rows.join('\n')}`,
    { parse_mode: 'Markdown' }
  );
}

console.log('✝️  Бот викторины «История АСД» запущен! Нажмите Ctrl+C для остановки.');
