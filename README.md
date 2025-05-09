# RealLife ManHunt

A real-time location tracking game where players can join as either hunters or targets. Players connect using a 6-digit code and can see other players of the same role on a map in real-time.

## Features

- Connect with other players using a 6-digit code
- Choose between hunter or target roles
- Real-time location tracking on map
- See other players of the same role on the map
- Hunters can see other hunters, but not targets
- Targets can see other targets, but not hunters

## Technology Stack

- Next.js (React framework)
- TypeScript
- Tailwind CSS for styling
- Leaflet for maps
- UUID for user identification

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

2. Install dependencies
```
npm install
# or
yarn install
```

3. Run the development server
```
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

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
   - You'll see yourself and other players of the same role on the map
   - The map updates in real-time as players move

## Notes

This is a demonstration application without a persistent backend. In a real-world implementation, it would include:

- Socket.io for real-time communication
- A database to store game sessions
- Authentication for users
- Additional game mechanics and rules

## Privacy

The application requires location access to function. Your location data is only shared with other players in your game session and is not stored permanently.

## License

MIT 