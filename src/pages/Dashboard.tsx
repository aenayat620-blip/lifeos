import { useEffect, useState } from 'react'
import { useAuth } from '../store/AuthContext'
import type { Page, Task, Habit, HabitLog, WaterLog, Medication } from '../types'
import { getAllByUserId, getByUserAndDate, putItem, generateId } from '../db'
import { formatPersianDate, formatPersianTime, getGreeting, toYYYYMMDD, percent } from '../lib/utils'

export default function Dashboard({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { user, profile } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [water, setWater] = useState(0)
  const [meds, setMeds] = useState<Medication[]>([])
  const [now, setNow] = useState(new Date())
  const today = toYYYYMMDD()

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const [ts, hs, hls, ws, ms] = await Promise.all([
        getByUserAndDate<Task>('tasks', user.id, today),
        getAllByUserId<Habit>('habits', user.id),
        getByUserAndDate<HabitLog>('habit_logs', user.id, today),
        getByUserAndDate<WaterLog>('water_logs', user.id, today),
        getAllByUserId<Medication>('medications', user.id),
      ])
      setTasks(ts)
      setHabits(hs.filter((h) => !h.archived))
      setHabitLogs(hls)
      setWater(ws.reduce((s, w) => s + w.amount, 0))
      setMeds(ms.filter((m) => m.active))
    })()
  }, [user, today])

  const toggleTask = async (task: Task) => {
    const updated = { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : undefined, updatedAt: new Date().toISOString() }
    await putItem('tasks', updated)
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
  }

  const toggleHabit = async (habit: Habit) => {
    const existing = habitLogs.find((l) => l.habitId === habit.id)
    if (existing) {
      const updated = { ...existing, completed: !existing.completed }
      await putItem('habit_logs', updated)
      setHabitLogs((prev) => prev.map((l) => (l.id === existing.id ? updated : l)))
    } else {
      const log: HabitLog = { id: generateId(), userId: user!.id, habitId: habit.id, date: today, completed: true, createdAt: new Date().toISOString() }
      await putItem('habit_logs', log)
      setHabitLogs((prev) => [...prev, log])
    }
  }

  const addWater = async (ml: number) => {
    const log: WaterLog = { id: generateId(), userId: user!.id, date: today, amount: ml, createdAt: new Date().toISOString() }
    await putItem('water_logs', log)
    setWater((w) => w + ml)
  }

  const completedTasks = tasks.filter((t) => t.completed).length
  const completedHabits = habitLogs.filter((l) => l.completed).length
  const totalItems = tasks.length + habits.length || 1
  const completion = percent(completedTasks + completedHabits, totalItems)
  const waterTarget = 2000

  return (
    <div className="pb-4">
      <header className="bg-primary-700 text-white px-4 pt-safe pb-6 rounded-b-3xl">
        <div className="flex justify-between items-start pt-4">
          <div>
            <p className="text-primary-100 text-sm">{getGreeting()}، {profile?.name || user?.name}</p>
            <h1 className="text-xl font-bold mt-0.5">{formatPersianDate(now)}</h1>
            <p className="text-primary-200 text-sm mt-1">{formatPersianTime(now)}</p>
          </div>
          <div className="text-center">
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 progress-ring" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="white" strokeWidth="3" strokeDasharray={`${completion}, 100`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{completion}%</span>
            </div>
            <p className="text-[10px] mt-1 text-primary-200">تکمیل امروز</p>
          </div>
        </div>
      </header>

      <div className="px-4 -mt-4 space-y-4">
        {/* Quick actions */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm p-3 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { label: 'آب +۲۵۰', action: () => addWater(250), icon: '💧' },
            { label: 'عادات', action: () => onNavigate('habits'), icon: '✅' },
            { label: 'دارو', action: () => onNavigate('medications'), icon: '💊' },
            { label: 'برنامه', action: () => onNavigate('calendar'), icon: '📅' },
          ].map((q) => (
            <button key={q.label} onClick={q.action} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
              <span>{q.icon}</span> {q.label}
            </button>
          ))}
        </div>

        {/* Tasks */}
        <Card title="برنامه امروز" onMore={() => onNavigate('calendar')}>
          {tasks.length === 0 ? (
            <Empty text="کاری برای امروز ثبت نشده" />
          ) : (
            <ul className="space-y-2">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTask(t)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${t.completed ? 'bg-primary-600 border-primary-600 text-white' : 'border-zinc-300'}`}
                  >
                    {t.completed && '✓'}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${t.completed ? 'line-through text-zinc-400' : ''}`}>{t.title}</p>
                    <p className="text-xs text-zinc-400">{t.category} {t.startTime && `· ${t.startTime}`}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Habits */}
        <Card title="عادات امروز" onMore={() => onNavigate('habits')}>
          {habits.length === 0 ? (
            <Empty text="عادتی تعریف نشده" />
          ) : (
            <ul className="space-y-2">
              {habits.map((h) => {
                const done = habitLogs.some((l) => l.habitId === h.id && l.completed)
                return (
                  <li key={h.id} className="flex items-center gap-3">
                    <button
                      onClick={() => toggleHabit(h)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300'}`}
                    >
                      {done && '✓'}
                    </button>
                    <p className={`text-sm font-medium ${done ? 'text-zinc-400' : ''}`}>{h.title}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        {/* Water */}
        <Card title="آب امروز" onMore={() => onNavigate('water')}>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 progress-ring" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e4e4e7" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0d9488" strokeWidth="3" strokeDasharray={`${percent(water, waterTarget)}, 100`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{Math.round(water / 1000 * 10) / 10}L</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-500">هدف: {waterTarget} میلی‌لیتر</p>
              <div className="flex gap-2 mt-2">
                {[250, 500].map((ml) => (
                  <button key={ml} onClick={() => addWater(ml)} className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium">
                    +{ml} ml
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Medications */}
        <Card title="داروهای امروز" onMore={() => onNavigate('medications')}>
          {meds.length === 0 ? (
            <Empty text="دارویی ثبت نشده" />
          ) : (
            <ul className="space-y-2">
              {meds.slice(0, 4).map((m) => (
                <li key={m.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{m.name}</span>
                  <span className="text-zinc-400 text-xs">{m.dose} {m.unit} · {m.times.join(', ')}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Disclaimer */}
        <p className="text-center text-[11px] text-zinc-400 px-4 pb-2">
          LifeOS یک ابزار سازمان‌دهی شخصی است و جایگزین مشاوره پزشکی نیست.
        </p>
      </div>
    </div>
  )
}

function Card({ title, children, onMore }: { title: string; children: React.ReactNode; onMore?: () => void }) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm">{title}</h2>
        {onMore && (
          <button onClick={onMore} className="text-xs text-primary-600 font-medium">بیشتر</button>
        )}
      </div>
      {children}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-zinc-400 text-center py-2">{text}</p>
}
