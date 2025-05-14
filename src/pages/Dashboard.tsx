
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { useYoga } from "@/contexts/YogaContext";
import { capitalizeFirstLetter } from "@/lib/utils";

const Dashboard = () => {
  const { experienceLevel, sessionDuration, practiceDays, reminderTime } = useYoga();
  const navigate = useNavigate();

  // Format the session duration for display
  const getDurationText = () => {
    switch (sessionDuration) {
      case "short":
        return "0-10 minutes";
      case "medium":
        return "10-20 minutes";
      case "long":
        return "20+ minutes";
      default:
        return "";
    }
  };

  // If user hasn't completed onboarding, redirect to home
  if (!experienceLevel || !sessionDuration || practiceDays.length === 0 || !reminderTime) {
    navigate('/');
    return null;
  }

  // Generate dummy journey cards
  const journeyCards = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-yoga-100">
      <header className="w-full bg-white shadow-sm py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <Logo />
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-8">Your Yoga Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Practice Plan</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Experience Level</p>
                <p className="font-medium">{capitalizeFirstLetter(experienceLevel)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Session Duration</p>
                <p className="font-medium">{getDurationText()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Practice Days</p>
                <p className="font-medium">
                  {practiceDays.map(day => capitalizeFirstLetter(day)).join(', ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Reminder</p>
                <p className="font-medium">{reminderTime}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-yoga-500 text-white">
            <h2 className="text-xl font-semibold mb-4">Today's Practice</h2>
            <p className="mb-6">Your personalized yoga session is ready!</p>
            <Button variant="secondary" className="w-full">
              Start Practice
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Progress Stats</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Poses Practiced</p>
                <p className="font-medium">0</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Days of Yoga</p>
                <p className="font-medium">0</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Practice Time</p>
                <p className="font-medium">0 minutes</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Yoga Journey</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {journeyCards.map((day) => (
              <Card key={day} className="p-4">
                <h3 className="font-medium text-center">Day {day}</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  {day <= 1 ? "Ready to start" : "Coming soon"}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
