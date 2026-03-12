import { CartModel } from "../../models/cart.model.js";

export default class CartsDAO {
    create = async ( data = { products: [] }) => {
        return await CartModel.create(data);
    };

    getById = async (id) => {
        return await CartModel.findById(id).populate("products.product");
    };

    getByIdLean = async (id) => {
        return await CartModel.findById(id).populate("products.product").lean();
    };
    
    update = async (id, data) => {
        return await CartModel.findByIdAndUpdate(id, data, { 
            new: true,
            runValidators: true,
        });
    };

    save = async (cartDocument) => {
        return await cartDocument.save();
    };
}
