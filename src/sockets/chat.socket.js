module.exports = (io) => {
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`✅ Socket conectado: ${socket.id}`);

    socket.onAny((eventName, ...args) => {
      console.log(`📡 Evento recebido: ${eventName}`, args);
    });

    socket.on("user-join", ({ username, avatar }) => {
      onlineUsers.set(socket.id, { username, avatar });

      console.log(`👤 ${username} entrou no chat`);

      io.emit("user-joined", {
        username,
        avatar,
        onlineCount: onlineUsers.size,
      });

      socket.emit("online-users", Array.from(onlineUsers.values()));
    });

    socket.on("global-message", (data) => {
      console.log('📨 Mensagem global recebida:', {
        user: data.user,
        type: data.type,
        hasAudioData: !!data.audioData,
        audioDataLength: data.audioData?.length,
        duration: data.duration
      });

      const message = {
        id: `${Date.now()}-${Math.random()}`,
        user: data.user,
        avatar: data.avatar,
        type: data.type || "text",
        text: data.text || "",
        audioData: data.audioData || null,
        duration: data.duration || 0,
        createdAt: new Date().toISOString(),
        status: "sent",
        replyTo: data.replyTo || null,
      };

      console.log('✉️ Emitindo mensagem:', {
        id: message.id,
        user: message.user,
        type: message.type,
        hasAudioData: !!message.audioData,
        audioDataLength: message.audioData?.length,
        duration: message.duration
      });

      io.emit("global-message", message);

      // Simula status de entrega e leitura
      setTimeout(() => {
        io.emit("message-status", {
          messageId: message.id,
          status: "delivered",
        });
      }, 500);

      setTimeout(() => {
        io.emit("message-status", {
          messageId: message.id,
          status: "read",
        });
      }, 2000);
    });

    socket.on("private-message", ({ to, from, text, type, audioData, duration, avatar }) => {
      const message = {
        id: `${Date.now()}-${Math.random()}`,
        from,
        to,
        avatar: avatar || `https://ui-avatars.com/api/?name=${from}`,
        type: type || "text",
        text: text || "",
        audioData: audioData || null,
        duration: duration || 0,
        createdAt: new Date().toISOString(),
        status: "sent",
      };

      console.log(`💬 Mensagem privada de ${from} para ${to}`);

      const recipientSocket = Array.from(onlineUsers.entries()).find(
        ([_, user]) => user.username === to
      );

      if (recipientSocket) {
        io.to(recipientSocket[0]).emit("private-message", message);
      }

      socket.emit("private-message", message);
    });

    socket.on("typing", ({ user }) => {
      socket.broadcast.emit("user-typing", { user });
    });

    socket.on("stop-typing", ({ user }) => {
      socket.broadcast.emit("user-stop-typing", { user });
    });

    socket.on("add-reaction", ({ messageId, emoji, userId }) => {
      io.emit("reaction-added", { messageId, emoji, userId });
    });

    socket.on("delete-message", ({ messageId, userId }) => {
      io.emit("message-deleted", { messageId, userId });
    });

    socket.on("edit-message", ({ messageId, newText, userId }) => {
      io.emit("message-edited", { messageId, newText, userId });
    });

    socket.on("disconnect", () => {
      const user = onlineUsers.get(socket.id);

      if (user) {
        console.log(`❌ ${user.username} saiu do chat`);
        
        onlineUsers.delete(socket.id);

        io.emit("user-left", {
          username: user.username,
          onlineCount: onlineUsers.size,
        });
      }
    });
  });

  return {
    getOnlineUsers: () => Array.from(onlineUsers.values()),
    getOnlineCount: () => onlineUsers.size,
  };
};