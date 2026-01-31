
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticateToken = async (req, res, next) => {
  try {
   
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: "Token não fornecido. Acesso negado." 
      });
    }

    const token = authHeader.replace("Bearer ", "");

   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
 
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ 
        message: "Usuário não encontrado. Token inválido." 
      });
    }

  
    if (user.status === 'blocked') {
      return res.status(403).json({ 
        message: "Conta bloqueada. Entre em contato com o suporte." 
      });
    }

  
    req.userId = decoded.id;
    req.user = user;
    
    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Token expirado. Faça login novamente.",
        code: "TOKEN_EXPIRED"
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        message: "Token inválido. Acesso negado.",
        code: "INVALID_TOKEN"
      });
    }

    return res.status(500).json({ 
      message: "Erro interno no servidor." 
    });
  }
};


export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select("-password");
    
    if (user && user.status !== 'blocked') {
      req.userId = decoded.id;
      req.user = user;
    }
    
    next();

  } catch (error) {
  
    next();
  }
};

export default authenticateToken;
