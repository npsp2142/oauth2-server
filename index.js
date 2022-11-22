const express = require("express");
const cookieSession = require("cookie-session");
const env = require("dotenv").config();
const auth = require("./auth");
const passport = require("passport");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./User");
var bodyParser = require("body-parser");
const MongoStore = require("connect-mongo");
const { pbkdf2, randomBytes, pbkdf2Sync } = require("node:crypto");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();
var corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
// app.use(
//   cookieSession({
//     maxAge: 24 * 60 * 60 * 1000,
//     name: "session",
//     keys: ["key"],
//   })
// );
app.use(cookieParser());

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    // cookie: {
    //   maxAge: 1000 * 60 * 60, // 1 hour
    //   secure: true,
    // },
    store: MongoStore.create({ mongoUrl: process.env.MONGO_CONNECTION_STRING }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

const isLogged = (req, res, next) => {
  console.log("islogged", req.isAuthenticated(), next);
  req.isAuthenticated() ? next() : res.sendStatus(401);
};

//GET requests
app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.get(
  "/auth/google",
  passport.authenticate(["google"], { scope: ["profile", "email"] })
);

app.post("/login", passport.authenticate("local"), (req, res) => {
  console.log("login req", req.isAuthenticated());
  if (req.isAuthenticated()) {
    res.json({ success: true, message: "", redirect: "/success" });
    return;
  }
  res.json({
    success: false,
    message: "Incorrect username or password",
    redirect: "/login",
  });
});

app.post("/register", async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
    await User.find();
    console.log("Generating salt");
    const salt = randomBytes(256).toString("hex");
    const dbUser = await User.find({ username: req.body.username });
    if (dbUser.length > 0) {
      res.json({ success: false, code: 400, message: "Username exists." });
      return;
    }
    console.log("Generating hashed password");
    const PASSWORD_HASH_ITERATION = 100000;
    const PASSWORD_HASH_DIGEST = 64;
    const hashedPassword = pbkdf2Sync(
      req.body.password,
      salt,
      PASSWORD_HASH_ITERATION,
      PASSWORD_HASH_DIGEST,
      "sha512"
    ).toString("hex");

    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
      salt: salt,
    });
    newUser.save();
    res.json({ success: true, code: 200, message: "Login successfully." });
  } catch (error) {
    console.error(error);
    res.json({ success: false, code: 500, message: "Server error." });
  }
});

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/success",
    failureRedirect: "http://localhost:3000/failure",
  })
);

app.get("/user", isLogged, (req, res) => {
  console.log("user login", req.user, req.session);
  res.json(req.user);
});

app.get("/protected/resource", isLogged, (req, res) => {
  res.send("You get a protected resource");
});

app.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy();
  console.log("user logout");
  res.json({ redirect: "/" });
});

//Listen
app.listen(5000, () => {
  console.log("listening port 5000");
});
