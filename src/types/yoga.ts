
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type SessionDuration = "short" | "medium" | "long" | number;

export interface YogaContextType {
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  experienceLevel: ExperienceLevel | null;
  sessionDuration: SessionDuration | null;
  practiceDays: WeekDay[];
  reminderTime: string | null;
  setExperienceLevel: (level: ExperienceLevel) => void;
  setSessionDuration: (duration: SessionDuration) => void;
  togglePracticeDay: (day: WeekDay) => void;
  setReminderTime: (time: string) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  completedDays: number[];
  totalPosesPracticed: number;
  totalPracticeTime: number;
  currentDay: number;
  isProfileLocked: boolean;
  completeDay: (day: number, poses: number, time: number) => Promise<void>;
  getCurrentDay: () => number;
  saveUserData: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  hasCompletedToday: boolean;
  streakCount: number;
}
