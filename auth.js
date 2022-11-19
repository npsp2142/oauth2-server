const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const mongoose = require("mongoose");
const crypto = require("crypto");
const { getUsersCollection } = require("./utils");
var LocalStrategy = require("passport-local");
const {PASSWORD_HASH_DIGEST,PASSWORD_HASH_ITERATION} = require('constants')


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

const verifyUser = async (username, password) => {
  const User = getUsersCollection();
  const dbUser = await User.findOne({ username: username });
  if (dbUser == null) {
    console.log("user not exists");
    return false;
  }
  const hashedPassword = pbkdf2Sync(
    password,
    dbUser.salt,
    PASSWORD_HASH_ITERATION,
    PASSWORD_HASH_DIGEST,
    "sha512"
  ).toString("hex");
  console.log("verify password", dbUser.password, password);
  return dbUser.password == hashedPassword, { username: dbUser.username };
};

passport.use(
  new LocalStrategy(function verify(username, password, cb) {
    verifyUser(username, password).then((result, user) => {
      if (result) {
        return cb(null, user);
      }
      return cb(null, false, { message: "Incorrect username or password." });
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
