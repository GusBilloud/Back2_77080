import UserDAO from "../dao/mongo/user.dao.js";

export default class UsersRepository {
    constructor() {
        this.dao = new UserDAO();
    }

    getAll = async () => this.dao.getAll();
    getById = async (id) => this.dao.getById(id);
    getRawById = async (id) => this.dao.getRawById(id);
    getByEmail = async (email) => this.dao.getByEmail(email);
    create = async (data) => this.dao.create(data);
    update = async (id, data) => this.dao.update(id, data);
    delete = async (id) => this.dao.delete(id);
}