import { useEffect, useState } from 'react'
import { useAuth } from '../store/AuthContext'
import type { WaterLog } from '../types'
import { getByUserAndDate, putItem, generateId } from '../db'
import { toYYYYMMDD, percent } from '../lib/utils'

export default function WaterPage() {
  const { user } = useAuth()
  const [total, setTotal] = useState(0)
  const [logs, setLogs] = useState<WaterLog[]>([])
  const cupMl = 250
  const targetCups = 8
  const target = cupMl * targetCups
  const today = toYYYYMMDD()

  const load = async () => {
    if (!user) return
    const list = await getByUserAndDate<WaterLog>('water_logs', user.id, today)
    setLogs(list)
    setTotal(list.reduce((s, l) => s + l.amount, 0))
  }
  useEffect(() => { load() }, [user])

  const add = async (ml: number) => {
    if (!user) return
    await putItem('water_logs', { id: generateId(), userId: user.id, date: today, amount: ml, createdAt: new Date().toISOString() })
    load()
  }

  return (
    <div className="p-4 pt-safe">
      <h1 className="text-xl font-bold mb-6">ردیاب آب</h1>
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-40 h-40">
          <svg className="w-40 h-40 progress-ring" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e4e4e7" strokeWidth="2.5" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0d9488" strokeWidth="2.5" strokeDasharray={`${percent(total, target)}, 100`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{Math.round(total / cupMl * 10) / 10}</span>
            <span className="text-xs text-zinc-500">از {targetCups} لیوان</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-zinc-500">{percent(total, target)}٪ تکمیل شده</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[1,2,3,4].map((cups) => (
          <button key={cups} onClick={() => add(cups * cupMl)} className="py-4 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium text-lg">
            +{cups} لیوان
          </button>
        ))}
      </div>
      <h2 className="font-semibold mb-2 text-sm">امروز</h2>
      <ul className="space-y-1">
        {logs.map((l) => (
          <li key={l.id} className="flex justify-between text-sm text-zinc-600 py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span>{new Date(l.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{l.amount / cupMl} لیوان</span>
          </li>
        ))}
        {logs.length === 0 && <p className="text-zinc-400 text-sm text-center py-4">هنوز آبی ثبت نشده</p>}
      </ul>
    </div>
  )
}
