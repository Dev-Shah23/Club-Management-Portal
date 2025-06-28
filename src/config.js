const mongoose = require('mongoose');

// Basic DB connection
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Club", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Database Connected Successfully");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
};

// Simple user schema (no password hashing, relaxed validation)
const Loginschema = new mongoose.Schema({
  name: String,
  password: String,
  role: String,
  email: String
});

const User = mongoose.model("User", Loginschema);

module.exports = {
  connectDB,
  User
};
