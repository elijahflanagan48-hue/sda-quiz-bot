import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const userId = session.user.id

  const [user, practiceSessions, writingSubmissions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    }),
    prisma.taskSubmission.findMany({
      where: {
        userId,
        task: { section: { in: ['WRITING', 'ORAL'] } },
      },
      include: { task: { select: { taskNumber: true, section: true, taskType: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  if (!user) redirect('/auth/login')

  const sectionNames: Record<string, string> = {
    LISTENING: 'Аудирование', READING: 'Чтение',
    GRAMMAR_VOCAB: 'Грамматика', WRITING: 'Письмо', ORAL: 'Устная часть',
  }

  const statsBySection = practiceSessions.reduce<Record<string, { total: number; correct: number; sessions: number }>>((acc, s) => {
    if (!acc[s.section]) acc[s.section] = { total: 0, correct: 0, sessions: 0 }
    acc[s.section].total += s.totalTasks
    acc[s.section].correct += s.correctTasks
    acc[s.section].sessions++
    return acc
  }, {})

  const totalTasks = practiceSessions.reduce((sum, s) => sum + s.totalTasks, 0)
  const totalCorrect = practiceSessions.reduce((sum, s) => sum + s.correctTasks, 0)
  const overallPct = totalTasks > 0 ? Math.round((totalCorrect / totalTasks) * 100) : 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Мой профиль</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-lg">{user.name}</div>
          <div className="text-gray-500 text-sm">{user.email}</div>
          <div className="text-gray-400 text-xs mt-0.5">Зарегистрирован {new Date(user.createdAt).toLocaleDateString('ru')}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{practiceSessions.length}</div>
          <div className="text-xs text-gray-500 mt-1">Тренировок</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{totalCorrect}/{totalTasks}</div>
          <div className="text-xs text-gray-500 mt-1">Верных ответов</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className={`text-2xl font-bold ${overallPct >= 70 ? 'text-green-600' : overallPct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {overallPct}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Точность</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Статистика по разделам</h2>
        {Object.keys(statsBySection).length === 0 ? (
          <p className="text-gray-400 text-sm">Пока нет тренировок</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(statsBySection).map(([section, stats]) => {
              const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
              return (
                <div key={section}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{sectionNames[section]}</span>
                    <span className="text-gray-500">
                      {stats.correct}/{stats.total} · {pct}% · {stats.sessions} сессий
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full">
                    <div
                      className={`h-2.5 rounded-full transition-all ${pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: pct + '%' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {writingSubmissions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Письменные и устные работы</h2>
          <div className="space-y-4">
            {writingSubmissions.map((s) => {
              let answerText = s.answer
              try {
                const p = JSON.parse(s.answer)
                if (typeof p === 'string') answerText = p
              } catch {}

              return (
                <div key={s.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-700">
                      Задание {s.task.taskNumber} · {sectionNames[s.task.section]}
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                      {s.reviewedAt ? (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                          Проверено: {s.teacherScore} б.
                        </span>
                      ) : s.submittedForReview ? (
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">На проверке</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">Не отправлено</span>
                      )}
                      <span className="text-gray-400 text-xs">{new Date(s.createdAt).toLocaleDateString('ru')}</span>
                    </div>
                  </div>
                  {s.imageUrl ? (
                    <Image src={s.imageUrl} alt="Ответ" width={400} height={300} className="rounded-lg max-w-sm" />
                  ) : (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4">{answerText}</p>
                  )}
                  {s.teacherFeedback && (
                    <div className="mt-3 bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                      <strong>Комментарий учителя:</strong> {s.teacherFeedback}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
