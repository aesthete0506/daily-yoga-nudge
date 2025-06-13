
import { Button } from "@/components/ui/button";
import { WeekDay } from "@/types/yoga";
import { useYoga } from "@/contexts/YogaContext";
import { useState } from "react";

const ScheduleStep = () => {
  const { practiceDays, togglePracticeDay, setCurrentStep } = useYoga();
  
  const days: { label: string; value: WeekDay }[] = [
    { label: "Mon", value: "monday" },
    { label: "Tue", value: "tuesday" },
    { label: "Wed", value: "wednesday" },
    { label: "Thur", value: "thursday" },
    { label: "Fri", value: "friday" },
    { label: "Sat", value: "saturday" },
    { label: "Sun", value: "sunday" },
  ];

  const handleContinue = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Pick your days</h2>
        <p className="text-muted-foreground mb-6">
          Choose which days of the week you'd like to show up on your mat.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {days.map((day) => (
          <button
            key={day.value}
            onClick={() => togglePracticeDay(day.value)}
            className={`p-4 rounded-lg transition-all font-medium 
              ${practiceDays.includes(day.value)
                ? "bg-yoga-500 text-white shadow-md" 
                : "bg-muted hover:bg-yoga-100"
              }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button 
          disabled={practiceDays.length === 0}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ScheduleStep;
