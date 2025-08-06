const mongoose = require("mongoose");

const DataValidationLogSchema = new mongoose.Schema({
  username: String,
  action: String,
  data: String,
  result: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DataValidationLog", DataValidationLogSchema);
