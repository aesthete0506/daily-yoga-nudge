import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase, UserDetails, UserJourney, getUserDetails, getUserJourney, saveUserDetails } from '../lib/supabase';
import { toast } from '@/components/ui/sonner';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type SessionDuration = "short" | "medium" | "long" | number;

interface YogaContextType {
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  experienceLevel: ExperienceLevel | null;
  sessionDuration: SessionDuration | null; // in minutes
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
}

const YogaContext = createContext<YogaContextType | undefined>(undefined);

export const YogaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [sessionDuration, setSessionDuration] = useState<SessionDuration | null>(null);
  const [practiceDays, setPracticeDays] = useState<WeekDay[]>([]);
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLocked, setIsProfileLocked] = useState(false);
  
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [totalPosesPracticed, setTotalPosesPracticed] = useState(0);
  const [totalPracticeTime, setTotalPracticeTime] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);

  // Load user data from local storage on initial load
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
      loadUserData(storedEmail);
    }
  }, []);

  // When email changes, save it to local storage
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('userEmail', userEmail);
    } else {
      localStorage.removeItem('userEmail');
    }
  }, [userEmail]);

  const loadUserData = async (email: string) => {
    setIsLoading(true);
    try {
      // Load user details
      const userDetails = await getUserDetails(email);
      if (userDetails) {
        setExperienceLevel(userDetails.experience_level);
        setSessionDuration(userDetails.session_duration);
        setPracticeDays(userDetails.practice_days as WeekDay[]);
        setReminderTime(userDetails.reminder_time);
        setIsProfileLocked(true); // Lock profile after first save
      }

      // Load user journey
      const userJourney = await getUserJourney(email);
      if (userJourney) {
        setCompletedDays(userJourney.completed_days || []);
        setTotalPosesPracticed(userJourney.total_poses_practiced || 0);
        setTotalPracticeTime(userJourney.total_practice_time || 0);
        setCurrentDay(userJourney.current_day || 1);
        
        // Check if user has completed practice today
        const today = new Date().toISOString().split('T')[0];
        setHasCompletedToday(userJourney.last_practice_date === today);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Something went wrong loading your data');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePracticeDay = (day: WeekDay) => {
    if (isProfileLocked) {
      toast.error('Your preferences are locked and cannot be changed');
      return;
    }
    setPracticeDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Function to complete a day and update stats
  const completeDayAction = async (day: number, poses: number, time: number) => {
    if (!userEmail) return;
    
    try {
      const { completeDay } = await import('../lib/supabase');
      const result = await completeDay(userEmail, day, poses, time);
      
      if (result.success) {
        // Reload user journey data
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

  // Get the current day (next day after last completed day or 1 if none completed)
  const getCurrentDay = () => {
    return currentDay;
  };

  // Save user data to Supabase
  const saveUserData = async () => {
    if (!userEmail || !experienceLevel || !sessionDuration || practiceDays.length === 0 || !reminderTime) {
      toast.error('Please complete all fields');
      return;
    }
    
    setIsLoading(true);

    try {
      const userDetails: UserDetails = {
        email: userEmail,
        experience_level: experienceLevel,
        session_duration: sessionDuration,
        practice_days: practiceDays,
        reminder_time: reminderTime
      };

      const success = await saveUserDetails(userDetails);
      
      if (success) {
        setIsProfileLocked(true); // Lock profile after first save
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

  // Logout function
  const logout = async () => {
    setUserEmail(null);
    setExperienceLevel(null);
    setSessionDuration(null);
    setPracticeDays([]);
    setReminderTime(null);
    setCompletedDays([]);
    setTotalPosesPracticed(0);
    setTotalPracticeTime(0);
    setCurrentDay(1);
    setCurrentStep(0);
    setIsProfileLocked(false);
    setHasCompletedToday(false);
    localStorage.removeItem('userEmail');
    toast.success('You have been logged out');
    return Promise.resolve();
  };

  return (
    <YogaContext.Provider value={{
      userEmail,
      setUserEmail,
      experienceLevel,
      sessionDuration,
      practiceDays,
      reminderTime,
      setExperienceLevel: (level) => {
        if (isProfileLocked) {
          toast.error('Your preferences are locked and cannot be changed');
          return;
        }
        setExperienceLevel(level);
      },
      setSessionDuration: (duration) => {
        if (isProfileLocked) {
          toast.error('Your preferences are locked and cannot be changed');
          return;
        }
        setSessionDuration(duration);
      },
      togglePracticeDay,
      setReminderTime: (time) => {
        if (isProfileLocked) {
          toast.error('Your preferences are locked and cannot be changed');
          return;
        }
        setReminderTime(time);
      },
      currentStep,
      setCurrentStep,
      completedDays,
      totalPosesPracticed,
      totalPracticeTime,
      currentDay,
      isProfileLocked,
      completeDay: completeDayAction,
      getCurrentDay,
      saveUserData,
      logout,
      isLoading,
      hasCompletedToday
    }}>
      {children}
    </YogaContext.Provider>
  );
};

export const useYoga = (): YogaContextType => {
  const context = useContext(YogaContext);
  if (context === undefined) {
    throw new Error('useYoga must be used within a YogaProvider');
  }
  return context;
};
