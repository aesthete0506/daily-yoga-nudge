
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase, UserDetail, UserProgress } from '../lib/supabase';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type SessionDuration = 'short' | 'medium' | 'long';
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface YogaContextType {
  userEmail: string | null;
  setUserEmail: (email: string) => void;
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
  completeDay: (day: number, poses: number, time: number) => void;
  getCurrentDay: () => number;
  saveUserData: () => Promise<void>;
}

const YogaContext = createContext<YogaContextType | undefined>(undefined);

export const YogaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [sessionDuration, setSessionDuration] = useState<SessionDuration | null>(null);
  const [practiceDays, setPracticeDays] = useState<WeekDay[]>([]);
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [totalPosesPracticed, setTotalPosesPracticed] = useState(0);
  const [totalPracticeTime, setTotalPracticeTime] = useState(0);

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
    }
  }, [userEmail]);

  const loadUserData = async (email: string) => {
    try {
      // Load user details
      const { data: userDetails } = await supabase
        .from('user_details')
        .select()
        .eq('email', email)
        .single();

      if (userDetails) {
        setExperienceLevel(userDetails.experience_level);
        setSessionDuration(userDetails.session_duration);
        setPracticeDays(userDetails.practice_days);
        setReminderTime(userDetails.reminder_time);
      }

      // Load user progress
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select()
        .eq('email', email)
        .single();

      if (userProgress) {
        setCompletedDays(userProgress.completed_days || []);
        setTotalPosesPracticed(userProgress.total_poses_practiced || 0);
        setTotalPracticeTime(userProgress.total_practice_time || 0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const togglePracticeDay = (day: WeekDay) => {
    setPracticeDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Function to complete a day and update stats
  const completeDay = async (day: number, poses: number, time: number) => {
    if (!completedDays.includes(day)) {
      const newCompletedDays = [...completedDays, day];
      const newTotalPoses = totalPosesPracticed + poses;
      const newTotalTime = totalPracticeTime + time;
      
      setCompletedDays(newCompletedDays);
      setTotalPosesPracticed(newTotalPoses);
      setTotalPracticeTime(newTotalTime);
      
      // If user is logged in, update their progress in Supabase
      if (userEmail) {
        try {
          await supabase.from('user_progress').upsert({
            email: userEmail,
            completed_days: newCompletedDays,
            total_poses_practiced: newTotalPoses,
            total_practice_time: newTotalTime
          });
        } catch (error) {
          console.error('Error updating progress:', error);
        }
      }
    }
  };

  // Get the current day (next day after last completed day or 1 if none completed)
  const getCurrentDay = () => {
    if (completedDays.length === 0) return 1;
    return Math.max(...completedDays) + 1;
  };

  // Save user data to Supabase
  const saveUserData = async () => {
    if (!userEmail) return;

    try {
      // Save user details
      await supabase.from('user_details').upsert({
        email: userEmail,
        experience_level: experienceLevel,
        session_duration: sessionDuration,
        practice_days: practiceDays,
        reminder_time: reminderTime
      });

      // Save user progress if not already saved
      await supabase.from('user_progress').upsert({
        email: userEmail,
        completed_days: completedDays,
        total_poses_practiced: totalPosesPracticed,
        total_practice_time: totalPracticeTime
      }, { onConflict: 'email' });

    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  return (
    <YogaContext.Provider value={{
      userEmail,
      setUserEmail,
      experienceLevel,
      sessionDuration,
      practiceDays,
      reminderTime,
      setExperienceLevel,
      setSessionDuration,
      togglePracticeDay,
      setReminderTime,
      currentStep,
      setCurrentStep,
      completedDays,
      totalPosesPracticed,
      totalPracticeTime,
      completeDay,
      getCurrentDay,
      saveUserData
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
