import Message from "../models/Message.js";

export async function getGlobalMessages(req, res) {
  try {
    const messages = await Message
      .find({ chatType: "global" })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      senderId: msg.sender?._id,
      senderName: msg.sender?.username,
      senderAvatar: msg.sender?.avatar,
      text: msg.content,
      audioData: msg.audioUrl,
      stickerUrl: msg.stickerUrl,
      type: msg.type,
      replyTo: msg.replyTo,
      timestamp: msg.createdAt,
      chatType: "global",
      read: false
    }));

    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
}



export async function getPrivateMessages(req, res) {
  try {
    const { conversationId } = req.params;

    const messages = await Message
      .find({ conversationId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      senderId: msg.sender?._id,
      senderName: msg.sender?.name,
      senderAvatar: msg.sender?.avatar,
      text: msg.content,
      audioData: msg.audioUrl,
      stickerUrl: msg.stickerUrl,
      type: msg.type,
      replyTo: msg.replyTo,
      timestamp: msg.createdAt,
      chatType: "private",
      read: msg.readBy?.includes(req.user?.id) || false
    }));

    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
}


export async function createMessage(req, res) {
  try {
    const { conversationId, content, type, audioUrl, stickerUrl, replyTo } = req.body;

    const message = await Message.create({
      conversationId,
      sender: req.user.id,
      content,
      type,
      audioUrl,
      stickerUrl,
      replyTo
    });


    await message.populate("sender", "name avatar");

    const formattedMessage = {
      id: message._id,
      senderId: message.sender._id,
      senderName: message.sender.name,
      senderAvatar: message.sender.avatar,
      text: message.content,
      audioData: message.audioUrl,
      stickerUrl: message.stickerUrl,
      type: message.type,
      replyTo: message.replyTo,
      timestamp: message.createdAt,
      chatType: "group",
      read: false
    };

    res.json(formattedMessage);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar mensagem' });
  }
}
