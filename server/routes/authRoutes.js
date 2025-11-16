import express from 'express';
import { isAuthenticated, login, logout, register, resetPassword, resetPasswordOTP, sendVerifyOtp, verifyEmail } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/logout", logout);

authRouter.post("/verify", userAuth, sendVerifyOtp);

authRouter.post("/verifyEmail", userAuth, verifyEmail);

authRouter.post("/authenticated", userAuth, isAuthenticated);

authRouter.post("/resetOTP", resetPasswordOTP);

authRouter.post("/resetPassword", resetPassword);

export default authRouter;