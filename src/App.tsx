
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { YogaProvider } from "./contexts/YogaContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import { useYoga } from "./contexts/YogaContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const { userEmail } = useYoga();
  return userEmail ? element : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { userEmail } = useYoga();

  return (
    <Routes>
      <Route path="/login" element={userEmail ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/" element={
        userEmail ? 
          <Index /> : 
          <Navigate to="/login" />
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute element={<Dashboard />} />
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <YogaProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </YogaProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
