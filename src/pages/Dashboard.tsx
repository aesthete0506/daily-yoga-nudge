
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { useYoga } from "@/contexts/YogaContext";
import PracticePlanDialog from "@/components/PracticePlanDialog";
import DayPlanDialog from "@/components/DayPlanDialog";
import { toast } from "@/components/ui/sonner";
import { CheckCircle, Lock, Play } from 'lucide-react';
import { getDayContent } from "@/lib/supabase";

const Dashboard = () => {
  const { 
    experienceLevel, 
    sessionDuration, 
    practiceDays, 
    reminderTime, 
    completedDays, 
    totalPosesPracticed, 
    totalPracticeTime,
    currentDay,
    hasCompletedToday,
    userEmail
  } = useYoga();
  
  const navigate = useNavigate();
  const [practicePlanOpen, setPracticePlanOpen] = useState(false);
  const [dayPlanOpen, setDayPlanOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [dayMuscles, setDayMuscles] = useState<Record<number, string>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Load muscle focus data for days
  useEffect(() => {
    const loadDayData = async () => {
      if (!experienceLevel) return;
      
      const muscleData: Record<number, string> = {};
      for (let day = 1; day <= 30; day++) {
        const content = await getDayContent(day, experienceLevel);
        if (content.length > 0) {
          muscleData[day] = content[0].muscles_impacted || 'Full Body';
        }
      }
      setDayMuscles(muscleData);
    };
    
    if (experienceLevel) {
      loadDayData();
    }
  }, [experienceLevel]);

  // If user hasn't completed onboarding, redirect to home
  useEffect(() => {
    if (!isLoading && (!experienceLevel || !sessionDuration || practiceDays.length === 0 || !reminderTime)) {
      toast.info("Let's complete your profile first");
      navigate('/');
    }
  }, [isLoading, experienceLevel, sessionDuration, practiceDays, reminderTime, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2 text-headline">Loading your dashboard...</h2>
          <p className="text-normal">Just a moment while we prepare your practice</p>
        </div>
      </div>
    );
  }

  // Generate journey cards
  const journeyCards = Array.from({ length: 30 }, (_, i) => i + 1);

  // Format practice time
  const formatPracticeTime = (minutes: number) => {
    if (minutes < 1) {
      const seconds = Math.round(minutes * 60);
      return `${seconds} seconds`;
    } else {
      return `${minutes} minutes`;
    }
  };

  const handleDayClick = (day: number) => {
    if (hasCompletedToday && !completedDays.includes(day)) {
      toast.error("✅ You've completed today's workout! Come back tomorrow to continue.");
      return;
    }
    
    if (day === 1 || completedDays.includes(day - 1)) {
      setSelectedDay(day);
      setDayPlanOpen(true);
    } else {
      toast.error(`Please complete Day ${day - 1} first to unlock this day.`);
    }
  };

  const getDayStatus = (day: number) => {
    if (completedDays.includes(day)) return 'completed';
    if (day === 1 || completedDays.includes(day - 1)) return 'available';
    return 'locked';
  };

  const getCalendarText = (day: number) => {
    const status = getDayStatus(day);
    if (status === 'locked') return 'Unlocking Soon';
    return dayMuscles[day] || 'Loading...';
  };

  // Check if all 30 days are completed
  const isJourneyComplete = completedDays.length === 30;

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full shadow-sm py-4 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setPracticePlanOpen(true)}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              Your Practice Plan
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        {isJourneyComplete ? (
          <div className="text-center mb-8 p-8 bg-white rounded-lg shadow-sm">
            <h1 className="text-4xl font-bold mb-4 text-headline">🎉 Congratulations! 🎉</h1>
            <p className="text-xl text-normal">You did it! 30 Days Completed. Keep going strong.</p>
          </div>
        ) : (
          <h1 className="text-3xl font-bold mb-8 text-headline">Your 30-Day Yoga Journey</h1>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white shadow-sm border-0">
            <h2 className="text-xl font-semibold mb-4 text-headline">Progress Stats</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-normal">Current Day</p>
                <p className="font-medium text-headline">Day {currentDay}</p>
              </div>
              <div>
                <p className="text-sm text-normal">Days Completed</p>
                <p className="font-medium text-headline">{completedDays.length} / 30</p>
              </div>
              <div>
                <p className="text-sm text-normal">Total Poses Practiced</p>
                <p className="font-medium text-headline">{totalPosesPracticed}</p>
              </div>
              <div>
                <p className="text-sm text-normal">Total Practice Time</p>
                <p className="font-medium text-headline">{formatPracticeTime(totalPracticeTime)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-primary text-white shadow-sm border-0">
            <h2 className="text-xl font-semibold mb-4 text-white">Today's Practice</h2>
            <p className="mb-6 text-white">
              {isJourneyComplete ? (
                'Journey Complete!'
              ) : (
                `Day ${currentDay} - ${dayMuscles[currentDay] ? `Working on: ${dayMuscles[currentDay]}` : 'Your personalized yoga session is ready!'}`
              )}
            </p>
            <Button 
              variant="secondary" 
              className="w-full bg-white text-primary border-0 hover:bg-gray-100"
              onClick={() => handleDayClick(currentDay)}
              disabled={hasCompletedToday || isJourneyComplete}
            >
              {isJourneyComplete ? '🎉 Journey Complete!' : hasCompletedToday ? '✅ Completed Today!' : `Start Day ${currentDay}`}
            </Button>
          </Card>

          <Card className="p-6 bg-white shadow-sm border-0">
            <h2 className="text-xl font-semibold mb-4 text-headline">Journey Progress</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-normal">Completion</span>
                <span className="text-headline">{Math.round((completedDays.length / 30) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300 bg-primary" 
                  style={{ width: `${(completedDays.length / 30) * 100}%` }}
                ></div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-headline">30-Day Journey Calendar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
            {journeyCards.map((day) => {
              const status = getDayStatus(day);
              const isCompleted = completedDays.includes(day);
              const isAvailable = status === 'available';
              const isLocked = status === 'locked';
              
              return (
                <Card 
                  key={day} 
                  className={`p-4 h-24 cursor-pointer transition-all bg-white shadow-sm border-0 hover:shadow-md ${
                    isCompleted ? 'ring-2 ring-green-500' : isLocked ? 'opacity-60' : 'hover:ring-2 hover:ring-primary'
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-headline">Day {day}</h3>
                      {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {isLocked && <Lock className="h-4 w-4 text-gray-400" />}
                      {isAvailable && !isCompleted && <Play className="h-4 w-4 text-primary" />}
                    </div>
                    
                    <div className="text-xs text-normal">
                      <p className="font-medium text-headline">
                        {getCalendarText(day)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <PracticePlanDialog 
        open={practicePlanOpen} 
        onOpenChange={setPracticePlanOpen} 
      />
      <DayPlanDialog 
        open={dayPlanOpen} 
        onOpenChange={setDayPlanOpen}
        dayNumber={selectedDay}
      />
    </div>
  );
};

export default Dashboard;
