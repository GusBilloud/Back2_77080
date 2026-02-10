import { Router } from "express";
import { Product } from "../config/models/product.model.js";
import mongoose from "mongoose";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json({ products });
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, price, description, inStock } = req.body;

        if (!name || !price || !description) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newProduct = await Product.create({ name, price, description, inStock });

        return res.status(201).json({ message: "Product created", product: newProduct });
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid ID" });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: `Product with ID ${req.params.id} does not exist` });
        }

        return res.status(200).json({ product });
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid ID" });
        }

        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return res.status(404).json({ error: `Product with ID ${req.params.id} does not exist` });
        }

        return res.status(200).json({ message: "Product updated", product });
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid ID" });
        }

        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: `Product with ID ${req.params.id} does not exist` });
        }

        return res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
});

export default router;