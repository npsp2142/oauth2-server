const express = require("express");
const cookieSession = require("cookie-session");
const env = require("dotenv").config();
const auth = require("./auth");
const passport = require("passport");
const cors = require("cors");
const { authenticate } = require("passport");

const app = express();
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
  req.user ? next() : res.sendStatus(401);
};

//GET requests
app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

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
