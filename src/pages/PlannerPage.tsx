import { useEffect, useState } from 'react'
import { useAuth } from '../store/AuthContext'
import type { Task, TaskCategory } from '../types'
import { getByUserAndDate, putItem, deleteItem, generateId } from '../db'
import { toYYYYMMDD, formatPersianDate } from '../lib/utils'

const categories: TaskCategory[] = ['سلامت', 'ورزش', 'تغذیه', 'مطالعه', 'کار', 'خانه', 'مراقبت شخصی', 'دارو', 'خواب', 'سایر']

export default function PlannerPage() {
  const { user } = useAuth()
  const [date, setDate] = useState(toYYYYMMDD())
  const [tasks, setTasks] = useState<Task[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'کار' as TaskCategory, startTime: '', priority: 'medium' as const })

  const load = async () => {
    if (!user) return
    setTasks(await getByUserAndDate<Task>('tasks', user.id, date))
  }
  useEffect(() => { load() }, [user, date])

  const add = async () => {
    if (!form.title.trim() || !user) return
    const t: Task = {
      id: generateId(), userId: user.id, title: form.title.trim(), category: form.category,
      date, startTime: form.startTime || undefined, priority: form.priority, completed: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    await putItem('tasks', t)
    setShowAdd(false)
    setForm({ title: '', category: 'کار', startTime: '', priority: 'medium' })
    load()
  }

  const toggle = async (task: Task) => {
    await putItem('tasks', { ...task, completed: !task.completed, updatedAt: new Date().toISOString() })
    load()
  }

  const remove = async (id: string) => {
    await deleteItem('tasks', id)
    load()
  }

  return (
    <div className="p-4 pt-safe">
      <h1 className="text-xl font-bold mb-2">برنامه‌ریز روزانه</h1>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mb-4 px-3 py-2 rounded-xl border w-full" dir="ltr" />
      <p className="text-sm text-zinc-500 mb-4">{formatPersianDate(date)}</p>
      <button onClick={() => setShowAdd(true)} className="w-full py-3 mb-4 rounded-xl bg-primary-600 text-white font-medium">+ کار جدید</button>
      {showAdd && (
        <div className="mb-4 p-4 bg-white dark:bg-zinc-800 rounded-2xl space-y-3 shadow-sm">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان" className="w-full px-3 py-2 rounded-xl border" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TaskCategory })} className="w-full px-3 py-2 rounded-xl border">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2 rounded-xl border" dir="ltr" />
          <div className="flex gap-2">
            <button onClick={add} className="flex-1 py-2 rounded-xl bg-primary-600 text-white text-sm">ذخیره</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl border text-sm">لغو</button>
          </div>
        </div>
      )}
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-3 bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm">
            <button onClick={() => toggle(t)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${t.completed ? 'bg-primary-600 border-primary-600 text-white' : 'border-zinc-300'}`}>
              {t.completed && '✓'}
            </button>
            <div className="flex-1">
              <p className={`font-medium text-sm ${t.completed ? 'line-through text-zinc-400' : ''}`}>{t.title}</p>
              <p className="text-xs text-zinc-400">{t.category} {t.startTime && `· ${t.startTime}`}</p>
            </div>
            <button onClick={() => remove(t.id)} className="text-zinc-400 text-xs">حذف</button>
          </li>
        ))}
        {tasks.length === 0 && <p className="text-center text-zinc-400 py-8">کاری برای این روز نیست</p>}
      </ul>
    </div>
  )
}
