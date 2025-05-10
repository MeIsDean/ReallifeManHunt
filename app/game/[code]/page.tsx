'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';
import TeammatesList from '../../../components/TeammatesList';
import socketService, { User } from '@/services/socket';

// Import Map component dynamically to prevent SSR issues with Leaflet
const MapWithNoSSR = dynamic(() => import('@/components/Map'), {
  ssr: false,
});

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const code = params.code as string;
  const username = searchParams.get('username') || 'Anonymous';
  const role = (searchParams.get('role') as 'hunter' | 'target') || 'hunter';
  const isHost = searchParams.get('isHost') === 'true';
  
  const [users, setUsers] = useState<User[]>([]);
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([0, 0]);
  const [userId] = useState(() => searchParams.get('userId') || uuidv4());
  const [isConnected, setIsConnected] = useState(false);
  const [nearbyTeammates, setNearbyTeammates] = useState<User[]>([]);
  const [showTeammatesList, setShowTeammatesList] = useState(false);
  const [trackedTeammateId, setTrackedTeammateId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Set up socket connection
  useEffect(() => {
    try {
      // Connect to socket server
      const socket = socketService.connect();
      
      // Set up connection status handlers
      const unsubscribeConnect = socketService.onConnect(() => {
        setIsConnected(true);
        setConnectionError(null);
        
        // Join game room
        socketService.joinGame({
          gameCode: code,
          userId,
          username,
          role
        });
      });
      
      const unsubscribeDisconnect = socketService.onDisconnect(() => {
        setIsConnected(false);
      });
      
      // Set up user updates handlers
      const unsubscribeUpdateUsers = socketService.onUpdateUsers((updatedUsers) => {
        setUsers(prevUsers => {
          // Preserve distance calculations if they exist
          const userMap = new Map(prevUsers.map(user => [user.id, user]));
          
          return updatedUsers.map(user => ({
            ...user,
            distance: userMap.get(user.id)?.distance
          }));
        });
      });
      
      const unsubscribeUserJoined = socketService.onUserJoined((user) => {
        setUsers(prevUsers => {
          // Avoid duplicates
          if (prevUsers.some(u => u.id === user.id)) {
            return prevUsers;
          }
          return [...prevUsers, { ...user, position: [0, 0] }];
        });
      });
      
      const unsubscribeUserPositionUpdate = socketService.onUserPositionUpdate((update) => {
        setUsers(prevUsers => {
          return prevUsers.map(user => {
            if (user.id === update.id) {
              return { ...user, position: update.position };
            }
            return user;
          });
        });
      });
      
      const unsubscribeUserLeft = socketService.onUserLeft((userId) => {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      });
      
      // Clean up on unmount
      return () => {
        unsubscribeConnect();
        unsubscribeDisconnect();
        unsubscribeUpdateUsers();
        unsubscribeUserJoined();
        unsubscribeUserPositionUpdate();
        unsubscribeUserLeft();
        socketService.disconnect();
      };
    } catch (error) {
      console.error('Socket connection error:', error);
      setConnectionError('Failed to connect to the game server. Please try again later.');
      return () => {};
    }
  }, [code, userId, username, role]);

  // Set up geolocation tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setConnectionError('Geolocation is not supported by your browser. Please use a different device.');
      return;
    }
    
    // Add current user to users list
    setUsers(prevUsers => {
      if (!prevUsers.some(user => user.id === userId)) {
        return [
          ...prevUsers,
          {
            id: userId,
            username,
            position: [0, 0],
            role,
          }
        ];
      }
      return prevUsers;
    });
    
    // Watch position
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        
        setCurrentPosition(newPosition);
        
        // Update users list with current position
        setUsers(prevUsers => {
          return prevUsers.map(user => {
            if (user.id === userId) {
              return { ...user, position: newPosition };
            }
            return user;
          });
        });
        
        // Send position update to server if connected
        if (isConnected) {
          socketService.updatePosition(newPosition);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setConnectionError('Location permission denied. Please enable location services to play.');
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
    
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [userId, username, role, isConnected]);

  // Calculate nearby teammates (within 500 meters) and update all teammate distances
  useEffect(() => {
    if (currentPosition[0] === 0 && currentPosition[1] === 0) return;
    
    const updatedUsers = users.map(user => {
      if (user.id === userId) return user;
      
      const distance = calculateDistance(
        currentPosition[0], 
        currentPosition[1], 
        user.position[0], 
        user.position[1]
      );
      
      return {
        ...user,
        distance
      };
    });
    
    setUsers(updatedUsers);
    
    const teammates = updatedUsers.filter(user => 
      user.id !== userId && 
      user.role === role
    );
    
    // Calculate nearby teammates (within ~500 meters)
    const nearby = teammates.filter(teammate => {
      return (teammate.distance || Infinity) < 0.5; // 0.5 km = 500 meters
    });
    
    setNearbyTeammates(nearby);
  }, [users.map(u => u.position.join(',')).join(','), currentPosition, userId, role]);
  
  // Haversine formula to calculate distance in kilometers between two coordinates
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in kilometers
    return distance;
  }
  
  function deg2rad(deg: number) {
    return deg * (Math.PI/180);
  }
  
  // Track a teammate
  const handleTrackTeammate = (teammateId: string) => {
    setTrackedTeammateId(teammateId === trackedTeammateId ? null : teammateId);
  };

  // Get teammates (other users with the same role)
  const teammates = users.filter(user => user.id !== userId && user.role === role);

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">ManHunt</h1>
            <p className="text-sm">Code: {code}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">{username}</p>
            <p className="text-xs uppercase">
              Role: <span className={role === 'hunter' ? 'text-blue-200' : 'text-red-200'}>{role}</span>
            </p>
          </div>
        </div>
      </header>
      
      <div className="flex-1 relative">
        {connectionError ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md text-center">
              <p className="font-bold mb-2">Connection Error</p>
              <p>{connectionError}</p>
            </div>
          </div>
        ) : (
          <>
            <MapWithNoSSR
              users={users}
              currentUserRole={role as 'hunter' | 'target'}
              currentUserId={userId}
            />
            
            {showTeammatesList && (
              <div className="absolute right-4 top-4 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-[1000]">
                <div className="flex justify-between items-center p-2 border-b">
                  <h3 className="font-medium">Teammates</h3>
                  <button 
                    onClick={() => setShowTeammatesList(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <TeammatesList 
                  teammates={teammates} 
                  currentPosition={currentPosition}
                  onTrackTeammate={handleTrackTeammate}
                />
              </div>
            )}
            
            {!showTeammatesList && teammates.length > 0 && (
              <button
                onClick={() => setShowTeammatesList(true)}
                className="absolute right-4 top-4 bg-white p-2 rounded-full shadow-lg z-[1000]"
              >
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    {teammates.length}
                  </div>
                </div>
              </button>
            )}
            
            {trackedTeammateId && (
              <div className="absolute left-4 bottom-20 bg-yellow-100 p-2 rounded-lg shadow-md z-[1000] border border-yellow-200">
                <div className="flex items-center">
                  <p className="text-sm text-yellow-800 mr-2">
                    Tracking: {users.find(u => u.id === trackedTeammateId)?.username}
                  </p>
                  <button 
                    onClick={() => setTrackedTeammateId(null)}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Stop
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {nearbyTeammates.length > 0 && (
        <div className="bg-yellow-100 p-3 border-t border-yellow-200">
          <p className="text-sm font-medium text-yellow-800">
            {nearbyTeammates.length} teammate{nearbyTeammates.length > 1 ? 's' : ''} nearby (within 500m)!
          </p>
        </div>
      )}
      
      <footer className="bg-gray-100 border-t p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              {teammates.length} teammate{teammates.length !== 1 ? 's' : ''} online
            </p>
          </div>
          <div>
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} inline-block mr-2`}></div>
            <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
} 