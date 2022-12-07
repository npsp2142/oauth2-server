const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const OAuth2Strategy = require("passport-oauth2").Strategy;
const mongoose = require("mongoose");
const { pbkdf2Sync } = require("crypto");
const User = require("./User");
var LocalStrategy = require("passport-local");

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
  console.log(
    "Getting user collection...",
    process.env.MONGO_CONNECTION_STRING
  );
  await mongoose.connect(process.env.MONGO_CONNECTION_STRING);

  const dbUser = await User.find({ username: username });
  const PASSWORD_HASH_ITERATION = 100000;
  const PASSWORD_HASH_DIGEST = 64;
  if (dbUser == null || dbUser.length <= 0) {
    return { success: false, user: null };
  }
  const hashedPassword = pbkdf2Sync(
    password,
    dbUser[0].salt,
    PASSWORD_HASH_ITERATION,
    PASSWORD_HASH_DIGEST,
    "sha512"
  ).toString("hex");
  return {
    success: dbUser[0].password == hashedPassword,
    user: { username: dbUser[0].username, displayName: dbUser[0].username },
  };
};

passport.use(
  new LocalStrategy(function verify(username, password, cb) {
    verifyUser(username, password).then(({ success, user }) => {
      console.log("cb", success, user);

      if (success) {
        return cb(null, user);
      }
      return cb(null, false, { message: "Incorrect username or password." });
    });
  })
);

function parseJwt (token) {
  const jwtArray = token.split('.');
  const claimsString = Buffer.from(jwtArray[1], 'base64').toString();
  return JSON.parse(claimsString);
}

passport.use(new OAuth2Strategy({
  authorizationURL: process.env.KEYCLOAK_AUTHORIZATION_URL,
  tokenURL: process.env.KEYCLOAK_TOKEN_UTL,
  clientID: process.env.KEYCLOAK_CLIENT_ID,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
  callbackURL: process.env.KEYCLOAK_CALLBACK_URL,
},
function(accessToken, refreshToken, profile, done) {
  const claims = parseJwt(accessToken);
  console.log("parseJwt",)
  return done(null, {
    username: claims.preferred_username,
    displayName: claims.preferred_username
  });
}
));

passport.serializeUser((user, done) => {
  process.nextTick(() => {
    return done(null, user);
  });
});

passport.deserializeUser((user, done) => {
  process.nextTick(() => {
    return done(null, user);
  });
});
