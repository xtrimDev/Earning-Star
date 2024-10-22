const LocalStrategy = require('passport-local').Strategy;
const loginUser = require("../auth/login");
const userModel = require("../auth/models/user");

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            try {
                const result = await loginUser(email, password);

                if (result && result.type == 1) {
                    return done(null, result.userDetail);
                } else {
                    if (result.name === 'ValidationError') {
                        const firstErrorField = Object.keys(result.errors)[0];
                        return done(null, false, { message: result.errors[firstErrorField].message});
                    } else {
                        if (result.message.includes("not-verified")) {
                            let words = result.message.split(' ');

                            const userId = words[1];
                            return done(null, false, { message: "not-verified", userId});
                        }
                        return done(null, false, { message: result.message});
                    }
                }
            } catch (error) {
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
