
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Mail } from 'lucide-react';

interface SignInScreenProps {
  onSignIn: (email: string) => void;
}

const SignInScreen = ({ onSignIn }: SignInScreenProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate a brief loading state for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      onSignIn(email.trim().toLowerCase());
      toast.success('Welcome! Let\'s set up your yoga journey.');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-sm border-0">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-headline">Welcome to YourDOST</CardTitle>
        <p className="text-muted-foreground">Enter your email to start your yoga journey</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-headline">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 border-gray-200 focus:border-primary"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <Button 
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full bg-primary text-white hover:opacity-90 transition-opacity"
        >
          {isLoading ? 'Signing In...' : 'Continue'}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to start your personalized 30-day yoga journey with us.
        </p>
      </CardContent>
    </Card>
  );
};

export default SignInScreen;
