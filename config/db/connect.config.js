import mongoose from "mongoose";

export const connectMongoDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/back77080"),        
        console.log("MongoDB conectado");
    }catch (err) {
        console.error("MongoDB error de conexion:", err);
        process.exit(1);
    }
};

export const connectMongoAtlas = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/back77080"),        
        console.log("MongoAtlas conectado");
    }catch (err) {
        console.error("MongoAtlas error de conexion:", err);
        process.exit(1);
    }
};
