# ManHunt Server

This is the backend server for the RealLife ManHunt application. It handles real-time location sharing between users.

## Features

- Real-time location updates via Socket.io
- Support for multiple game rooms with 6-digit codes
- Role-based filtering (hunters see hunters, targets see targets)
- Works across different networks and devices

## Getting Started

### Local Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on port 3001 by default.

### Deploying to the Cloud

For real-world use, you should deploy this server to a cloud provider:

#### Heroku Deployment
```bash
heroku create
git subtree push --prefix server heroku main
```

#### Railway Deployment
```bash
railway init
railway up
```

## Endpoints

- `GET /` - Health check
- `GET /stats` - Get statistics about active games and users

## Socket.io Events

### Client -> Server
- `joinGame` - Join a game room with user data
- `updatePosition` - Update user position
- `disconnect` - User disconnects (handled automatically)

### Server -> Client
- `updateUsers` - Sends the full list of users in a game
- `userJoined` - Notifies when a new user joins
- `userPositionUpdate` - Notifies when a user's position changes
- `userLeft` - Notifies when a user leaves 