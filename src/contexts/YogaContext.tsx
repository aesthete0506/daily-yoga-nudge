
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase, UserDetail, UserProgress, VideoFile, ScheduleEntry, enablePublicAccess } from '../lib/supabase';
import { toast } from '@/components/ui/sonner';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type SessionDuration = 'short' | 'medium' | 'long';
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface YogaContextType {
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
  completeDay: (day: number, poses: number, time: number) => void;
  getCurrentDay: () => number;
  saveUserData: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
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
  
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [totalPosesPracticed, setTotalPosesPracticed] = useState(0);
  const [totalPracticeTime, setTotalPracticeTime] = useState(0);
  const [hasAccessEnabled, setHasAccessEnabled] = useState(false);

  // Load user data from local storage on initial load
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
      loadUserData(storedEmail);
    }
    
    // Enable public access when component mounts
    enablePublicAccess().then(success => {
      setHasAccessEnabled(success);
    });
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
      // Wait for public access to be enabled
      if (!hasAccessEnabled) {
        await enablePublicAccess();
      }
      
      // Load user details
      const { data: userDetails, error: userError } = await supabase
        .from('user_details')
        .select()
        .eq('email', email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error loading user details:', userError);
        toast.error('Error loading your profile');
      }

      if (userDetails) {
        setExperienceLevel(userDetails.experience_level);
        setSessionDuration(userDetails.session_duration);
        setPracticeDays(userDetails.practice_days);
        setReminderTime(userDetails.reminder_time);
      }

      // Load user progress
      const { data: userProgress, error: progressError } = await supabase
        .from('user_progress')
        .select()
        .eq('email', email)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error loading user progress:', progressError);
      }

      if (userProgress) {
        setCompletedDays(userProgress.completed_days || []);
        setTotalPosesPracticed(userProgress.total_poses_practiced || 0);
        setTotalPracticeTime(userProgress.total_practice_time || 0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Something went wrong loading your data');
    } finally {
      setIsLoading(false);
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
          // First ensure we have a user_details entry
          await saveUserData();
          
          // Now update the progress
          const { error } = await supabase.from('user_progress').upsert({
            email: userEmail,
            completed_days: newCompletedDays,
            total_poses_practiced: newTotalPoses,
            total_practice_time: newTotalTime
          });
          
          if (error) {
            console.error('Error updating progress:', error);
            toast.error('Could not save your progress');
          }
        } catch (error) {
          console.error('Error updating progress:', error);
          toast.error('Could not save your progress');
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
    setIsLoading(true);

    try {
      // Make sure public access is enabled
      if (!hasAccessEnabled) {
        await enablePublicAccess();
      }
      
      // Use an RPC call to create the user details
      const { error: rpcError } = await supabase.rpc('create_or_update_user_details', {
        p_email: userEmail,
        p_experience_level: experienceLevel,
        p_session_duration: sessionDuration,
        p_practice_days: practiceDays,
        p_reminder_time: reminderTime
      });

      if (rpcError) {
        console.error('Error saving user details:', rpcError);
        
        // Fallback to direct insertion with explicit data 
        const { error: userError } = await supabase.from('user_details').upsert({
          email: userEmail,
          experience_level: experienceLevel,
          session_duration: sessionDuration,
          practice_days: practiceDays,
          reminder_time: reminderTime
        }, {
          onConflict: 'email'
        });
        
        if (userError) {
          console.error('Error with fallback save:', userError);
          toast.error('Could not save your profile');
          return;
        }
      }

      // Initialize user progress if not already saved
      const { error: progressError } = await supabase.from('user_progress').upsert({
        email: userEmail,
        completed_days: completedDays.length > 0 ? completedDays : [],
        total_poses_practiced: totalPosesPracticed,
        total_practice_time: totalPracticeTime
      }, { 
        onConflict: 'email' 
      });

      if (progressError) {
        console.error('Error saving user progress:', progressError);
        toast.error('Could not save your progress');
        return;
      }

      toast.success('Your data has been saved');

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
    setCurrentStep(0);
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
      saveUserData,
      logout,
      isLoading
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
