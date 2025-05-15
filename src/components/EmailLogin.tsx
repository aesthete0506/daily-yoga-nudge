
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase, UserDetail } from "@/lib/supabase";
import { useYoga } from "@/contexts/YogaContext";
import YogaCard from "./YogaCard";

const EmailLogin = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUserEmail } = useYoga();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from("user_details")
        .select()
        .eq("email", email)
        .single();

      // Store the email in context
      setUserEmail(email);
      
      if (existingUser) {
        // Existing user - load their data and redirect to dashboard
        toast.success("Welcome back!");
        navigate("/dashboard");
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
