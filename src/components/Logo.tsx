
export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <img 
        src="https://d2w4fhi5bhd90e.cloudfront.net/new-appointment-flow/yd-logo.png" 
        alt="YourDOST Logo" 
        className="h-8 w-auto"
        onError={(e) => {
          // Fallback if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <span className="text-2xl font-bold text-headline hidden">YourDOST</span>
    </div>
  );
};
