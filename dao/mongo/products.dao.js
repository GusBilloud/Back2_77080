import { ProductModel } from "../../models/product.model.js";

export default class ProductsDAO {
    getAll = async () => {
        return await ProductModel.find().lean();
    };
    
    getById = async (id) => {
        return await ProductModel.findById(id).lean();
    };
    
    create = async (data) => {
        return await ProductModel.create(data);
    };

    update = async (id, data) => {
        return await ProductModel.findByIdAndUpdate(id, data, { 
            new: true,
            runValidators: true,
    }).lean();
    };
    
    delete = async (id) => {
        return await ProductModel.findByIdAndDelete(id).lean();
    };

    decreaseStock = async (id, quantity) => {
        return await ProductModel.findByIdAndUpdate(
            id,
            { $inc: { stock: -quantity } },
            { new: true, runValidators: true }
        ).lean();
    };
}