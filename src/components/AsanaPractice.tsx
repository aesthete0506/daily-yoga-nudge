
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
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useYoga } from "@/contexts/YogaContext";
import YogaVideoPlayer from "./YogaVideoPlayer";
import { VideoFile, getVideoFiles } from "@/lib/supabase";

interface Asana {
  name: string;
  duration: string;
}

interface AsanaPracticeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayNumber: number;
  asanas: Asana[];
}

const AsanaPractice = ({ open, onOpenChange, dayNumber, asanas }: AsanaPracticeProps) => {
  const [currentAsanaIndex, setCurrentAsanaIndex] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(2); // 2 seconds for testing
  const [completed, setCompleted] = useState(false);
  const [asanaComplete, setAsanaComplete] = useState(false);
  const [videoData, setVideoData] = useState<VideoFile | null>(null);
  const { toast } = useToast();
  const { completeDay, experienceLevel } = useYoga();

  const currentAsana = asanas[currentAsanaIndex];
  const isLastAsana = currentAsanaIndex === asanas.length - 1;

  // Load video data for the current asana
  useEffect(() => {
    const loadVideoData = async () => {
      if (!currentAsana) return;
      
      try {
        // Get video data for current pose
        const videos = await getVideoFiles(experienceLevel as any);
        const video = videos.find(v => v.pose_name === currentAsana.name);
        setVideoData(video || null);
      } catch (error) {
        console.error("Error loading video:", error);
      }
    };

    if (open) {
      loadVideoData();
    }
  }, [currentAsana, experienceLevel, open]);

  // Steps for each asana - would come from a database in a real app
  const asanaSteps = {
    "Mountain Pose (Tadasana)": [
      "Stand with feet together",
      "Distribute weight evenly",
      "Arms at sides, palms forward",
      "Engage leg muscles",
      "Lengthen spine, relax shoulders"
    ],
    "Downward Dog (Adho Mukha Svanasana)": [
      "Begin on hands and knees",
      "Lift hips up and back",
      "Straighten legs (without locking knees)",
      "Press chest toward thighs",
      "Relax head, gaze at navel"
    ],
    "Child's Pose (Balasana)": [
      "Kneel on the floor, big toes touching",
      "Sit back on heels",
      "Extend arms forward",
      "Rest forehead on mat",
      "Breathe deeply and relax"
    ]
  };

  // Details for each asana
  const asanaDetails = {
    "Mountain Pose (Tadasana)": "Improves posture, balance, and body awareness. Strengthens thighs, knees, and ankles while firming abdomen and buttocks.",
    "Downward Dog (Adho Mukha Svanasana)": "Energizes and rejuvenates the body. Stretches the hamstrings, calves, and shoulders while strengthening the arms and legs.",
    "Child's Pose (Balasana)": "Gentle resting pose that helps calm the brain and relieve stress. Elongates the back and helps relieve tension in the shoulders, chest, and lower back."
  };

  useEffect(() => {
    let timer: number;
    if (timerActive && timeRemaining > 0) {
      timer = window.setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeRemaining === 0) {
      setTimerActive(false);
      setAsanaComplete(true);
    }
    return () => clearTimeout(timer);
  }, [timerActive, timeRemaining]);

  const handleStart = () => {
    setTimerActive(true);
  };

  const handleStop = () => {
    setTimerActive(false);
  };

  const handleNext = () => {
    if (isLastAsana) {
      // Complete the practice
      setCompleted(true);
      
      // Update progress stats - 0.1 minutes per asana (6 seconds) for testing
      completeDay(dayNumber, asanas.length, asanas.length * 0.1);
      
      toast({
        title: "Congratulations!",
        description: "You've completed your yoga practice for today.",
      });

      // In a real app, you would update the user's progress here
      setTimeout(() => {
        onOpenChange(false); // Close dialog after completion
      }, 3000);
    } else {
      // Move to next asana
      setCurrentAsanaIndex(prev => prev + 1);
      setTimeRemaining(2); // Reset to 2 seconds for testing
      setAsanaComplete(false);
    }
  };

  const handleRepeat = () => {
    setTimeRemaining(2); // Reset to 2 seconds for testing
    setAsanaComplete(false);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (completed) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Practice Complete!</DialogTitle>
            <DialogDescription>Day {dayNumber} completed successfully</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Thanks for doing it today!</h3>
            <p className="text-center text-muted-foreground">
              Your yoga is done for today. Come back tomorrow to continue your journey.
            </p>
          </div>
          <Button onClick={() => onOpenChange(false)}>Return to Dashboard</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Day {dayNumber} - {currentAsana.name}</DialogTitle>
          <DialogDescription>Complete each pose to progress</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Video display - only shows in practice mode, uses the YogaVideoPlayer component */}
          <YogaVideoPlayer video={videoData} />

          {/* Hover buttons */}
          <div className="flex space-x-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="outline" className="flex-1">Steps</Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <h4 className="font-medium mb-2">Steps for {currentAsana.name}</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {asanaSteps[currentAsana.name as keyof typeof asanaSteps]?.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="outline" className="flex-1">Details</Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <h4 className="font-medium mb-2">About {currentAsana.name}</h4>
                <p className="text-sm">
                  {asanaDetails[currentAsana.name as keyof typeof asanaDetails]}
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* Timer display */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Time Remaining</span>
              <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
            </div>
            <Progress value={(timeRemaining / 2) * 100} className="h-2" />
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            {!asanaComplete ? (
              <Button 
                className="w-full" 
                onClick={timerActive ? handleStop : handleStart}
              >
                {timerActive ? "Stop" : "Start"}
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1" onClick={handleRepeat}>
                  Repeat
                </Button>
                <Button className="flex-1" onClick={handleNext}>
                  {isLastAsana ? "Complete" : "Next"}
                </Button>
              </div>
            )}
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center space-x-1">
            {asanas.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-8 rounded-full ${i === currentAsanaIndex ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AsanaPractice;
