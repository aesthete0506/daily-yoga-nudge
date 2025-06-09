import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { useYoga } from "@/contexts/YogaContext";
import { capitalizeFirstLetter } from "@/lib/utils";
import PracticePlanDialog from "@/components/PracticePlanDialog";
import DayPlanDialog from "@/components/DayPlanDialog";
import UserYogaPoses from "@/components/UserYogaPoses";
import { toast } from "@/components/ui/sonner";
import { CheckCircle, Lock } from 'lucide-react';

const Dashboard = () => {
  const { experienceLevel, sessionDuration, practiceDays, reminderTime, completedDays, totalPosesPracticed, totalPracticeTime } = useYoga();
  const navigate = useNavigate();
  const [practicePlanOpen, setPracticePlanOpen] = useState(false);
  const [dayPlanOpen, setDayPlanOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to allow context to fully load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // If user hasn't completed onboarding and loading is finished, redirect to home
  useEffect(() => {
    if (!isLoading && (!experienceLevel || !sessionDuration || practiceDays.length === 0 || !reminderTime)) {
      toast.info("Let's complete your profile first");
      navigate('/');
    }
  }, [isLoading, experienceLevel, sessionDuration, practiceDays, reminderTime, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yoga-100">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading your dashboard...</h2>
          <p className="text-muted-foreground">Just a moment while we prepare your practice</p>
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ebf3f3' }}>
      <header className="w-full shadow-sm py-4 px-4 sm:px-6" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setPracticePlanOpen(true)}
              style={{ 
                borderColor: '#eb644c', 
                color: '#eb644c',
                backgroundColor: '#ffffff'
              }}
              className="hover:bg-primary hover:text-white"
            >
              Your Practice Plan
            </Button>
            
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#2d2857' }}>Your 30-Day Yoga Journey</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6" style={{ backgroundColor: '#ffffff' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#2d2857' }}>Progress Stats</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Current Day</p>
                <p className="font-medium" style={{ color: '#2d2857' }}>Day {1}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Completed</p>
                <p className="font-medium" style={{ color: '#2d2857' }}>{completedDays.length} / 30</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Poses Practiced</p>
                <p className="font-medium" style={{ color: '#2d2857' }}>{totalPosesPracticed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Practice Time</p>
                <p className="font-medium" style={{ color: '#2d2857' }}>{formatPracticeTime(totalPracticeTime)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6" style={{ backgroundColor: '#eb644c', color: '#ffffff' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#ffffff' }}>Today's Practice</h2>
            <p className="mb-6" style={{ color: '#ffffff' }}>Day {1} - Your personalized yoga session is ready!</p>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => setDayPlanOpen(true)}
              style={{ 
                backgroundColor: '#ffffff', 
                color: '#eb644c',
                border: 'none'
              }}
            >
              Start Day {1}
            </Button>
          </Card>

          <Card className="p-6" style={{ backgroundColor: '#ffffff' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#2d2857' }}>Journey Progress</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span style={{ color: '#2d2857' }}>{Math.round((completedDays.length / 30) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${(completedDays.length / 30) * 100}%`,
                    backgroundColor: '#eb644c'
                  }}
                ></div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-8">
          <UserYogaPoses />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#2d2857' }}>30-Day Journey Calendar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {journeyCards.map((day) => {
              
              return (
                <Card 
                  key={day} 
                  className={`p-4 transition-all cursor-pointer`}
                  onClick={() => {}}
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-center" style={{ color: '#2d2857' }}>Day {day}</h3>
                      <p className="text-xs text-center mt-1">
                        
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
        dayNumber={1}
      />
    </div>
  );
};

export default Dashboard;
