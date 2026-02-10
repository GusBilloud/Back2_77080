import dotenv from 'dotenv';
dotenv.config();


import express from 'express';

import cookieParser from 'cookie-parser';
import passport from 'passport';

import { connectAuto } from './config/db/connect.config.js';
import initializePassport from './config/auth/passport.config.js';

//import authRouter from './routes/auth.router.js';
import productsRouter from './routes/products.router.js';
import profileRouter from './routes/profile.router.js';
import homeRouter from './routes/home.router.js';
import sessionRouter from './routes/sessions.router.js';
import userRouter from './routes/users.router.js';




const app = express();
const PORT = process.env.PORT || 8000;

//const SECRET_SESSION = process.env.SECRET_SESSION || 'clave_secreta';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

initializePassport();
app.use(passport.initialize());

app.use("/", homeRouter);
//app.use("/api/auth", authRouter);
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

