const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

// Create Socket.io server with CORS settings
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from any origin
    methods: ["GET", "POST"]
  }
});

// Store active games and users
const games = {};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join a game room
  socket.on('joinGame', ({ gameCode, userId, username, role }) => {
    console.log(`User ${username} (${userId}) joining game ${gameCode} as ${role}`);
    
    // Add user to game room
    socket.join(gameCode);
    
    // Initialize game if it doesn't exist
    if (!games[gameCode]) {
      games[gameCode] = { users: {} };
    }
    
    // Add user to game
    games[gameCode].users[userId] = {
      id: userId,
      username,
      role,
      position: [0, 0], // Default position
      socketId: socket.id
    };
    
    // Store user data in socket for quick reference
    socket.data.gameCode = gameCode;
    socket.data.userId = userId;
    
    // Emit updated user list to all clients in the game
    io.to(gameCode).emit('updateUsers', Object.values(games[gameCode].users));
    
    // Notify others that a new user joined
    socket.to(gameCode).emit('userJoined', {
      id: userId, 
      username, 
      role
    });
  });
  
  // Handle position updates
  socket.on('updatePosition', ({ position }) => {
    const { gameCode, userId } = socket.data;
    
    if (!gameCode || !userId || !games[gameCode] || !games[gameCode].users[userId]) {
      return;
    }
    
    // Update user position
    games[gameCode].users[userId].position = position;
    
    // Broadcast position update to all users in the same game
    socket.to(gameCode).emit('userPositionUpdate', {
      id: userId,
      position
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    const { gameCode, userId } = socket.data;
    
    if (gameCode && userId && games[gameCode] && games[gameCode].users[userId]) {
      // Remove user from game
      delete games[gameCode].users[userId];
      
      // Notify others that user left
      io.to(gameCode).emit('userLeft', userId);
      
      // Remove game if empty
      if (Object.keys(games[gameCode].users).length === 0) {
        delete games[gameCode];
        console.log(`Game ${gameCode} removed (no users left)`);
      } else {
        // Emit updated user list
        io.to(gameCode).emit('updateUsers', Object.values(games[gameCode].users));
      }
    }
    
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Health check route
app.get('/', (req, res) => {
  res.send('ManHunt server is running!');
});

// Get stats route
app.get('/stats', (req, res) => {
  const totalGames = Object.keys(games).length;
  const totalUsers = Object.values(games).reduce((sum, game) => 
    sum + Object.keys(game.users).length, 0);
  
  res.json({
    games: totalGames,
    users: totalUsers,
    gamesList: Object.keys(games).map(code => ({
      code,
      users: Object.keys(games[code].users).length
    }))
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 