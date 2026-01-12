import express from 'express';
import { connectMongoDB, connectMongoAtlas } from './config/db/connect.config.js';
import homeRouter from './routes/home.router.js';
import productsRouter from './routes/products.router.js';
import logger from './middleware/logger.middleware.js';

const app = express();
const PORT = 3000;
const ATLAS = false;

app.use(express.json());
app.use(logger);

app.use("/", homeRouter);
app.use("/products", productsRouter);

const startServer = async () => {
    ATLAS ? connectMongoAtlas() : connectMongoDB();
    app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
};

await startServer();



