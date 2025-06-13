import { toast } from '@/components/ui/sonner';
import { saveUserDetails, UserDetails } from '../lib/supabase';
import { ExperienceLevel, SessionDuration, WeekDay } from '../types/yoga';

interface UseYogaActionsProps {
  userEmail: string | null;
  experienceLevel: ExperienceLevel | null;
  sessionDuration: SessionDuration | null;
  practiceDays: WeekDay[];
  reminderTime: string | null;
  isProfileLocked: boolean;
  setExperienceLevel: (level: ExperienceLevel) => void;
  setSessionDuration: (duration: SessionDuration) => void;
  setPracticeDays: (days: WeekDay[]) => void;
  setReminderTime: (time: string) => void;
  setIsLoading: (loading: boolean) => void;
  setIsProfileLocked: (locked: boolean) => void;
  loadUserData: (email: string) => Promise<void>;
  resetUserData: () => void;
}

export const useYogaActions = ({
  userEmail,
  experienceLevel,
  sessionDuration,
  practiceDays,
  reminderTime,
  isProfileLocked,
  setExperienceLevel,
  setSessionDuration,
  setPracticeDays,
  setReminderTime,
  setIsLoading,
  setIsProfileLocked,
  loadUserData,
  resetUserData
}: UseYogaActionsProps) => {

  const togglePracticeDay = (day: WeekDay) => {
    if (isProfileLocked) {
      toast.error('Your preferences are locked and cannot be changed');
      return;
    }
    const newPracticeDays = practiceDays.includes(day) 
      ? practiceDays.filter(d => d !== day)
      : [...practiceDays, day];
    setPracticeDays(newPracticeDays);
  };

  const setExperienceLevelWithLock = (level: ExperienceLevel) => {
    if (isProfileLocked) {
      toast.error('Your preferences are locked and cannot be changed');
      return;
    }
    setExperienceLevel(level);
  };

  const setSessionDurationWithLock = (duration: SessionDuration) => {
    if (isProfileLocked) {
      toast.error('Your preferences are locked and cannot be changed');
      return;
    }
    setSessionDuration(duration);
  };

  const setReminderTimeWithLock = (time: string) => {
    if (isProfileLocked) {
      toast.error('Your preferences are locked and cannot be changed');
      return;
    }
    setReminderTime(time);
  };

  const completeDayAction = async (day: number, poses: number, time: number) => {
    if (!userEmail) return;
    
    try {
      const { completeDay } = await import('../lib/supabase');
      const result = await completeDay(userEmail, day, poses, time);
      
      if (result.success) {
        await loadUserData(userEmail);
        toast.success('Congratulations! Day completed successfully!');
      } else {
        toast.error(result.error || 'Failed to complete day');
      }
    } catch (error) {
      console.error('Error completing day:', error);
      toast.error('Something went wrong');
    }
  };

  const saveUserData = async () => {
    if (!userEmail || !experienceLevel || !sessionDuration || practiceDays.length === 0 || !reminderTime) {
      toast.error('Please complete all fields');
      return;
    }
    
    setIsLoading(true);

    try {
      let durationInMinutes: number;
      if (typeof sessionDuration === 'number') {
        durationInMinutes = sessionDuration;
      } else {
        switch (sessionDuration) {
          case 'short':
            durationInMinutes = 8;
            break;
          case 'medium':
            durationInMinutes = 15;
            break;
          case 'long':
            durationInMinutes = 25;
            break;
          default:
            durationInMinutes = 15;
        }
      }

      const userDetails: UserDetails = {
        email: userEmail,
        experience_level: experienceLevel,
        session_duration: durationInMinutes,
        practice_days: practiceDays,
        reminder_time: reminderTime
      };

      const success = await saveUserDetails(userDetails);
      
      if (success) {
        setIsProfileLocked(true);
        toast.success('Your preferences have been saved and locked');
      } else {
        toast.error('Could not save your profile');
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    resetUserData();
    toast.success('You have been logged out');
    return Promise.resolve();
  };

  return {
    togglePracticeDay,
    setExperienceLevel: setExperienceLevelWithLock,
    setSessionDuration: setSessionDurationWithLock,
    setReminderTime: setReminderTimeWithLock,
    completeDay: completeDayAction,
    saveUserData,
    logout
  };
};
