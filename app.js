import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import passport from 'passport';

import { connectAuto } from './config/db/connect.config.js';
import initializePassport from './config/auth/passport.config.js';

import productsRouter from './routes/products.router.js';
import profileRouter from './routes/profile.router.js';
import cartsRouter from './routes/carts.router.js';
import sessionRouter from './routes/sessions.router.js';
import userRouter from './routes/users.router.js';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

initializePassport();
app.use(passport.initialize());

app.use("/api/carts", cartsRouter);
app.use("/api/products", productsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/users", userRouter);

app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
})

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
});

connectAuto()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error);
        process.exit(1);
    });
    

export default app;

