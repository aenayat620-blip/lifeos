import type { Page } from '../types'

const items: { id: Page; label: string; icon: string }[] = [
  { id: 'home', label: 'خانه', icon: '🏠' },
  { id: 'calendar', label: 'تقویم', icon: '📅' },
  { id: 'health', label: 'سلامت', icon: '❤️' },
  { id: 'habits', label: 'عادات', icon: '✅' },
  { id: 'more', label: 'بیشتر', icon: '☰' },
]

export default function BottomNav({ current, onNavigate }: { current: Page; onNavigate: (p: Page) => void }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-t border-zinc-200 dark:border-zinc-800 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const active = current === item.id || (item.id === 'home' && current === 'today')
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? 'text-primary-600' : 'text-zinc-400'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[11px] mt-0.5 font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
