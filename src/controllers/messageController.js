import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export async function getGlobalMessages(req, res) {
  try {
    const messages = await Message
      .find({ room: "global" })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    const formattedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      senderId: msg.sender?._id.toString(),
      senderName: msg.sender?.username,
      senderAvatar: msg.sender?.avatar,
      text: msg.content || '',
      audioData: msg.audioUrl || null,
      stickerUrl: msg.stickerUrl || null,
      type: msg.type,
      replyTo: msg.replyTo || null,
      timestamp: msg.createdAt.toISOString(),
      chatType: "group",
      read: false
    }));

    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
}


export async function getMessagesByChatType(req, res) {
  try {
    const { chatType } = req.params;
    
    const isGroup = chatType === 'group';
    const conversation = await Conversation.findOne({ isGroup });
    
    if (!conversation) {
      return res.json([]);
    }

    const messages = await Message
      .find({ conversationId: conversation._id })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    const formattedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      senderId: msg.sender?._id.toString(),
      senderName: msg.sender?.username,
      senderAvatar: msg.sender?.avatar,
      text: msg.content || '',
      audioData: msg.audioUrl || null,
      stickerUrl: msg.stickerUrl || null,
      type: msg.type,
      replyTo: msg.replyTo || null,
      timestamp: msg.createdAt.toISOString(),
      chatType: chatType,
      read: msg.readBy?.includes(req.user?.id) || false
    }));

    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
}
