import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  if (session.user.role !== 'TEACHER') redirect('/dashboard')

  const { id } = await params

  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      practiceSessions: { orderBy: { startedAt: 'desc' } },
      submissions: {
        include: { task: { select: { taskNumber: true, section: true, taskType: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!student || student.role !== 'STUDENT') notFound()

  const sectionNames: Record<string, string> = {
    LISTENING: 'Аудирование', READING: 'Чтение',
    GRAMMAR_VOCAB: 'Грамматика', WRITING: 'Письмо', ORAL: 'Устная часть',
  }

  // Stats per section
  const statsBySection = student.practiceSessions.reduce<Record<string, { total: number; correct: number; count: number }>>((acc, s) => {
    if (!acc[s.section]) acc[s.section] = { total: 0, correct: 0, count: 0 }
    acc[s.section].total += s.totalTasks
    acc[s.section].correct += s.correctTasks
    acc[s.section].count++
    return acc
  }, {})

  const writingSubmissions = student.submissions.filter(
    (s) => s.task.section === 'WRITING' || s.task.section === 'ORAL'
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher/students" className="text-blue-600 hover:underline text-sm">← Назад</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-500 text-sm">{student.email} · с {new Date(student.createdAt).toLocaleDateString('ru')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Статистика по разделам</h2>
        {Object.keys(statsBySection).length === 0 ? (
          <p className="text-gray-400 text-sm">Нет тренировок</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(statsBySection).map(([section, stats]) => {
              const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
              return (
                <div key={section}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{sectionNames[section]}</span>
                    <span className="text-gray-500">{stats.correct}/{stats.total} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className={`h-2 rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
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
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {s.teacherScore} б. проверено
                        </span>
                      ) : s.submittedForReview ? (
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">На проверке</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Черновик</span>
                      )}
                      <span className="text-gray-400">{new Date(s.createdAt).toLocaleDateString('ru')}</span>
                    </div>
                  </div>
                  {s.imageUrl ? (
                    <Image src={s.imageUrl} alt="Ответ" width={400} height={300} className="rounded-lg max-w-xs" />
                  ) : (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4">{answerText}</p>
                  )}
                  {s.teacherFeedback && (
                    <div className="mt-2 bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                      <strong>Комментарий:</strong> {s.teacherFeedback}
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
