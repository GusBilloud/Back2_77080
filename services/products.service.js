import ProductsRepository from "../repositories/products.repository.js";

const productsRepository = new ProductsRepository();

export default class ProductsService {
    getAll = async () => {
        return await productsRepository.getAll();
    };

    getProductById = async (id) => {
        return await productsRepository.getById(id);
    };

    createProduct = async (data) => {
        const { name, price, description, stock } = data;
        if (!name || price === undefined || !description) {
            const error = new Error("Missing required fields: name, price, description");
            throw error;
        }

        return await productsRepository.create({
            name,
            price,
            description,
            stock: stock ?? 0,
        });
    };

    updateProduct = async (id, data) => {
        return await productsRepository.update(id, data);
    };

    deleteProduct = async (id) => {
        return await productsRepository.delete(id);
    };

}