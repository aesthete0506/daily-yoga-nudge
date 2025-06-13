
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
import { Progress } from "@/components/ui/progress";

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
    userEmail,
    streakCount
  } = useYoga();
  
  const navigate = useNavigate();
  const [practicePlanOpen, setPracticePlanOpen] = useState(false);
  const [dayPlanOpen, setDayPlanOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyContent, setWeeklyContent] = useState<Record<number, { benefits: string; muscles: string }>>({});
  const [todayContent, setTodayContent] = useState<{ benefits: string; muscles: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Load content for today's practice and weekly view
  useEffect(() => {
    const loadContent = async () => {
      if (!experienceLevel) return;
      
      // Get today's content
      const todayContentData = await getDayContent(currentDay, experienceLevel);
      if (todayContentData.length > 0) {
        setTodayContent({
          benefits: todayContentData[0].benefits || 'Strength & Flexibility',
          muscles: todayContentData[0].muscles_impacted || 'Full Body'
        });
      }
      
      // Get weekly content (show next 7 available days)
      const contentData: Record<number, { benefits: string; muscles: string }> = {};
      const availableDays = [];
      
      // Find next 7 available days starting from current day
      for (let day = currentDay; day <= 30 && availableDays.length < 7; day++) {
        if (!completedDays.includes(day)) {
          availableDays.push(day);
        }
      }
      
      for (const day of availableDays) {
        const content = await getDayContent(day, experienceLevel);
        if (content.length > 0) {
          contentData[day] = {
            benefits: content[0].benefits || 'Strength & Flexibility',
            muscles: content[0].muscles_impacted || 'Full Body'
          };
        }
      }
      setWeeklyContent(contentData);
    };
    
    if (experienceLevel) {
      loadContent();
    }
  }, [experienceLevel, currentDay, completedDays]);

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
          <p className="text-muted-foreground">Just a moment while we prepare your practice</p>
        </div>
      </div>
    );
  }

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

  // Get tile colors that cycle through the specified palette
  const getTileColor = (day: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-100 to-blue-200',      // Light Blue
      'bg-gradient-to-br from-yellow-100 to-yellow-200',  // Light Yellow  
      'bg-gradient-to-br from-orange-100 to-orange-200',  // Light Orange
      'bg-gradient-to-br from-purple-100 to-purple-200',  // Lavender
      'bg-gradient-to-br from-purple-200 to-purple-300'   // Light Purple
    ];
    return colors[(day - 1) % colors.length];
  };

  const isJourneyComplete = completedDays.length === 30;

  // Get next 7 available days (excluding completed ones)
  const getAvailableDays = () => {
    const availableDays = [];
    for (let day = currentDay; day <= 30 && availableDays.length < 7; day++) {
      if (!completedDays.includes(day)) {
        availableDays.push(day);
      }
    }
    return availableDays;
  };

  const availableDays = getAvailableDays();

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full shadow-sm py-4 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />
          <div className="flex gap-2">
            <Button 
              onClick={() => setPracticePlanOpen(true)}
              className="bg-primary text-white hover:bg-primary/90 transition-colors"
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
            <p className="text-xl text-muted-foreground">You did it! 30 Days Completed. Keep going strong.</p>
          </div>
        ) : (
          <h1 className="text-3xl font-bold mb-8 text-headline">My Yoga Journey</h1>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white shadow-sm border-0 rounded-xl">
            <h2 className="text-lg font-semibold mb-4 text-headline">Progress Stats</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Current Day</p>
                <p className="font-medium text-headline">Day {currentDay}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Completed</p>
                <p className="font-medium text-headline">{completedDays.length} / 30</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Poses Practiced</p>
                <p className="font-medium text-headline">{totalPosesPracticed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Practice Time</p>
                <p className="font-medium text-headline">{formatPracticeTime(totalPracticeTime)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-200 to-purple-300 text-headline shadow-sm border-0 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Today's Practice</h2>
            <div className="mb-4 space-y-2">
              {isJourneyComplete ? (
                <p className="text-sm">Journey Complete!</p>
              ) : todayContent ? (
                <>
                  <p className="text-sm font-medium">Benefits: {todayContent.benefits}</p>
                  <p className="text-sm">Muscles: {todayContent.muscles}</p>
                </>
              ) : (
                <p className="text-sm">Ready for practice!</p>
              )}
            </div>
            <Button 
              variant="secondary" 
              className="w-full bg-white text-primary border-0 hover:bg-gray-100 transition-colors rounded-lg"
              onClick={() => handleDayClick(currentDay)}
              disabled={hasCompletedToday || isJourneyComplete}
            >
              {isJourneyComplete ? '🎉 Journey Complete!' : hasCompletedToday ? '✅ Completed Today!' : `Start Day ${currentDay}`}
            </Button>
          </Card>

          <Card className="p-6 bg-white shadow-sm border-0 rounded-xl">
            <h2 className="text-lg font-semibold mb-4 text-headline">Journey Progress</h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-headline">{Math.round((completedDays.length / 30) * 100)}%</div>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
              <Progress value={(completedDays.length / 30) * 100} className="h-2" />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-sm border-0 rounded-xl">
            <h2 className="text-lg font-semibold mb-4 text-headline">Current Streak</h2>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">🔥</div>
              <div className="text-2xl font-bold text-headline">{streakCount || 0}</div>
              <p className="text-sm text-muted-foreground">Days in a row</p>
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-headline">Upcoming Practice Days</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {availableDays.map((day) => {
              const status = getDayStatus(day);
              const isCompleted = completedDays.includes(day);
              const isAvailable = status === 'available';
              const isLocked = status === 'locked';
              const content = weeklyContent[day];
              const tileColor = getTileColor(day);
              
              return (
                <Card 
                  key={day} 
                  className={`p-4 h-48 cursor-pointer transition-all duration-200 ${tileColor} shadow-sm border-0 rounded-xl hover:shadow-md hover:scale-105 ${
                    isCompleted ? 'ring-2 ring-green-500' : isLocked ? 'opacity-60' : 'hover:ring-2 hover:ring-primary'
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-headline text-sm">Day {day}</h3>
                      {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {isLocked && <Lock className="h-3 w-3 text-gray-400" />}
                      {isAvailable && !isCompleted && <Play className="h-3 w-3 text-primary" />}
                    </div>
                    
                    <div className="text-xs space-y-2">
                      {isLocked ? (
                        <p className="text-headline/70 font-medium">Coming Soon</p>
                      ) : (
                        <>
                          <div>
                            <p className="text-headline font-medium text-xs">Benefits:</p>
                            <p className="text-headline/70 text-xs">
                              {content?.benefits || 'Strength & Balance'}
                            </p>
                          </div>
                          <div>
                            <p className="text-headline font-medium text-xs">Muscles:</p>
                            <p className="text-headline/70 text-xs">
                              {content?.muscles || 'Full Body'}
                            </p>
                          </div>
                        </>
                      )}
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
