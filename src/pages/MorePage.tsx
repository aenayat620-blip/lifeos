import type { Page } from '../types'

export default function MorePage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const items: { id: Page; label: string; icon: string }[] = [
    { id: 'medications', label: 'داروها', icon: '💊' },
    { id: 'water', label: 'آب', icon: '💧' },
    { id: 'habits', label: 'عادات', icon: '✅' },
    { id: 'fitness', label: 'ورزش', icon: '💪' },
    { id: 'nutrition', label: 'تغذیه', icon: '🥗' },
    { id: 'settings', label: 'تنظیمات', icon: '⚙️' },
  ]

  return (
    <div className="p-4 pt-safe">
      <h1 className="text-xl font-bold mb-4">بیشتر</h1>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-center gap-2 p-5 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm"
          >
            <span className="text-3xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
