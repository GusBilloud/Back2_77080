import { Router } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { UserModel } from "../config/models/user.model.js";
import { CartModel } from "../config/models/cart.model.js";

import passport from "passport";

const router = Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: admin only" });
    }
    next();
};

router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    requireAdmin,
    async (req, res) => {
        try {
            const users = await UserModel.find().select("-password").lean();
            return res.status(200).json({ users });
        } catch (error) {
            return res.status(500).json({ error: "Server error" });
        }
    }
);

router.get(
    "/:uid",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const { uid } = req.params;
            if (!isValidObjectId(uid)) {
                return res.status(400).json({ error: "Invalid user id" });
            }

            const user = await UserModel.findById(uid).select("-password").lean();
            if (!user) return res.status(404).json({ error: "User not found" });

            if (req.user.role !== "admin" && String(req.user._id) !== String(uid)) {
                return res.status(403).json({ error: "Forbidden" });
            }

            return res.status(200).json({ user });
        } catch (error) {
            return res.status(500).json({ error: "Server error" });
        }
    }
);

router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    requireAdmin,
    async (req, res) => {
        try {
            const { first_name, last_name, email, age, password, role, cart } = req.body;

            if (!first_name || !last_name || !email || age === undefined || !password) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const exists = await UserModel.findOne({ email });
            if (exists) return res.status(409).json({ error: "Email already in use" });

            let cartId = cart;

            if (!cartId) {
                const newCart = await CartModel.create({ products: [] });
                cartId = newCart._id;
            } else {
                if (!isValidObjectId(cartId)) {
                    return res.status(400).json({ error: "Invalid cart id" });
                }
            }

            const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

            const newUser = await UserModel.create({
                first_name,
                last_name,
                email,
                age,
                password: hashedPassword,
                cart: cartId,
                role: role || "user",
            });

            const userSafe = await UserModel.findById(newUser._id).select("-password").lean();
            return res.status(201).json({ user: userSafe });
        } catch (error) {
            return res.status(500).json({ error: "Server error" });
        }
    }
);

router.put(
    "/:uid",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const { uid } = req.params;
            if (!isValidObjectId(uid)) {
                return res.status(400).json({ error: "Invalid user id" });
            }

            if (req.user.role !== "admin" && String(req.user._id) !== String(uid)) {
                return res.status(403).json({ error: "Forbidden" });
            }

            const update = { ...req.body };

            if (update.email) {
                const exists = await UserModel.findOne({ email: update.email, _id: { $ne: uid } });
                if (exists) return res.status(409).json({ error: "Email already in use" });
            }

            if (update.password) {
                update.password = bcrypt.hashSync(update.password, bcrypt.genSaltSync(10));
            }

            if (update.cart && !isValidObjectId(update.cart)) {
                return res.status(400).json({ error: "Invalid cart id" });
            }

            if (req.user.role !== "admin") {
                delete update.role;
            }

            const updated = await UserModel.findByIdAndUpdate(uid, update, {
                new: true,
                runValidators: true,
            })
                .select("-password")
                .lean();

            if (!updated) return res.status(404).json({ error: "User not found" });

            return res.status(200).json({ user: updated });
        } catch (error) {
            return res.status(500).json({ error: "Server error" });
        }
    }
);


router.delete(
    "/:uid",
    passport.authenticate("jwt", { session: false }),
    requireAdmin,
    async (req, res) => {
        try {
            const { uid } = req.params;
            if (!isValidObjectId(uid)) {
                return res.status(400).json({ error: "Invalid user id" });
            }

            const deleted = await UserModel.findByIdAndDelete(uid).lean();
            if (!deleted) return res.status(404).json({ error: "User not found" });

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: "Server error" });
        }
    }
);

export default router;