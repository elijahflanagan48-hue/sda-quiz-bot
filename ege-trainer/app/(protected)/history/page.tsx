import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function HistoryPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const userId = session.user.id

  const [practiceSessions, examAttempts] = await Promise.all([
    prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 20,
    }),
    prisma.examAttempt.findMany({
      where: { userId },
      include: { variant: { select: { title: true } } },
      orderBy: { startedAt: 'desc' },
      take: 20,
    }),
  ])

  const sectionNames: Record<string, string> = {
    LISTENING: 'Аудирование',
    READING: 'Чтение',
    GRAMMAR_VOCAB: 'Грамматика',
    WRITING: 'Письмо',
    ORAL: 'Устная часть',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">История</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-gray-700 mb-3">Тренировки</h2>
          {practiceSessions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400">
              Нет тренировок. <Link href="/practice" className="text-blue-600 hover:underline">Начать</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {practiceSessions.map((s) => (
                <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">{sectionNames[s.section] || s.section}</p>
                    <p className="text-xs text-gray-400">{new Date(s.startedAt).toLocaleString('ru')}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${s.correctTasks / s.totalTasks >= 0.7 ? 'text-green-600' : 'text-red-600'}`}>
                      {s.correctTasks}/{s.totalTasks}
                    </p>
                    <p className="text-xs text-gray-400">{Math.round(s.correctTasks / s.totalTasks * 100)}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-gray-700 mb-3">Экзамены</h2>
          {examAttempts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400">
              Нет экзаменов. <Link href="/exam" className="text-blue-600 hover:underline">Пройти экзамен</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {examAttempts.map((a) => (
                <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700 truncate max-w-[220px]">{a.variant.title}</p>
                    <p className="text-xs text-gray-400">{new Date(a.startedAt).toLocaleString('ru')} · {a.part === 'WRITTEN' ? 'Письменная' : 'Устная'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    a.status === 'GRADED' ? 'bg-green-100 text-green-700' :
                    a.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-700' :
                    a.status === 'TEACHER_REVIEW' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {a.status === 'GRADED' ? `${a.teacherScore} б.` :
                     a.status === 'SUBMITTED' ? 'Сдан' :
                     a.status === 'TEACHER_REVIEW' ? 'На проверке' : 'В процессе'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
