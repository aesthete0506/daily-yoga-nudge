
import { useState, useEffect } from 'react';
import { supabase, UserDetail } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { useYoga } from '@/contexts/YogaContext';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setUserEmail, setExperienceLevel, setSessionDuration, setReminderTime } = useYoga();

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
            
            // Set user preferences from the fetched data
            if (data.experience_level) {
              setExperienceLevel(data.experience_level);
            }
            
            if (data.session_duration) {
              setSessionDuration(data.session_duration);
            }
            
            if (data.reminder_time) {
              setReminderTime(data.reminder_time);
            }
          } else {
            // User doesn't exist in database but email is stored
            localStorage.removeItem('userEmail');
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
          localStorage.removeItem('userEmail');
          setIsAuthenticated(false);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, [setUserEmail, setExperienceLevel, setSessionDuration, setReminderTime]);

  const login = async (email: string) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login for email:', email);
      
      // Check if user exists in user_details
      const { data: userDetails, error: userError } = await supabase
        .from('user_details')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError && userError.code !== 'PGRST116') {
        console.error('Login error checking user details:', userError);
        toast.error('Login failed. Please try again.');
        setIsAuthenticated(false);
        return false;
      }
      
      // Check if user exists in user_journey
      const { data: userJourney, error: journeyError } = await supabase
        .from('user_journey')
        .select('*')
        .eq('email', email)
        .single();
      
      if (journeyError && journeyError.code !== 'PGRST116') {
        console.error('Login error checking user journey:', journeyError);
      }
      
      // Store email in local storage and set user email
      localStorage.setItem('userEmail', email);
      setUserEmail(email);
      setIsAuthenticated(true);
      
      // If user doesn't exist in user_journey, create an entry
      if (!userJourney) {
        console.log('Creating new user journey entry for:', email);
        const { error: insertJourneyError } = await supabase
          .from('user_journey')
          .insert({
            email: email,
            current_day: 1,
            completed_days: [],
            total_poses_practiced: 0,
            total_practice_time: 0,
            streak_count: 0,
            journey_start_date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
            last_practice_date: null
          });
        
        if (insertJourneyError) {
          console.error('Error creating user journey:', insertJourneyError);
        }
      }
      
      // If user has complete profile (experience_level, session_duration, etc.), they're returning
      if (userDetails && userDetails.experience_level && userDetails.session_duration) {
        console.log('Existing user with complete profile, loading preferences');
        
        setExperienceLevel(userDetails.experience_level);
        setSessionDuration(userDetails.session_duration);
        
        if (userDetails.reminder_time) {
          setReminderTime(userDetails.reminder_time);
        }
        
        return true; // Existing user - go to dashboard
      }
      
      // New user or incomplete profile - needs onboarding
      console.log('New user or incomplete profile, needs onboarding');
      return false;
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Login failed. Please try again.');
      setIsAuthenticated(false);
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
