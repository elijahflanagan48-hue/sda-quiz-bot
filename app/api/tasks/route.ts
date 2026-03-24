import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const section = searchParams.get('section')
  const taskType = searchParams.get('taskType')
  const limit = parseInt(searchParams.get('limit') || '1')
  const excludeIds = searchParams.get('excludeIds')?.split(',').filter(Boolean) || []

  const where: Record<string, unknown> = { isActive: true }
  if (section) where.section = section
  if (taskType) where.taskType = taskType
  if (excludeIds.length > 0) where.id = { notIn: excludeIds }

  const count = await prisma.task.count({ where })
  if (count === 0) return NextResponse.json({ task: null })

  const skip = Math.floor(Math.random() * count)
  const tasks = await prisma.task.findMany({ where, skip, take: limit })

  return NextResponse.json({ task: tasks[0] || null, tasks })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const task = await prisma.task.create({ data: body })
  return NextResponse.json(task, { status: 201 })
}
