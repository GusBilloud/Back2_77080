import bcrypt from "bcrypt";
import crypto from "crypto";
import CurrentUserDTO from "../dto/CurrentUser.dto.js";
import UsersRepository from "../repositories/users.repository.js";
import CartsRepository from "../repositories/carts.repository.js";
import PasswordResetRepository from "../repositories/passwordReset.repository.js";
import { sendPasswordResetEmail } from "./mail.service.js";

const usersRepository = new UsersRepository();
const cartsRepository = new CartsRepository();
const passwordResetRepository = new PasswordResetRepository();

function createHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

function isValidPassword(user, password) {
    return bcrypt.compareSync(password, user.password);
}

export default class SessionsService {
    register = async ({ first_name, last_name, email, age, password }) => {
        const existingUser = await usersRepository.getByEmail(email);

        if (existingUser) {
            const error = new Error("User already exists");
            error.statusCode = 400;
            throw error;
        }

        const newCart = await cartsRepository.create({ products: [] });

        const newUser = await usersRepository.create({
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            role: "user",
            cart: newCart._id,
        });

        return newUser;
    };

    getSafeUser = (user) => {
        return new CurrentUserDTO(user);
    };

    getsafeUser = (user) => {
        return this.getSafeUser(user);
    };

    getCurrentUserDTO = (user) => {
        return new CurrentUserDTO(user);
    };

    logout = () => {
        return { message: "Logout successful" };
    };

    forgotPassword = async (email) => {
        const user = await usersRepository.getByEmail(email);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        await passwordResetRepository.invalidatePreviousTokens(user._id);

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await passwordResetRepository.create({
            user: user._id,
            token,
            expiresAt,
            used: false,
        });

        const resetLink = `${process.env.BASE_URL}/reset-password?token=${token}`;

        await sendPasswordResetEmail(user.email, resetLink);

        return { message: "Password reset email sent" };
    };

    resetPassword = async (token, newPassword) => {
        const resetRequest = await passwordResetRepository.getByToken(token);

        if (!resetRequest) {
            const error = new Error("Invalid token");
            error.statusCode = 400;
            throw error;
        }

        if (resetRequest.used) {
            const error = new Error("Token already used");
            error.statusCode = 400;
            throw error;
        }

        if (new Date() > new Date(resetRequest.expiresAt)) {
            const error = new Error("Token expired");
            error.statusCode = 400;
            throw error;
        }

        const user = await usersRepository.getById(resetRequest.user);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const rawUser = await usersRepository.getRawById(resetRequest.user);

        if (!rawUser) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const samePassword = isValidPassword(rawUser, newPassword);

        if (samePassword) {
            const error = new Error("New password must be different from the current password");
            error.statusCode = 400;
            throw error;
        }

        const hashedPassword = createHash(newPassword);

        await usersRepository.update(rawUser._id, {
            password: hashedPassword,
        });

        await passwordResetRepository.markAsUsed(resetRequest._id);

        return { message: "Password reset successful" };
    };
}

