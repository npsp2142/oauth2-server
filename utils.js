const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  salt: String,
});
const User = mongoose.model("User", userSchema);
const getUsersCollection = async () => {
    console.log("Getting user collection...")
  await mongoose.connect(
    "mongodb+srv://admin:admin@cluster0.a2udqxz.mongodb.net/?retryWrites=true&w=majority"
  );

  return User;
};

module.exports = { getUsersCollection };
