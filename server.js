import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import jwt from 'jsonwebtoken';

// Rotas
import authRoutes from './src/routes/authroutes.js';
import userRoutes from './src/routes/userRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';

// Models
import User from './src/models/User.js';
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';

// Middleware de autenticação
import { authenticateToken } from './src/middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.get('/api/stickers', authenticateToken, (req, res) => {
  const stickersDir = path.join(__dirname, 'stickers');
  const result = [];

  function readFolder(folder, prefix = '') {
    const files = fs.readdirSync(folder);
    files.forEach(file => {
      const filePath = path.join(folder, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        readFolder(filePath, `${prefix}${file}/`);
      } else if (/\.(webp|png|jpg|gif)$/i.test(file)) {
        result.push(`/stickers/${prefix}${file}`);
      }
    });
  }

  try {
    readFolder(stickersDir);
    res.json(result);
  } catch (error) {
    console.error('Erro ao carregar stickers:', error);
    res.status(500).json({ message: 'Erro ao carregar stickers' });
  }
});

// 🔧 STATIC FILES
app.use(
  '/stickers',
  express.static(path.join(__dirname, 'stickers'), {
    setHeaders: (res, filepath) => {
      if (filepath.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      }
    }
  })
);

app.use(
  '/uploads/avatars',
  express.static(path.join(__dirname, 'uploads/avatars'), {
    setHeaders: (res, filepath) => {
      if (filepath.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      }
      res.setHeader('Cache-Control', 'public, max-age=604800');
    }
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB conectado');
    
    if (process.env.SEED_DEMO_DATA === 'true') {
      try {
        const { seedDemoData } = await import('./src/utils/seedMessages.js');
        await seedDemoData();
      } catch (error) {
        console.error('❌ Erro ao executar seed:', error);
      }
    }
  })
  .catch((err) => console.error('❌ Erro ao conectar MongoDB:', err));

app.get('/', (req, res) => {
  res.json({
    message: 'Chat API está funcionando!',
    version: '2.0.0',
    status: 'online'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const onlineUsers = new Map();

async function getOrCreateConversation(chatType, userId) {
  let conversation = await Conversation.findOne({ isGroup: chatType === 'group' });

  if (!conversation) {
    conversation = await Conversation.create({
      isGroup: chatType === 'group',
      participants: [userId]
    });
  } else if (!conversation.participants.includes(userId)) {
    conversation.participants.push(userId);
    await conversation.save();
  }

  return conversation;
}

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.replace('Bearer ', '') ||
      socket.handshake.query.token;

    if (!token) {
      return next(new Error('Autenticação necessária. Token não fornecido.'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('Usuário não encontrado. Token inválido.'));
    }

    if (user.status === 'blocked') {
      return next(new Error('Conta bloqueada.'));
    }

    socket.userId = user._id;
    socket.user = user;

    next();

  } catch (error) {
    console.error('Erro na autenticação do socket:', error);
    
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Token expirado. Faça login novamente.'));
    }

    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Token inválido.'));
    }

    return next(new Error('Erro ao autenticar.'));
  }
});

io.on('connection', async (socket) => {
  const user = socket.user;
  const userId = socket.userId.toString();

  console.log(`✅ Usuário conectado: ${user.username} (${userId})`);

  try {
    user.online = true;
    user.lastSeen = new Date();
    await user.save();

    onlineUsers.set(userId, {
      username: user.username,
      socketId: socket.id,
      userId: userId,
      avatar: user.avatar
    });

    socket.join('global');
    socket.join('group');

    socket.emit('registered', {
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      email: user.email
    });

    io.emit('users_count', onlineUsers.size);
    io.emit('user_online', {
      userId: user._id,
      username: user.username,
      avatar: user.avatar
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
  }

  socket.on('typing', (data) => {
    socket.to(data.chatType).emit('user_typing', {
      username: user.username,
      userId: userId,
      chatType: data.chatType
    });
  });

  socket.on('stop_typing', (data) => {
    socket.to(data.chatType).emit('user_stop_typing', {
      username: user.username,
      userId: userId,
      chatType: data.chatType
    });
  });

  socket.on('get_online_users', () => {
    const users = Array.from(onlineUsers.values());
    socket.emit('online_users_list', users);
  });

  socket.on('join_room', async (roomId) => {
    try {
      socket.join(roomId);
      console.log(`Usuário ${user.username} entrou na sala ${roomId}`);
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
    }
  });

  socket.on('send_message', async (data) => {
    try {
      if (!data.chatType) {
        socket.emit('error', { message: 'chatType é obrigatório' });
        return;
      }

      let messageType = 'text';
      if (data.stickerUrl) messageType = 'sticker';
      else if (data.audioData) messageType = 'audio';
      else if (data.type) messageType = data.type;

      const conversation = await getOrCreateConversation(data.chatType, socket.userId);

      const message = await Message.create({
        conversationId: conversation._id,
        sender: socket.userId,
        content: data.text || '',
        stickerUrl: data.stickerUrl || null,
        audioUrl: data.audioData || null,
        mediaData: data.mediaData || null,
        replyTo: data.replyTo || null,
        type: messageType
      });

      await message.populate('sender', 'username avatar');

      const messagePayload = {
        id: message._id.toString(),
        text: message.content || '',
        stickerUrl: message.stickerUrl || null,
        senderId: message.sender._id.toString(),
        senderName: message.sender.username,
        senderAvatar: message.sender.avatar,
        chatType: data.chatType,
        type: message.type,
        audioData: message.audioUrl || null,
        mediaData: message.mediaData || null,
        timestamp: message.createdAt.toISOString(),
        replyTo: message.replyTo
      };

      io.to(data.chatType).emit('receive_message', messagePayload);

      console.log(`📨 Mensagem enviada por ${user.username} em ${data.chatType}`);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      socket.emit('error', {
        message: 'Erro ao enviar mensagem',
        details: error.message
      });
    }
  });

  socket.on('mark_chat_as_read', async (data) => {
    try {
      const { chatType, userId: requestUserId } = data;
      const currentUserId = requestUserId || socket.userId;

      const conversation = await Conversation.findOne({
        isGroup: chatType === 'group'
      });

      if (!conversation) {
        return;
      }

      const result = await Message.updateMany(
        {
          conversationId: conversation._id,
          sender: { $ne: currentUserId },
          readBy: { $ne: currentUserId }
        },
        {
          $addToSet: { readBy: currentUserId }
        }
      );

      socket.to(chatType).emit('messages_read', {
        chatType,
        userId: currentUserId,
        count: result.modifiedCount
      });

      console.log(`✅ ${result.modifiedCount} mensagens marcadas como lidas por ${user.username}`);

    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  });

  socket.on('disconnect', async () => {
    try {
      console.log(`❌ Usuário desconectado: ${user.username}`);

      await User.findByIdAndUpdate(socket.userId, {
        online: false,
        lastSeen: new Date(),
      });

      onlineUsers.delete(userId);

      io.emit('users_count', onlineUsers.size);
      io.emit('user_offline', { userId: socket.userId });

    } catch (error) {
      console.error('Erro ao processar desconexão:', error);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Socket.IO configurado`);
  console.log(`🌐 CLIENT_URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});