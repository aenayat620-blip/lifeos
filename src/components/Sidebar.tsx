import type { Page } from '../types'
import { useAuth } from '../store/AuthContext'

const items: { id: Page; label: string; icon: string }[] = [
  { id: 'home', label: 'خانه / امروز', icon: '🏠' },
  { id: 'calendar', label: 'برنامه‌ریز', icon: '📅' },
  { id: 'habits', label: 'عادات', icon: '✅' },
  { id: 'medications', label: 'داروها', icon: '💊' },
  { id: 'water', label: 'آب', icon: '💧' },
  { id: 'health', label: 'سلامت', icon: '❤️' },
  { id: 'fitness', label: 'ورزش', icon: '💪' },
  { id: 'nutrition', label: 'تغذیه', icon: '🥗' },
  { id: 'settings', label: 'تنظیمات', icon: '⚙️' },
]

export default function Sidebar({ current, onNavigate }: { current: Page; onNavigate: (p: Page) => void }) {
  const { user, logout } = useAuth()
  return (
    <aside className="fixed right-0 top-0 bottom-0 w-64 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col z-40">
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg">L</div>
          <div>
            <h1 className="font-bold text-lg">LifeOS</h1>
            <p className="text-xs text-zinc-500 truncate">{user?.name}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active = current === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <span>🚪</span>
          <span>خروج</span>
        </button>
      </div>
    </aside>
  )
}
