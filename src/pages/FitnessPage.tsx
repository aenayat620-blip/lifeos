import { useEffect,useMemo,useState } from 'react'
import { useAuth } from '../store/AuthContext'
import { getAllByUserId,getByUserAndDate,putItem,deleteItem,generateId } from '../db'
import type { DailyWorkout,WorkoutTemplate } from '../types'
import { toYYYYMMDD,formatPersianDate } from '../lib/utils'

type WorkoutPack={id:string;name:string;description:string;items:string[]}
const defaultRows=[
 ['تمرین قدرتی/بدنسازی','وزنه',60,330,'تمرین کامل با شدت متوسط؛ کالری تقریبی بر اساس وزن و شدت.'],
 ['تردمیل','دویدن',10,55,'۱۰ دقیقه؛ سرعت/شیب مطابق برنامه مربی.'],
 ['دوچرخه ثابت','دوچرخه',10,55,'۱۰ دقیقه با شدت متوسط.'],
 ['الپتیکال','هوازی',5,30,'۵ دقیقه با شدت متوسط.'],
 ['پیاده‌روی','پیاده‌روی',30,115,'۳۰ دقیقه پیاده‌روی با سرعت متناسب.'],
] as const
const packs:WorkoutPack[]=[
 {id:'w1',name:'پک باشگاه کامل · ۱۱۰ دقیقه',description:'قدرتی + تردمیل + دوچرخه + الپتیکال',items:['تمرین قدرتی/بدنسازی','تردمیل','دوچرخه ثابت','الپتیکال']},
 {id:'w2',name:'پک پیاده‌روی · ۳۰ دقیقه',description:'برای روز استراحت یا فعالیت سبک',items:['پیاده‌روی']},
 {id:'w3',name:'پک ترکیبی · ۱۴۰ دقیقه',description:'تمرین قدرتی + هوازی + پیاده‌روی',items:['تمرین قدرتی/بدنسازی','تردمیل','دوچرخه ثابت','الپتیکال','پیاده‌روی']},
]
const metNote='کالری‌ها تخمینی‌اند و با وزن، سرعت، شیب و شدت واقعی تغییر می‌کنند.'
export default function FitnessPage(){
 const{user,profile}=useAuth();const[items,setItems]=useState<WorkoutTemplate[]>([]);const[daily,setDaily]=useState<DailyWorkout[]>([]);const[date,setDate]=useState(()=>localStorage.getItem('lifeos-planner-date')||toYYYYMMDD());const[type,setType]=useState<WorkoutTemplate['type']>('وزنه');const[show,setShow]=useState(false);const[form,setForm]=useState({title:'',duration:'',calories:''})
 const load=async()=>{if(!user)return;const[a,b]=await Promise.all([getAllByUserId<WorkoutTemplate>('workout_templates',user.id),getByUserAndDate<DailyWorkout>('daily_workouts',user.id,date)]);setItems(a);setDaily(b)}
 useEffect(()=>{load()},[user,date])
 useEffect(()=>{(async()=>{if(!user)return;const all=await getAllByUserId<WorkoutTemplate>('workout_templates',user.id);for(const x of defaultRows)if(!all.some(i=>i.title===x[0]))await putItem('workout_templates',{id:generateId(),userId:user.id,title:x[0],type:x[1] as WorkoutTemplate['type'],durationMinutes:x[2],caloriesBurned:x[3],notes:x[4],createdAt:new Date().toISOString()});load()})()},[user])
 const choose=async(x:WorkoutTemplate)=>{if(!user||daily.some(d=>d.workoutId===x.id))return;await putItem('daily_workouts',{id:generateId(),userId:user.id,date,workoutId:x.id,completed:false,caloriesBurned:x.caloriesBurned,createdAt:new Date().toISOString()});load()}
 const toggle=async(x:DailyWorkout)=>{await putItem('daily_workouts',{...x,completed:!x.completed});load()}
 const selectPack=async(p:WorkoutPack)=>{if(!user)return;const existing=await getByUserAndDate<DailyWorkout>('daily_workouts',user.id,date);for(const x of existing)await deleteItem('daily_workouts',x.id);for(const name of p.items){const x=items.find(i=>i.title===name);if(x)await putItem('daily_workouts',{id:generateId(),userId:user.id,date,workoutId:x.id,completed:false,caloriesBurned:x.caloriesBurned,createdAt:new Date().toISOString()})}load()}
 const add=async()=>{if(!user||!form.title.trim())return;await putItem('workout_templates',{id:generateId(),userId:user.id,title:form.title.trim(),type,durationMinutes:Number(form.duration)||30,caloriesBurned:Number(form.calories)||0,createdAt:new Date().toISOString()});setForm({title:'',duration:'',calories:''});setShow(false);load()}
 const burn=daily.filter(x=>x.completed).reduce((s,x)=>s+(x.caloriesBurned||0),0), duration=daily.reduce((s,x)=>s+(items.find(i=>i.id===x.workoutId)?.durationMinutes||0),0)
 const types:WorkoutTemplate['type'][]=['وزنه','پیاده‌روی','دویدن','دوچرخه','کشش','یوگا','هوازی','سایر']
 const bmi=profile?.weight&&profile?.height?profile.weight/((profile.height/100)**2):null
 return <div className="p-4 pt-safe max-w-4xl mx-auto pb-24"><h1 className="text-2xl font-black">ورزش و فعالیت</h1><p className="text-sm text-zinc-500 mt-1">برنامه را انتخاب کن، سپس هر بخش را بعد از انجام تیک بزن.</p>
 <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-4 px-3 py-3 rounded-xl border bg-white dark:bg-zinc-800" dir="ltr"/><p className="text-sm text-zinc-500 mt-2">{formatPersianDate(date)}</p>
 <div className="grid grid-cols-3 gap-2 mt-3"><div className="card"><span className="muted">انجام‌شده</span><b className="metric">{burn}</b><span>kcal</span></div><div className="card"><span className="muted">مدت برنامه</span><b className="metric">{duration}</b><span>دقیقه</span></div><div className="card"><span className="muted">وضعیت</span><b className="metric text-base">{daily.length?'فعال':'خالی'}</b></div></div>
 <div className="card mt-3"><b>پک‌های ورزشی پیشنهادی</b>{packs.map(p=><button key={p.id} onClick={()=>selectPack(p)} className="w-full text-right border-b last:border-0 py-3"><b>{p.name}</b><p className="text-xs text-zinc-500">{p.description}</p></button>)}</div>
 <div className="card mt-3"><b>تمرین امروز</b>{daily.length===0?<p className="muted mt-2">هنوز تمرینی انتخاب نشده.</p>:daily.map(d=>{const x=items.find(i=>i.id===d.workoutId);return x&&<div key={d.id} className="flex items-center gap-3 border-b last:border-0 py-3"><button onClick={()=>toggle(d)} className={`check ${d.completed?'check-on':''}`}>{d.completed?'✓':''}</button><div className="flex-1"><b className={d.completed?'line-through text-zinc-400':''}>{x.title}</b><p className="text-xs text-zinc-500">{x.durationMinutes} دقیقه · {x.caloriesBurned||0} kcal</p></div><button onClick={async()=>{await deleteItem('daily_workouts',d.id);load()}} className="text-zinc-400 text-xs">حذف</button></div>})}</div>
 <p className="text-[11px] text-zinc-400 mt-3">{metNote}{bmi?' شاخص توده بدنی صرفاً در صورت تکمیل قد و وزن نمایش داده می‌شود.':''}</p>
 <div className="flex gap-2 overflow-x-auto no-scrollbar my-5">{types.map(x=><button key={x} onClick={()=>setType(x)} className={`chip ${type===x?'chip-on':''}`}>{x}</button>)}</div>
 <div className="flex justify-between items-center mb-2"><h2 className="font-bold">{type}</h2><button onClick={()=>setShow(!show)} className="text-primary-600 text-sm">+ تمرین شخصی</button></div>
 <div className="space-y-2">{items.filter(x=>x.type===type).map(x=><div key={x.id} className="card flex items-center gap-3"><div className="flex-1"><b>{x.title}</b><p className="text-xs text-zinc-500">{x.durationMinutes} دقیقه · {x.caloriesBurned||0} kcal</p></div><button onClick={()=>choose(x)} className="text-primary-600 font-bold text-sm">انتخاب</button></div>)}</div>
 {show&&<div className="fixed inset-x-4 bottom-24 z-40 card shadow-2xl"><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="نام تمرین" className="field"/><div className="flex gap-2 mt-2"><input value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} placeholder="مدت دقیقه" className="field"/><input value={form.calories} onChange={e=>setForm({...form,calories:e.target.value})} placeholder="کالری تقریبی" className="field"/></div><button onClick={add} className="primary-btn mt-2">ذخیره</button></div>}</div>
}