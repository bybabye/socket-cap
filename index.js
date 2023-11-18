import express from 'express';
import http from 'http';
import { Server as SocketIo } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new SocketIo(server);

// Mảng chứa thông tin về người dùng đang kết nối
let activeUsers = [];

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('add-user', (uid) => {
    console.log(`User added: ${uid}`);
    activeUsers.push({ id: socket.id, uid });
    io.emit('get-users', activeUsers);
  });
  socket.on('join-room', data => {
    const {chatId} = data
    socket.join(chatId);
  })

  socket.on('send-message', (data) => {
    const { chatId, message } = data;
    console.log(`Received message in chat ${chatId}: ${JSON.stringify(message)}`);
    // socket.join(chatId);
    io.to(chatId).emit('chat-id',{message});
    
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    const userIndex = activeUsers.findIndex((user) => user.id === socket.id);
    if (userIndex !== -1) {
      activeUsers.splice(userIndex, 1);
      io.emit('get-users', activeUsers);
    }
  });
});

const port = process.env.PORT || 8800;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
