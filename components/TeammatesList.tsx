'use client';

interface User {
  id: string;
  username: string;
  position: [number, number]; // [latitude, longitude]
  role: 'hunter' | 'target';
  distance?: number; // Distance from current user in km
}

interface TeammatesListProps {
  teammates: User[];
  currentPosition: [number, number];
  onTrackTeammate: (teammateId: string) => void;
}

export default function TeammatesList({ 
  teammates, 
  currentPosition, 
  onTrackTeammate 
}: TeammatesListProps) {
  // Sort teammates by distance
  const sortedTeammates = [...teammates].sort((a, b) => {
    return (a.distance || Infinity) - (b.distance || Infinity);
  });

  if (teammates.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No teammates online
      </div>
    );
  }

  return (
    <div className="p-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Teammates</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {sortedTeammates.map((teammate) => (
          <div
            key={teammate.id}
            className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm border border-gray-100"
          >
            <div className="flex items-center">
              <div className={`h-8 w-8 rounded-full ${teammate.role === 'hunter' ? 'bg-blue-500' : 'bg-red-500'} flex items-center justify-center text-white font-bold text-xs mr-2`}>
                {teammate.username.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-sm">{teammate.username}</p>
                <p className="text-xs text-gray-500">
                  {teammate.distance 
                    ? teammate.distance < 1 
                      ? `${Math.round(teammate.distance * 1000)}m away` 
                      : `${teammate.distance.toFixed(1)}km away`
                    : 'Calculating...'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onTrackTeammate(teammate.id)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
            >
              Track
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 