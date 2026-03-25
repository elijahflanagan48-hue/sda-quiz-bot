'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session?.user) return null

  const isTeacher = session.user.role === 'TEACHER'

  const studentLinks = [
    { href: '/dashboard', label: 'Кабинет' },
    { href: '/practice', label: 'Тренировка' },
    { href: '/exam', label: 'Экзамен' },
    { href: '/history', label: 'История' },
    { href: '/profile', label: 'Профиль' },
    { href: '/settings', label: 'Настройки' },
  ]

  const teacherLinks = [
    { href: '/teacher', label: 'Обзор' },
    { href: '/teacher/review', label: 'Проверка' },
    { href: '/teacher/students', label: 'Ученики' },
    { href: '/teacher/tasks', label: 'Задания' },
    { href: '/teacher/variants', label: 'Варианты' },
  ]

  const links = isTeacher ? teacherLinks : studentLinks

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href={isTeacher ? '/teacher' : '/dashboard'} className="font-bold text-blue-700 text-lg">
          ЕГЭ Тренажёр
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 font-medium">{session.user.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isTeacher ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {isTeacher ? 'Учитель' : 'Ученик'}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>
    </nav>
  )
}
