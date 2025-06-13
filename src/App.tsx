
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
import { useAuth } from "./hooks/use-auth";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2 text-headline">Loading...</h2>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2 text-headline">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
      } />
      <Route path="/" element={
        isAuthenticated ? <Index /> : <Navigate to="/login" />
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
