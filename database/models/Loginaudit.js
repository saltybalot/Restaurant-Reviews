const mongoose = require("mongoose");

const LoginAuditSchema = new mongoose.Schema({
  username: { type: String, required: true },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
  errorMessage: { type: String },
  action: { type: String, default: 'login' }, // 'login' or 'logout'
});

const LoginAudit = mongoose.model("LoginAudit", LoginAuditSchema);

module.exports = LoginAudit;
