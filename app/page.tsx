'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [joinCode, setJoinCode] = useState('');
  
  const generateRandomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure only numbers are entered and limit to 6 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setJoinCode(value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">RealLife ManHunt</h1>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-center text-gray-700 mb-4">
              Connect with others and track locations in real-time
            </p>
            
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                value={joinCode}
                onChange={handleCodeChange}
                placeholder="Enter 6-digit code"
                className="p-3 border border-gray-300 rounded-md text-center text-lg"
                maxLength={6}
              />
              
              <Link 
                href={joinCode.length === 6 ? `/join/${joinCode}` : '#'} 
                className={`p-3 rounded-md text-white text-center font-medium ${joinCode.length === 6 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'}`}
              >
                Join Game
              </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <Link 
              href={`/create/${generateRandomCode()}`}
              className="block w-full p-3 bg-green-600 hover:bg-green-700 text-white text-center rounded-md font-medium"
            >
              Create New Game
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 