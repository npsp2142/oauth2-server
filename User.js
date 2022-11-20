const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  salt: String,
});
const User = 
// const getUsersCollection = async () => {
//     console.log("Getting user collection...")


//   return User;
// };

module.exports = mongoose.model("User", userSchema);
