
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type SessionDuration = 'short' | 'medium' | 'long';
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface YogaContextType {
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
  // Added progress tracking
  completedDays: number[];
  totalPosesPracticed: number;
  totalPracticeTime: number;
  completeDay: (day: number, poses: number, time: number) => void;
  getCurrentDay: () => number;
}

const YogaContext = createContext<YogaContextType | undefined>(undefined);

export const YogaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [sessionDuration, setSessionDuration] = useState<SessionDuration | null>(null);
  const [practiceDays, setPracticeDays] = useState<WeekDay[]>([]);
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Added progress tracking state
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [totalPosesPracticed, setTotalPosesPracticed] = useState(0);
  const [totalPracticeTime, setTotalPracticeTime] = useState(0);

  const togglePracticeDay = (day: WeekDay) => {
    setPracticeDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Function to complete a day and update stats
  const completeDay = (day: number, poses: number, time: number) => {
    if (!completedDays.includes(day)) {
      setCompletedDays(prev => [...prev, day]);
      setTotalPosesPracticed(prev => prev + poses);
      setTotalPracticeTime(prev => prev + time);
    }
  };

  // Get the current day (next day after last completed day or 1 if none completed)
  const getCurrentDay = () => {
    if (completedDays.length === 0) return 1;
    return Math.max(...completedDays) + 1;
  };

  return (
    <YogaContext.Provider value={{
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
      getCurrentDay
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
