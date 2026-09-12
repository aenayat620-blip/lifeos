import { useEffect, useState } from 'react'
import { useAuth } from '../store/AuthContext'
import type { Medication } from '../types'
import { getAllByUserId, putItem, deleteItem, generateId } from '../db'

export default function MedicationsPage() {
  const { user } = useAuth()
  const [meds, setMeds] = useState<Medication[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', dose: '', unit: 'میلی‌گرم', times: '08:00', instructions: '' })

  const load = async () => {
    if (!user) return
    const list = await getAllByUserId<Medication>('medications', user.id)
    setMeds(list.filter((m) => m.active))
  }
  useEffect(() => { load() }, [user])

  const add = async () => {
    if (!form.name.trim() || !user) return
    const m: Medication = {
      id: generateId(), userId: user.id, name: form.name.trim(), dose: form.dose, unit: form.unit,
      form: 'قرص', frequency: 'daily', times: form.times.split(',').map((t) => t.trim()),
      startDate: new Date().toISOString().slice(0, 10), withFood: false, instructions: form.instructions,
      active: true, createdAt: new Date().toISOString(),
    }
    await putItem('medications', m)
    setShowAdd(false)
    setForm({ name: '', dose: '', unit: 'میلی‌گرم', times: '08:00', instructions: '' })
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('حذف این دارو؟')) return
    await deleteItem('medications', id)
    load()
  }

  return (
    <div className="p-4 pt-safe">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">داروها و مکمل‌ها</h1>
        <button onClick={() => setShowAdd(true)} className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-sm">+ جدید</button>
      </div>
      <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-xs p-3 rounded-xl mb-4">
        این اطلاعات صرفاً یادآوری شخصی است. هرگز دوز دارو را بدون مشورت پزشک تغییر ندهید.
      </div>
      {showAdd && (
        <div className="mb-4 p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm space-y-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام دارو" className="w-full px-3 py-2 rounded-xl border" />
          <div className="flex gap-2">
            <input value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} placeholder="دوز" className="flex-1 px-3 py-2 rounded-xl border" dir="ltr" />
            <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="واحد" className="w-24 px-3 py-2 rounded-xl border" />
          </div>
          <input value={form.times} onChange={(e) => setForm({ ...form, times: e.target.value })} placeholder="ساعت‌ها (مثال: 08:00, 20:00)" className="w-full px-3 py-2 rounded-xl border" dir="ltr" />
          <div className="flex gap-2">
            <button onClick={add} className="flex-1 py-2 rounded-xl bg-primary-600 text-white text-sm">ذخیره</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl border text-sm">لغو</button>
          </div>
        </div>
      )}
      <ul className="space-y-2">
        {meds.map((m) => (
          <li key={m.id} className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-zinc-500 mt-1">{m.dose} {m.unit} · {m.times.join('، ')}</p>
                {m.instructions && <p className="text-xs text-zinc-400 mt-1">{m.instructions}</p>}
              </div>
              <button onClick={() => remove(m.id)} className="text-red-500 text-sm">حذف</button>
            </div>
          </li>
        ))}
        {meds.length === 0 && <p className="text-center text-zinc-400 py-8">دارویی ثبت نشده</p>}
      </ul>
    </div>
  )
}
