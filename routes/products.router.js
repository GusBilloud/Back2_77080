import { Router } from "express";
import passport from "passport";
import ProductsService from "../services/products.service.js";
import { authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();
const productsService = new ProductsService();

router.get("/", async (req, res) => {
    try {
        const result = await productsService.getAll();

        return res.status(200).json({
            status: "success",
            payload: result,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            error: error.message || "Server error",
        });
    }
});

router.get("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;

        const product = await productsService.getProductById(pid);

        if (!product) {
            return res.status(404).json({
                status: "error",
                error: "Product not found",
            });
        }

        return res.status(200).json({
            status: "success",
            payload: product,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            error: error.message || "Server error",
        });
    }
});

router.post(
    "/",
    passport.authenticate("current", { session: false }),
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const newProduct = await productsService.createProduct(req.body);

            return res.status(201).json({
                status: "success",
                payload: newProduct,
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                error: error.message || "Server error",
            });
        }
    }
);

router.put(
    "/:pid",
    passport.authenticate("current", { session: false }),
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { pid } = req.params;

            const updatedProduct = await productsService.updateProduct(pid, req.body);

            if (!updatedProduct) {
                return res.status(404).json({
                    status: "error",
                    error: "Product not found",
                });
            }

            return res.status(200).json({
                status: "success",
                payload: updatedProduct,
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                error: error.message || "Server error",
            });
        }
    }
);

router.delete(
    "/:pid",
    passport.authenticate("current", { session: false }),
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { pid } = req.params;

            const deletedProduct = await productsService.deleteProduct(pid);

            if (!deletedProduct) {
                return res.status(404).json({
                    status: "error",
                    error: "Product not found",
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Product deleted successfully",
                payload: deletedProduct,
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                error: error.message || "Server error",
            });
        }
    }
);

export default router;