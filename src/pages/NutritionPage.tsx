import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../store/AuthContext'
import { getAllByUserId, getByUserAndDate, putItem, deleteItem, generateId } from '../db'
import type { DailyMeal, MealTemplate } from '../types'
import { toYYYYMMDD, formatPersianDate } from '../lib/utils'

type MealCategory = MealTemplate['category']
type Pack = { id:string; name:string; description:string; breakfast:string; snack:string; lunch:string; pre?:string; dinner:string; gym:boolean }

const breakfast = [
 ['صبحانه ۱ · تخم‌مرغ آبپز','۲ تخم‌مرغ + ۶۰ گرم نان سنگک + ۱۵۰ گرم گوجه',330,20],
 ['صبحانه ۲ · اوتمیل موز و چیا','۴۰ گرم جو دوسر خشک + ۲۰۰ میلی‌لیتر شیر کم‌چرب + ۸۰ گرم موز + ۱۰ گرم چیا + ۱۰ گرم گردو + دارچین',370,14],
 ['صبحانه ۳ · پنیر و سبزی','۶۰ گرم سنگک + ۳۰ گرم پنیر کم‌چرب + ۱۵۰ گرم گوجه + ۱۵۰ گرم خیار + ۵ زیتون',320,13],
 ['صبحانه ۴ · اوتمیل سیب و گردو','۴۰ گرم جو دوسر + ۲۰۰ میلی‌لیتر شیر کم‌چرب + ۱۰۰ گرم سیب + ۱۰ گرم گردو + ۱۰ گرم چیا + دارچین',350,13],
 ['صبحانه ۵ · تخم‌مرغ، پنیر و شوید','۲ تخم‌مرغ + ۲۵ گرم پنیر کم‌چرب + ۱۵–۲۰ گرم شوید + ۵۰ گرم سنگک + ۲۵۰ گرم گوجه/خیار',335,20],
 ['صبحانه ۶ · حلواارده و عسل','۵۰ گرم سنگک + ۲۰ گرم حلواارده + ۵ گرم عسل + ۲۰۰ میلی‌لیتر شیر کم‌چرب + ۱۵۰ گرم گوجه/خیار',390,13],
 ['صبحانه ۷ · املت سبزیجات','۲ تخم‌مرغ + ۱۰۰ گرم قارچ + ۱۵۰ گرم گوجه + ۵۰ گرم فلفل دلمه‌ای + ۵۰ گرم سنگک',330,21],
] as const

const lunches = [
 ['ناهار ۱ · قورمه‌سبزی','۱۵۰ گرم برنج پخته + ۲۰۰ گرم خورش + حدود ۸۰ گرم گوشت کم‌چرب + سالاد',560,32],
 ['ناهار ۲ · قیمه','۱۵۰ گرم برنج پخته + ۲۰۰ گرم خورش + ۷۰–۸۰ گرم گوشت کم‌چرب + سالاد',570,31],
 ['ناهار ۳ · مرغ، آلو و هویج','۱۵۰ گرم برنج پخته + ۱۲۰ گرم مرغ + ۲ عدد آلو + ۸۰ گرم هویج',520,39],
 ['ناهار ۴ · خورش بامیه','۱۵۰ گرم برنج پخته + ۲۰۰ گرم خورش + ۸۰ گرم گوشت کم‌چرب + سالاد',560,31],
 ['ناهار ۵ · استیک مرغ و سبزیجات','۱۵۰ گرم مرغ + ۱۲۰ گرم برنج پخته + ۸۰ گرم هویج + ۱۰۰ گرم قارچ + ۱۰۰ گرم بروکلی',500,49],
 ['ناهار ۶ · کباب تابه‌ای','۱۲۰ گرم گوشت کم‌چرب + ۱۵۰ گرم برنج پخته + ۱۵۰–۲۰۰ گرم گوجه کبابی + سبزی خوردن',560,34],
 ['ناهار ۷ · سبزی‌پلو با ماهی','۱۸۰ گرم سبزی‌پلو + ۱۵۰ گرم ماهی پخته + سالاد',540,39],
 ['ناهار ۸ · ماش‌پلو و گوشت آبگوشتی','۱۸۰ گرم ماش‌پلو پخته + ۱۰۰ گرم گوشت کم‌چرب آبگوشتی + سالاد',560,36],
 ['ناهار ۹ · عدس‌پلو، کوفته و کشمش','۱۸۰ گرم عدس‌پلو + ۱۰۰ گرم گوشت/کوفته کم‌چرب + ۱۰ گرم کشمش + سالاد',570,35],
 ['ناهار ۱۰ · لوبیاپلو','۲۰۰ گرم لوبیاپلو پخته + ۸۰–۱۰۰ گرم گوشت + سالاد',570,34],
 ['ناهار ۱۱ · ماکارونی','۲۰۰ گرم ماکارونی پخته + ۸۰–۱۰۰ گرم گوشت چرخ‌کرده کم‌چرب + ۱۰۰ گرم قارچ یا فلفل دلمه‌ای + سالاد',560,32],
 ['ناهار ۱۲ · کدو، بادمجان و گوشت با نان','۱۵۰ گرم کدو + ۱۰۰ گرم بادمجان + ۲۰۰ گرم گوجه + ۱۰۰ گرم گوشت چرخ‌کرده کم‌چرب + ۶۰ گرم سنگک',560,36],
 ['ناهار ۱۳ · مرغ چرخ‌کرده با گوجه و خیارشور','۱۵۰ گرم مرغ چرخ‌کرده + ۲۰۰ گرم گوجه + ۳۰ گرم خیارشور + ۶۰ گرم سنگک + سبزیجات',470,40],
 ['ناهار ۱۴ · آبگوشت با نان','۱۰۰ گرم گوشت پخته + ۱۰۰ گرم نخود/لوبیا پخته + ۱۰۰ گرم سیب‌زمینی + ۶۰ گرم سنگک + سبزی',580,35],
] as const

const dinners = [
 ['شام ۱ · تخم‌مرغ و نان','۲ تخم‌مرغ آبپز + ۵۰ گرم سنگک + ۲۰۰ گرم گوجه + ۱۰۰ گرم خیار',330,20],
 ['شام ۲ · عدسی','۲۰۰ گرم عدسی پخته + ۴۰–۵۰ گرم نان + سبزیجات',390,19],
 ['شام ۳ · عدسی با قارچ','۱۸۰ گرم عدسی + ۱۰۰ گرم قارچ + ۱ تخم‌مرغ + ۴۰–۵۰ گرم نان + سبزیجات',390,24],
 ['شام ۴ · خوراک لوبیا','۲۰۰ گرم لوبیا پخته + ۱ تخم‌مرغ + ۴۰–۵۰ گرم نان + گوجه/سبزیجات',430,23],
 ['شام ۵ · لوبیا با قارچ','۱۸۰ گرم لوبیا + ۱۰۰ گرم قارچ + ۱ تخم‌مرغ + ۴۰–۵۰ گرم نان + سبزیجات',420,27],
 ['شام ۶ · سوپ جو و مرغ','۳۵۰–۴۰۰ گرم سوپ جو با هویج و جعفری + ۱۰۰ گرم مرغ ریش‌ریش پخته + ۳۰ گرم نان',400,38],
] as const

const fruitOptions = ['سیب ۱ عدد متوسط (~۱۵۰ گرم)','پرتقال ۱ عدد متوسط (~۱۸۰ گرم)','کیوی ۲ عدد (~۱۵۰ گرم)','موز کوچک ۱ عدد (~۸۰ گرم)','هلو ۲ عدد کوچک (~۱۵۰ گرم)','توت‌فرنگی ۲۰۰ گرم','انگور ۱۰۰ گرم','خرمالو ۱ عدد کوچک (~۱۲۰ گرم)']

const packData: Pack[] = [
 {id:'p1',name:'پک ۱ · قورمه‌سبزی',description:'تخم‌مرغ + میوه + قورمه‌سبزی + شام عدسی با قارچ',breakfast:breakfast[0][0],snack:'میان‌وعده · یک واحد میوه',lunch:lunches[0][0],pre:'قبل باشگاه · ۶ بادام خام + ۱ فنجان قهوه ترک بدون شکر',dinner:dinners[2][0],gym:true},
 {id:'p2',name:'پک ۲ · ناهار کدو و بادمجان',description:'اوتمیل موز + ناهار نانی + شام تخم‌مرغ',breakfast:breakfast[1][0],snack:'میان‌وعده · یک واحد میوه',lunch:lunches[11][0],pre:'قبل باشگاه · ۶ بادام خام + ۱ فنجان قهوه ترک بدون شکر',dinner:dinners[0][0],gym:true},
 {id:'p3',name:'پک ۳ · قیمه',description:'پنیر و سبزی + قیمه + عدسی با قارچ',breakfast:breakfast[2][0],snack:'میان‌وعده · یک واحد میوه',lunch:lunches[1][0],pre:'قبل باشگاه · ۶ بادام خام + ۱ فنجان قهوه ترک بدون شکر',dinner:dinners[2][0],gym:true},
 {id:'p4',name:'پک ۴ · مرغ چرخ‌کرده',description:'اوتمیل سیب + ناهار مرغ نانی + لوبیا',breakfast:breakfast[3][0],snack:'میان‌وعده · یک واحد میوه',lunch:lunches[12][0],pre:'قبل باشگاه · ۶ بادام خام + ۱ فنجان قهوه ترک بدون شکر',dinner:dinners[3][0],gym:true},
 {id:'p5',name:'پک ۵ · مرغ و آلو',description:'تخم‌مرغ و پنیر + مرغ و آلو + لوبیا با قارچ',breakfast:breakfast[4][0],snack:'میان‌وعده · یک واحد میوه',lunch:lunches[2][0],pre:'قبل باشگاه · ۶ بادام خام + ۱ فنجان قهوه ترک بدون شکر',dinner:dinners[4][0],gym:true},
 {id:'p6',name:'پک ۶ · بامیه',description:'حلواارده کنترل‌شده + بامیه + شام عدسی',breakfast:breakfast[5][0],snack:'میان‌وعده · یک واحد میوه',lunch:lunches[3][0],dinner:dinners[1][0],gym:false},
 {id:'p7',name:'پک ۷ · سبزی‌پلو ماهی',description:'املت سبزیجات + ماهی + شام سبک',breakfast:breakfast[6][0],snack:'میان‌وعده · یک واحد میوه',lunch:lunches[6][0],dinner:dinners[0][0],gym:false},
 {id:'p8',name:'پک ۸ · استیک مرغ',description:'اوتمیل موز + استیک مرغ و سبزیجات + عدسی',breakfast:breakfast[1][0],snack:'میان‌وعده · یک واحد میوه',lunch:lunches[4][0],pre:'قبل باشگاه · ۶ بادام خام + ۱ فنجان قهوه ترک بدون شکر',dinner:dinners[2][0],gym:true},
 {id:'p9',name:'پک ۹ · کباب تابه‌ای',description:'پنیر و سبزی + کباب تابه‌ای + لوبیا',breakfast:breakfast[2][0],snack:'میان‌وعده · یک واحد میوه',lunch:lunches[5][0],pre:'قبل باشگاه · ۶ بادام خام + ۱ فنجان قهوه ترک بدون شکر',dinner:dinners[3][0],gym:true},
 {id:'p10',name:'پک ۱۰ · ماش‌پلو',description:'اوتمیل سیب + ماش‌پلو + لوبیا با قارچ',breakfast:breakfast[3][0],snack:'میان‌وعده · یک واحد میوه',lunch:lunches[7][0],pre:'قبل باشگاه · ۶ بادام خام + ۱ فنجان قهوه ترک بدون شکر',dinner:dinners[4][0],gym:true},
 {id:'p11',name:'پک ۱۱ · عدس‌پلو',description:'تخم‌مرغ و پنیر + عدس‌پلو + سوپ جو و مرغ',breakfast:breakfast[4][0],snack:'میان‌وعده · یک واحد میوه',lunch:lunches[8][0],pre:'قبل باشگاه · ۶ بادام خام + ۱ فنجان قهوه ترک بدون شکر',dinner:dinners[5][0],gym:true},
 {id:'p12',name:'پک ۱۲ · لوبیاپلو',description:'حلواارده + لوبیاپلو + عدسی',breakfast:breakfast[5][0],snack:'میان‌وعده · یک واحد میوه',lunch:lunches[9][0],dinner:dinners[1][0],gym:false},
 {id:'p13',name:'پک ۱۳ · ماکارونی',description:'املت + ماکارونی + تخم‌مرغ و نان',breakfast:breakfast[6][0],snack:'میان‌وعده · یک واحد میوه',lunch:lunches[10][0],pre:'قبل باشگاه · ۶ بادام خام + ۱ فنجان قهوه ترک بدون شکر',dinner:dinners[0][0],gym:true},
 {id:'p14',name:'پک ۱۴ · آبگوشت',description:'تخم‌مرغ + آبگوشت + شام سوپ جو و مرغ',breakfast:breakfast[0][0],snack:'میان‌وعده · یک واحد میوه',lunch:lunches[13][0],dinner:dinners[5][0],gym:false},
]

function rowToMeal(x: readonly [string,string,number,number], category:MealCategory): Omit<MealTemplate,'id'|'userId'|'createdAt'> {
 return {category,title:x[0],ingredients:[x[1]],instructions:'مقدارها تقریبی‌اند؛ با روغن کم تهیه شود.',calories:x[2],protein:x[3],prepMinutes:15}
}
const defaultMeals = [
 ...breakfast.map(x=>rowToMeal(x,'صبحانه')),
 ...lunches.map(x=>rowToMeal(x,'ناهار')),
 ...dinners.map(x=>rowToMeal(x,'شام')),
 {category:'میان‌وعده' as const,title:'میان‌وعده · یک واحد میوه',ingredients:fruitOptions,instructions:'هر روز فقط یک واحد میوه از فهرست انتخاب شود.',calories:80,protein:1,prepMinutes:0},
 {category:'قبل باشگاه' as const,title:'قبل باشگاه · ۶ بادام خام + ۱ فنجان قهوه ترک بدون شکر',ingredients:['۶ عدد بادام خام','۱ فنجان قهوه ترک بدون شکر'],instructions:'حدود ۶۰–۹۰ دقیقه قبل تمرین. اگر انرژی کافی نبود، ۱ خرما یا نصف موز اضافه شود.',calories:45,protein:2,prepMinutes:2},
]

export default function NutritionPage() {
 const {user}=useAuth()
 const [items,setItems]=useState<MealTemplate[]>([])
 const [daily,setDaily]=useState<DailyMeal[]>([])
 const [date,setDate]=useState(()=>localStorage.getItem('lifeos-planner-date')||toYYYYMMDD())
 const [cat,setCat]=useState<MealCategory>('صبحانه')
 const [show,setShow]=useState(false)
 const [showPacks,setShowPacks]=useState(true)
 const [selectedFruit,setSelectedFruit]=useState('')
 const [customPacks,setCustomPacks]=useState<Pack[]>([])
 const [showPackForm,setShowPackForm]=useState(false)
 const [packForm,setPackForm]=useState({name:'',breakfast:'',snack:'میان‌وعده · یک واحد میوه',lunch:'',pre:'قبل باشگاه · ۶ بادام خام + ۱ فنجان قهوه ترک بدون شکر',dinner:'',gym:true})
 const [form,setForm]=useState({title:'',calories:'',protein:''})
 const load=async()=>{if(!user)return;const[a,b]=await Promise.all([getAllByUserId<MealTemplate>('meal_templates',user.id),getByUserAndDate<DailyMeal>('daily_meals',user.id,date)]);setItems(a);setDaily(b)}
 useEffect(()=>{load()},[user,date])
 useEffect(()=>{if(user){try{setCustomPacks(JSON.parse(localStorage.getItem(`lifeos-custom-packs-${user.id}`)||'[]'))}catch{setCustomPacks([])}}},[user])
 useEffect(()=>{(async()=>{if(!user)return;const all=await getAllByUserId<MealTemplate>('meal_templates',user.id);for(const m of defaultMeals)if(!all.some(x=>x.title===m.title&&x.category===m.category))await putItem('meal_templates',{...m,id:generateId(),userId:user.id,createdAt:new Date().toISOString()});load()})()},[user])
 const choose=async(m:MealTemplate)=>{if(!user)return;const same=daily.find(x=>x.category===m.category);if(same)await deleteItem('daily_meals',same.id);await putItem('daily_meals',{id:generateId(),userId:user.id,date,mealId:m.id,category:m.category,completed:false,createdAt:new Date().toISOString()});load()}
 const toggle=async(x:DailyMeal)=>{await putItem('daily_meals',{...x,completed:!x.completed});load()}
 const selectPack=async(p:Pack)=>{if(!user)return;const existing=await getByUserAndDate<DailyMeal>('daily_meals',user.id,date);for(const x of existing)await deleteItem('daily_meals',x.id);const names=[p.breakfast,p.snack,p.lunch,p.pre,p.dinner].filter(Boolean) as string[];for(const name of names){const m=items.find(x=>x.title===name);if(m)await putItem('daily_meals',{id:generateId(),userId:user.id,date,mealId:m.id,category:m.category,completed:false,createdAt:new Date().toISOString()})}load()}
 const add=async()=>{if(!user||!form.title.trim())return;await putItem('meal_templates',{id:generateId(),userId:user.id,title:form.title.trim(),category:cat,ingredients:[],instructions:'وعده سفارشی',calories:Number(form.calories)||0,protein:Number(form.protein)||0,createdAt:new Date().toISOString()});setForm({title:'',calories:'',protein:''});setShow(false);load()}
 const savePack=()=>{if(!user||!packForm.name.trim())return;const pack:Pack={id:`custom-${generateId()}`,name:packForm.name.trim(),description:`${packForm.breakfast||'صبحانه'} + ${packForm.lunch||'ناهار'} + ${packForm.dinner||'شام'}`,breakfast:packForm.breakfast,snack:packForm.snack,lunch:packForm.lunch,pre:packForm.gym?packForm.pre:undefined,dinner:packForm.dinner,gym:packForm.gym};const next=[...customPacks,pack];setCustomPacks(next);localStorage.setItem(`lifeos-custom-packs-${user.id}`,JSON.stringify(next));setPackForm({name:'',breakfast:'',snack:'میان‌وعده · یک واحد میوه',lunch:'',pre:'قبل باشگاه · ۶ بادام خام + ۱ فنجان قهوه ترک بدون شکر',dinner:'',gym:true});setShowPackForm(false)}
 const selected=useMemo(()=>daily.map(x=>items.find(m=>m.id===x.mealId)).filter(Boolean) as MealTemplate[],[daily,items])
 const kcal=selected.reduce((s,m)=>s+(m.calories||0),0), protein=selected.reduce((s,m)=>s+(m.protein||0),0)
 const remove=async(id:string)=>{if(confirm('این وعده از کتابخانه حذف شود؟')){await deleteItem('meal_templates',id);load()}}
 return <div className="p-4 pt-safe max-w-4xl mx-auto pb-24">
  <h1 className="text-2xl font-black">تغذیه</h1><p className="text-sm text-zinc-500 mt-1">برنامه روز را انتخاب کن؛ هر وعده را بعداً می‌توانی جداگانه عوض کنی.</p>
  <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-4 px-3 py-3 rounded-xl border bg-white dark:bg-zinc-800" dir="ltr"/>
  <div className="grid grid-cols-2 gap-2 mt-3"><div className="card"><span className="muted">کالری برنامه</span><b className="metric">{kcal}</b><span>kcal</span></div><div className="card"><span className="muted">پروتئین</span><b className="metric">{protein}</b><span>گرم</span></div></div>
  <div className="card mt-3"><b>میان‌وعده صبح</b><p className="text-sm text-zinc-500 mt-1">یک واحد میوه؛ فقط یکی را انتخاب کن:</p><div className="flex flex-wrap gap-2 mt-2">{fruitOptions.map(f=><button key={f} onClick={()=>setSelectedFruit(f)} className={`chip ${selectedFruit===f?'chip-on':''}`}>{f.split(' ')[0]}</button>)}</div>{selectedFruit&&<p className="text-xs text-primary-700 mt-2">انتخاب امروز: {selectedFruit}</p>}</div>
  <div className="flex gap-2 mt-3"><button onClick={()=>setShowPacks(!showPacks)} className="section-button flex-1">{showPacks?'−':'+'} پک‌های پیشنهادی · ۱۴ پک کامل</button><button onClick={()=>setShowPackForm(!showPackForm)} className="px-4 rounded-xl bg-primary-600 text-white font-bold">＋ پک</button></div>
  {showPackForm&&<div className="card mt-2 space-y-2"><input value={packForm.name} onChange={e=>setPackForm({...packForm,name:e.target.value})} placeholder="نام پک شخصی" className="field"/><select value={packForm.breakfast} onChange={e=>setPackForm({...packForm,breakfast:e.target.value})} className="field"><option value="">صبحانه</option>{items.filter(x=>x.category==='صبحانه').map(x=><option key={x.id} value={x.title}>{x.title}</option>)}</select><select value={packForm.lunch} onChange={e=>setPackForm({...packForm,lunch:e.target.value})} className="field"><option value="">ناهار</option>{items.filter(x=>x.category==='ناهار').map(x=><option key={x.id} value={x.title}>{x.title}</option>)}</select><select value={packForm.dinner} onChange={e=>setPackForm({...packForm,dinner:e.target.value})} className="field"><option value="">شام</option>{items.filter(x=>x.category==='شام').map(x=><option key={x.id} value={x.title}>{x.title}</option>)}</select><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={packForm.gym} onChange={e=>setPackForm({...packForm,gym:e.target.checked})}/> روز تمرین</label><button onClick={savePack} className="primary-btn">ذخیره پک شخصی</button></div>}{showPacks&&<div className="grid md:grid-cols-2 gap-2 mt-2">{[...packData,...customPacks].map(p=><button key={p.id} onClick={()=>selectPack(p)} className="card text-right hover:ring-2 hover:ring-primary-200"><b>{p.name}</b><p className="text-xs text-zinc-500 mt-1">{p.description}</p><span className="text-[11px] text-primary-600 mt-2 block">{p.gym?'روز تمرین':'روز استراحت'} · انتخاب پک</span></button>)}</div>}
  <div className="card mt-3"><div className="flex justify-between items-center"><b>وعده‌های این روز</b><span className="text-xs text-zinc-400">هر کدام جداگانه قابل تغییر است</span></div>{daily.length===0&&<p className="muted mt-3">هنوز وعده‌ای انتخاب نشده.</p>}{daily.map(x=>{const m=items.find(i=>i.id===x.mealId);return m&&<div key={x.id} className="flex items-center gap-3 border-b last:border-0 py-3"><button onClick={()=>toggle(x)} className={`check ${x.completed?'check-on':''}`}>{x.completed?'✓':''}</button><div className="flex-1"><b className={x.completed?'line-through text-zinc-400':''}>{m.title}</b><p className="text-xs text-zinc-500">{m.ingredients[0]} · {m.calories||0} kcal · {m.protein||0}g</p></div><button onClick={()=>setCat(m.category)} className="text-primary-600 text-xs">تغییر</button></div>})}</div>
  <div className="flex gap-2 overflow-x-auto no-scrollbar my-5">{(['صبحانه','میان‌وعده','ناهار','قبل باشگاه','شام'] as MealCategory[]).map(x=><button key={x} onClick={()=>setCat(x)} className={`chip ${cat===x?'chip-on':''}`}>{x}</button>)}</div>
  <div className="flex justify-between items-center mb-2"><h2 className="font-bold">{cat}</h2><button onClick={()=>setShow(!show)} className="text-primary-600 text-sm">+ مورد شخصی</button></div>
  {cat==='میان‌وعده'&&<div className="card mb-2 text-sm"><b>قاعده میان‌وعده:</b> روزانه یک واحد میوه؛ گزینه‌های دیگر فقط در صورت نیاز و با تنظیم کالری روز.</div>}
  <div className="space-y-2">{items.filter(x=>x.category===cat).map(m=><div key={m.id} className="card flex items-center gap-3"><div className="flex-1"><b>{m.title}</b><p className="text-xs text-zinc-500 mt-1">{m.ingredients.join(' · ')} · {m.calories||0} kcal · {m.protein||0}g</p></div><button onClick={()=>choose(m)} className="text-primary-600 text-sm font-bold">انتخاب</button>{m.title.startsWith('صبحانه')===false&&m.title.startsWith('ناهار')===false&&m.title.startsWith('شام')===false&&<button onClick={()=>remove(m.id)} className="text-zinc-400 text-xs">حذف</button>}</div>)}</div>
  {show&&<div className="fixed inset-x-4 bottom-24 z-40 card shadow-2xl"><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="نام مورد" className="field"/><div className="flex gap-2 mt-2"><input value={form.calories} onChange={e=>setForm({...form,calories:e.target.value})} placeholder="کالری" className="field"/><input value={form.protein} onChange={e=>setForm({...form,protein:e.target.value})} placeholder="پروتئین (گرم)" className="field"/></div><button onClick={add} className="primary-btn mt-2">ذخیره</button></div>}
 </div>
}
