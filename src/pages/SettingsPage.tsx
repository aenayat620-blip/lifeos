import { useAuth } from '../store/AuthContext'
import type { Page } from '../types'

export default function SettingsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { user, profile, logout } = useAuth()

  return (
    <div className="p-4 pt-safe">
      <h1 className="text-xl font-bold mb-4">تنظیمات</h1>
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm p-4 mb-4">
        <p className="font-medium">{profile?.name || user?.name}</p>
        <p className="text-sm text-zinc-500" dir="ltr">{user?.email}</p>
        {profile?.weight && <p className="text-sm text-zinc-500 mt-1">وزن: {profile.weight} کیلوگرم</p>}
        {profile?.height && <p className="text-sm text-zinc-500">قد: {profile.height} سانتی‌متر</p>}
      </div>
      <div className="space-y-2">
        <button onClick={() => onNavigate('home')} className="w-full text-right p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm">
          بازگشت به خانه
        </button>
        <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm text-sm text-zinc-600 space-y-2">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">حریم خصوصی</p>
          <p>داده‌های شما فقط روی این دستگاه (IndexedDB) ذخیره می‌شوند و به سرور خارجی ارسال نمی‌شوند.</p>
          <p>برای استفاده چنددستگاهی در آینده می‌توانید به Supabase مهاجرت کنید.</p>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm text-sm text-zinc-600">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">اعلان‌ها</p>
          <p>در iOS Safari پشتیبانی از اعلان پس‌زمینه محدود است. بهترین تجربه با نصب PWA و باز بودن اپلیکیشن است.</p>
        </div>
        <button onClick={() => logout()} className="w-full text-right p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl font-medium">
          خروج از حساب
        </button>
      </div>
      <p className="text-center text-[11px] text-zinc-400 mt-8">
        LifeOS v0.1 · ابزار شخصی · جایگزین پزشکی نیست
      </p>
    </div>
  )
}
