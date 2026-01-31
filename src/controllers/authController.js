
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validateEmail, validatePassword, validateUsername } from "../utils/validators.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: "Todos os campos são obrigatórios" 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        message: "Formato de e-mail inválido" 
      });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({ 
        message: "Nome de usuário deve ter entre 3-20 caracteres (apenas letras, números e _)" 
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: "Senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula e número" 
      });
    }

    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] 
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ 
          message: "Este e-mail já está cadastrado" 
        });
      }
      if (existingUser.username === username.toLowerCase()) {
        return res.status(400).json({ 
          message: "Este nome de usuário já está em uso" 
        });
      }
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hash,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_REFRESH_SECRET, 
      { expiresIn: "30d" }
    );

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 
    });

    res.status(201).json({ 
      message: "Usuário criado com sucesso!",
      token, 
      user: userResponse 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao criar usuário",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: "E-mail e senha são obrigatórios" 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        message: "Formato de e-mail inválido" 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ 
        message: "E-mail ou senha inválidos" 
      });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ 
        message: "Conta bloqueada. Entre em contato com o suporte." 
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
     
      await User.findByIdAndUpdate(user._id, { 
        $inc: { failedLoginAttempts: 1 },
        lastFailedLogin: new Date()
      });

      return res.status(401).json({ 
        message: "E-mail ou senha inválidos" 
      });
    }

    await User.findByIdAndUpdate(user._id, { 
      failedLoginAttempts: 0,
      lastLogin: new Date()
    });

    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_REFRESH_SECRET, 
      { expiresIn: "30d" }
    );

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 
    });

    res.json({ 
      message: "Login realizado com sucesso!",
      token, 
      user: userResponse 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao fazer login",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token não fornecido" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const newToken = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.json({ 
      token: newToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      }
    });

  } catch (error) {
    return res.status(401).json({ message: "Refresh token inválido" });
  }
};

export const logout = async (req, res) => {
  try {
 
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao fazer logout" });
  }
};


export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({ 
      valid: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      }
    });

  } catch (error) {
    res.status(401).json({ 
      valid: false,
      message: "Token inválido" 
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({ user });

  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao buscar perfil",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ message: "E-mail inválido" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({ 
        message: "Se o e-mail existir, você receberá instruções para recuperação de senha" 
      });
    }

    const resetToken = jwt.sign(
      { id: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    res.json({ 
      message: "Se o e-mail existir, você receberá instruções para recuperação de senha",
    
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });

  } catch (error) {
    res.status(500).json({ message: "Erro ao processar solicitação" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token e nova senha são obrigatórios" });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ 
        message: "Senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula e número" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.purpose !== 'password-reset') {
      return res.status(401).json({ message: "Token inválido" });
    }

    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido ou expirado" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Senha alterada com sucesso" });

  } catch (error) {
    res.status(500).json({ message: "Erro ao resetar senha" });
  }
};
