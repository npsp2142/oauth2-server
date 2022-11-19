const express = require("express");
const cookieSession = require("cookie-session");
const env = require("dotenv").config();
const auth = require("./auth");
const passport = require("passport");
const cors = require("cors");
const { authenticate } = require("passport");
var bodyParser = require("body-parser");
const { getUsersCollection } = require("./utils");
const { pbkdf2, randomBytes, pbkdf2Sync } = require("node:crypto");
const {PASSWORD_HASH_DIGEST,PASSWORD_HASH_ITERATION} = require('./constants')

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    name: "session",
    keys: ["key"],
  })
);
app.use(passport.initialize());
app.use(passport.session());

//functions
const isLogged = (req, res, next) => {
  // req.user ? next() : res.json({ message: "not authenticated" });
  req.isAuthenticated() ? next() : res.sendStatus(401);
};

//GET requests
app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.get(
  "/auth/google",
  passport.authenticate(["local", "google"], { scope: ["profile", "email"] })
);

app.post("/login", async (req, res) => {
  console.log("user req", req);
  console.log("user req body", req.body);
  console.log("user req body", JSON.stringify(req.body));
  const loginResponse = await fetch(
    "https://internet-sec-proj.azurewebsites.net/api/v1/user/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    }
  );
  console.log(loginResponse, loginResponse.url);
  const json = await loginResponse.json();

  console.log("user login resp", json);
  console.log("user login resp", JSON.stringify(json));
  res.json(json);
});

app.post("/register", async (req, res) => {
  console.log("user req", req);
  console.log("user req body", req.body);
  console.log("user req body", JSON.stringify(req.body));
  console.log("user req body", req.body.password);
  console.log("user req body", PASSWORD_HASH_ITERATION);

  const User = await getUsersCollection();

  console.log("Generating salt")
  const salt = randomBytes(256).toString("hex");

  console.log("Generating hashed password")
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
  newUser.save(); // "Meow name is fluffy"

  // const loginResponse = await fetch("https://internet-sec-proj.azurewebsites.net/api/v1/user/login", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(req.body),
  // })
  // console.log(loginResponse,loginResponse.url)
  // const json = await loginResponse.json();

  // console.log("user login resp", json);
  // console.log("user login resp", JSON.stringify(json));
  // res.json(json);
  res.json({success:true,code:200})
});

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/auth/google/success",
    failureRedirect: "http://localhost:3000/auth/google/failure",
  })
);

app.get("/auth/google/user", isLogged, (req, res) => {
  console.log("user login");
  res.json(req.user);
});

app.get("/protected/resource", isLogged, (req, res) => {
  res.send("You get a protected resource");
});

app.get("/auth/google/logout", (req, res) => {
  req.logout();
  req.session = null;
  console.log("user logout");
  res.redirect("/");
});

//Listen
app.listen(5000, () => {
  console.log("listening port 5000");
});
