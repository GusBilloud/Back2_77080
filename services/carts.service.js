import mongoose from "mongoose";
import CartsRepository from "../repositories/carts.repository.js";
import ProductsRepository from "../repositories/products.repository.js";
import TicketsService from "./tickets.service.js";

const cartsRepository = new CartsRepository();
const productsRepository = new ProductsRepository();
const ticketsService = new TicketsService();

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

export default class CartsService {
    createCart = async () => {
        return await cartsRepository.create({ products: [] });
    };

    getCartById = async (cid) => {
        if (!isValidObjectId(cid)) {
            const error = new Error("Invalid cart id");
            error.statusCode = 400;
            throw error;
        }

        const cart = await cartsRepository.getById(cid);

        if (!cart) {
            const error = new Error("Cart not found");
            error.statusCode = 404;
            throw error;
        }

        return cart;
    };

    addProductToCart = async (cid, pid, currentUser) => {
        if (!isValidObjectId(cid)) {
            const error = new Error("Invalid cart id");
            error.statusCode = 400;
            throw error;
        }

        if (!isValidObjectId(pid)) {
            const error = new Error("Invalid product id");
            error.statusCode = 400;
            throw error;
        }

        if (!currentUser || currentUser.role !== "user") {
            const error = new Error("Only users can add products to cart");
            error.statusCode = 403;
            throw error;
        }

        if (String(currentUser.cart) !== String(cid)) {
            const error = new Error("Forbidden: you can only use your own cart");
            error.statusCode = 403;
            throw error;
        }

        const cart = await cartsRepository.getById(cid);

        if (!cart) {
            const error = new Error("Cart not found");
            error.statusCode = 404;
            throw error;
        }

        const product = await productsRepository.getById(pid);

        if (!product) {
            const error = new Error("Product not found");
            error.statusCode = 404;
            throw error;
        }

        const existingProduct = cart.products.find(
            (item) => String(item.product._id || item.product) === String(pid)
        );

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.products.push({
                product: pid,
                quantity: 1,
            });
        }

        await cartsRepository.save(cart);

        return await cartsRepository.getById(cid);
    };

    removeProductFromCart = async (cid, pid, currentUser) => {
        if (!isValidObjectId(cid)) {
            const error = new Error("Invalid cart id");
            error.statusCode = 400;
            throw error;
        }

        if (!isValidObjectId(pid)) {
            const error = new Error("Invalid product id");
            error.statusCode = 400;
            throw error;
        }

        if (!currentUser || currentUser.role !== "user") {
            const error = new Error("Only users can modify carts");
            error.statusCode = 403;
            throw error;
        }

        if (String(currentUser.cart) !== String(cid)) {
            const error = new Error("Forbidden: you can only use your own cart");
            error.statusCode = 403;
            throw error;
        }

        const cart = await cartsRepository.getById(cid);

        if (!cart) {
            const error = new Error("Cart not found");
            error.statusCode = 404;
            throw error;
        }

        cart.products = cart.products.filter(
            (item) => String(item.product._id || item.product) !== String(pid)
        );

        await cartsRepository.save(cart);

        return await cartsRepository.getById(cid);
    };

    clearCart = async (cid, currentUser) => {
        if (!isValidObjectId(cid)) {
            const error = new Error("Invalid cart id");
            error.statusCode = 400;
            throw error;
        }

        if (!currentUser || currentUser.role !== "user") {
            const error = new Error("Only users can clear carts");
            error.statusCode = 403;
            throw error;
        }

        if (String(currentUser.cart) !== String(cid)) {
            const error = new Error("Forbidden: you can only use your own cart");
            error.statusCode = 403;
            throw error;
        }

        const cart = await cartsRepository.getById(cid);

        if (!cart) {
            const error = new Error("Cart not found");
            error.statusCode = 404;
            throw error;
        }

        cart.products = [];
        await cartsRepository.save(cart);

        return await cartsRepository.getById(cid);
    };

    purchaseCart = async (cid, currentUser) => {
        if (!isValidObjectId(cid)) {
            const error = new Error("Invalid cart id");
            error.statusCode = 400;
            throw error;
        }

        if (!currentUser || currentUser.role !== "user") {
            const error = new Error("Only users can purchase carts");
            error.statusCode = 403;
            throw error;
        }

        if (String(currentUser.cart) !== String(cid)) {
            const error = new Error("Forbidden: you can only purchase your own cart");
            error.statusCode = 403;
            throw error;
        }

        const cart = await cartsRepository.getById(cid);

        if (!cart) {
            const error = new Error("Cart not found");
            error.statusCode = 404;
            throw error;
        }

        if (!cart.products || cart.products.length === 0) {
            const error = new Error("Cart is empty");
            error.statusCode = 400;
            throw error;
        }

        const productsNotProcessed = [];
        const productsProcessed = [];
        let totalAmount = 0;

        for (const item of cart.products) {
            const productId = item.product._id || item.product;
            const product = await productsRepository.getById(productId);

            if (!product) {
                productsNotProcessed.push({
                    product: productId,
                    quantity: item.quantity,
                    reason: "Product not found",
                });
                continue;
            }

            if (product.stock >= item.quantity) {
                await productsRepository.decreaseStock(productId, item.quantity);

                totalAmount += product.price * item.quantity;

                productsProcessed.push({
                    product: productId,
                    quantity: item.quantity,
                });
            } else {
                productsNotProcessed.push({
                    product: productId,
                    quantity: item.quantity,
                    reason: "Insufficient stock",
                });
            }
        }

        if (productsProcessed.length === 0) {
            const error = new Error("No products could be processed");
            error.statusCode = 400;
            throw error;
        }

        const ticket = await ticketsService.createTicket({
            amount: totalAmount,
            purchaser: currentUser.email,
        });

        cart.products = cart.products.filter((item) => {
            return productsNotProcessed.some(
                (notProcessed) =>
                    String(notProcessed.product) === String(item.product._id || item.product)
            );
        });

        await cartsRepository.save(cart);

        return {
            message:
                productsNotProcessed.length > 0
                    ? "Purchase completed partially"
                    : "Purchase completed successfully",
            ticket,
            productsProcessed,
            productsNotProcessed,
        };
    };
}