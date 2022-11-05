const express = require("express");
const session = require("express-session");
const env = require("dotenv").config();
const auth = require("./auth");
const passport = require("passport");
const cors = require("cors");

const app = express();
app.use(session({ secret: "cats" }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

//functions
const isLogged = (req, res, next) => {
  req.user ? next() : res.sendStatus(401);
};

//GET requests
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/auth/google/success",
    failureRedirect: "http://localhost:3000/auth/google/failure",
    successMessage: "Logged with Google successfully",
    failureMessage: "Fail to login with Google",
  })
);

app.get("/auth/google/user", isLogged, (req, res) => {
  res.json(req.user);
});

app.get("/auth/google/failure", (req, res) => {
  res.send("Error!!");
});

app.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy();
  res.send("Goodbye!");
});

//Listen
app.listen(5000, () => {
  console.log("listening port 5000");
});
