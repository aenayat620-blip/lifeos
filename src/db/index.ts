import type { User } from '../types'
const DB_NAME='LifeOS_DB'; const DB_VERSION=3; let db:IDBDatabase|null=null
const stores=['users','profiles','task_templates','task_plans','habits','habit_logs','meal_templates','meal_plans','exercise_templates','workout_plans','medications','medication_logs','water_logs','weight_logs','sleep_logs','period_logs','journal_entries','goals','appointments','notification_settings','sessions']
export async function initDB(){
 if(db) return db;
 return new Promise<IDBDatabase>((resolve,reject)=>{
  const r=indexedDB.open(DB_NAME,DB_VERSION);
  r.onerror=()=>reject(r.error);
  r.onsuccess=()=>{db=r.result;resolve(db)};
  r.onupgradeneeded=e=>{
   const d=(e.target as IDBOpenDBRequest).result;
   stores.forEach(n=>{
    if(!d.objectStoreNames.contains(n)){
     const s=d.createObjectStore(n,{keyPath:'id'});
     if(!['users','sessions'].includes(n)) s.createIndex('userId','userId',{unique:false});
     if(n==='users') s.createIndex('email','email',{unique:true});
     if(['task_plans','meal_plans','workout_plans','habit_logs','medication_logs','water_logs','weight_logs','sleep_logs','period_logs','journal_entries'].includes(n)){
      s.createIndex('date','date',{unique:false});
      s.createIndex('userId_date',['userId','date'],{unique:false});
     }
    }
   });
  };
 });
}
function store(n:string,m:IDBTransactionMode='readonly'){if(!db) throw new Error('DB not initialized');return db.transaction(n,m).objectStore(n)}
export async function putItem<T extends {id:string}>(n:string,x:T){await initDB();return new Promise<T>((res,rej)=>{const r=store(n,'readwrite').put(x);r.onsuccess=()=>res(x);r.onerror=()=>rej(r.error)})}
export async function getItem<T>(n:string,id:string){await initDB();return new Promise<T|undefined>((res,rej)=>{const r=store(n).get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
export async function deleteItem(n:string,id:string){await initDB();return new Promise<void>((res,rej)=>{const r=store(n,'readwrite').delete(id);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}
export async function getAll<T>(n:string){await initDB();return new Promise<T[]>((res,rej)=>{const r=store(n).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)})}
export async function getAllByUserId<T>(n:string,userId:string){await initDB();return new Promise<T[]>((res,rej)=>{const r=store(n).index('userId').getAll(userId);r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)})}
export async function getByUserAndDate<T>(n:string,userId:string,date:string){await initDB();return new Promise<T[]>((res,rej)=>{const r=store(n).index('userId_date').getAll([userId,date]);r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)})}
export async function findUserByEmail(email:string){await initDB();return new Promise<User|undefined>((res,rej)=>{const r=store('users').index('email').get(email.toLowerCase());r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
export const simpleHash=(s:string)=>{let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0}return'h'+Math.abs(h).toString(36)}
export const generateId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,10)
export async function setSession(userId:string,token:string){return putItem('sessions',{id:'current',userId,token,createdAt:new Date().toISOString()})}
export async function getSession(){return getItem<{id:string;userId:string;token:string}>('sessions','current')}
export async function clearSession(){return deleteItem('sessions','current')}
