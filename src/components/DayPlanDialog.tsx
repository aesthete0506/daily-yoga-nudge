
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
}

const DayPlanDialog = ({ open, onOpenChange }: DayPlanDialogProps) => {
  const [startPractice, setStartPractice] = useState(false);
  const { sessionDuration, getCurrentDay } = useYoga();
  
  // Get the current day from context
  const dayNumber = getCurrentDay();

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
      dayNumber={dayNumber} 
      asanas={dayPlan.asanas}
    />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Day {dayNumber} Practice</DialogTitle>
          <DialogDescription>Your personalized practice for today</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Goal of the Day</h4>
            <p className="text-sm text-muted-foreground">{dayPlan.goal}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Muscles Impacted</h4>
            <p className="text-sm text-muted-foreground">{dayPlan.muscles}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Asanas</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {dayPlan.asanas.map((asana, index) => (
                <li key={index}>{asana.name}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Total Time Required</h4>
            <p className="text-sm text-muted-foreground">{dayPlan.totalTime}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={() => setStartPractice(true)}>
            Start Practice
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Go Back</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DayPlanDialog;
