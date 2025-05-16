
import { useState, useEffect } from 'react';
import { supabase, UserDetail } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { useYoga } from '@/contexts/YogaContext';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setUserEmail, setExperienceLevel, setSessionDuration, setPracticeDays, setReminderTime } = useYoga();

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const storedEmail = localStorage.getItem('userEmail');
      
      if (storedEmail) {
        try {
          // Check if user exists in the database
          const { data, error } = await supabase
            .from('user_details')
            .select('*')
            .eq('email', storedEmail)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            console.error('Error loading user:', error);
            localStorage.removeItem('userEmail');
            setIsAuthenticated(false);
          } else if (data) {
            // User exists, set authentication and user details
            setUserEmail(storedEmail);
            setIsAuthenticated(true);
            
            // Set user preferences directly from the fetched data
            // This will prevent asking for preferences again
            if (data.experience_level) {
              setExperienceLevel(data.experience_level);
            }
            
            if (data.session_duration) {
              setSessionDuration(data.session_duration);
            }
            
            if (data.practice_days && data.practice_days.length > 0) {
              setPracticeDays(data.practice_days);
            }
            
            if (data.reminder_time) {
              setReminderTime(data.reminder_time);
            }
          } else {
            // User doesn't exist
            localStorage.removeItem('userEmail');
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
          toast.error('Authentication error, please sign in again.');
          localStorage.removeItem('userEmail');
          setIsAuthenticated(false);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, [setUserEmail, setExperienceLevel, setSessionDuration, setPracticeDays, setReminderTime]);

  const login = async (email: string) => {
    setIsLoading(true);
    
    try {
      // Check if user exists
      const { data, error } = await supabase
        .from('user_details')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Login error:', error);
        toast.error('Login failed. Please try again.');
        setIsAuthenticated(false);
        return false;
      }
      
      // Store email in local storage
      localStorage.setItem('userEmail', email);
      setUserEmail(email);
      
      // If user exists, load their preferences
      if (data) {
        setIsAuthenticated(true);
        
        if (data.experience_level) {
          setExperienceLevel(data.experience_level);
        }
        
        if (data.session_duration) {
          setSessionDuration(data.session_duration);
        }
        
        if (data.practice_days && data.practice_days.length > 0) {
          setPracticeDays(data.practice_days);
        }
        
        if (data.reminder_time) {
          setReminderTime(data.reminder_time);
        }
        
        return true;
      }
      
      // New user
      setIsAuthenticated(true);
      return false;
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('userEmail');
    setUserEmail(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  return {
    isLoading,
    isAuthenticated,
    login,
    logout
  };
};
