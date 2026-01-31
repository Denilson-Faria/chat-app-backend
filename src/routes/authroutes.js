import express from "express";
import { 
  register, 
  login,
  logout,
  refreshToken,
  verifyToken, 
  getProfile,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/verify", verifyToken);
router.post("/refresh", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/profile", authenticateToken, getProfile);
router.post("/logout", authenticateToken, logout);

export default router;
