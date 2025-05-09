'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';

// Import Map component dynamically to prevent SSR issues with Leaflet
const MapWithNoSSR = dynamic(() => import('@/components/Map'), {
  ssr: false,
});

// In a real application, this would come from a backend
type User = {
  id: string;
  username: string;
  position: [number, number];
  role: 'hunter' | 'target';
};

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const code = params.code as string;
  const username = searchParams.get('username') || 'Anonymous';
  const role = (searchParams.get('role') as 'hunter' | 'target') || 'hunter';
  const isHost = searchParams.get('isHost') === 'true';
  
  const [users, setUsers] = useState<User[]>([]);
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([0, 0]);
  const [userId] = useState(uuidv4());
  const [isConnected, setIsConnected] = useState(true);

  // In a real application, this would use socket.io to connect to a backend
  useEffect(() => {
    // Simulate getting location and updating
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newPosition: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setCurrentPosition(newPosition);
          
          // Update the current user's position in the users array
          setUsers((prevUsers) => {
            const existingUserIndex = prevUsers.findIndex(user => user.id === userId);
            
            if (existingUserIndex >= 0) {
              // Update existing user
              const updatedUsers = [...prevUsers];
              updatedUsers[existingUserIndex] = {
                ...updatedUsers[existingUserIndex],
                position: newPosition,
              };
              return updatedUsers;
            } else {
              // Add current user
              return [
                ...prevUsers,
                {
                  id: userId,
                  username,
                  position: newPosition,
                  role,
                },
              ];
            }
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true }
      );
      
      // Simulate other users joining and moving (in a real app, this would come from sockets)
      const simulateOtherUsers = () => {
        // Only add simulated users if we're the host (for demo purposes)
        if (!isHost) return;
        
        const targetUsers = Array.from({ length: 2 }, (_, i) => ({
          id: `target-${i}`,
          username: `Target ${i + 1}`,
          position: [
            currentPosition[0] + (Math.random() - 0.5) * 0.01,
            currentPosition[1] + (Math.random() - 0.5) * 0.01,
          ] as [number, number],
          role: 'target' as const,
        }));
        
        const hunterUsers = Array.from({ length: 2 }, (_, i) => ({
          id: `hunter-${i}`,
          username: `Hunter ${i + 1}`,
          position: [
            currentPosition[0] + (Math.random() - 0.5) * 0.01,
            currentPosition[1] + (Math.random() - 0.5) * 0.01,
          ] as [number, number],
          role: 'hunter' as const,
        }));
        
        setUsers((prevUsers) => {
          // Filter out any existing simulated users and keep real users
          const realUsers = prevUsers.filter(user => user.id === userId);
          return [...realUsers, ...targetUsers, ...hunterUsers];
        });
      };
      
      // Only simulate after we have our own position
      if (currentPosition[0] !== 0 && currentPosition[1] !== 0) {
        simulateOtherUsers();
        
        // Move simulated users every few seconds
        const moveInterval = setInterval(() => {
          setUsers((prevUsers) => 
            prevUsers.map(user => {
              if (user.id === userId) return user; // Don't move the current user
              
              // Move other users randomly
              return {
                ...user,
                position: [
                  user.position[0] + (Math.random() - 0.5) * 0.001,
                  user.position[1] + (Math.random() - 0.5) * 0.001,
                ] as [number, number],
              };
            })
          );
        }, 3000);
        
        return () => {
          navigator.geolocation.clearWatch(watchId);
          clearInterval(moveInterval);
        };
      }
      
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [userId, username, role, isHost, currentPosition]);

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
        {isConnected ? (
          <MapWithNoSSR
            users={users}
            currentUserRole={role as 'hunter' | 'target'}
            currentUserId={userId}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Connecting to server...</p>
          </div>
        )}
      </div>
      
      <footer className="bg-gray-100 border-t p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              {users.filter(u => u.id !== userId && u.role === role).length} other {role}s online
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