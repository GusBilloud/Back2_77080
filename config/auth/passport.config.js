import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcrypt";
import UsersRepository from "../../repositories/users.repository.js";

const usersRepository = new UsersRepository();
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "access_token";

function cookieExtractor(req) {
    return req?.cookies?.[COOKIE_NAME] || null;
}

export default function initializePassport() {
    passport.use(
        "login",
        new LocalStrategy(
            { usernameField: "email", passwordField: "password" },
            async (email, password, done) => {
                try {
                    const user = await usersRepository.getByEmail(email);

                    if (!user) {
                        return done(null, false, { message: "User not found" });
                    }

                    const isValid = bcrypt.compareSync(password, user.password);

                    if (!isValid) {
                        return done(null, false, { message: "Incorrect password" });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    passport.use(
        "current",
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
                secretOrKey: process.env.JWT_SECRET,
            },
            async (jwtPayload, done) => {
                try {
                    const user = await usersRepository.getById(jwtPayload.id);

                    if (!user) {
                        return done(null, false);
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error, false);
                }
            }
        )
    );
}