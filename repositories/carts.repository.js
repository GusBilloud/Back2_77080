import CartsDAO from "../dao/mongo/carts.dao.js";

export default class CartsRepository {
    constructor() {
        this.dao = new CartsDAO();
    }

    create = async (data) => this.dao.create(data);
    getById = async (id) => this.dao.getById(id);
    getByIdLean = async (id) => this.dao.getByIdLean(id);
    update = async (id, data) => this.dao.update(id, data);
    save = async (cartDocument) => this.dao.save(cartDocument)
}
