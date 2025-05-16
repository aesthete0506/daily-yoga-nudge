
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useYogaPoses } from '@/hooks/use-yoga-poses';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const UserYogaPoses = () => {
  const { poses, isLoading, error, refreshPoses } = useYogaPoses();

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Yoga Poses</CardTitle>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={refreshPoses}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center p-4">
            <span className="loading">Loading poses...</span>
          </div>
        )}
        
        {error && (
          <div className="text-center text-red-500 p-4">
            {error}
          </div>
        )}
        
        {!isLoading && !error && poses.length === 0 && (
          <div className="text-center text-muted-foreground p-4">
            No yoga poses found. Start practicing to see poses here!
          </div>
        )}
        
        {poses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {poses.map((pose) => (
              <Card key={pose.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  {pose.pose_image && (
                    <img 
                      src={pose.pose_image} 
                      alt={pose.pose_name} 
                      className="object-cover w-full h-full"
                    />
                  )}
                  {/* Important: No video elements here, only showing images in the dashboard */}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium">{pose.pose_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pose.pose_description?.substring(0, 60)}
                    {pose.pose_description && pose.pose_description.length > 60 ? '...' : ''}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserYogaPoses;
