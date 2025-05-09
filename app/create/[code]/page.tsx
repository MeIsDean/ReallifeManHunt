'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import map components dynamically to avoid SSR issues with Leaflet
const MapWithNoSSR = dynamic(() => import('@/components/Map'), {
  ssr: false,
});

type UserRole = 'hunter' | 'target';

export default function CreateGame() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('hunter');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // In a real app, we would set up socket.io connection here
  const startGame = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    setIsLoading(true);
    
    // In a real implementation, we would connect to a backend
    // For now we'll simulate joining by redirecting to the game page
    setTimeout(() => {
      router.push(`/game/${code}?username=${encodeURIComponent(username)}&role=${role}&isHost=true`);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-center mb-6">Create New Game</h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-md text-center">
          <p className="text-lg font-semibold">Your Game Code</p>
          <p className="text-3xl font-bold tracking-wider text-blue-600">{code}</p>
          <p className="text-sm text-gray-600 mt-2">Share this code with others to join your game</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
          </div>
          
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Select Your Role</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setRole('hunter')}
                className={`p-4 rounded-lg border ${
                  role === 'hunter'
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <span className="block text-lg font-medium">Hunter</span>
                <span className="text-sm">Search for targets</span>
              </button>
              <button
                onClick={() => setRole('target')}
                className={`p-4 rounded-lg border ${
                  role === 'target'
                    ? 'bg-red-100 border-red-500 text-red-700'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <span className="block text-lg font-medium">Target</span>
                <span className="text-sm">Hide from hunters</span>
              </button>
            </div>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <Link
              href="/"
              className="flex-1 p-3 border border-gray-300 text-gray-700 rounded-md text-center"
            >
              Cancel
            </Link>
            <button
              onClick={startGame}
              disabled={isLoading}
              className="flex-1 p-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
            >
              {isLoading ? 'Creating...' : 'Start Game'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 