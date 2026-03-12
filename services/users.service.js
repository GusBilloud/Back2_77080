import mongoose from "mongoose";
import bcrypt from "bcrypt";
import UsersRepository from "../repositories/users.repository.js";
import CartsRepository from "../repositories/carts.repository.js";

const usersRepository = new UsersRepository();
const cartsRepository = new CartsRepository();

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function createHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

export default class UsersService {
    getAllUsers = async () => {
        return await usersRepository.getAll();
    };

    getUserById = async (uid, currentUser) => {
        if (!isValidObjectId(uid)) {
            const error = new Error("Invalid user id");
            error.statusCode = 400;
            throw error;
        }

        const user = await usersRepository.getById(uid);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        if (currentUser.role !== "admin" && String(currentUser._id) !== String(uid)) {
            const error = new Error("Forbidden");
            error.statusCode = 403;
            throw error;
        }

        return user;
    };

    createUser = async ({ first_name, last_name, email, age, password, role, cart }) => {
        if (!first_name || !last_name || !email || age === undefined || !password) {
            const error = new Error("Missing required fields");
            error.statusCode = 400;
            throw error;
        }

        const exists = await usersRepository.getByEmail(email);

        if (exists) {
            const error = new Error("Email already in use");
            error.statusCode = 409;
            throw error;
        }

        let cartId = cart;

        if (!cartId) {
            const newCart = await cartsRepository.create({ products: [] });
            cartId = newCart._id;
        } else {
            if (!isValidObjectId(cartId)) {
                const error = new Error("Invalid cart id");
                error.statusCode = 400;
                throw error;
            }
        }

        const newUser = await usersRepository.create({
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            role: role || "user",
            cart: cartId,
        });

        return await usersRepository.getById(newUser._id);
    };

    updateUser = async (uid, updateData, currentUser) => {
        if (!isValidObjectId(uid)) {
            const error = new Error("Invalid user id");
            error.statusCode = 400;
            throw error;
        }

        if (currentUser.role !== "admin" && String(currentUser._id) !== String(uid)) {
            const error = new Error("Forbidden");
            error.statusCode = 403;
            throw error;
        }

        const update = { ...updateData };

        if (update.email) {
            const existingUser = await usersRepository.getByEmail(update.email);

            if (existingUser && String(existingUser._id) !== String(uid)) {
                const error = new Error("Email already in use");
                error.statusCode = 409;
                throw error;
            }
        }

        if (update.password) {
            update.password = createHash(update.password);
        }

        if (update.cart && !isValidObjectId(update.cart)) {
            const error = new Error("Invalid cart id");
            error.statusCode = 400;
            throw error;
        }

        if (currentUser.role !== "admin") {
            delete update.role;
        }

        const updatedUser = await usersRepository.update(uid, update);

        if (!updatedUser) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        return updatedUser;
    };

    deleteUser = async (uid) => {
        if (!isValidObjectId(uid)) {
            const error = new Error("Invalid user id");
            error.statusCode = 400;
            throw error;
        }

        const deletedUser = await usersRepository.delete(uid);

        if (!deletedUser) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        return deletedUser;
    };
}