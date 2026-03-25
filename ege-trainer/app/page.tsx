import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await auth()
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">
            ЕГЭ по английскому языку
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 text-left">
          {[
            { icon: '🎧', title: 'Аудирование', desc: 'Задания 1–9' },
            { icon: '📖', title: 'Чтение', desc: 'Задания 10–18' },
            { icon: '✏️', title: 'Грамматика и лексика', desc: 'Задания 19–36' },
            { icon: '📝', title: 'Письмо', desc: 'Задания 37–38' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="font-semibold text-gray-800">{item.title}</div>
              <div className="text-sm text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            Зарегистрироваться
          </Link>
          <Link
            href="/auth/login"
            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold text-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Войти
          </Link>
        </div>
      </div>
    </main>
  )
}
