
import { Button } from "@/components/ui/button";
import { ExperienceLevel } from "@/types/yoga";
import { useYoga } from "@/contexts/YogaContext";

const ExperienceStep = () => {
  const { experienceLevel, setExperienceLevel, setCurrentStep } = useYoga();

  const experienceLevels: { level: ExperienceLevel; label: string; description: string; bgColor: string }[] = [
    {
      level: "beginner",
      label: "Beginner",
      description: "New to yoga or returning after a break",
      bgColor: "bg-gradient-to-br from-blue-100 to-blue-200"
    },
    {
      level: "intermediate",
      label: "Intermediate", 
      description: "Regular practice with basic poses mastered",
      bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-200"
    },
    {
      level: "advanced",
      label: "Advanced",
      description: "Confident with complex poses and flows",
      bgColor: "bg-gradient-to-br from-orange-100 to-orange-200"
    }
  ];

  const sessionDurations = [
    { duration: "short", label: "8 minutes", description: "Quick daily practice", bgColor: "bg-gradient-to-br from-purple-100 to-purple-200" },
    { duration: "medium", label: "15 minutes", description: "Balanced session", bgColor: "bg-gradient-to-br from-purple-200 to-purple-300" },
    { duration: "long", label: "25 minutes", description: "Deep practice", bgColor: "bg-gradient-to-br from-purple-300 to-purple-400" }
  ];

  const { sessionDuration, setSessionDuration } = useYoga();

  const handleContinue = () => {
    setCurrentStep(1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-headline">Tell us about yourself</h2>
        <p className="text-muted-foreground mb-6">
          Let's customize your yoga journey based on your experience and available time.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4 text-headline">What's your experience level?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {experienceLevels.map((exp) => (
            <button
              key={exp.level}
              onClick={() => setExperienceLevel(exp.level)}
              className={`p-6 rounded-xl transition-all duration-200 border-2 shadow-sm hover:shadow-md hover:scale-105 ${
                experienceLevel === exp.level
                  ? `${exp.bgColor} border-primary shadow-lg scale-105`
                  : `${exp.bgColor} border-transparent hover:border-primary/30`
              }`}
            >
              <h4 className="font-semibold text-headline mb-2">{exp.label}</h4>
              <p className="text-sm text-headline/70">{exp.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4 text-headline">How long can you practice?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sessionDurations.map((session) => (
            <button
              key={session.duration}
              onClick={() => setSessionDuration(session.duration as any)}
              className={`p-6 rounded-xl transition-all duration-200 border-2 shadow-sm hover:shadow-md hover:scale-105 ${
                sessionDuration === session.duration
                  ? `${session.bgColor} border-primary shadow-lg scale-105`
                  : `${session.bgColor} border-transparent hover:border-primary/30`
              }`}
            >
              <h4 className="font-semibold text-headline mb-2">{session.label}</h4>
              <p className="text-sm text-headline/70">{session.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          disabled={!experienceLevel || !sessionDuration}
          onClick={handleContinue}
          className="bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ExperienceStep;
