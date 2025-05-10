# RealLife ManHunt

A real-time location tracking game where players can join as either hunters or targets. Players connect using a 6-digit code and can see other players of the same role on a map in real-time.

## Features

- Connect with other players using a 6-digit code
- Choose between hunter or target roles
- Real-time location tracking on map
- See your teammates (players with the same role) on the map
- Track specific teammates with the tracking feature
- Get notifications when teammates are nearby
- Hunters can see other hunters, but not targets
- Targets can see other targets, but not hunters
- Works across different networks (no need to be on the same WiFi)

## Technology Stack

- **Frontend**
  - Next.js (React framework)
  - TypeScript
  - Tailwind CSS for styling
  - Leaflet for maps
  - Socket.io client for real-time communication
  - UUID for user identification

- **Backend**
  - Node.js with Express
  - Socket.io for real-time communication
  - Cors for cross-origin resource sharing

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/reallife-manhunt.git
cd reallife-manhunt
```

2. Install frontend dependencies
```
npm install
# or
yarn install
```

3. Install backend dependencies
```
cd server
npm install
cd ..
```

### Running the Application

1. Start the backend server first
```
cd server
npm start
```

2. In a different terminal, start the frontend
```
npm run dev
# or
yarn dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Environment Setup

Create a `.env.local` file in the root directory with:
```
NEXT_PUBLIC_SOCKET_SERVER=http://localhost:3001
```

When deploying, change this to your actual server URL.

## How to Play

1. **Create a Game**
   - Click on "Create New Game"
   - Choose your role (Hunter or Target)
   - Share your 6-digit code with other players

2. **Join a Game**
   - Enter the 6-digit code provided by the game creator
   - Choose your role (Hunter or Target)
   - Click "Join Game"

3. **During the Game**
   - Allow the browser to access your location
   - You'll see yourself and your teammates on the map
   - Click the teammate counter in the top-right to see a list of all teammates
   - Click "Track" on a teammate to keep track of their movements
   - You'll receive notifications when teammates are nearby (within 500m)
   - The map updates in real-time as players move

## Deployment Options

### Frontend Deployment

#### Vercel (Recommended)
```bash
vercel
```

#### Netlify
```bash
netlify deploy
```

### Backend Deployment

The backend server needs to be deployed separately to ensure real-time communication works.

#### Heroku
```bash
cd server
heroku create
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### Railway
```bash
railway up
```

### Important Deployment Notes

1. Make sure to update `.env.local` with your deployed backend URL
2. Ensure your server allows WebSocket connections
3. Test your deployment with multiple devices

## Privacy

The application requires location access to function. Your location data is only shared with other players in your game session and is not stored permanently.

## License

MIT 