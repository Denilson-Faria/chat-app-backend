import express from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/messages/:chatType', authenticateToken, async (req, res) => {
  try {
    const { chatType } = req.params;
    const userId = req.user?._id || req.userId;
 
    const limit = parseInt(req.query.limit) || 100;
    const skip = parseInt(req.query.skip) || 0;

    const validChatTypes = ['global', 'group', 'private'];
    if (!validChatTypes.includes(chatType)) {
      return res.status(400).json({ 
        message: 'chatType inválido. Use: global, group ou private' 
      });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const conversation = await Conversation.findOne({ 
      isGroup: chatType === 'group' 
    });

    if (!conversation) {
      console.log(`⚠️ Conversa não encontrada para chatType: ${chatType}`);
      return res.json([]);
    }

    console.log(`📨 Buscando mensagens de ${chatType} (conversationId: ${conversation._id})`);

    
    const messages = await Message.find({ 
      conversationId: conversation._id 
    })
    .populate('sender', 'username avatar')
    .populate('replyTo', 'content sender') 
    .sort({ createdAt: -1 }) 
    .limit(limit)
    .skip(skip)
    .lean(); 

    
    messages.reverse();

    
    const totalMessages = await Message.countDocuments({ 
      conversationId: conversation._id 
    });

   
    const formattedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      text: msg.content || '',
      stickerUrl: msg.stickerUrl || null,
      senderId: msg.sender?._id?.toString() || 'unknown',
      senderName: msg.sender?.username || 'Desconhecido',
      senderAvatar: msg.sender?.avatar || null,
      chatType: chatType,
      type: msg.type || 'text',
      audioData: msg.audioUrl || null,
      mediaData: msg.mediaData || null,
      duration: msg.duration || null,
      timestamp: msg.createdAt.toISOString(),
      replyTo: msg.replyTo ? {
        id: msg.replyTo._id?.toString(),
        content: msg.replyTo.content,
        senderId: msg.replyTo.sender?.toString()
      } : null,
      read: msg.readBy?.includes(userId.toString()) || 
            msg.sender?._id?.toString() === userId.toString()
    }));

    console.log(`✅ ${formattedMessages.length} mensagens carregadas para ${chatType}`);

    res.json({
      messages: formattedMessages,
      pagination: {
        total: totalMessages,
        limit: limit,
        skip: skip,
        hasMore: skip + formattedMessages.length < totalMessages
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar mensagens',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


router.get('/messages/:chatType/unread', authenticateToken, async (req, res) => {
  try {
    const { chatType } = req.params;
    const userId = req.user?._id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const conversation = await Conversation.findOne({ 
      isGroup: chatType === 'group' 
    });

    if (!conversation) {
      return res.json({ count: 0 });
    }

    const unreadCount = await Message.countDocuments({
      conversationId: conversation._id,
      sender: { $ne: userId },
      readBy: { $ne: userId }
    });

    res.json({ 
      chatType,
      count: unreadCount 
    });

  } catch (error) {
    console.error('❌ Erro ao buscar mensagens não lidas:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar mensagens não lidas' 
    });
  }
});


router.delete('/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?._id || req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Mensagem não encontrada' });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: 'Você não tem permissão para deletar esta mensagem' 
      });
    }

    await message.deleteOne();

    console.log(`🗑️ Mensagem ${messageId} deletada por ${userId}`);

    res.json({ 
      message: 'Mensagem deletada com sucesso',
      messageId 
    });

  } catch (error) {
    console.error('❌ Erro ao deletar mensagem:', error);
    res.status(500).json({ 
      message: 'Erro ao deletar mensagem' 
    });
  }
});

router.put('/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id || req.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Conteúdo da mensagem não pode estar vazio' 
      });
    }

    const message = await Message.findById(messageId)
      .populate('sender', 'username avatar');

    if (!message) {
      return res.status(404).json({ message: 'Mensagem não encontrada' });
    }

    if (message.sender._id.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: 'Você não tem permissão para editar esta mensagem' 
      });
    }

    if (message.type !== 'text') {
      return res.status(400).json({ 
        message: 'Apenas mensagens de texto podem ser editadas' 
      });
    }

    message.content = content.trim();
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    console.log(`✏️ Mensagem ${messageId} editada por ${userId}`);

    res.json({
      message: 'Mensagem editada com sucesso',
      data: {
        id: message._id.toString(),
        content: message.content,
        edited: message.edited,
        editedAt: message.editedAt
      }
    });

  } catch (error) {
    console.error('❌ Erro ao editar mensagem:', error);
    res.status(500).json({ 
      message: 'Erro ao editar mensagem' 
    });
  }
});

router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;

    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'username avatar online lastSeen')
    .sort({ updatedAt: -1 });

    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({
          conversationId: conv._id
        })
        .populate('sender', 'username')
        .sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          sender: { $ne: userId },
          readBy: { $ne: userId }
        });

        return {
          id: conv._id,
          isGroup: conv.isGroup,
          participants: conv.participants,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            sender: lastMessage.sender?.username,
            timestamp: lastMessage.createdAt
          } : null,
          unreadCount,
          updatedAt: conv.updatedAt
        };
      })
    );

    res.json(conversationsWithLastMessage);

  } catch (error) {
    console.error('❌ Erro ao buscar conversas:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar conversas' 
    });
  }
});

export default router;