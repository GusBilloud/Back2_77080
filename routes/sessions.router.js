import { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import SessionsService from "../services/sessions.service.js";

const router = Router();
const sessionsService = new SessionsService();
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "access_token";

router.post("/register", async (req, res) => {
    try {
        const userCreated = await sessionsService.register(req.body);
        const safeUser = sessionsService.getSafeUser(userCreated);
        return res.status(201).json({
            status: "success",
            message: "User registered successfully",
            payload: safeUser
        });
    } catch (error) {
        const status = error.statusCode || 500;
        return res.status(status).json({
            status: "error",
            error: error.message || "Server error",
        });
    } 
});

router.post("/login", passport.authenticate("login", { session: false }), async (req, res) => {
    try {
        const user = req.user;

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
                cart: user.cart,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            maxAge: Number(process.env.JWT_COOKIE_MAX_AGE) || 3600000,
        });

        return res.status(200).json({
            status: "success",
            message: "Login successful",
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            error: error.message || "Server error",
        });
    }
});

router.get(
    "/current",
    passport.authenticate("current", { session: false }),
    async (req, res) => {
        try {
            const currentUser = sessionsService.getCurrentUserDTO(req.user);

            return res.status(200).json({
                status: "success",
                payload: currentUser,
            });
        } catch (error) {
            const status = error.statusCode || 500;

            return res.status(status).json({
                status: "error",
                error: error.message || "Server error",
            });
        }
    }
);

router.post("/logout", (req, res) => {
    try {
        const result = sessionsService.logout();

        res.clearCookie(COOKIE_NAME);

        return res.status(200).json({
            status: "success",
            message: result.message,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            error: error.message || "Server error",
        });
    }
});

router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const result = await sessionsService.forgotPassword(email);
        
        return res.status(200).json({
            status: "success",
            message: result.message,
        });
    } catch (error) {
        const status = error.statusCode || 500;
        return res.status(status).json({
            status: "error",
            error: error.message || "Server error",
        });
    }
});

router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const result = await sessionsService.resetPassword(token, newPassword);
        
        return res.status(200).json({
            status: "success",
            message: result.message,
        });
    } catch (error) {
        const status = error.statusCode || 500;
        return res.status(status).json({
            status: "error",
            error: error.message || "Server error",
        });
    }
});



export default router;