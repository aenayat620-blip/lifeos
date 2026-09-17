import { useEffect, useState } from 'react'
import { useAuth } from '../store/AuthContext'
import type { Habit, HabitLog } from '../types'
import { getAllByUserId, getByUserAndDate, putItem, deleteItem, generateId } from '../db'
import { toYYYYMMDD } from '../lib/utils'

export default function HabitsPage() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const today = toYYYYMMDD()

  const load = async () => {
    if (!user) return
    const [hs, ls] = await Promise.all([
      getAllByUserId<Habit>('habits', user.id),
      getByUserAndDate<HabitLog>('habit_logs', user.id, today),
    ])
    setHabits(hs.filter((h) => !h.archived))
    setLogs(ls)
  }

  useEffect(() => { (async()=>{if(!user)return;const all=await getAllByUserId<Habit>('habits',user.id);const defaults=['مسواک زدن','روتین مراقبت پوست','مصرف به‌موقع دارو/مکمل‌های ثبت‌شده','یادگیری زبان','کنترل قند و چربی افزوده'];for(const title of defaults)if(!all.some(h=>h.title===title))await putItem('habits',{id:generateId(),userId:user.id,title,frequency:'daily',createdAt:new Date().toISOString(),archived:false});load()})() }, [user])

  const addHabit = async () => {
    if (!title.trim() || !user) return
    const h: Habit = {
      id: generateId(), userId: user.id, title: title.trim(), frequency: 'daily',
      createdAt: new Date().toISOString(), archived: false,
    }
    await putItem('habits', h)
    setTitle('')
    setShowAdd(false)
    load()
  }

  const toggle = async (habit: Habit) => {
    const existing = logs.find((l) => l.habitId === habit.id)
    if (existing) {
      const updated = { ...existing, completed: !existing.completed }
      await putItem('habit_logs', updated)
    } else {
      await putItem('habit_logs', {
        id: generateId(), userId: user!.id, habitId: habit.id, date: today, completed: true, createdAt: new Date().toISOString(),
      })
    }
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('حذف این عادت؟')) return
    await deleteItem('habits', id)
    load()
  }

  return (
    <div className="p-4 pt-safe">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">عادات</h1>
        <button onClick={() => setShowAdd(true)} className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-sm">+ جدید</button>
      </div>
      {showAdd && (
        <div className="mb-4 p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان عادت" className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700" />
          <div className="flex gap-2">
            <button onClick={addHabit} className="flex-1 py-2 rounded-xl bg-primary-600 text-white text-sm">ذخیره</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl border text-sm">لغو</button>
          </div>
        </div>
      )}
      <ul className="space-y-2">
        {habits.map((h) => {
          const done = logs.some((l) => l.habitId === h.id && l.completed)
          return (
            <li key={h.id} className="flex items-center gap-3 bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm">
              <button onClick={() => toggle(h)} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300'}`}>
                {done && '✓'}
              </button>
              <span className="flex-1 font-medium">{h.title}</span>
              <button onClick={() => remove(h.id)} className="text-zinc-400 text-sm">حذف</button>
            </li>
          )
        })}
        {habits.length === 0 && <p className="text-center text-zinc-400 py-8">هنوز عادتی اضافه نشده</p>}
      </ul>
    </div>
  )
}
