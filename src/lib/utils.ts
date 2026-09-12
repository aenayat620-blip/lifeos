export const pad=(n:number)=>String(n).padStart(2,'0')
export const todayISO=()=>{const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
export const addDays=(iso:string,n:number)=>{const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
export const formatDate=(iso:string)=>new Intl.DateTimeFormat('fa-IR',{weekday:'long',year:'numeric',month:'long',day:'numeric'}).format(new Date(iso+'T12:00:00'))
export const shortDate=(iso:string)=>new Intl.DateTimeFormat('fa-IR',{month:'short',day:'numeric'}).format(new Date(iso+'T12:00:00'))
export const percent=(v:number,t:number)=>t?Math.min(100,Math.round(v/t*100)):0
export const getGreeting=()=>{const h=new Date().getHours();return h<5?'شب بخیر':h<12?'صبح بخیر':h<17?'ظهر بخیر':h<21?'عصر بخیر':'شب بخیر'}
