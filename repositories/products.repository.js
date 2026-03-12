import ProductsDAO from '../dao/mongo/products.dao.js';

export default class ProductsRepository {
    constructor() {
        this.dao = new ProductsDAO();
    }

    getAll = async () => this.dao.getAll();
    getById = async (id) => this.dao.getById(id);
    create = async (data) => this.dao.create(data);
    update = async (id, data) => this.dao.update(id, data);
    delete = async (id) => this.dao.delete(id);
    decreaseStock = async (id, quantity) => this.dao.decreaseStock(id, quantity);
}