
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useYoga } from "@/contexts/YogaContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ReminderStep = () => {
  const { reminderTime, setReminderTime, setCurrentStep, saveUserData } = useYoga();
  const [time, setTime] = useState(reminderTime || "08:00");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setReminderTime(time);
    
    try {
      // Save user data to Supabase
      await saveUserData();
      
      toast({
        title: "Yoga practice set up successfully!",
        description: "Your personalized yoga journey begins now.",
      });
      
      // Navigate to the dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error("Error saving user data:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Set a daily reminder</h2>
        <p className="text-muted-foreground mb-6">
          Select a time to receive a gentle nudge—so you never miss a session.
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="w-full max-w-xs">
          <label htmlFor="time-input" className="block text-sm font-medium mb-2">
            Reminder time
          </label>
          <Input
            id="time-input"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="text-center text-lg"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          We'll send you a notification at this time on your practice days.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleComplete} disabled={isLoading}>
          {isLoading ? "Saving..." : "Complete Setup"}
        </Button>
      </div>
    </div>
  );
};

export default ReminderStep;
