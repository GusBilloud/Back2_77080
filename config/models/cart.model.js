import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    products: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product"
                },
                quantity: { type: Number, default: 1 }
            }
        ],
        default: []
    },
},
    { timestamps: true }
);

export const CartModel = mongoose.model("Cart", cartSchema);