import { Router } from "express";
import { UserModel } from "../config/models/user.model.js";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import passport from "passport";

const router = new Router();

function createHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

function isValidPassword(user, password) {
    return bcrypt.compareSync(password, user.password);
}

function generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

router.post("/register", async (req, res, next) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        if (!first_name || !last_name || !email || !password || !age) {
            res.status(400).json({ error: 'All fields are required' });
        };

        const exist = await UserModel.findOne({ email });
        if (exist) return res.status(400).json({ error: `Email ${email} already exists` });

        const userCreated = await UserModel.create({
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            role: 'user'
        });

        const token = generateToken({
            id: userCreated._id,
            email: userCreated.email,
            role: userCreated.role
        });
        res.cookie(process.env.JWT_COOKIE_NAME || "access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: Number(process.env.JWT_COOKIE_MAX_AGE || 60 * 60 * 1000)
        });

        return res.status(201).json({
            status: 'success',
            payload: {
                id: userCreated._id,
                first_name: userCreated.first_name,
                last_name: userCreated.last_name,
                email: userCreated.email,
                age: userCreated.age,
                role: userCreated.role
            },
            message: 'User registered successfully'
        });
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        if (!isValidPassword(user, password)) {
            return res.status(400).json({ error: 'Incorrect password' });
        }

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        res.cookie(process.env.JWT_COOKIE_NAME || "access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: Number(process.env.JWT_COOKIE_MAX_AGE || 24 * 60)
        });

        return res.status(200).json({
            status: 'success',
            message: 'Login exitoso',
            payload: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

router.get("/logout", async (req, res) => {
    res.clearCookie(process.env.JWT_COOKIE_NAME || "access_token");
    return res.status(200).json({ message: 'Logout successful' });
});

router.get("/current", passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.status(200).json({
        status: 'success',
        payload: {
            id: req.user._id || req.user.id,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            age: req.user.age,
            role: req.user.role
        }
    });
}
);


export default router;






