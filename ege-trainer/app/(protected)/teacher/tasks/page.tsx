import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const sectionNames: Record<string, string> = {
  LISTENING: 'Аудирование', READING: 'Чтение',
  GRAMMAR_VOCAB: 'Грамматика', WRITING: 'Письмо', ORAL: 'Устная часть',
}

export default async function TasksPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  if (session.user.role !== 'TEACHER') redirect('/dashboard')

  const tasks = await prisma.task.findMany({
    orderBy: [{ section: 'asc' }, { taskNumber: 'asc' }],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Банк заданий</h1>
        <p className="text-gray-500 mt-1">{tasks.length} заданий</p>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          Нет заданий. Добавьте задания через API или скрипты импорта.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {sectionNames[task.section]}
                  </span>
                  <span className="text-sm font-medium text-gray-700">Задание {task.taskNumber}</span>
                  <span className="text-xs text-gray-400">{task.taskType}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                  {(() => {
                    try { return JSON.parse(task.content).stimulus || JSON.parse(task.content).text || task.id } catch { return task.id }
                  })()}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${task.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {task.isActive ? 'Активно' : 'Скрыто'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
