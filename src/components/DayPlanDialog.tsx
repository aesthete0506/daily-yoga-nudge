import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { useYoga } from "@/contexts/YogaContext";
import { useState } from "react";
import AsanaPractice from "./AsanaPractice";

interface DayPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayNumber?: number;
}

const DayPlanDialog = ({ open, onOpenChange, dayNumber }: DayPlanDialogProps) => {
  const [startPractice, setStartPractice] = useState(false);
  const { sessionDuration, getCurrentDay } = useYoga();
  
  // Use provided dayNumber or current day
  const currentDayNumber = dayNumber || getCurrentDay();

  // Sample day plan data - in a real app, this would come from an API or database
  const dayPlan = {
    goal: "Improve flexibility and reduce stress",
    muscles: "Lower back, hamstrings, shoulders",
    asanas: [
      { name: "Mountain Pose (Tadasana)", duration: "2 minutes" },
      { name: "Downward Dog (Adho Mukha Svanasana)", duration: "2 minutes" },
      { name: "Child's Pose (Balasana)", duration: "2 minutes" }
    ],
    totalTime: sessionDuration === "short" ? "8 minutes" : 
               sessionDuration === "medium" ? "15 minutes" : "25 minutes"
  };

  if (startPractice) {
    return <AsanaPractice 
      open={open} 
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) setStartPractice(false);
      }} 
      dayNumber={currentDayNumber} 
      asanas={dayPlan.asanas}
    />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Day {currentDayNumber} Practice</DialogTitle>
          <DialogDescription>Your personalized practice for today</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-text-primary">Goal of the Day</h4>
            <p className="text-sm text-muted-foreground">{dayPlan.goal}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-text-primary">Muscles Impacted</h4>
            <p className="text-sm text-muted-foreground">{dayPlan.muscles}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-text-primary">Asanas</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {dayPlan.asanas.map((asana, index) => (
                <li key={index}>{asana.name}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-text-primary">Total Time Required</h4>
            <p className="text-sm text-muted-foreground">{dayPlan.totalTime}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button 
            onClick={() => setStartPractice(true)}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Start Practice
          </Button>
          <DialogClose asChild>
            <Button 
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              Go Back
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DayPlanDialog;
