import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
    res.status(200).json({ message: "Bienvenidos a la pagina de inicio!" });
});

export default router;