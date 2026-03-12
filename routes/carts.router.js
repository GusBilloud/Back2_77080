import { Router } from "express";
import mongoose from "mongoose";
import passport from "passport";
import { authorizeRoles } from "../middleware/auth.middleware.js";
import CartsService from "../services/carts.service.js";

const router = Router();
const cartsService = new CartsService();

router.get(
    "/:cid",
    passport.authenticate("current", { session: false }),
    authorizeRoles("user", "admin"),
    async (req, res) => {
        try {
            const { cid } = req.params;

            if (!mongoose.Types.ObjectId.isValid(cid)) {
                return res.status(400).json({
                    status: "error",
                    error: "Invalid cart ID",
                });
            }

            const cart = await cartsService.getCartById(cid);

            if (req.user.role === "user" && String(req.user.cart) !== String(cid)) {
                return res.status(403).json({
                    status: "error",
                    error: "You can only view your own cart",
                });
            }

            return res.status(200).json({
                status: "success",
                payload: cart,
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

router.post(
    "/:cid/products/:pid",
    passport.authenticate("current", { session: false }),
    authorizeRoles("user"),
    async (req, res) => {
        try {
            const { cid, pid } = req.params;

            if (!mongoose.Types.ObjectId.isValid(cid)) {
                return res.status(400).json({
                    status: "error",
                    error: "Invalid cart ID",
                });
            }

            if (!mongoose.Types.ObjectId.isValid(pid)) {
                return res.status(400).json({
                    status: "error",
                    error: "Invalid product ID",
                });
            }

            if (String(req.user.cart) !== String(cid)) {
                return res.status(403).json({
                    status: "error",
                    error: "You can only modify your own cart",
                });
            }

            const updatedCart = await cartsService.addProductToCart(cid, pid, req.user);

            return res.status(200).json({
                status: "success",
                message: "Product added to cart",
                payload: updatedCart,
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

router.post(
    "/:cid/purchase",
    passport.authenticate("current", { session: false }),
    authorizeRoles("user"),
    async (req, res) => {
        try {
            const { cid } = req.params;

            if (!mongoose.Types.ObjectId.isValid(cid)) {
                return res.status(400).json({
                    status: "error",
                    error: "Invalid cart ID",
                });
            }

            if (String(req.user.cart) !== String(cid)) {
                return res.status(403).json({
                    status: "error",
                    error: "You can only purchase your own cart",
                });
            }

            const result = await cartsService.purchaseCart(cid, req.user);

            return res.status(200).json({
                status: "success",
                ...result,
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

export default router;