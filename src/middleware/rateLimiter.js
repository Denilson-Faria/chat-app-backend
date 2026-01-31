import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { 
    message: "Muitas tentativas de login. Tente novamente em 15 minutos." 
  },
  standardHeaders: true,
  legacyHeaders: false,
  
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20, 
  message: { 
    message: "Muitos registros. Tente novamente em 1 hora." 
  },
 
});