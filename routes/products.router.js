import { Router } from "express";
import { Product } from "../config/models/product.model.js";
import mongoose from "mongoose";

const router = Router();

router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ "products": products });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }

});

router.post('/', async (req, res) => {
    try {
        let { name, price, description, inStock } = req.body;
        if (!name || !price || !description) {
            return res.status(400).json({ error: "Complete con todos los datos requeridos" });
        }
        const newProduct = new Product({ name, price, description, inStock });
        await newProduct.save();

        res.status(201).json({ message: "Product creado", product: newProduct });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "ID inválido" });
        }
        const products = await Product.findById(req.params.id);
        if (!products) return res.status(404).json({ error: `Producto con ID ${req.params.id} no existe` });
        res.status(200).json({ "products": products });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.put('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "ID inválido" });
        }
        const products = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!products) return res.status(404).json({ error: `Producto con ID ${req.params.id} no existe` });
        res.status(200).json({ message: "Producto actualizado", products: products });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "ID inválido" });
        }
        const products = await Product.findByIdAndDelete(req.params.id);
        if (!products) return res.status(404).json({ error: `Producto con ID ${req.params.id} no existe` });
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

export default router;