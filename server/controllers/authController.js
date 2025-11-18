import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/user.js';
import transporter from '../config/nodemailer.js';
import 'dotenv/config';
import { EMAIL_RESET, EMAIL_VERIFY } from '../config/emailTemplates.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }

    try {
        const existingUser = await userModel.findOne({email});

        if (existingUser) {
            return res.status(409).json({ success: false, message: "User already exists"})
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        try {
            await transporter.sendMail({
                from: process.env.SENDER_EMAIL,
                to: email,
                subject: "Welcome to Authentication ✔",
                text: `Welcome to our app. Your account has been created with email: ${email}`,
                html: `<b>Welcome to our app. Your account has been created with email: ${email}</b>`
            });
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError.message);
        }

        return res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and Password are required"});
        }

        const user = await userModel.findOne({email});

        if (!user) {
            return res.status(404).json({ success: false, message: "User doesn't exist"});
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid credentials"});
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ success: true, message: "User signed in"});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        return res.json({ success: true, message: "You've been logged out"});
    } catch (error) {
        return res.json({ success: false, message: error.message});
    }
}

export const sendVerifyOtp = async (req, res) => {
    try {
        const {userId} = req;

        const user = await userModel.findById(userId);

        if (user.isVerified) {
            return res.json({ success: false, message: "Account is already verified."});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOTP = otp;

        user.OTPExpire = Date.now() + (24 * 60 * 60 * 1000);

        await user.save();

        const mail = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Verification code",
            //text: `Your verification code is: ${user.verifyOTP}`
            html: EMAIL_VERIFY.replace("{{otp}}", user.verifyOTP)
        }

        await transporter.sendMail(mail);

        return res.json({ success: true, message: "Verification OTP Sent"});
    } catch (error) {
        return res.json({ success: false, message: error.message });
    } 
}

export const verifyEmail = async (req, res) => {
    const {otp} = req.body;
    const userId = req.userId;

    if (!userId || !otp) {
        return res.json({ success: false, message: "Missing details."});
    }

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found"});
        }

        if (user.verifyOTP === '' || user.verifyOTP !== otp) {
            return res.json({ success: false, message: "Invalid OTP"});
        }

        if (user.OTPExpire < Date.now()) {
            return res.json({ success: false, message: "OTP has expired"});
        }

        user.isVerified = true;
        user.verifyOTP = '';
        user.OTPExpire = 0;

        await user.save();
        return res.json({ success: true, message: "Account has been verified"});
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const isAuthenticated = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "User not found" 
            });
        }
        return res.json({ 
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    } catch (error) {   
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}

export const resetPasswordOTP = async (req, res) => {
    const {email} = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email is required"});
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found"});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOTP = otp;

        user.resetOTPExpire = Date.now() + (24 * 60 * 60 * 1000);

        await user.save();

        const mail = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password reset code",
            // text: `Your password reset OTP is: ${user.resetOTP}. Use this code to proceed with resetting your password.`
            html: EMAIL_RESET.replace("{{otp}}", otp)
        }

        await transporter.sendMail(mail);

        return res.json({ success: true, message: "Reset Password OTP Sent"});
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: "Missing required information"});
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist"});
        }

        const userOTP = user.resetOTP;

        if (otp !== userOTP || otp === '') {
            return res.json({ success: false, message: "Invalid OTP" })
        }

        if (user.resetOTPExpire < Date.now()) {
            return res.json({ success: false, message: "OTP has expired"})
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetOTP = '';
        user.resetOTPExpire = 0;
        await user.save();
        return res.json({ success: true, message: "Password has been reset"})
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}