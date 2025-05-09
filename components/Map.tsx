'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Define user types
interface User {
  id: string;
  username: string;
  position: [number, number]; // [latitude, longitude]
  role: 'hunter' | 'target';
}

// Fix Leaflet default icon issues in Next.js
const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to update the map view when location changes
function LocationUpdater({ position }: { position: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (position[0] !== 0 && position[1] !== 0) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  
  return null;
}

interface MapProps {
  users: User[];
  currentUserRole: 'hunter' | 'target';
  currentUserId: string;
}

export default function Map({ users, currentUserRole, currentUserId }: MapProps) {
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([0, 0]);
  const [hasLocation, setHasLocation] = useState(false);
  
  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const newPosition: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setCurrentPosition(newPosition);
          setHasLocation(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a location if geolocation fails
          setCurrentPosition([51.505, -0.09]); // London
          setHasLocation(true);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);
  
  if (!hasLocation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Getting your location...</p>
      </div>
    );
  }
  
  // Filter users based on role
  const visibleUsers = users.filter((user) => {
    // Always show the current user
    if (user.id === currentUserId) return true;
    
    // Show other users with the same role
    return user.role === currentUserRole;
  });
  
  return (
    <MapContainer
      center={currentPosition}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Update map center when current position changes */}
      <LocationUpdater position={currentPosition} />
      
      {visibleUsers.map((user) => (
        <Marker
          key={user.id}
          position={user.position}
          icon={
            user.id === currentUserId
              ? L.divIcon({
                  className: 'my-div-icon',
                  html: `<div class="h-6 w-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white font-bold text-xs">ME</div>`,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12],
                })
              : L.divIcon({
                  className: 'user-div-icon',
                  html: `<div class="h-6 w-6 rounded-full ${
                    user.role === 'hunter' ? 'bg-blue-500' : 'bg-red-500'
                  } border-2 border-white"></div>`,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12],
                })
          }
        >
          <Popup>{user.username}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
} 