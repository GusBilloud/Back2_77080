import { Router } from "express";
import passport from "passport";
import CurrentUserDTO from "../dto/CurrentUser.dto.js";

const router = Router();

router.get('/', passport.authenticate('current', { session: false }),
    (req, res) => {
        const profile = new CurrentUserDTO(req.user);
        return res.status(200).json({
            status: 'success',
            payload: profile,
        });
    }
);

export default router;