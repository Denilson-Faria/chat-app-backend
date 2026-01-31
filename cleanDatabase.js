import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';

dotenv.config();

const cleanDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const totalMessages = await Message.countDocuments();
    const totalConversations = await Conversation.countDocuments();

    const deletedCorrupted = await Message.deleteMany({ sender: null });

    
    process.stdin.once('data', async (data) => {
      const answer = data.toString().trim().toLowerCase();
      
      if (answer === 's' || answer === 'sim') {
        const deletedMessages = await Message.deleteMany({});
        const deletedConversations = await Conversation.deleteMany({});
      } else {
      }

      const finalMessages = await Message.countDocuments();
      const finalConversations = await Conversation.countDocuments();

      await mongoose.connection.close();
      process.exit(0);
    });

  } catch (error) {
    await mongoose.connection.close();
    process.exit(1);
  }
};

cleanDatabase();
