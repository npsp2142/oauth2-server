const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  salt: String,
});

module.exports = mongoose.model("User", userSchema);
