const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const mongoose = require("mongoose");
const { pbkdf2Sync } = require("crypto");
const User = require("./User");
var LocalStrategy = require("passport-local");
const { PASSWORD_HASH_DIGEST, PASSWORD_HASH_ITERATION } = require("constants");

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
  console.log("Getting user collection...");
  await mongoose.connect(
    "mongodb+srv://admin:admin@cluster0.a2udqxz.mongodb.net/?retryWrites=true&w=majority"
  );

  const dbUser = await User.find({ username: username });
  const PASSWORD_HASH_ITERATION = 100000;
  const PASSWORD_HASH_DIGEST = 64;
  if (dbUser == null) {
    console.log("user not exists");
    return { success: false, user: null };
  }
  console.log("user retrieved, user = ", dbUser);
  const hashedPassword = pbkdf2Sync(
    password,
    dbUser[0].salt,
    PASSWORD_HASH_ITERATION,
    PASSWORD_HASH_DIGEST,
    "sha512"
  ).toString("hex");
  console.log("verify password", dbUser[0].password, hashedPassword);
  return {
    success: dbUser[0].password == hashedPassword,
    user: { username: dbUser[0].username },
  };
};

passport.use(
  new LocalStrategy(function verify(username, password, cb) {
    verifyUser(username, password).then(({success,user}) => {
      console.log("cb", success, user);
      if (success) {
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
