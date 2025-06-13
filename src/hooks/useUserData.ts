
import { useState, useEffect } from 'react';
import { getUserDetails, getUserJourney } from '../lib/supabase';
import { ExperienceLevel, SessionDuration, WeekDay } from '../types/yoga';
import { toast } from '@/components/ui/sonner';

export const useUserData = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [sessionDuration, setSessionDuration] = useState<SessionDuration | null>(null);
  const [practiceDays, setPracticeDays] = useState<WeekDay[]>([]);
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLocked, setIsProfileLocked] = useState(false);
  
  // Journey data
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [totalPosesPracticed, setTotalPosesPracticed] = useState(0);
  const [totalPracticeTime, setTotalPracticeTime] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

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
        setIsProfileLocked(true);
      }

      // Load user journey
      const userJourney = await getUserJourney(email);
      if (userJourney) {
        setCompletedDays(userJourney.completed_days || []);
        setTotalPosesPracticed(userJourney.total_poses_practiced || 0);
        setTotalPracticeTime(userJourney.total_practice_time || 0);
        setCurrentDay(userJourney.current_day || 1);
        setStreakCount(userJourney.streak_count || 0);
        
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

  const resetUserData = () => {
    setUserEmail(null);
    setExperienceLevel(null);
    setSessionDuration(null);
    setPracticeDays([]);
    setReminderTime(null);
    setCompletedDays([]);
    setTotalPosesPracticed(0);
    setTotalPracticeTime(0);
    setCurrentDay(1);
    setIsProfileLocked(false);
    setHasCompletedToday(false);
    setStreakCount(0);
    localStorage.removeItem('userEmail');
  };

  return {
    // User data
    userEmail,
    setUserEmail,
    experienceLevel,
    setExperienceLevel,
    sessionDuration,
    setSessionDuration,
    practiceDays,
    setPracticeDays,
    reminderTime,
    setReminderTime,
    isLoading,
    setIsLoading,
    isProfileLocked,
    setIsProfileLocked,
    
    // Journey data
    completedDays,
    setCompletedDays,
    totalPosesPracticed,
    setTotalPosesPracticed,
    totalPracticeTime,
    setTotalPracticeTime,
    currentDay,
    setCurrentDay,
    hasCompletedToday,
    setHasCompletedToday,
    streakCount,
    setStreakCount,
    
    // Methods
    loadUserData,
    resetUserData
  };
};
