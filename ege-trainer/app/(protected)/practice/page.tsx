import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const sections = [
  {
    id: 'LISTENING',
    icon: '🎧',
    title: 'Аудирование',
    description: 'Задания 1–9: соответствие, True/False/Not stated, множественный выбор',
    tasks: ['Задание 1: Соответствие', 'Задание 2: True / False / Not stated', 'Задания 3–9: Множественный выбор'],
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'READING',
    icon: '📖',
    title: 'Чтение',
    description: 'Задания 10–18: соответствие, заполнение пропусков, множественный выбор',
    tasks: ['Задание 10: Соответствие', 'Задание 11: Заполнение пропусков', 'Задания 12–18: Множественный выбор'],
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'GRAMMAR_VOCAB',
    icon: '✏️',
    title: 'Грамматика и лексика',
    description: 'Задания 19–36: грамматика, лексика',
    tasks: ['Задания 19–24: Грамматика', 'Задания 25–29: Лексика', 'Задания 30–36: Грамматика и лексика'],
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'WRITING',
    icon: '📝',
    title: 'Письмо',
    description: 'Задания 37–38: email и эссе с проверкой учителем',
    tasks: ['Задание 37: Электронное письмо (100–140 слов)', 'Задание 38: Эссе (200–250 слов)'],
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'ORAL',
    icon: '🎙',
    title: 'Устная часть',
    description: 'Задания 1–4: чтение, диалог, интервью, описание проекта',
    tasks: ['Задание 1: Чтение текста вслух', 'Задание 2: Условный диалог', 'Задание 3: Интервью', 'Задание 4: Описание проекта'],
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
