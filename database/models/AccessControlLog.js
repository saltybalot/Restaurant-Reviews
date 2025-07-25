const mongoose = require("mongoose");

const AccessControlLogSchema = new mongoose.Schema({
  username: String,
  attemptedPath: String,
  method: String,
  ip: String,
  reason: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AccessControlLog", AccessControlLogSchema);
