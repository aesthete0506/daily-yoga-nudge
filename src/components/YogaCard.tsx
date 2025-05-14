
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface YogaCardProps {
  children: ReactNode;
  className?: string;
}

const YogaCard = ({ children, className }: YogaCardProps) => {
  return (
    <div className={cn(
      "yoga-card rounded-xl shadow-lg p-6 md:p-8 max-w-2xl w-full mx-auto animate-fade-in",
      className
    )}>
      {children}
    </div>
  );
};

export default YogaCard;
