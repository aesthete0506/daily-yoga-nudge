
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useYoga } from "@/contexts/YogaContext";
import { capitalizeFirstLetter } from "@/lib/utils";

interface PracticePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PracticePlanDialog = ({ open, onOpenChange }: PracticePlanDialogProps) => {
  const { experienceLevel, sessionDuration, practiceDays, reminderTime } = useYoga();

  // Format the session duration for display
  const getDurationText = () => {
    if (typeof sessionDuration === 'number') {
      return `${sessionDuration} minutes`;
    }
    
    switch (sessionDuration) {
      case "short":
        return "0-10 minutes";
      case "medium":
        return "10-20 minutes";
      case "long":
        return "20+ minutes";
      default:
        return "Not set";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Practice Plan</DialogTitle>
          <DialogDescription>
            Your personalized yoga practice plan based on your preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Experience Level</h4>
              <p className="text-sm text-muted-foreground">
                {experienceLevel ? capitalizeFirstLetter(experienceLevel) : "-"}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Session Duration</h4>
              <p className="text-sm text-muted-foreground">{getDurationText()}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Practice Days</h4>
              <p className="text-sm text-muted-foreground">
                {practiceDays.map(day => capitalizeFirstLetter(day)).join(', ')}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Daily Reminder</h4>
              <p className="text-sm text-muted-foreground">{reminderTime}</p>
            </div>
          </div>
        </div>
        <DialogClose asChild>
          <Button className="w-full">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default PracticePlanDialog;
