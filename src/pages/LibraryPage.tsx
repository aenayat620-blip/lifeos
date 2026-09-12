import { useEffect, useState } from 'react'
import { useAuth } from '../store/AuthContext'
import { deleteItem, generateId, getAllByUserId, putItem } from '../db'
import type { TaskTemplate, TaskCategory } from '../types'

const cats:TaskCategory[]=['سلامت','ورزش','تغذیه','مطالعه','کار','خانه','مراقبت شخصی','دارو','خواب','سایر']
export default function LibraryPage(){
 const {user}=useAuth(); const [items,setItems]=useState<TaskTemplate[]>([]); const [title,setTitle]=useState(''); const [category,setCategory]=useState<TaskCategory>('کار'); const [time,setTime]=useState('');
 const load=async()=>user&&setItems(await getAllByUserId<TaskTemplate>('task_templates',user.id)); useEffect(()=>{load()},[user])
 const add=async()=>{if(!user||!title.trim())return; await putItem('task_templates',{id:generateId(),userId:user.id,title:title.trim(),category,startTime:time||undefined,priority:'medium',createdAt:new Date().toISOString()});setTitle('');setTime('');load()}
 return <div className="p-4 pt-safe"><h1 className="text-xl font-bold mb-2">کتابخانه کارها</h1><p className="text-sm text-zinc-500 mb-4">هر کار را یک بار ذخیره کن و در هر تاریخ دوباره انتخابش کن.</p><div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 space-y-3 mb-4"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="مثلاً مطالعه انگلیسی" className="w-full px-3 py-2 rounded-xl border"/><select value={category} onChange={e=>setCategory(e.target.value as TaskCategory)} className="w-full px-3 py-2 rounded-xl border">{cats.map(c=><option key={c}>{c}</option>)}</select><input type="time" value={time} onChange={e=>setTime(e.target.value)} className="w-full px-3 py-2 rounded-xl border"/><button onClick={add} className="w-full py-2 rounded-xl bg-primary-600 text-white">افزودن به کتابخانه</button></div><div className="space-y-2">{items.map(x=><div key={x.id} className="bg-white dark:bg-zinc-800 p-4 rounded-2xl flex items-center gap-3"><div className="flex-1"><b>{x.title}</b><div className="text-xs text-zinc-500 mt-1">{x.category}{x.startTime&&` · ${x.startTime}`}</div></div><button onClick={async()=>{await deleteItem('task_templates',x.id);load()}} className="text-red-500 text-xs">حذف</button></div>)}{!items.length&&<p className="text-center text-zinc-400 py-8">کتابخانه خالی است.</p>}</div></div>
}
