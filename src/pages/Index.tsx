
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import YogaCard from "@/components/YogaCard";
import OnboardingSteps from "@/components/onboarding/OnboardingSteps";
import { useYoga } from "@/contexts/YogaContext";

const Index = () => {
  const { currentStep, setCurrentStep } = useYoga();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#ebf3f3' }}>
      <header className="w-full py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-3xl">
          {currentStep === -1 ? (
            <YogaCard>
              <div className="text-center space-y-6">
                <h1 className="text-3xl font-bold" style={{ color: '#2d2857' }}>Welcome to YourDOST Guided Yoga</h1>
                <p className="text-lg text-muted-foreground">
                  Ready to build a practice that fits your life? We'll guide you step-by-step.
                </p>

                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold" style={{ color: '#2d2857' }}>1. Tell us about yourself</h2>
                    <p className="text-muted-foreground">
                      – What's your experience level? (Beginner / Intermediate / Advanced)<br />
                      – How long can you practice each session? (0–10 min / 10–20 min / 20+ min)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold" style={{ color: '#2d2857' }}>2. Pick your days</h2>
                    <p className="text-muted-foreground">
                      Choose which days of the week you'd like to show up on your mat.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold" style={{ color: '#2d2857' }}>3. Set a daily reminder</h2>
                    <p className="text-muted-foreground">
                      Select a time to receive a gentle nudge—so you never miss a session.
                    </p>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="mt-4"
                  style={{ 
                    backgroundColor: '#eb644c', 
                    color: '#ffffff',
                    border: 'none'
                  }}
                  onClick={() => setCurrentStep(0)}
                >
                  Let's Begin
                </Button>
                
                <p className="text-muted-foreground pt-2">
                  Your path to strength, flexibility, and calm awaits.
                </p>
              </div>
            </YogaCard>
          ) : (
            <YogaCard>
              <OnboardingSteps />
            </YogaCard>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
