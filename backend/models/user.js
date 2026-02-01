const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

console.log('[Model] about to register model with mongoose');
const registered = mongoose.model("User", userSchema);
console.log('[Model] mongoose.model returned:', typeof registered, registered && registered.name);
module.exports = registered;
console.log('[Model] module.exports set to:', typeof module.exports);