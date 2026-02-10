import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user.model.js";


function cookieExtractor(req) {
    const cookieName = process.env.JWT_COOKIE_NAME || "access_token";
    return req?.cookies?.[cookieName] || null;
}

export default function initializePassport() {

    passport.use(
        "local",
        new LocalStrategy(
            { usernameField: "email", passwordField: "password" },
            async (email, password, done) => {
                try {
                    const user = await UserModel.findOne({ email });
                    if (!user) return done(null, false, { message: "User not found" });

                    const ok = bcrypt.compareSync(password, user.password);
                    if (!ok) return done(null, false, { message: "Incorrect password" });

                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }
        )
    );


    passport.use(
        "jwt",
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
                secretOrKey: process.env.JWT_SECRET,
            },
            async (jwtPayload, done) => {
                try {

                    const user = await UserModel.findById(jwtPayload.id).select("-password");

                    if (!user) return done(null, false);
                    return done(null, user);
                } catch (err) {
                    return done(err, false);
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
                    const user = await UserModel.findById(jwtPayload.id).select("-password");
                    if (!user) return done(null, false);
                    return done(null, user);
                } catch (err) {
                    return done(err, false);
                }
            }
        )
    );
}

