import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        used: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const PasswordResetModel = mongoose.model("PasswordReset", passwordResetSchema);
        
    