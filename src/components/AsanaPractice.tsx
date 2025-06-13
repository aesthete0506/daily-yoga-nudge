
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useYoga } from "@/contexts/YogaContext";
import YogaVideoPlayer from "./YogaVideoPlayer";
import { ContentLibrary } from "@/lib/supabase";

interface AsanaPracticeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayNumber: number;
  dayContent: ContentLibrary[];
}

const AsanaPractice = ({ open, onOpenChange, dayNumber, dayContent }: AsanaPracticeProps) => {
  const [currentAsanaIndex, setCurrentAsanaIndex] = useState(0);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();
  const { completeDay } = useYoga();

  const currentAsana = dayContent[currentAsanaIndex];
  const isLastAsana = currentAsanaIndex === dayContent.length - 1;

  const handleStart = () => {
    setPracticeStarted(true);
  };

  const handleVideoEnd = () => {
    // Auto-advance handled by video player
  };

  const handleNext = () => {
    if (isLastAsana) {
      // Complete the practice
      setCompleted(true);
      
      // Calculate total practice time based on video durations
      const totalTime = dayContent.reduce((sum, content) => sum + (content.video_duration || 180), 0);
      const totalMinutes = totalTime / 60;
      
      completeDay(dayNumber, dayContent.length, totalMinutes);
      
      toast({
        title: "Congratulations!",
        description: "You've completed your yoga practice for today.",
      });

      setTimeout(() => {
        onOpenChange(false);
      }, 3000);
    } else {
      // Move to next asana
      setCurrentAsanaIndex(prev => prev + 1);
      setPracticeStarted(true); // Auto-start next video
    }
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setCurrentAsanaIndex(0);
      setPracticeStarted(false);
      setCompleted(false);
    }
  }, [open]);

  if (completed) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-headline">Practice Complete!</DialogTitle>
            <DialogDescription className="text-normal">Day {dayNumber} completed successfully</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-headline">Thanks for doing it today!</h3>
            <p className="text-center text-normal">
              Your yoga is done for today. Come back tomorrow to continue your journey.
            </p>
          </div>
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg"
          >
            Return to Dashboard
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  if (!currentAsana) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-headline">No Content Available</DialogTitle>
            <DialogDescription className="text-normal">No asanas found for Day {dayNumber}</DialogDescription>
          </DialogHeader>
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-headline">Day {dayNumber} - {currentAsana.asana_name}</DialogTitle>
          <DialogDescription className="text-normal">Complete each pose to progress</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Video display */}
          <YogaVideoPlayer 
            content={currentAsana} 
            autoPlay={practiceStarted}
            onVideoEnd={handleVideoEnd}
            onNext={handleNext}
            showNextButton={true}
          />

          {/* Hover buttons */}
          <div className="flex space-x-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-lg">
                  Steps
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-white rounded-xl shadow-lg">
                <h4 className="font-medium mb-2 text-headline">Steps for {currentAsana.asana_name}</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-normal">
                  {currentAsana.pose_steps?.map((step, i) => (
                    <li key={i}>{step}</li>
                  )) || <li>Follow the video instructions</li>}
                </ol>
              </HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-lg">
                  Details
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-white rounded-xl shadow-lg">
                <h4 className="font-medium mb-2 text-headline">About {currentAsana.asana_name}</h4>
                <div className="space-y-2 text-sm text-normal">
                  {currentAsana.benefits && (
                    <div>
                      <p className="font-medium text-headline">Benefits:</p>
                      <p>{currentAsana.benefits}</p>
                    </div>
                  )}
                  {currentAsana.muscles_impacted && (
                    <div>
                      <p className="font-medium text-headline">Muscles Targeted:</p>
                      <p>{currentAsana.muscles_impacted}</p>
                    </div>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            {!practiceStarted ? (
              <Button 
                className="w-full bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg" 
                onClick={handleStart}
              >
                Start Practice
              </Button>
            ) : (
              <Button 
                className="w-full bg-primary text-white transition-colors rounded-lg" 
                disabled
              >
                Practice in Progress... (Auto-advancing)
              </Button>
            )}
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center space-x-1">
            {dayContent.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-8 rounded-full transition-colors ${
                  i === currentAsanaIndex ? 'bg-primary' : 
                  i < currentAsanaIndex ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AsanaPractice;
