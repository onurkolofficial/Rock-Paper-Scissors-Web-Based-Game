import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const app = express();
const PORT = 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

interface Player {
  socketId: string;
  name: string;
  move: string | null;
  score: number;
}

interface Room {
  id: string;
  players: Record<string, Player>;
  status: 'waiting' | 'playing' | 'result' | 'game_over';
  round: number;
  draws: number;
  roundTimeoutId?: NodeJS.Timeout;
  isPrivate?: boolean;
}

const rooms: Record<string, Room> = {};
const playerRoomMap = new Map<string, string>(); // socketId -> roomId

let onlinePlayerCount = 0;

const getOutcome = (m1: string, m2: string): 'win' | 'lose' | 'draw' => {
  if (m1 === m2) return 'draw';
  if (
    (m1 === 'rock' && m2 === 'scissors') ||
    (m1 === 'paper' && m2 === 'rock') ||
    (m1 === 'scissors' && m2 === 'paper') ||
    (m1 === 'iron' && (m2 === 'rock' || m2 === 'scissors')) ||
    (m2 === 'iron' && m1 === 'paper')
  ) {
    return 'win';
  }
  return 'lose';
};

const evaluateRound = (roomId: string, isTimeout: boolean = false) => {
  console.log(`Evaluating round for room ${roomId}, isTimeout: ${isTimeout}`);
  const room = rooms[roomId];
  if (!room) {
    console.log(`Room not found: ${roomId}`);
    return;
  }

  if (room.status !== 'playing') {
    console.log(`Room not playing: ${roomId}`);
    return;
  }

  if (room.roundTimeoutId) {
    clearTimeout(room.roundTimeoutId);
    room.roundTimeoutId = undefined;
  }

  const playerIds = Object.keys(room.players);
  if (playerIds.length !== 2) {
    console.log(`Room does not have 2 players: ${roomId}`);
    return;
  }
  
  const p1 = room.players[playerIds[0]];
  const p2 = room.players[playerIds[1]];
  
  console.log(`Player 1 move: ${p1.move}, Player 2 move: ${p2.move}`);

  room.status = 'result';

  let p1Outcome: 'win' | 'lose' | 'draw' = 'draw';
  
  if (isTimeout && (!p1.move || !p2.move)) {
    if (!p1.move && !p2.move) {
       p1Outcome = 'draw';
    } else if (p1.move) {
       p1Outcome = 'win';
    } else {
       p1Outcome = 'lose';
    }
  } else {
    p1Outcome = getOutcome(p1.move || 'iron', p2.move || 'iron');
  }

  const p2Outcome = p1Outcome === 'win' ? 'lose' : (p1Outcome === 'lose' ? 'win' : 'draw');

  if (p1Outcome === 'win') p1.score++;
  if (p2Outcome === 'win') p2.score++;
  if (p1Outcome === 'draw') room.draws++;

  io.to(p1.socketId).emit("round_result", {
    result: p1Outcome,
    myMove: p1.move,
    opponentMove: p2.move,
    opponentId: p2.socketId,
    score: p1.score,
    opponentScore: p2.score,
    draws: room.draws,
    round: room.round
  });

  io.to(p2.socketId).emit("round_result", {
    result: p2Outcome,
    myMove: p2.move,
    opponentMove: p1.move,
    opponentId: p1.socketId,
    score: p2.score,
    opponentScore: p1.score,
    draws: room.draws,
    round: room.round
  });

  if (room.round >= 10) {
    room.status = 'game_over';
    setTimeout(() => {
      if (rooms[roomId]) {
        const p1FinalScore = rooms[roomId].players[p1.socketId].score;
        const p2FinalScore = rooms[roomId].players[p2.socketId].score;
        
        io.to(p1.socketId).emit("game_over", {
          myScore: p1FinalScore,
          opponentScore: p2FinalScore,
          result: p1FinalScore > p2FinalScore ? 'win' : (p1FinalScore < p2FinalScore ? 'lose' : 'draw')
        });
        
        io.to(p2.socketId).emit("game_over", {
          myScore: p2FinalScore,
          opponentScore: p1FinalScore,
          result: p2FinalScore > p1FinalScore ? 'win' : (p2FinalScore < p1FinalScore ? 'lose' : 'draw')
        });
        
        delete rooms[roomId];
        playerRoomMap.delete(p1.socketId);
        playerRoomMap.delete(p2.socketId);
      }
    }, 3000);
  } else {
    setTimeout(() => {
      if (rooms[roomId]) {
        p1.move = null;
        p2.move = null;
        rooms[roomId].round++;
        rooms[roomId].status = 'playing';
        rooms[roomId].roundTimeoutId = setTimeout(() => {
           evaluateRound(roomId, true);
        }, 10000);
        io.to(roomId).emit("next_round", { round: rooms[roomId].round });
      }
    }, 3000);
  }
};

io.on("connection", (socket: Socket) => {
  console.log("Client connected:", socket.id);
  
  onlinePlayerCount++;
  io.emit("player_count", { count: onlinePlayerCount });

  socket.on("request_player_count", () => {
    socket.emit("player_count", { count: onlinePlayerCount });
  });

  socket.on("join_matchmaking", (data: { name: string }) => {
    let joinedRoom = null;
    
    // Look for a waiting room with 1 player
    for (const roomId in rooms) {
      if (rooms[roomId].status === 'waiting' && Object.keys(rooms[roomId].players).length === 1 && !rooms[roomId].isPrivate) {
        joinedRoom = roomId;
        rooms[roomId].players[socket.id] = { socketId: socket.id, name: data.name || 'Guest', move: null, score: 0 };
        rooms[roomId].status = 'playing';
        rooms[roomId].round = 1;
        rooms[roomId].draws = 0;
        playerRoomMap.set(socket.id, roomId);
        
        socket.join(roomId);

        // Notify both players
        io.to(roomId).emit("match_found", {
          roomId,
          round: 1,
          draws: 0,
          players: Object.values(rooms[roomId].players).map(p => ({ id: p.socketId, name: p.name, score: p.score }))
        });

        // Delay 3 seconds before starting the first round timeout
        setTimeout(() => {
           if (rooms[roomId]) {
             io.to(roomId).emit("game_starting");
             rooms[roomId].roundTimeoutId = setTimeout(() => {
               evaluateRound(roomId, true);
             }, 10000);
           }
        }, 3000);
        
        break;
      }
    }

    // Otherwise create a new room
    if (!joinedRoom) {
      const newRoomId = Math.random().toString(36).substring(2, 9);
      rooms[newRoomId] = {
        id: newRoomId,
        players: {
          [socket.id]: { socketId: socket.id, name: data.name || 'Guest', move: null, score: 0 }
        },
        status: 'waiting',
        round: 1,
        draws: 0,
        isPrivate: false
      };
      playerRoomMap.set(socket.id, newRoomId);
      socket.join(newRoomId);
      socket.emit("waiting_for_opponent", { roomId: newRoomId });
    }
  });

  socket.on("create_private_room", (data: { name: string }) => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms[newRoomId] = {
      id: newRoomId,
      players: {
        [socket.id]: { socketId: socket.id, name: data.name || 'Guest', move: null, score: 0 }
      },
      status: 'waiting',
      round: 1,
      draws: 0,
      isPrivate: true
    };
    playerRoomMap.set(socket.id, newRoomId);
    socket.join(newRoomId);
    socket.emit("private_room_created", { roomId: newRoomId });
  });

  socket.on("join_private_room", (data: { name: string, roomId: string }) => {
    const roomId = data.roomId.toUpperCase();
    const room = rooms[roomId];
    
    if (room && room.status === 'waiting' && room.isPrivate && Object.keys(room.players).length === 1) {
      room.players[socket.id] = { socketId: socket.id, name: data.name || 'Guest', move: null, score: 0 };
      room.status = 'playing';
      room.round = 1;
      room.draws = 0;
      playerRoomMap.set(socket.id, roomId);
      
      socket.join(roomId);

      io.to(roomId).emit("match_found", {
        roomId,
        round: 1,
        draws: 0,
        players: Object.values(room.players).map(p => ({ id: p.socketId, name: p.name, score: p.score }))
      });

      // Delay 3 seconds before starting the first round timeout
      setTimeout(() => {
         if (rooms[roomId]) {
           io.to(roomId).emit("game_starting");
           rooms[roomId].roundTimeoutId = setTimeout(() => {
             evaluateRound(roomId, true);
           }, 10000);
         }
      }, 3000);

    } else {
      socket.emit("join_error", { message: "Oda bulunamadı veya dolu." });
    }
  });

  socket.on("send_move", (data: { move: string }) => {
    const roomId = playerRoomMap.get(socket.id);
    if (!roomId) return;

    const room = rooms[roomId];
    if (room && room.status === 'playing') {
      const player = room.players[socket.id];
      if (player && !player.move) {
        player.move = data.move;
        
        // Let the other player know opponent has moved
        socket.to(roomId).emit("opponent_moved", {});

        // Check if both players have moved
        const playerIds = Object.keys(room.players);
        if (playerIds.length === 2) {
          const p1 = room.players[playerIds[0]];
          const p2 = room.players[playerIds[1]];

          if (p1.move && p2.move) {
            evaluateRound(roomId);
          }
        }
      }
    }
  });

  socket.on("timeout_from_client", () => {
    const roomId = playerRoomMap.get(socket.id);
    if (!roomId) return;
    const room = rooms[roomId];
    if (room && room.status === 'playing') {
      evaluateRound(roomId, true);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    onlinePlayerCount = Math.max(0, onlinePlayerCount - 1);
    io.emit("player_count", { count: onlinePlayerCount });
    const roomId = playerRoomMap.get(socket.id);
    if (roomId) {
      const room = rooms[roomId];
      if (room) {
        if (room.roundTimeoutId) clearTimeout(room.roundTimeoutId);
        
        const wasPlaying = room.status === 'playing' || room.status === 'result';
        // Send individually to ensure the remaining player receives it (since this socket is leaving the room)
        Object.values(room.players).forEach(p => {
          if (p.socketId !== socket.id) {
            io.to(p.socketId).emit("opponent_disconnected", { wasPlaying });
          }
        });
      }
      delete rooms[roomId];
      playerRoomMap.delete(socket.id);
    }
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
