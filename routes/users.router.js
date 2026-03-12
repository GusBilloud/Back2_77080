import { Router } from "express";
import passport from "passport";
import { authorizeRoles } from "../middleware/auth.middleware.js";
import UsersService from "../services/users.service.js";

const router = Router();
const usersService = new UsersService();

router.get(
    "/",
    passport.authenticate("current", { session: false }),
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const users = await usersService.getAllUsers();

            return res.status(200).json({ users });
        } catch (error) {
            const status = error.statusCode || 500;

            return res.status(status).json({
                status: "error",
                error: error.message || "Server error",
            });
        }
    }
);

router.get(
    "/:uid",
    passport.authenticate("current", { session: false }),
    async (req, res) => {
        try {
            const user = await usersService.getUserById(req.params.uid, req.user);

            return res.status(200).json({ user });
        } catch (error) {
            const status = error.statusCode || 500;

            return res.status(status).json({
                status: "error",
                error: error.message || "Server error",
            });
        }
    }
);

router.post(
    "/",
    passport.authenticate("current", { session: false }),
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const user = await usersService.createUser(req.body);

            return res.status(201).json({ user });
        } catch (error) {
            const status = error.statusCode || 500;

            return res.status(status).json({
                status: "error",
                error: error.message || "Server error",
            });
        }
    }
);

router.put(
    "/:uid",
    passport.authenticate("current", { session: false }),
    async (req, res) => {
        try {
            const user = await usersService.updateUser(req.params.uid, req.body, req.user);

            return res.status(200).json({ user });
        } catch (error) {
            const status = error.statusCode || 500;

            return res.status(status).json({
                status: "error",
                error: error.message || "Server error",
            });
        }
    }
);

router.delete(
    "/:uid",
    passport.authenticate("current", { session: false }),
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            await usersService.deleteUser(req.params.uid);

            return res.status(204).send();
        } catch (error) {
            const status = error.statusCode || 500;

            return res.status(status).json({
                status: "error",
                error: error.message || "Server error",
            });
        }
    }
);

export default router;