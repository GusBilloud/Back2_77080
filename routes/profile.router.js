import { Router } from "express";
import passport from "passport";

const router = Router();

router.get('/', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        return res.status(200).json({
            status: 'success',
            payload: req.user,
        });
    }
);

export default router;