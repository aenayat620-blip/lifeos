import type { Page } from '../types'

export default function HealthPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const items = [
    { id: 'medications' as Page, label: 'داروها و مکمل‌ها', icon: '💊', desc: 'یادآوری و پیگیری' },
    { id: 'water' as Page, label: 'آب', icon: '💧', desc: 'مصرف روزانه آب' },
    { id: 'habits' as Page, label: 'عادات سلامت', icon: '✅', desc: 'پیگیری عادات' },
    { id: 'settings' as Page, label: 'پروفایل سلامت', icon: '👤', desc: 'اطلاعات شخصی' },
  ]

  return (
    <div className="p-4 pt-safe">
      <h1 className="text-xl font-bold mb-4">سلامت و تندرستی</h1>
      <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-xs p-3 rounded-xl mb-4">
        این برنامه تشخیص بیماری نمی‌دهد و جایگزین پزشک نیست. در صورت نگرانی با متخصص مشورت کنید.
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="w-full flex items-center gap-4 p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm text-right"
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1">
              <p className="font-medium">{item.label}</p>
              <p className="text-xs text-zinc-500">{item.desc}</p>
            </div>
            <span className="text-zinc-300">‹</span>
          </button>
        ))}
      </div>
    </div>
  )
}
