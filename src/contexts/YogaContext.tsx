
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { YogaContextType } from '../types/yoga';
import { useUserData } from '../hooks/useUserData';
import { useYogaActions } from '../hooks/useYogaActions';

const YogaContext = createContext<YogaContextType | undefined>(undefined);

export const YogaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const userData = useUserData();
  const yogaActions = useYogaActions(userData);

  // Get the current day (next day after last completed day or 1 if none completed)
  const getCurrentDay = () => {
    return userData.currentDay;
  };

  return (
    <YogaContext.Provider value={{
      // User data
      userEmail: userData.userEmail,
      setUserEmail: userData.setUserEmail,
      experienceLevel: userData.experienceLevel,
      sessionDuration: userData.sessionDuration,
      practiceDays: userData.practiceDays,
      reminderTime: userData.reminderTime,
      isLoading: userData.isLoading,
      isProfileLocked: userData.isProfileLocked,
      
      // Journey data
      completedDays: userData.completedDays,
      totalPosesPracticed: userData.totalPosesPracticed,
      totalPracticeTime: userData.totalPracticeTime,
      currentDay: userData.currentDay,
      hasCompletedToday: userData.hasCompletedToday,
      streakCount: userData.streakCount,
      
      // Step management
      currentStep,
      setCurrentStep,
      
      // Actions
      setExperienceLevel: yogaActions.setExperienceLevel,
      setSessionDuration: yogaActions.setSessionDuration,
      togglePracticeDay: yogaActions.togglePracticeDay,
      setReminderTime: yogaActions.setReminderTime,
      completeDay: yogaActions.completeDay,
      getCurrentDay,
      saveUserData: yogaActions.saveUserData,
      logout: yogaActions.logout
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
