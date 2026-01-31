import { Router } from "express";
import { searchUsers } from "../controllers/userController.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/search", authenticateToken, searchUsers);

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      online: user.online,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
});

router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { avatar, username, email } = req.body;
    const userId = req.user?._id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (username && username.trim().length < 3) {
      return res.status(400).json({ 
        message: 'Username deve ter pelo menos 3 caracteres' 
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        message: 'Email inválido' 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Username já está em uso' 
        });
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ 
          message: 'Email já está em uso' 
        });
      }
    }

    if (avatar !== undefined) user.avatar = avatar;
    if (username !== undefined) user.username = username.trim();
    if (email !== undefined) user.email = email.toLowerCase().trim();

    await user.save();

    console.log(`✅ Perfil atualizado: ${user.username} (${user._id})`);

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        online: user.online,
        lastSeen: user.lastSeen
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }

    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
});

router.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      online: user.online,
      lastSeen: user.lastSeen
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.userId;
    
    const users = await User.find({ 
      _id: { $ne: currentUserId }, 
      status: { $ne: 'blocked' } 
    })
    .select('username avatar online lastSeen')
    .sort({ username: 1 })
    .limit(100);

    res.json(users);

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
});

export default router;