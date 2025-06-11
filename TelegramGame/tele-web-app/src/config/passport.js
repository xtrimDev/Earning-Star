const LocalStrategy = require('passport-local').Strategy;
const loginUser = require("../auth/login");
const userModel = require("../auth/models/user");

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'userId', passwordField: 'first_name' }, async (userId, username, done) => {
            try {
                const result = await loginUser(userId);

                if (result && result.type == 1) {
                    /** user already exist */
                    return done(null, result.userDetail);
                } else {
                    return done(null, false, { message: result.message});
                }
            } catch {
                return done(null, false, { message: "Something went wrong"});
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const result = await userModel.findById(id);
            done(null, result);
        } catch (error) {
            done(error, false)
        }
    });
};
