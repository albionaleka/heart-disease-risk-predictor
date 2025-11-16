import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    verifyOTP: {
        type: String,
        default: ""
    },
    OTPExpire: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetOTP: {
        type: String,
        default: ""
    },
    resetOTPExpire: {
        type: Number,
        default: 0
    },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;