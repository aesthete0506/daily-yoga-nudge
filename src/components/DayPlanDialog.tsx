
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
import { useState, useEffect } from "react";
import AsanaPractice from "./AsanaPractice";
import { getDayContent, ContentLibrary } from "@/lib/supabase";

interface DayPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayNumber?: number;
}

const DayPlanDialog = ({ open, onOpenChange, dayNumber }: DayPlanDialogProps) => {
  const [startPractice, setStartPractice] = useState(false);
  const { sessionDuration, getCurrentDay, experienceLevel } = useYoga();
  const [dayContent, setDayContent] = useState<ContentLibrary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use provided dayNumber or current day
  const currentDayNumber = dayNumber || getCurrentDay();

  // Load day content when dialog opens
  useEffect(() => {
    const loadDayContent = async () => {
      if (!experienceLevel || !open) return;
      
      setIsLoading(true);
      try {
        const content = await getDayContent(currentDayNumber, experienceLevel);
        setDayContent(content);
      } catch (error) {
        console.error('Error loading day content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDayContent();
  }, [currentDayNumber, experienceLevel, open]);

  // Calculate total time based on session duration
  const getTotalTime = () => {
    return sessionDuration || 15; // Default to 15 minutes
  };

  if (startPractice) {
    return <AsanaPractice 
      open={open} 
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) setStartPractice(false);
      }} 
      dayNumber={currentDayNumber} 
      dayContent={dayContent}
    />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-headline">Day {currentDayNumber} Practice</DialogTitle>
          <DialogDescription className="text-normal">Your personalized practice for today</DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-normal">Loading your practice...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-headline">Goal of the Day</h4>
              <p className="text-sm text-normal">
                {dayContent[0]?.benefits || 'Improve flexibility and reduce stress'}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-headline">Muscles Impacted</h4>
              <p className="text-sm text-normal">
                {dayContent[0]?.muscles_impacted || 'Full Body'}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-headline">Asanas</h4>
              <ul className="text-sm text-normal space-y-1">
                {dayContent.map((content, index) => (
                  <li key={index}>{content.asana_name}</li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-headline">Total Time Required</h4>
              <p className="text-sm text-normal">{getTotalTime()} minutes</p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <Button 
            onClick={() => setStartPractice(true)}
            className="btn-primary"
            disabled={isLoading || dayContent.length === 0}
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
