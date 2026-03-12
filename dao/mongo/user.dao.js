import { UserModel } from '../../models/user.model.js';

export default class UserDAO {
    getAll = async () => {
        return await UserModel.find().select("-password").lean();
    };

    getById = async (id) => {
        return await UserModel.findById(id).select("-password").lean();
    };

    getRawById = async (id) => {
        return await UserModel.findById(id);
    };

    getByEmail = async (email) => {
        return await UserModel.findOne({ email });
    };

    create = async (data) => {
        return await UserModel.create(data);
    };

    update = async (id, data) => {
        return await UserModel.findByIdAndUpdate(id, data, { 
            new: true,
            runValidators: true,
        }).select("-password").lean();
    };
    
    delete = async (id) => {
        return await UserModel.findByIdAndDelete(id).lean();
    };
}