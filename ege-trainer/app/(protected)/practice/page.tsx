import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const sections = [
  {
    id: 'LISTENING',
    icon: '🎧',
    title: 'Аудирование',
    description: 'Задания 1–9: соответствие, множественный выбор, краткий ответ',
    tasks: ['Задание 1: Соответствие (6 высказываний)', 'Задания 2–8: Множественный выбор', 'Задания 9–15: Краткий ответ'],
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'READING',
    icon: '📖',
    title: 'Чтение',
    description: 'Задания 10–24: заголовки, True/False, множественный выбор',
    tasks: ['Задание 10: Заголовки абзацев', 'Задания 11–16: True/Not stated/False', 'Задания 17–24: Множественный выбор'],
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'GRAMMAR_VOCAB',
    icon: '✏️',
    title: 'Грамматика и лексика',
    description: 'Задания 25–44: трансформация, словообразование, лексика',
    tasks: ['Задания 25–31: Грамматические формы', 'Задания 32–38: Словообразование', 'Задания 39–44: Лексический тест'],
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'WRITING',
    icon: '📝',
    title: 'Письмо',
    description: 'Задания 37–38: email и эссе с проверкой учителем',
    tasks: ['Задание 37: Электронное письмо (130–150 слов)', 'Задание 38: Эссе (200–250 слов)'],
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'ORAL',
    icon: '🎙',
    title: 'Устная часть',
    description: 'Задания 1–4: чтение, диалог, монолог, сравнение фото',
    tasks: ['Задание 1: Чтение текста вслух', 'Задание 2: Условный диалог (5 вопросов)', 'Задание 3: Монолог-описание фото', 'Задание 4: Сравнение двух фотографий'],
    color: 'from-red-500 to-red-600',
  },
]

export default async function PracticePage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Тренировка</h1>
        <p className="text-gray-500 mt-1">Выберите раздел для отработки</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={`/practice/session?section=${section.id}`}
            className="block bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${section.color} p-5 text-white`}>
              <div className="text-3xl mb-2">{section.icon}</div>
              <h2 className="text-xl font-bold">{section.title}</h2>
              <p className="text-sm opacity-90 mt-1">{section.description}</p>
            </div>
            <div className="p-4">
              <ul className="space-y-1">
                {section.tasks.map((task, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-gray-400">•</span>
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
