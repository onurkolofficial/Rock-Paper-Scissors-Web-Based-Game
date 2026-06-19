import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";

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
  status: 'waiting' | 'playing' | 'result';
}

const rooms: Record<string, Room> = {};
const playerRoomMap = new Map<string, string>(); // socketId -> roomId

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

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_matchmaking", (data: { name: string }) => {
    let joinedRoom = null;
    
    // Look for a waiting room with 1 player
    for (const roomId in rooms) {
      if (rooms[roomId].status === 'waiting' && Object.keys(rooms[roomId].players).length === 1) {
        joinedRoom = roomId;
        rooms[roomId].players[socket.id] = { socketId: socket.id, name: data.name || 'Guest', move: null, score: 0 };
        rooms[roomId].status = 'playing';
        playerRoomMap.set(socket.id, roomId);
        
        // Notify both players
        io.to(roomId).emit("match_found", {
          roomId,
          players: Object.values(rooms[roomId].players).map(p => ({ id: p.socketId, name: p.name, score: p.score }))
        });
        socket.join(roomId);
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
        status: 'waiting'
      };
      playerRoomMap.set(socket.id, newRoomId);
      socket.join(newRoomId);
      socket.emit("waiting_for_opponent", { roomId: newRoomId });
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
        
        // Check if both players have moved
        const playerIds = Object.keys(room.players);
        const p1 = room.players[playerIds[0]];
        const p2 = room.players[playerIds[1]];

        // Let the other player know opponent has moved
        socket.to(roomId).emit("opponent_moved", {});

        if (p1.move && p2.move) {
          room.status = 'result';
          
          const p1Outcome = getOutcome(p1.move, p2.move);
          const p2Outcome = p1Outcome === 'win' ? 'lose' : (p1Outcome === 'lose' ? 'win' : 'draw');

          if (p1Outcome === 'win') p1.score++;
          if (p2Outcome === 'win') p2.score++;

          io.to(p1.socketId).emit("round_result", {
            result: p1Outcome,
            myMove: p1.move,
            opponentMove: p2.move,
            opponentId: p2.socketId,
            score: p1.score,
            opponentScore: p2.score
          });

          io.to(p2.socketId).emit("round_result", {
            result: p2Outcome,
            myMove: p2.move,
            opponentMove: p1.move,
            opponentId: p1.socketId,
            score: p2.score,
            opponentScore: p1.score
          });

          // Reset room for next round
          setTimeout(() => {
            if (rooms[roomId]) {
              p1.move = null;
              p2.move = null;
              rooms[roomId].status = 'playing';
              io.to(roomId).emit("next_round", {});
            }
          }, 3000);
        }
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    const roomId = playerRoomMap.get(socket.id);
    if (roomId) {
      io.to(roomId).emit("opponent_disconnected");
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
