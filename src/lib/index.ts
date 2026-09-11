import type {
  User, Profile, Task, Habit, HabitLog, Medication, MedicationLog,
  WaterLog, WeightLog, SleepLog, PeriodLog, JournalEntry, Goal, Appointment, NotificationSetting
} from '../types';

const DB_NAME = 'LifeOS_DB';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      const stores = [
        'users', 'profiles', 'tasks', 'habits', 'habit_logs',
        'medications', 'medication_logs', 'water_logs', 'weight_logs',
        'sleep_logs', 'period_logs', 'journal_entries', 'goals',
        'appointments', 'notification_settings', 'sessions'
      ];
      stores.forEach((name) => {
        if (!database.objectStoreNames.contains(name)) {
          const store = database.createObjectStore(name, { keyPath: 'id' });
          if (name !== 'users' && name !== 'sessions') {
            store.createIndex('userId', 'userId', { unique: false });
          }
          if (name === 'users') {
            store.createIndex('email', 'email', { unique: true });
          }
          if (['tasks', 'habit_logs', 'medication_logs', 'water_logs', 'weight_logs', 'sleep_logs', 'period_logs', 'journal_entries'].includes(name)) {
            store.createIndex('date', 'date', { unique: false });
            store.createIndex('userId_date', ['userId', 'date'], { unique: false });
          }
        }
      });
    };
  });
}

function getStore(storeName: string, mode: IDBTransactionMode = 'readonly') {
  if (!db) throw new Error('DB not initialized');
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

// Generic helpers
export async function putItem<T extends { id: string }>(storeName: string, item: T): Promise<T> {
  await initDB();
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const req = store.put(item);
    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
}

export async function getItem<T>(storeName: string, id: string): Promise<T | undefined> {
  await initDB();
  return new Promise((resolve, reject) => {
    const store = getStore(storeName);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteItem(storeName: string, id: string): Promise<void> {
  await initDB();
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllByUserId<T>(storeName: string, userId: string): Promise<T[]> {
  await initDB();
  return new Promise((resolve, reject) => {
    const store = getStore(storeName);
    const index = store.index('userId');
    const req = index.getAll(userId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getByUserAndDate<T>(storeName: string, userId: string, date: string): Promise<T[]> {
  await initDB();
  return new Promise((resolve, reject) => {
    const store = getStore(storeName);
    try {
      const index = store.index('userId_date');
      const req = index.getAll([userId, date]);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    } catch {
      // fallback
      getAllByUserId<T>(storeName, userId).then(items => {
        resolve((items as any[]).filter(i => i.date === date));
      }).catch(reject);
    }
  });
}

// Auth helpers
export async function findUserByEmail(email: string): Promise<User | undefined> {
  await initDB();
  return new Promise((resolve, reject) => {
    const store = getStore('users');
    const index = store.index('email');
    const req = index.get(email.toLowerCase());
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function createUser(user: User): Promise<User> {
  return putItem('users', user);
}

export async function setSession(userId: string, token: string): Promise<void> {
  await putItem('sessions', { id: 'current', userId, token, createdAt: new Date().toISOString() });
}

export async function getSession(): Promise<{ userId: string; token: string } | null> {
  const s = await getItem<{ id: string; userId: string; token: string }>('sessions', 'current');
  return s ? { userId: s.userId, token: s.token } : null;
}

export async function clearSession(): Promise<void> {
  await deleteItem('sessions', 'current');
}

// Simple hash for demo (NOT secure for production)
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h' + Math.abs(hash).toString(36);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// Sample data generator
export async function seedSampleData(userId: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const habits: Habit[] = [
    { id: generateId(), userId, title: 'نوشیدن آب', frequency: 'daily', reminderTime: '09:00', createdAt: new Date().toISOString(), archived: false },
    { id: generateId(), userId, title: 'ورزش صبحگاهی', frequency: 'weekdays', weekdays: [0,1,2,3,4], createdAt: new Date().toISOString(), archived: false },
    { id: generateId(), userId, title: 'مطالعه ۳۰ دقیقه', frequency: 'daily', createdAt: new Date().toISOString(), archived: false },
    { id: generateId(), userId, title: 'مراقبت پوست', frequency: 'daily', createdAt: new Date().toISOString(), archived: false },
  ];
  for (const h of habits) await putItem('habits', h);

  const tasks: Task[] = [
    { id: generateId(), userId, title: 'بررسی ایمیل‌ها', category: 'کار', date: today, startTime: '09:00', priority: 'medium', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), userId, title: 'ورزش هوازی', category: 'ورزش', date: today, startTime: '17:00', priority: 'high', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), userId, title: 'شام سالم', category: 'تغذیه', date: today, startTime: '20:00', priority: 'medium', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  for (const t of tasks) await putItem('tasks', t);

  // water sample
  await putItem('water_logs', { id: generateId(), userId, date: today, amount: 500, createdAt: new Date().toISOString() });
}
