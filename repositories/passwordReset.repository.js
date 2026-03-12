import PasswordResetDAO from '../dao/mongo/passwordResets.dao.js';

export default class PasswordResetRepository {
    constructor() {
        this.dao = new PasswordResetDAO();
    }

    create = async (data) => this.dao.create(data);
    getByToken = async (token) => this.dao.getByToken(token);
    invalidatePreviousTokens = async (userId) => this.dao.invalidatePreviousTokens(userId);
    markAsUsed = async (id) => this.dao.markAsUsed(id);
}