const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  passWord: String, 
  imageProfile: String, 
});

module.exports = userSchema