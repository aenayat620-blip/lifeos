export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // simple for demo - use proper hashing in production
  createdAt: string;
  onboardingCompleted: boolean;
}

export interface Profile {
  userId: string;
  name: string;
  dateOfBirth?: string;
  height?: number; // cm
  weight?: number; // kg
  targetWeight?: number;
  units: 'metric' | 'imperial';
  timezone: string;
  wakeTime?: string;
  sleepTime?: string;
  sex?: 'male' | 'female' | 'other';
  fitnessGoal?: string;
  activityLevel?: string;
  trainingDaysPerWeek?: number;
  dietaryRestrictions?: string[];
  allergies?: string[];
  medications?: string;
  medicalConditions?: string;
  emergencyContact?: string;
  lastPeriodStart?: string;
  cycleLength?: number;
  periodDuration?: number;
  cycleRegular?: boolean;
  workSchedule?: string;
  preferredReminderTimes?: string[];
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  category: TaskCategory;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  recurrence?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  completed: boolean;
  completedAt?: string;
  reminder?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskCategory =
  | 'سلامت'
  | 'ورزش'
  | 'تغذیه'
  | 'مطالعه'
  | 'کار'
  | 'خانه'
  | 'مراقبت شخصی'
  | 'دارو'
  | 'خواب'
  | 'سایر';

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekdays' | 'weekly' | 'custom';
  weekdays?: number[]; // 0-6
  targetPerWeek?: number;
  targetPerMonth?: number;
  reminderTime?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  archived: boolean;
}

export interface HabitLog {
  id: string;
  userId: string;
  habitId: string;
  date: string;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dose: string;
  unit: string;
  form: string; // قرص، شربت، etc.
  frequency: string;
  days?: number[];
  times: string[]; // HH:mm
  startDate: string;
  endDate?: string;
  withFood: boolean;
  instructions?: string;
  notes?: string;
  doctor?: string;
  active: boolean;
  createdAt: string;
}

export interface MedicationLog {
  id: string;
  userId: string;
  medicationId: string;
  date: string;
  time: string;
  status: 'taken' | 'skipped' | 'snoozed' | 'pending';
  notes?: string;
  createdAt: string;
}

export interface WaterLog {
  id: string;
  userId: string;
  date: string;
  amount: number; // glasses
  slot?: number;
  createdAt: string;
}

export interface WeightLog {
  id: string;
  userId: string;
  date: string;
  weight: number;
  notes?: string;
  createdAt: string;
}

export interface SleepLog {
  id: string;
  userId: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  durationMinutes: number;
  quality: 1 | 2 | 3 | 4 | 5;
  awakenings?: number;
  notes?: string;
  createdAt: string;
}

export interface PeriodLog {
  id: string;
  userId: string;
  startDate: string;
  endDate?: string;
  flow?: 'light' | 'medium' | 'heavy';
  symptoms?: string[];
  notes?: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  mood?: number;
  wins?: string;
  problems?: string;
  lessons?: string;
  tomorrowPriorities?: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: string;
  target?: string;
  deadline?: string;
  progress: number;
  milestones?: { title: string; done: boolean }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  reminder?: string;
  repeat?: string;
  createdAt: string;
}

export interface NotificationSetting {
  userId: string;
  enabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  medication: boolean;
  habits: boolean;
  water: boolean;
  sleep: boolean;
  appointments: boolean;
  workouts: boolean;
}

export type Page =
  | 'home'
  | 'today'
  | 'calendar'
  | 'health'
  | 'fitness'
  | 'nutrition'
  | 'more'
  | 'login'
  | 'signup'
  | 'onboarding'
  | 'settings'
  | 'profile'
  | 'medications'
  | 'habits'
  | 'water'
  | 'sleep'
  | 'cycle'
  | 'journal'
  | 'goals'
  | 'analytics'
  | 'appointments'
  | 'library';

export interface TaskTemplate { id:string; userId:string; title:string; category:TaskCategory; startTime?:string; endTime?:string; priority:Task['priority']; notes?:string; reminder?:string; createdAt:string; }
export interface MealTemplate { id:string; userId:string; title:string; category:'صبحانه'|'میان‌وعده'|'ناهار'|'قبل باشگاه'|'شام'; ingredients:string[]; instructions:string; calories?:number; protein?:number; prepMinutes?:number; createdAt:string; }
export interface WorkoutTemplate { id:string; userId:string; title:string; type:'وزنه'|'پیاده‌روی'|'دویدن'|'دوچرخه'|'کشش'|'یوگا'|'هوازی'|'سایر'; durationMinutes:number; caloriesBurned?:number; notes?:string; createdAt:string; }
export interface DailyMeal { id:string; userId:string; date:string; mealId:string; category:MealTemplate['category']; completed:boolean; createdAt:string; }
export interface DailyWorkout { id:string; userId:string; date:string; workoutId:string; completed:boolean; caloriesBurned?:number; createdAt:string; }
