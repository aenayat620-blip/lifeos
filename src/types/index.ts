export type Category = 'سلامت'|'ورزش'|'تغذیه'|'مطالعه'|'کار'|'خانه'|'مراقبت شخصی'|'دارو'|'خواب'|'سایر'
export type MealCategory = 'صبحانه'|'میان‌وعده'|'ناهار'|'قبل از باشگاه'|'شام'
export type Priority = 'low'|'medium'|'high'
export interface User { id:string; email:string; name:string; passwordHash:string; createdAt:string; onboardingCompleted:boolean }
export interface Profile { userId:string; name:string; dateOfBirth?:string; height?:number; weight?:number; targetWeight?:number; units:'metric'|'imperial'; timezone:string; wakeTime?:string; sleepTime?:string; sex?:'male'|'female'|'other'; fitnessGoal?:string; activityLevel?:string; trainingDaysPerWeek?:number; dietaryRestrictions?:string[]; allergies?:string[]; lastPeriodStart?:string; cycleLength?:number; periodDuration?:number; glassMl?:number; waterTargetGlasses?:number; updatedAt:string }
export interface TaskTemplate { id:string; userId:string; title:string; category:Category; defaultStartTime?:string; defaultEndTime?:string; priority:Priority; notes?:string; reminderMinutes?:number; createdAt:string; archived?:boolean }
export interface TaskPlan { id:string; userId:string; templateId?:string; date:string; title:string; category:Category; startTime?:string; endTime?:string; priority:Priority; notes?:string; reminderMinutes?:number; completed:boolean; completedAt?:string; createdAt:string; updatedAt:string }
export interface Habit { id:string; userId:string; title:string; description?:string; frequency:'daily'|'weekdays'|'weekly'|'custom'; weekdays?:number[]; targetPerWeek?:number; reminderTime?:string; createdAt:string; archived:boolean }
export interface HabitLog { id:string; userId:string; habitId:string; date:string; completed:boolean; createdAt:string }
export interface MealTemplate { id:string; userId:string; category:MealCategory; title:string; description:string; ingredients:string[]; recipe?:string; calories?:number; protein?:number; prepMinutes?:number; createdAt:string; archived?:boolean }
export interface MealPlan { id:string; userId:string; date:string; category:MealCategory; templateId?:string; title:string; description?:string; calories?:number; protein?:number; completed:boolean; createdAt:string; updatedAt:string }
export interface ExerciseTemplate { id:string; userId:string; title:string; type:'وزنه'|'پیاده‌روی'|'دویدن'|'دوچرخه'|'کشش و موبیلیتی'|'یوگا'|'هوازی'|'سایر'; durationMinutes:number; details?:string; caloriesEstimate?:number; createdAt:string; archived?:boolean }
export interface WorkoutPlan { id:string; userId:string; date:string; templateId?:string; title:string; type:string; durationMinutes:number; details?:string; completed:boolean; notes?:string; createdAt:string; updatedAt:string }
export interface Medication { id:string; userId:string; name:string; dose:string; unit:string; form:string; frequency:string; days?:number[]; times:string[]; startDate:string; endDate?:string; withFood:boolean; instructions?:string; active:boolean; createdAt:string }
export interface MedicationLog { id:string; userId:string; medicationId:string; date:string; time:string; status:'taken'|'skipped'|'pending'; createdAt:string }
export interface WaterLog { id:string; userId:string; date:string; glasses:number; createdAt:string }
export interface WeightLog { id:string; userId:string; date:string; weight:number; notes?:string; createdAt:string }
export interface SleepLog { id:string; userId:string; date:string; bedtime:string; wakeTime:string; durationMinutes:number; quality:1|2|3|4|5; notes?:string; createdAt:string }
export interface PeriodLog { id:string; userId:string; startDate:string; endDate?:string; flow?:'light'|'medium'|'heavy'; symptoms?:string[]; notes?:string; createdAt:string }
export interface JournalEntry { id:string; userId:string; date:string; mood?:number; wins?:string; problems?:string; lessons?:string; tomorrowPriorities?:string; content?:string; createdAt:string; updatedAt:string }
export interface Goal { id:string; userId:string; title:string; description?:string; type:string; target?:string; deadline?:string; progress:number; milestones?:{title:string;done:boolean}[]; createdAt:string; updatedAt:string }
export interface Appointment { id:string; userId:string; title:string; date:string; time:string; location?:string; notes?:string; reminderMinutes?:number; repeat?:string; createdAt:string }
export interface NotificationSetting { id:string; userId:string; enabled:boolean; medication:boolean; habits:boolean; water:boolean; sleep:boolean; appointments:boolean; workouts:boolean; quietStart?:string; quietEnd?:string }
export type Page='home'|'planner'|'habits'|'nutrition'|'fitness'|'health'|'medications'|'water'|'weight'|'cycle'|'sleep'|'journal'|'goals'|'appointments'|'settings'|'more'
