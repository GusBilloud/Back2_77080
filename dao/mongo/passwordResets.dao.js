import { PasswordResetModel } from "../../models/passwordReset.model.js";

export default class PasswordResetsDAO {
    create = async (data) => {
        return await PasswordResetModel.create(data);
    };

    getByToken = async (token) => {
        return await PasswordResetModel.findOne({ token });
    };

    invalidatePreviousTokens = async (userId) => {
        return await PasswordResetModel.updateMany(
            { user: userId, used: false },
            { used: true }
        );
    };

    markAsUsed = async (id) => {
        return await PasswordResetModel.findByIdAndUpdate(
            id,
            { used: true },
            { new: true }
        );
    };
}
