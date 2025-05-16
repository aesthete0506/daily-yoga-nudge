import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import YogaCard from "./YogaCard";
import { useYoga } from "@/contexts/YogaContext";

const EmailLogin = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();
  const { experienceLevel } = useYoga();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const isExistingUser = await auth.login(email);
      
      if (isExistingUser && experienceLevel) {
        // Existing user with preferences - redirect to dashboard
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else if (isExistingUser) {
        // Existing user without complete preferences - redirect to onboarding
        toast.success("Welcome back! Let's complete your profile");
        navigate("/");
      } else {
        // New user - redirect to onboarding
        toast.success("Welcome! Let's set up your practice");
        navigate("/");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <YogaCard>
      <CardHeader className="text-center">
        <CardTitle>Welcome to YourDOST Guided Yoga</CardTitle>
        <CardDescription>
          Enter your email to continue your yoga journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Continue"}
          </Button>
        </form>
      </CardContent>
    </YogaCard>
  );
};

export default EmailLogin;
