import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const demoUsers = [
  {
    username: 'João',
    email: 'joao@chatapp.com',
    password: '$2b$10$YourHashedPasswordHere',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao',
    online: false
  },
  {
    username: 'Maria',
    email: 'maria@chatapp.com',
    password: '$2b$10$YourHashedPasswordHere',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    online: false
  },
  {
    username: 'Pedro',
    email: 'pedro@chatapp.com',
    password: '$2b$10$YourHashedPasswordHere',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    online: false
  },
  {
    username: 'Ana',
    email: 'ana@chatapp.com',
    password: '$2b$10$YourHashedPasswordHere',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    online: false
  },
  {
    username: 'Carlos',
    email: 'carlos@chatapp.com',
    password: '$2b$10$YourHashedPasswordHere',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    online: false
  },
  {
    username: 'Juliana',
    email: 'juliana@chatapp.com',
    password: '$2b$10$YourHashedPasswordHere',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juliana',
    online: false
  }
];

const demoMessages = {
  global: [
    {
      username: 'João',
      content: 'Bom dia pessoal! 😊',
      type: 'text',
      delay: 0
    },
    {
      username: 'Maria',
      content: 'Bom dia João! Tudo bem?',
      type: 'text',
      delay: 3000
    },
    {
      username: 'João',
      content: 'Tudo ótimo! Alguém viu o jogo ontem?',
      type: 'text',
      delay: 6000
    },
    {
      username: 'Pedro',
      content: 'Vi sim! Que partida hein 🔥',
      type: 'text',
      delay: 9000
    },
    {
      username: 'Pedro',
      content: 'Aquele gol no último minuto foi insano',
      type: 'text',
      delay: 12000
    },
    {
      username: 'Ana',
      content: 'Pessoal, alguém sabe se vai ter aula amanhã?',
      type: 'text',
      delay: 18000
    },
    {
      username: 'Carlos',
      content: 'Acho que sim Ana, não recebi nenhum aviso',
      type: 'text',
      delay: 22000
    },
    {
      username: 'Juliana',
      content: 'Confirmado! Vai ter aula normal',
      type: 'text',
      delay: 26000
    },
    {
      username: 'Ana',
      content: 'Valeu Ju! 💙',
      type: 'text',
      delay: 29000
    },
    {
      username: 'Maria',
      content: 'Voltando ao jogo... aquele lance do pênalti foi polêmico né',
      type: 'text',
      delay: 35000
    },
    {
      username: 'Pedro',
      content: 'Demais! O VAR demorou uns 5 minutos pra decidir',
      type: 'text',
      delay: 39000
    },
    {
      username: 'João',
      content: 'Eu achei pênalti claro',
      type: 'text',
      delay: 43000
    },
    {
      username: 'Carlos',
      content: 'Discordo totalmente, foi teatro kkkkk',
      type: 'text',
      delay: 47000
    },
    {
      username: 'Juliana',
      content: 'Gente, mudando de assunto... alguém vai no aniversário da Bruna?',
      type: 'text',
      delay: 55000
    },
    {
      username: 'Ana',
      content: 'Eu vou! Que horas vai ser mesmo?',
      type: 'text',
      delay: 58000
    },
    {
      username: 'Juliana',
      content: 'Sábado às 20h',
      type: 'text',
      delay: 61000
    },
    {
      username: 'Maria',
      content: 'Eu também vou! Podemos ir juntas Ana?',
      type: 'text',
      delay: 65000
    },
    {
      username: 'Ana',
      content: 'Claro! Me chama no sábado 😊',
      type: 'text',
      delay: 68000
    },
    {
      username: 'Pedro',
      content: 'Vou tentar ir também, depende do trabalho',
      type: 'text',
      delay: 73000
    },
    {
      username: 'Carlos',
      content: 'Pessoal, alguém tem a anotação da aula de ontem?',
      type: 'text',
      delay: 80000
    },
    {
      username: 'João',
      content: 'Eu tenho! Te mando por email',
      type: 'text',
      delay: 84000
    },
    {
      username: 'Carlos',
      content: 'Valeu demais João! 🙏',
      type: 'text',
      delay: 87000
    }
  ],
  group: [
    {
      username: 'Maria',
      content: 'Oi gente! Sobre o projeto de quinta...',
      type: 'text',
      delay: 0
    },
    {
      username: 'Pedro',
      content: 'Oi Maria! Estava pensando nisso também',
      type: 'text',
      delay: 4000
    },
    {
      username: 'Maria',
      content: 'Acho que devíamos dividir as tarefas hoje',
      type: 'text',
      delay: 7000
    },
    {
      username: 'Ana',
      content: 'Concordo! Eu posso ficar com a parte de pesquisa',
      type: 'text',
      delay: 11000
    },
    {
      username: 'Pedro',
      content: 'Eu faço a apresentação então',
      type: 'text',
      delay: 15000
    },
    {
      username: 'João',
      content: 'Posso fazer os slides e o design',
      type: 'text',
      delay: 19000
    },
    {
      username: 'Maria',
      content: 'Perfeito! Eu fico com a revisão final',
      type: 'text',
      delay: 23000
    },
    {
      username: 'Carlos',
      content: 'Desculpa o atraso pessoal, estava no trânsito',
      type: 'text',
      delay: 30000
    },
    {
      username: 'Carlos',
      content: 'Sobrou alguma parte pra mim?',
      type: 'text',
      delay: 33000
    },
    {
      username: 'Ana',
      content: 'Tranquilo Carlos! Você pode fazer a introdução?',
      type: 'text',
      delay: 37000
    },
    {
      username: 'Carlos',
      content: 'Fechado! Mando até amanhã',
      type: 'text',
      delay: 41000
    },
    {
      username: 'Juliana',
      content: 'Pessoal, não vou conseguir ajudar muito essa semana 😔',
      type: 'text',
      delay: 48000
    },
    {
      username: 'Juliana',
      content: 'Minha mãe está internada e vou ficar com ela',
      type: 'text',
      delay: 51000
    },
    {
      username: 'Maria',
      content: 'Não se preocupa Ju! A gente se vira aqui',
      type: 'text',
      delay: 55000
    },
    {
      username: 'Pedro',
      content: 'Força aí Juliana! Espero que sua mãe melhore logo 🙏',
      type: 'text',
      delay: 58000
    },
    {
      username: 'Ana',
      content: 'Se precisar de alguma coisa é só falar!',
      type: 'text',
      delay: 62000
    },
    {
      username: 'Juliana',
      content: 'Obrigada pessoal ❤️ vocês são demais',
      type: 'text',
      delay: 66000
    },
    {
      username: 'João',
      content: 'Voltando ao projeto, quando é a entrega mesmo?',
      type: 'text',
      delay: 75000
    },
    {
      username: 'Maria',
      content: 'Quinta-feira até às 23h59',
      type: 'text',
      delay: 78000
    },
    {
      username: 'Pedro',
      content: 'Temos tempo então! Vamos fazer algo top',
      type: 'text',
      delay: 82000
    },
    {
      username: 'Carlos',
      content: 'Bora fazer uma call amanhã pra alinhar tudo?',
      type: 'text',
      delay: 87000
    },
    {
      username: 'Ana',
      content: 'Boa ideia! Que horas?',
      type: 'text',
      delay: 91000
    },
    {
      username: 'Carlos',
      content: '19h tá bom pra todo mundo?',
      type: 'text',
      delay: 94000
    },
    {
      username: 'Pedro',
      content: 'Pra mim tá ótimo!',
      type: 'text',
      delay: 97000
    },
    {
      username: 'João',
      content: 'Fechado! 19h então',
      type: 'text',
      delay: 100000
    },
    {
      username: 'Maria',
      content: 'Perfeito! Vejo vocês amanhã 😊',
      type: 'text',
      delay: 103000
    }
  ]
};

export async function seedDemoData() {
  try {
    console.log('🌱 Verificando dados de demonstração...');

    const messageCount = await Message.countDocuments();
    if (messageCount > 0) {
      console.log('✅ Dados de demonstração já existem. Pulando seed...');
      return;
    }

    console.log('📝 Criando usuários de demonstração...');

    const createdUsers = {};
    for (const userData of demoUsers) {
      let user = await User.findOne({ email: userData.email });
      
      if (!user) {
        user = await User.create(userData);
        console.log(`✅ Usuário criado: ${user.username}`);
      }
      
      createdUsers[userData.username] = user;
    }

    console.log('💬 Criando conversas...');
    
    const globalConversation = await Conversation.create({
      isGroup: false,
      participants: Object.values(createdUsers).map(u => u._id)
    });

    const groupConversation = await Conversation.create({
      isGroup: true,
      participants: Object.values(createdUsers).map(u => u._id)
    });

    console.log('📨 Criando mensagens do chat global...');
    const baseTimestamp = new Date(Date.now() - 86400000);

    for (const msgData of demoMessages.global) {
      const timestamp = new Date(baseTimestamp.getTime() + msgData.delay);
      
      await Message.create({
        conversationId: globalConversation._id,
        sender: createdUsers[msgData.username]._id,
        content: msgData.content,
        type: msgData.type,
        chatType: 'global',
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    console.log('📨 Criando mensagens do chat em grupo...');
    const groupBaseTimestamp = new Date(Date.now() - 43200000);

    for (const msgData of demoMessages.group) {
      const timestamp = new Date(groupBaseTimestamp.getTime() + msgData.delay);
      
      await Message.create({
        conversationId: groupConversation._id,
        sender: createdUsers[msgData.username]._id,
        content: msgData.content,
        type: msgData.type,
        chatType: 'group',
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    console.log('✅ Seed concluído com sucesso!');
    console.log(`📊 ${demoMessages.global.length} mensagens no chat global`);
    console.log(`📊 ${demoMessages.group.length} mensagens no chat em grupo`);

  } catch (error) {
    console.error('❌ Erro ao criar dados de demonstração:', error);
    throw error;
  }
}

export async function clearDemoData() {
  try {
    console.log('🗑️ Limpando dados de demonstração...');

    const demoEmails = demoUsers.map(u => u.email);
    const demoUserDocs = await User.find({ email: { $in: demoEmails } });
    const demoUserIds = demoUserDocs.map(u => u._id);

    const deletedMessages = await Message.deleteMany({
      sender: { $in: demoUserIds }
    });

    const deletedConversations = await Conversation.deleteMany({
      participants: { $in: demoUserIds }
    });

    const deletedUsers = await User.deleteMany({
      email: { $in: demoEmails }
    });

    console.log(`✅ ${deletedMessages.deletedCount} mensagens deletadas`);
    console.log(`✅ ${deletedConversations.deletedCount} conversas deletadas`);
    console.log(`✅ ${deletedUsers.deletedCount} usuários deletados`);

  } catch (error) {
    console.error('❌ Erro ao limpar dados de demonstração:', error);
    throw error;
  }
}