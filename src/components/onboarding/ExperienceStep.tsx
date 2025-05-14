
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExperienceLevel, SessionDuration, useYoga } from "@/contexts/YogaContext";
import { Clock, Star, Timer } from "lucide-react";

const ExperienceStep = () => {
  const { experienceLevel, sessionDuration, setExperienceLevel, setSessionDuration, setCurrentStep } = useYoga();
  
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel | null>(experienceLevel);
  const [selectedDuration, setSelectedDuration] = useState<SessionDuration | null>(sessionDuration);
  
  const handleContinue = () => {
    if (selectedLevel) setExperienceLevel(selectedLevel);
    if (selectedDuration) setSessionDuration(selectedDuration);
    setCurrentStep(1);
  };

  const levelOptions: {label: string; value: ExperienceLevel; icon: JSX.Element; description: string}[] = [
    {
      label: "Beginner",
      value: "beginner",
      icon: <Star className="h-5 w-5" />,
      description: "New to yoga or returning after a break"
    },
    {
      label: "Intermediate",
      value: "intermediate",
      icon: <Star className="h-5 w-5" />,
      description: "Familiar with basic poses and flows"
    },
    {
      label: "Advanced",
      value: "advanced",
      icon: <Star className="h-5 w-5" />,
      description: "Experienced practitioner seeking challenges"
    }
  ];

  const durationOptions: {label: string; value: SessionDuration; icon: JSX.Element; description: string}[] = [
    {
      label: "Short",
      value: "short",
      icon: <Timer className="h-5 w-5" />,
      description: "0-10 minutes for quick sessions"
    },
    {
      label: "Medium",
      value: "medium",
      icon: <Clock className="h-5 w-5" />,
      description: "10-20 minutes for balanced practice"
    },
    {
      label: "Long",
      value: "long",
      icon: <Clock className="h-5 w-5" />,
      description: "20+ minutes for deep practice"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Tell us about yourself</h2>
        <p className="text-muted-foreground mb-6">
          We'll customize your yoga journey based on your experience and availability.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">What's your experience level?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {levelOptions.map((option) => (
              <Card 
                key={option.value}
                className={`cursor-pointer transition-all ${
                  selectedLevel === option.value 
                    ? "border-2 border-yoga-500 bg-yoga-100" 
                    : "hover:border-yoga-300"
                }`}
                onClick={() => setSelectedLevel(option.value)}
              >
                <div className="p-4 flex flex-col items-center text-center">
                  <div className={`rounded-full p-2 mb-2 ${
                    selectedLevel === option.value ? "bg-yoga-200" : "bg-muted"
                  }`}>
                    {option.icon}
                  </div>
                  <h4 className="font-medium">{option.label}</h4>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">How long can you practice each session?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {durationOptions.map((option) => (
              <Card 
                key={option.value}
                className={`cursor-pointer transition-all ${
                  selectedDuration === option.value 
                    ? "border-2 border-yoga-500 bg-yoga-100" 
                    : "hover:border-yoga-300"
                }`}
                onClick={() => setSelectedDuration(option.value)}
              >
                <div className="p-4 flex flex-col items-center text-center">
                  <div className={`rounded-full p-2 mb-2 ${
                    selectedDuration === option.value ? "bg-yoga-200" : "bg-muted"
                  }`}>
                    {option.icon}
                  </div>
                  <h4 className="font-medium">{option.label}</h4>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          className="w-full md:w-auto"
          size="lg"
          disabled={!selectedLevel || !selectedDuration}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ExperienceStep;
