import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { UserModel } from "../config/models/user.model.js";
import { CartModel } from "../config/models/cart.model.js";

const router = Router();

function createHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

function isValidPassword(user, password) {
    return bcrypt.compareSync(password, user.password);
}

function generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
}

router.post("/register", async (req, res, next) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;

        if (!first_name || !last_name || !email || !password || !age) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const exist = await UserModel.findOne({ email });
        if (exist) return res.status(400).json({ error: `The email ${email} already exists` });

        const cartCreated = await CartModel.create({ products: [] });
        const userCreated = await UserModel.create({
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            role: "user",
            cart: cartCreated._id,
        });

        const token = generateToken({
            id: userCreated._id,
            email: userCreated.email,
            role: userCreated.role,
        });

        const cookieName = process.env.JWT_COOKIE_NAME || "access_token";

        res.cookie(cookieName, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: Number(process.env.JWT_COOKIE_MAX_AGE || 60 * 60 * 1000),
        });

        return res.status(201).json({
            status: "success",
            message: "User registered successfully",
            payload: {
                id: userCreated._id,
                first_name: userCreated.first_name,
                last_name: userCreated.last_name,
                email: userCreated.email,
                age: userCreated.age,
                role: userCreated.role,
                cart: userCreated.cart,
            },
        });
    } catch (error) {
        next(error);
    }
});

router.post(
    "/login",
    passport.authenticate("local", { session: false }),
    (req, res) => {
        const user = req.user;

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role,
        });

        const cookieName = process.env.JWT_COOKIE_NAME || "access_token";

        res.cookie(cookieName, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: Number(process.env.JWT_COOKIE_MAX_AGE || 60 * 60 * 1000),
        });

        return res.status(200).json({
            status: "success",
            message: "Login successful",
            payload: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                role: user.role,
            },
        });
    }
);

router.get("/logout", (req, res) => {
    const cookieName = process.env.JWT_COOKIE_NAME || "access_token";
    res.clearCookie(cookieName);
    return res.status(200).json({ status: "success", message: "Logout successful" });
});

router.get(
    "/current",
    passport.authenticate("current", { session: false }),
    (req, res) => {
        return res.status(200).json({
            status: "success",
            payload: req.user,
        });
    }
);

export default router;