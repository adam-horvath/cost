const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../app/models/user");

module.exports = function (passport) {
    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
        secretOrKey: process.env.JWT_SECRET,
    };
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            try {
                const user = await User.findById(jwt_payload.id);
                return done(null, user || false);
            } catch (err) {
                return done(err, false);
            }
        })
    );
};
