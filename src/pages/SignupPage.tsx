import { useState } from 'react'
import { useAuth } from '../store/AuthContext'

export default function SignupPage({ onSwitch }: { onSwitch: () => void }) {
  const { signup } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signup(email, password, name)
    setLoading(false)
    if (!res.ok) setError(res.error || 'خطا')
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary-700 to-primary-900">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 mx-auto flex items-center justify-center text-3xl font-bold text-white mb-3">L</div>
          <h1 className="text-2xl font-bold text-white">LifeOS</h1>
          <p className="text-primary-100 text-sm mt-1">ساخت حساب جدید</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-semibold text-center">ثبت‌نام</h2>
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl text-center">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">نام</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="نام شما"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">ایمیل</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="you@example.com"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              dir="ltr"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-60 transition"
          >
            {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </button>
          <p className="text-center text-sm text-zinc-500">
            حساب دارید؟{' '}
            <button type="button" onClick={onSwitch} className="text-primary-600 font-medium">
              ورود
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
