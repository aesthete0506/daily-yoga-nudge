
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
import { Progress } from "@/components/ui/progress";
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
  const [asanaComplete, setAsanaComplete] = useState(false);
  const { toast } = useToast();
  const { completeDay } = useYoga();

  const currentAsana = dayContent[currentAsanaIndex];
  const isLastAsana = currentAsanaIndex === dayContent.length - 1;

  // Steps for each asana - would come from a database in a real app
  const asanaSteps = {
    "Mountain Pose": [
      "Stand with feet together",
      "Distribute weight evenly",
      "Arms at sides, palms forward",
      "Engage leg muscles",
      "Lengthen spine, relax shoulders"
    ],
    "Downward Dog": [
      "Begin on hands and knees",
      "Lift hips up and back",
      "Straighten legs (without locking knees)",
      "Press chest toward thighs",
      "Relax head, gaze at navel"
    ],
    "Child's Pose": [
      "Kneel on the floor, big toes touching",
      "Sit back on heels",
      "Extend arms forward",
      "Rest forehead on mat",
      "Breathe deeply and relax"
    ]
  };

  // Details for each asana
  const asanaDetails = {
    "Mountain Pose": "Improves posture, balance, and body awareness. Strengthens thighs, knees, and ankles while firming abdomen and buttocks.",
    "Downward Dog": "Energizes and rejuvenates the body. Stretches the hamstrings, calves, and shoulders while strengthening the arms and legs.",
    "Child's Pose": "Gentle resting pose that helps calm the brain and relieve stress. Elongates the back and helps relieve tension in the shoulders, chest, and lower back."
  };

  const handleStart = () => {
    setPracticeStarted(true);
  };

  const handleVideoEnd = () => {
    setAsanaComplete(true);
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
      setAsanaComplete(false);
      setPracticeStarted(false);
    }
  };

  const handleRepeat = () => {
    setAsanaComplete(false);
    setPracticeStarted(false);
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setCurrentAsanaIndex(0);
      setPracticeStarted(false);
      setAsanaComplete(false);
      setCompleted(false);
    }
  }, [open]);

  if (completed) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-white">
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
            className="bg-primary text-white hover:bg-primary/90"
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
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-headline">No Content Available</DialogTitle>
            <DialogDescription className="text-normal">No asanas found for Day {dayNumber}</DialogDescription>
          </DialogHeader>
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white">
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
                <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-white">
                  Steps
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-white">
                <h4 className="font-medium mb-2 text-headline">Steps for {currentAsana.asana_name}</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-normal">
                  {asanaSteps[currentAsana.asana_name as keyof typeof asanaSteps]?.map((step, i) => (
                    <li key={i}>{step}</li>
                  )) || <li>Steps not available</li>}
                </ol>
              </HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-white">
                  Details
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-white">
                <h4 className="font-medium mb-2 text-headline">About {currentAsana.asana_name}</h4>
                <p className="text-sm text-normal">
                  {currentAsana.benefits || asanaDetails[currentAsana.asana_name as keyof typeof asanaDetails] || "Details not available"}
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            {!practiceStarted ? (
              <Button 
                className="w-full bg-primary text-white hover:bg-primary/90" 
                onClick={handleStart}
              >
                Start Practice
              </Button>
            ) : !asanaComplete ? (
              <Button 
                className="w-full bg-primary text-white hover:bg-primary/90" 
                disabled
              >
                Practice in Progress...
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1 border-primary text-primary hover:bg-primary hover:text-white" 
                  onClick={handleRepeat}
                >
                  Repeat
                </Button>
                <Button 
                  className="flex-1 bg-primary text-white hover:bg-primary/90" 
                  onClick={handleNext}
                >
                  {isLastAsana ? "Complete" : "Next"}
                </Button>
              </div>
            )}
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center space-x-1">
            {dayContent.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-8 rounded-full ${i === currentAsanaIndex ? 'bg-primary' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AsanaPractice;
