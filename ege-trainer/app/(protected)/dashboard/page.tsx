import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  if (session.user.role === 'TEACHER') redirect('/teacher')

  const userId = session.user.id

  const [recentSessions, recentAttempts, pendingSubmissions] = await Promise.all([
    prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 5,
    }),
    prisma.examAttempt.findMany({
      where: { userId },
      include: { variant: { select: { title: true } } },
      orderBy: { startedAt: 'desc' },
      take: 5,
    }),
    prisma.taskSubmission.count({
      where: { userId, teacherScore: null, mode: 'EXAM' },
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Личный кабинет</h1>
        <p className="text-gray-500">Привет, {session.user.name}!</p>
      </div>

      {pendingSubmissions > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800">
            📋 Ожидает проверки учителя: <strong>{pendingSubmissions}</strong> {pendingSubmissions === 1 ? 'работа' : 'работ'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/practice?section=LISTENING', icon: '🎧', label: 'Аудирование', color: 'bg-purple-50 hover:bg-purple-100' },
          { href: '/practice?section=READING', icon: '📖', label: 'Чтение', color: 'bg-green-50 hover:bg-green-100' },
          { href: '/practice?section=GRAMMAR_VOCAB', icon: '✏️', label: 'Грамматика', color: 'bg-orange-50 hover:bg-orange-100' },
          { href: '/practice?section=WRITING', icon: '📝', label: 'Письмо', color: 'bg-blue-50 hover:bg-blue-100' },
        ].map((card) => (
          <Link key={card.href} href={card.href} className={`${card.color} rounded-xl p-4 text-center transition-colors`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="font-medium text-gray-700">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Последние тренировки</h2>
          {recentSessions.length === 0 ? (
            <p className="text-gray-400 text-sm">Пока нет тренировок. <Link href="/practice" className="text-blue-600 hover:underline">Начать</Link></p>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{sectionNames[s.section] || s.section}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${s.correctTasks / s.totalTasks >= 0.7 ? 'text-green-600' : 'text-red-600'}`}>
                      {s.correctTasks}/{s.totalTasks}
                    </span>
                    <span className="text-gray-400">{new Date(s.startedAt).toLocaleDateString('ru')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Последние экзамены</h2>
          {recentAttempts.length === 0 ? (
            <p className="text-gray-400 text-sm">Пока нет попыток. <Link href="/exam" className="text-blue-600 hover:underline">Пройти экзамен</Link></p>
          ) : (
            <div className="space-y-2">
              {recentAttempts.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 truncate max-w-[200px]">{a.variant.title}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      a.status === 'GRADED' ? 'bg-green-100 text-green-700' :
                      a.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {a.status === 'GRADED' ? `${a.teacherScore} б.` :
                       a.status === 'SUBMITTED' ? 'На проверке' :
                       a.status === 'IN_PROGRESS' ? 'В процессе' : a.status}
                    </span>
                    <span className="text-gray-400">{new Date(a.startedAt).toLocaleDateString('ru')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/practice" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold text-center hover:bg-blue-700 transition-colors">
          Тренироваться
        </Link>
        <Link href="/exam" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold text-center hover:bg-indigo-700 transition-colors">
          Экзамен
        </Link>
      </div>
    </div>
  )
}
