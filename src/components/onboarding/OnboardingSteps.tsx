
import { useYoga } from "@/contexts/YogaContext";
import ExperienceStep from "./ExperienceStep";
import ReminderStep from "./ReminderStep";
import ScheduleStep from "./ScheduleStep";

const OnboardingSteps = () => {
  const { currentStep } = useYoga();

  return (
    <div>
      {currentStep === 0 && <ExperienceStep />}
      {currentStep === 1 && <ScheduleStep />}
      {currentStep === 2 && <ReminderStep />}
    </div>
  );
};

export default OnboardingSteps;
