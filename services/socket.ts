import { io, Socket } from 'socket.io-client';

// Socket.io event types
export type User = {
  id: string;
  username: string;
  position: [number, number];
  role: 'hunter' | 'target';
  distance?: number;
};

type JoinGameParams = {
  gameCode: string;
  userId: string;
  username: string;
  role: 'hunter' | 'target';
};

type PositionUpdate = {
  position: [number, number];
};

type UserJoinedEvent = {
  id: string;
  username: string;
  role: 'hunter' | 'target';
};

type UserPositionUpdateEvent = {
  id: string;
  position: [number, number];
};

// Socket client singleton
class SocketService {
  private socket: Socket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private serverUrl: string = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:3001';

  // Event callbacks
  private onConnectCallbacks: (() => void)[] = [];
  private onDisconnectCallbacks: (() => void)[] = [];
  private onUpdateUsersCallbacks: ((users: User[]) => void)[] = [];
  private onUserJoinedCallbacks: ((user: UserJoinedEvent) => void)[] = [];
  private onUserPositionUpdateCallbacks: ((update: UserPositionUpdateEvent) => void)[] = [];
  private onUserLeftCallbacks: ((userId: string) => void)[] = [];

  // Initialize and connect socket
  public connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io(this.serverUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
    return this.socket;
  }

  // Set up event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.onConnectCallbacks.forEach(callback => callback());
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.onDisconnectCallbacks.forEach(callback => callback());
      
      // Attempt to reconnect after some time
      this.reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect...');
        this.socket?.connect();
      }, 3000);
    });

    this.socket.on('updateUsers', (users: User[]) => {
      this.onUpdateUsersCallbacks.forEach(callback => callback(users));
    });

    this.socket.on('userJoined', (user: UserJoinedEvent) => {
      this.onUserJoinedCallbacks.forEach(callback => callback(user));
    });

    this.socket.on('userPositionUpdate', (update: UserPositionUpdateEvent) => {
      this.onUserPositionUpdateCallbacks.forEach(callback => callback(update));
    });

    this.socket.on('userLeft', (userId: string) => {
      this.onUserLeftCallbacks.forEach(callback => callback(userId));
    });
  }

  // Join a game room
  public joinGame(params: JoinGameParams): void {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket?.emit('joinGame', params);
  }

  // Update user position
  public updatePosition(position: [number, number]): void {
    this.socket?.emit('updatePosition', { position });
  }

  // Disconnect from server
  public disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  // Event listeners
  public onConnect(callback: () => void): () => void {
    this.onConnectCallbacks.push(callback);
    return () => {
      this.onConnectCallbacks = this.onConnectCallbacks.filter(cb => cb !== callback);
    };
  }

  public onDisconnect(callback: () => void): () => void {
    this.onDisconnectCallbacks.push(callback);
    return () => {
      this.onDisconnectCallbacks = this.onDisconnectCallbacks.filter(cb => cb !== callback);
    };
  }

  public onUpdateUsers(callback: (users: User[]) => void): () => void {
    this.onUpdateUsersCallbacks.push(callback);
    return () => {
      this.onUpdateUsersCallbacks = this.onUpdateUsersCallbacks.filter(cb => cb !== callback);
    };
  }

  public onUserJoined(callback: (user: UserJoinedEvent) => void): () => void {
    this.onUserJoinedCallbacks.push(callback);
    return () => {
      this.onUserJoinedCallbacks = this.onUserJoinedCallbacks.filter(cb => cb !== callback);
    };
  }

  public onUserPositionUpdate(callback: (update: UserPositionUpdateEvent) => void): () => void {
    this.onUserPositionUpdateCallbacks.push(callback);
    return () => {
      this.onUserPositionUpdateCallbacks = this.onUserPositionUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  public onUserLeft(callback: (userId: string) => void): () => void {
    this.onUserLeftCallbacks.push(callback);
    return () => {
      this.onUserLeftCallbacks = this.onUserLeftCallbacks.filter(cb => cb !== callback);
    };
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService; 