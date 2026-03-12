import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 0,
        max: 110
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin'],
        default: 'user'
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    githubId: {
        type: String,
    }

}, { timestamps: true });

export const UserModel = mongoose.model('User', userSchema);