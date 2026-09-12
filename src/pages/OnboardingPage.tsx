import { useState } from 'react'
import { useAuth } from '../store/AuthContext'

const steps = ['شخصی', 'تناسب‌اندام', 'تغذیه', 'سلامت', 'چرخه', 'تأیید']

export default function OnboardingPage({ onComplete }: { onComplete: () => void }) {
  const { completeOnboarding, profile } = useAuth()
  const [step, setStep] = useState(0)
  const [withSample, setWithSample] = useState(true)
  const [form, setForm] = useState({
    name: profile?.name || '',
    dateOfBirth: '',
    height: '',
    weight: '',
    targetWeight: '',
    wakeTime: '07:00',
    sleepTime: '23:00',
    fitnessGoal: 'سلامت عمومی',
    activityLevel: 'متوسط',
    trainingDaysPerWeek: '3',
    dietaryRestrictions: '',
    allergies: '',
    lastPeriodStart: '',
    cycleLength: '28',
    periodDuration: '5',
  })

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const finish = async () => {
    await completeOnboarding(
      {
        name: form.name,
        dateOfBirth: form.dateOfBirth || undefined,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        targetWeight: form.targetWeight ? Number(form.targetWeight) : undefined,
        wakeTime: form.wakeTime,
        sleepTime: form.sleepTime,
        fitnessGoal: form.fitnessGoal,
        activityLevel: form.activityLevel,
        trainingDaysPerWeek: Number(form.trainingDaysPerWeek) || 3,
        dietaryRestrictions: form.dietaryRestrictions ? form.dietaryRestrictions.split(',').map((s) => s.trim()) : [],
        allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()) : [],
        lastPeriodStart: form.lastPeriodStart || undefined,
        cycleLength: Number(form.cycleLength) || 28,
        periodDuration: Number(form.periodDuration) || 5,
      },
      withSample
    )
    onComplete()
  }

  return (
    <div className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-primary-700 text-white p-4 pt-safe">
        <h1 className="text-lg font-bold text-center">خوش آمدید به LifeOS</h1>
        <div className="flex gap-1 mt-3 justify-center">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 max-w-12 rounded-full ${i <= step ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
        <p className="text-center text-sm mt-2 text-primary-100">{steps[step]}</p>
      </header>
      <div className="flex-1 p-4 overflow-y-auto">
        {step === 0 && (
          <div className="space-y-4 max-w-md mx-auto">
            <Field label="نام" value={form.name} onChange={(v) => update('name', v)} />
            <Field label="تاریخ تولد" type="date" value={form.dateOfBirth} onChange={(v) => update('dateOfBirth', v)} />
            <Field label="قد (سانتی‌متر)" type="number" value={form.height} onChange={(v) => update('height', v)} />
            <Field label="وزن فعلی (کیلوگرم)" type="number" value={form.weight} onChange={(v) => update('weight', v)} />
            <Field label="وزن هدف (کیلوگرم)" type="number" value={form.targetWeight} onChange={(v) => update('targetWeight', v)} />
            <Field label="ساعت بیدار شدن" type="time" value={form.wakeTime} onChange={(v) => update('wakeTime', v)} />
            <Field label="ساعت خواب" type="time" value={form.sleepTime} onChange={(v) => update('sleepTime', v)} />
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4 max-w-md mx-auto">
            <Select label="هدف تناسب‌اندام" value={form.fitnessGoal} onChange={(v) => update('fitnessGoal', v)} options={['کاهش چربی', 'افزایش عضله', 'قدرت', 'سلامت عمومی', 'استقامت']} />
            <Select label="سطح فعالیت" value={form.activityLevel} onChange={(v) => update('activityLevel', v)} options={['کم‌تحرک', 'سبک', 'متوسط', 'فعال', 'بسیار فعال']} />
            <Field label="روزهای تمرین در هفته" type="number" value={form.trainingDaysPerWeek} onChange={(v) => update('trainingDaysPerWeek', v)} />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4 max-w-md mx-auto">
            <Field label="محدودیت‌های غذایی (با ویرگول)" value={form.dietaryRestrictions} onChange={(v) => update('dietaryRestrictions', v)} placeholder="گیاه‌خواری، بدون گلوتن..." />
            <Field label="آلرژی‌ها" value={form.allergies} onChange={(v) => update('allergies', v)} placeholder="بادام‌زمینی، لاکتوز..." />
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4 max-w-md mx-auto text-center text-zinc-600">
            <p>می‌توانید داروها و شرایط پزشکی را بعداً در بخش سلامت اضافه کنید.</p>
            <p className="text-sm">این برنامه تشخیص پزشکی نمی‌دهد و جایگزین پزشک نیست.</p>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4 max-w-md mx-auto">
            <p className="text-sm text-zinc-500 text-center mb-2">اختیاری — می‌توانید رد کنید</p>
            <Field label="شروع آخرین قاعدگی" type="date" value={form.lastPeriodStart} onChange={(v) => update('lastPeriodStart', v)} />
            <Field label="طول معمول چرخه (روز)" type="number" value={form.cycleLength} onChange={(v) => update('cycleLength', v)} />
            <Field label="مدت معمول پریود (روز)" type="number" value={form.periodDuration} onChange={(v) => update('periodDuration', v)} />
          </div>
        )}
        {step === 5 && (
          <div className="space-y-6 max-w-md mx-auto text-center">
            <p className="text-zinc-600">آماده‌اید شروع کنید؟</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                <input type="radio" checked={withSample} onChange={() => setWithSample(true)} />
                <div className="text-right flex-1">
                  <p className="font-medium">شروع با داده‌های نمونه</p>
                  <p className="text-xs text-zinc-500">عادات، کارها و مثال‌های آماده</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                <input type="radio" checked={!withSample} onChange={() => setWithSample(false)} />
                <div className="text-right flex-1">
                  <p className="font-medium">شروع از صفر</p>
                  <p className="text-xs text-zinc-500">بدون داده نمونه</p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-3 pb-safe">
        {step > 0 && (
          <button onClick={prev} className="flex-1 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 font-medium">قبلی</button>
        )}
        {step < steps.length - 1 ? (
          <button onClick={next} className="flex-1 py-3 rounded-xl bg-primary-600 text-white font-medium">بعدی</button>
        ) : (
          <button onClick={finish} className="flex-1 py-3 rounded-xl bg-primary-600 text-white font-medium">شروع کنید</button>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
        dir={type === 'date' || type === 'time' || type === 'number' ? 'ltr' : undefined} />
    </div>
  )
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-600 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-500">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
